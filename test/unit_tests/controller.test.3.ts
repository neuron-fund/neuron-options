/*
should free long when burn short collaterated by this long
should free long and collaterals when burn short collaterated by this long and collateral tokens
*/

import {
  MockERC20 as MockERC20Instance,
  CallTester as CallTesterInstance,
  MarginCalculator as MarginCalculatorInstance,
  MockONtoken as MockONtokenInstance,
  MockOracle as MockOracleInstance,
  MockWhitelistModule as MockWhitelistModuleInstance,
  MarginPool as MarginPoolInstance,
  Controller as ControllerInstance,
  AddressBook as AddressBookInstance,
  OwnedUpgradeabilityProxy as OwnedUpgradeabilityProxyInstance,
  ONtokenImplV1 as ONtokenImplV1Instance,
  ArrayAddressUtils as ArrayAddressUtilsInstance,
} from '../../typechain-types'

import { ActionArgsStruct } from '../../typechain-types/Controller'

import { createScaledNumber, createTokenAmount, underlyingPriceToCtokenPrice, resp2bn } from '../helpers/utils'
import { artifacts, contract, web3 } from 'hardhat'
import { expect, assert } from 'chai'

import { BigNumber } from 'ethers'

const { expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers')

const CallTester = artifacts.require('CallTester.sol')
const MockERC20 = artifacts.require('MockERC20.sol')
const ONtokenImplV1 = artifacts.require('ONtokenImplV1.sol')
const MockONtoken = artifacts.require('MockONtoken.sol')
const MockOracle = artifacts.require('MockOracle.sol')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy.sol')
const MarginCalculator = artifacts.require('MarginCalculator.sol')
const MockWhitelistModule = artifacts.require('MockWhitelistModule.sol')
const AddressBook = artifacts.require('AddressBook.sol')
const MarginPool = artifacts.require('MarginPool.sol')
const Controller = artifacts.require('Controller.sol')
const MarginVault = artifacts.require('MarginVault.sol')
// const ArrayAddressUtils = artifacts.require('ArrayAddressUtils.sol')

// address(0)
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

import { ActionType, getAction } from '../helpers/actions'

contract('Controller', ([owner, user]) => {
  // ERC20 mock
  let usdc: MockERC20Instance
  let usdc09: MockERC20Instance
  let usdc07: MockERC20Instance
  let weth: MockERC20Instance
  // Oracle module
  let oracle: MockOracleInstance
  // calculator module
  let calculator: MarginCalculatorInstance
  // margin pool module
  let marginPool: MarginPoolInstance
  // whitelist module mock
  let whitelist: MockWhitelistModuleInstance
  // addressbook module mock
  let addressBook: AddressBookInstance
  // controller module
  let controllerImplementation: ControllerInstance
  let controllerProxy: ControllerInstance

  // deployed and whitelisted onTokens
  let shortONtoken: MockONtokenInstance

  const usdcDecimals = 6
  const wethDecimals = 18

  before('Deployment', async () => {
    // addressbook deployment
    addressBook = await AddressBook.new()
    // ERC20 deployment
    usdc = await MockERC20.new('USDC', 'USDC', usdcDecimals)
    usdc07 = await MockERC20.new('USDC07', 'USDC07', usdcDecimals)
    usdc09 = await MockERC20.new('USDC09', 'USDC09', usdcDecimals)
    weth = await MockERC20.new('WETH', 'WETH', wethDecimals)
    // deploy Oracle module
    oracle = await MockOracle.new(addressBook.address, { from: owner })

    const libMarginVault = await MarginVault.new()

    //await MarginCalculator.link(libArrayAddressUtils)
    calculator = await MarginCalculator.new(oracle.address)
    // margin pool deployment
    marginPool = await MarginPool.new(addressBook.address)
    // whitelist module
    whitelist = await MockWhitelistModule.new()
    // set margin pool in addressbook
    await addressBook.setMarginPool(marginPool.address)
    // set calculator in addressbook
    await addressBook.setMarginCalculator(calculator.address)
    // set oracle in AddressBook
    await addressBook.setOracle(oracle.address)
    // set whitelist module address
    await addressBook.setWhitelist(whitelist.address)
    // deploy Controller module

    await Controller.link(libMarginVault)
    controllerImplementation = await Controller.new()

    // set controller address in AddressBook
    await addressBook.setController(controllerImplementation.address, { from: owner })

    // check controller deployment
    const controllerProxyAddress = await addressBook.getController()
    controllerProxy = await Controller.at(controllerProxyAddress)
    const proxy: OwnedUpgradeabilityProxyInstance = await OwnedUpgradeabilityProxy.at(controllerProxyAddress)

    assert.equal(await proxy.proxyOwner(), addressBook.address, 'Proxy owner address mismatch')
    assert.equal(await controllerProxy.owner(), owner, 'Controller owner address mismatch')
    assert.equal(await controllerProxy.systemPartiallyPaused(), false, 'system is partially paused')

    // make user rich
    await weth.mint(user, createTokenAmount(100000, wethDecimals))
    await usdc.mint(user, createTokenAmount(100000, usdcDecimals))
    await usdc07.mint(user, createTokenAmount(100000, usdcDecimals))
    await usdc09.mint(user, createTokenAmount(100000, usdcDecimals))

    await usdc.approve(marginPool.address, createTokenAmount(100000, usdcDecimals), { from: user })
    await usdc07.approve(marginPool.address, createTokenAmount(100000, usdcDecimals), { from: user })
    await usdc09.approve(marginPool.address, createTokenAmount(100000, usdcDecimals), { from: user })

    //const collaterals = [usdc.address, usdc07.address, usdc09.address]
    //await whitelist.whitelistCollaterals(collaterals)

    await oracle.setRealTimePrice(weth.address, createTokenAmount(100, 8))
    await oracle.setRealTimePrice(usdc.address, createTokenAmount(1, 8))
    await oracle.setRealTimePrice(usdc07.address, createTokenAmount(7, 7))
    await oracle.setRealTimePrice(usdc09.address, createTokenAmount(9, 7))

    shortONtoken = await MockONtoken.new()
  })

  describe('Mint with constraints', () => {
    it('should ignore constraints if vault has fewer coins than the limits', async () => {
      const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
      const vaultId = vaultCounter.toNumber() + 1

      const strikeShort = createTokenAmount(100)

      const collaterals = [usdc.address, usdc07.address, usdc09.address]
      await whitelist.whitelistCollaterals(collaterals)

      const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day
      const expiry = resp2bn(await time.latest()).add(expiryTime)

      const collateralsConstraints = [0, createTokenAmount(700, usdcDecimals), createTokenAmount(900, usdcDecimals)]

      // init short put
      await shortONtoken.init(
        addressBook.address,
        weth.address,
        usdc.address,
        collaterals,
        collateralsConstraints,
        strikeShort,
        expiry,
        true
      )

      await whitelist.whitelistONtoken(shortONtoken.address, { from: owner })
      assert.isTrue(await whitelist.isWhitelistedONtoken(shortONtoken.address))

      const collateralsAmounts = [
        createTokenAmount(1000, usdcDecimals),
        createTokenAmount(700, usdcDecimals),
        createTokenAmount(900, usdcDecimals),
      ]

      const mintAmount = createTokenAmount((1000 + 700 * 0.7 + 900 * 0.9) / 100)

      const actionArgs = [
        getAction(ActionType.OpenVault, {
          owner: user,
          shortONtoken: shortONtoken.address,
          vaultId: vaultId,
        }),
        getAction(ActionType.DepositCollateral, {
          owner: user,
          vaultId: vaultId,
          from: user,
          assets: collaterals,
          amounts: collateralsAmounts,
        }),
        getAction(ActionType.MintShortOption, {
          owner: user,
          vaultId: vaultId,
          to: user,
          amount: [mintAmount],
        }),
      ]

      // await controllerProxy.operate(actionArgs, { from: user })

      //await expectRevert(controllerProxy.operate(actionArgs, { from: user }), 'not marginable long')
      await controllerProxy.operate(actionArgs, { from: user })

      const mintedShorts = await shortONtoken.balanceOf(user)

      console.log(mintedShorts.toString)
    })
    it('should revert if constraints reached', async () => {
      const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
      const vaultId = vaultCounter.toNumber()

      const collaterals = [usdc.address, usdc07.address, usdc09.address]
      // await whitelist.whitelistCollaterals(collaterals

      const collateralsAmounts = [
        createTokenAmount(1000, usdcDecimals),
        createTokenAmount(700, usdcDecimals),
        createTokenAmount(900, usdcDecimals),
      ]
      const mintAmount = createTokenAmount((0 + 700 * 0.7 + 900 * 0.9) / 100)

      const actionArgs = [
        getAction(ActionType.DepositCollateral, {
          owner: user,
          vaultId: vaultId,
          from: user,
          assets: collaterals,
          amounts: collateralsAmounts,
        }),
        getAction(ActionType.MintShortOption, {
          owner: user,
          vaultId: vaultId,
          to: user,
          amount: [mintAmount],
        }),
      ]

      // await controllerProxy.operate(actionArgs, { from: user })

      //await expectRevert(controllerProxy.operate(actionArgs, { from: user }), 'not marginable long')
      await expectRevert(
        controllerProxy.operate(actionArgs, { from: user }),
        'Vault value is not enough to collaterize the amount'
      )
    }),
      it('should mint on unconstained token', async () => {
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber()

        const collaterals = [usdc.address, usdc07.address, usdc09.address]
        // await whitelist.whitelistCollaterals(collaterals

        const collateralsAmounts = [createTokenAmount(1000, usdcDecimals), 0, 0]
        const mintAmount = createTokenAmount(1000 / 100)

        const actionArgs = [
          getAction(ActionType.DepositCollateral, {
            owner: user,
            vaultId: vaultId,
            from: user,
            assets: collaterals,
            amounts: collateralsAmounts,
          }),
          getAction(ActionType.MintShortOption, {
            owner: user,
            vaultId: vaultId,
            to: user,
            amount: [mintAmount],
          }),
        ]

        await controllerProxy.operate(actionArgs, { from: user })

        const mintedShorts = await shortONtoken.balanceOf(user)

        console.log(mintedShorts.toString)
      })
  })
})
