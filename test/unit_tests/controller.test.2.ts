import { 
  MockERC20 as MockERC20Instance,
  CallTester as CallTesterInstance,
  MarginCalculator as MarginCalculatorInstance,
  MockOtoken as MockOtokenInstance,
  MockOracle as MockOracleInstance,
  MockWhitelistModule as MockWhitelistModuleInstance,
  MarginPool as MarginPoolInstance,
  Controller as ControllerInstance,
  AddressBook as AddressBookInstance,
  OwnedUpgradeabilityProxy as OwnedUpgradeabilityProxyInstance,
  OtokenImplV1 as OtokenImplV1Instance,
  ArrayAddressUtils as ArrayAddressUtilsInstance
} from '../../typechain-types'  

import { ActionArgsStruct } from '../../typechain-types/Controller'

import { createScaledNumber, createTokenAmount, underlyingPriceToCtokenPrice, resp2bn } from './helpers/utils'
import { artifacts, contract, web3 } from 'hardhat'
import { expect, assert } from 'chai'

import { BigNumber } from 'ethers'

const { expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers')

const CallTester = artifacts.require('CallTester.sol')
const MockERC20 = artifacts.require('MockERC20.sol')
const OtokenImplV1 = artifacts.require('OtokenImplV1.sol')
const MockOtoken = artifacts.require('MockOtoken.sol')
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

contract(
  'Controller',
  ([owner, user, redeemer]) => {
    // ERC20 mock
    let usdc: MockERC20Instance
    let usdc2: MockERC20Instance
    let weth: MockERC20Instance
    let weth2: MockERC20Instance
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

    // deployed and whitelisted otokens
    let shortOtoken: MockOtokenInstance

    const usdcDecimals = 6
    const wethDecimals = 18

    before('Deployment', async () => {
      // addressbook deployment
      addressBook = await AddressBook.new()
      // ERC20 deployment
      usdc = await MockERC20.new('USDC', 'USDC', usdcDecimals)
      usdc2 = await MockERC20.new('USDC2', 'USDC2', usdcDecimals)
      weth = await MockERC20.new('WETH', 'WETH', wethDecimals)
      weth2 = await MockERC20.new('WETH2', 'WETH2', wethDecimals)
      // deploy Oracle module
      oracle = await MockOracle.new(addressBook.address, { from: owner })
      
      
      const libMarginVault = await MarginVault.new()
      
      /*
      const libArrayAddressUtils  = await ArrayAddressUtils.new()
      await MarginCalculator.link(libArrayAddressUtils, libMarginVault)
      */
      
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
      await usdc.mint(user, createTokenAmount(100000, usdcDecimals))
      await weth.mint(user, createTokenAmount(100000, wethDecimals))
      await usdc2.mint(user, createTokenAmount(100000, usdcDecimals))
      await weth2.mint(user, createTokenAmount(100000, wethDecimals))

      
    })

    describe('Redeem', () => {
      const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day 
      it('should redeem from undercollaretized call', async () => {
        // underlying price 100 -> 200
        // strlke 100
        // collateral price 100 -> 10
        //

        const shortCall: MockOtokenInstance = await MockOtoken.new()
        const strike = createTokenAmount(100)
        const strike_x2 = createTokenAmount(200)
        const strike_div10 = createTokenAmount(10)

        const collaterals = [weth2.address,]
        whitelist.whitelistCollaterals(collaterals)

        // init call
        await shortCall.init(
          addressBook.address,
          weth.address,
          usdc.address,
          collaterals,
          strike,
          resp2bn(await time.latest()).add(expiryTime),
          false,
        )        

        await whitelist.whitelistOtoken(shortCall.address, { from: owner })
        assert.isTrue(await whitelist.isWhitelistedOtoken(shortCall.address))
        
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() + 1
        const collateralAmounts = [createTokenAmount(10, wethDecimals)]
        const shortsToMint = createTokenAmount(10)
        const shortsToSell = createTokenAmount(2)

        await weth2.approve(marginPool.address, collateralAmounts[0], { from: user })

        await oracle.setRealTimePrice(weth.address, strike)
        await oracle.setRealTimePrice(weth2.address, strike)

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: user,
            shortOtoken: shortCall.address,
            vaultId: vaultId,
          }),
          getAction(ActionType.DepositCollateral, {
            owner: user, 
            vaultId: vaultId, 
            from: user, 
            assets: collaterals, 
            amounts: collateralAmounts
          }),
          getAction(ActionType.MintShortOption, {
            owner: user, 
            vaultId: vaultId,
            to: user,
            otoken: [shortCall.address],
            amount: [shortsToMint]
          })
        ]

        await controllerProxy.operate(actionArgs, { from: user })
        // await oracle.setRealTimePrice(weth.address, strike_x2)
        // await oracle.setRealTimePrice(weth2.address, strike_div10) 

        await time.increase(expiryTime.toNumber()) // increase time with one hour in seconds

        const expiryTimestamp = await shortCall.expiryTimestamp()
        const curTime = resp2bn(await time.latest())

        assert.isTrue(curTime > expiryTimestamp, "Short otoken hasn't expired")

        // shortCall.transfer(redeemer, createTokenAmount(2))

        console.log('user shorts', (await shortCall.balanceOf(user)).toString())

        await shortCall.transfer(redeemer, shortsToSell, { from: user })


        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiryTimestamp, createTokenAmount(1), true)        
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth2.address, expiryTimestamp, strike_div10, true)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiryTimestamp, strike_x2, true)

        const actionArgsRedeem = [
          getAction(ActionType.Redeem, {
            receiver: redeemer,
            otoken: [shortCall.address],
            amount: [shortsToSell],
          }),
        ]

        await controllerProxy.operate(actionArgsRedeem, { from: redeemer })


        /*
        const actionArgs = [
          {
            actionType: ActionType.DepositLongOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [longOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [longToDeposit],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

          await longOtoken.approve(marginPool.address, longToDeposit, { from: accountOwner1 })
          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C17')

        */
      })

    })
  }
)
