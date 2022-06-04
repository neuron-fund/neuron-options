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
} from '../../typechain-types'

import { ActionArgsStruct } from '../../typechain-types/Controller'

import { createTokenAmount, resp2bn } from '../helpers/utils'
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
const ArrayAddressUtils = artifacts.require('ArrayAddressUtils.sol')

// address(0)
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

import { ActionType, getAction } from '../helpers/actions'

contract(
  'Controller',
  ([owner, accountOwner1, accountOwner2, accountOperator1, holder1, partialPauser, fullPauser, random, donor]) => {
    // ERC20 mock
    let usdc: MockERC20Instance
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

    // deployed and whitelisted onToken
    let whitelistedONtoken: MockONtokenInstance

    const usdcDecimals = 6
    const wethDecimals = 18

    before('Deployment', async () => {
      // addressbook deployment
      addressBook = await AddressBook.new()
      // ERC20 deployment
      usdc = await MockERC20.new('USDC', 'USDC', usdcDecimals)
      weth = await MockERC20.new('WETH', 'WETH', wethDecimals)
      weth2 = await MockERC20.new('WETH', 'WETH', wethDecimals)
      // deploy Oracle module
      oracle = await MockOracle.new(addressBook.address, { from: owner })

      const libMarginVault = await MarginVault.new()
      // const libArrayAddressUtils  = await ArrayAddressUtils.new()
      // await MarginCalculator.link(libArrayAddressUtils, libMarginVault)

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

      // make everyone rich
      await usdc.mint(accountOwner1, createTokenAmount(10000, usdcDecimals))
      await usdc.mint(accountOperator1, createTokenAmount(10000, usdcDecimals))
      await usdc.mint(random, createTokenAmount(10000, usdcDecimals))
      await usdc.mint(donor, createTokenAmount(10000, usdcDecimals))

      //whitelisted dumb onToken
      whitelistedONtoken = await MockONtoken.new()
      await whitelist.whitelistONtoken(whitelistedONtoken.address, { from: owner })
      // await addressBook.setWhitelist(whitelist.address)
      assert.isTrue(await whitelist.isWhitelistedONtoken(whitelistedONtoken.address))
    })

    describe('Controller initialization', () => {
      it('should revert when calling initialize if it is already initalized', async () => {
        await expectRevert(
          controllerProxy.initialize(addressBook.address, owner),
          'Initializable: contract is already initialized' //'Contract instance has already been initialized',
        )
      })

      it('should revert when calling initialize with addressbook equal to zero', async () => {
        const controllerImplementation = await Controller.new()

        await expectRevert(controllerImplementation.initialize(ZERO_ADDR, owner), 'C7')
      })

      it('should revert when calling initialize with owner equal to zero', async () => {
        const controllerImplementation = await Controller.new()

        await expectRevert(controllerImplementation.initialize(addressBook.address, ZERO_ADDR), 'C8')
      })
    })

    describe('Account operator', () => {
      it('should set operator', async () => {
        assert.equal(
          await controllerProxy.isOperator(accountOwner1, accountOperator1),
          false,
          'Address is already an operator'
        )

        await controllerProxy.setOperator(accountOperator1, true, { from: accountOwner1 })

        assert.equal(
          await controllerProxy.isOperator(accountOwner1, accountOperator1),
          true,
          'Operator address mismatch'
        )
      })

      it('should revert when set an already operator', async () => {
        await expectRevert(controllerProxy.setOperator(accountOperator1, true, { from: accountOwner1 }), 'C9')
      })

      it('should be able to remove operator', async () => {
        await controllerProxy.setOperator(accountOperator1, false, { from: accountOwner1 })

        assert.equal(
          await controllerProxy.isOperator(accountOwner1, accountOperator1),
          false,
          'Operator address mismatch'
        )
      })

      it('should revert when removing an already removed operator', async () => {
        await expectRevert(controllerProxy.setOperator(accountOperator1, false, { from: accountOwner1 }), 'C9')
      })
    })

    describe('Vault', () => {
      it('should get vault', async () => {
        const vaultId = BigNumber.from(0)
        await controllerProxy.vaults(accountOwner1, vaultId)
      })

      /* it('should get vault balance', async () => {
        const vaultId = BigNumber.from(0)
        const proceed = await controllerProxy.getProceed(accountOwner1, vaultId)
        assert.isTrue(proceed.length==0)
      })*/
    })

    describe('Open vault', () => {
      it('should revert opening a vault an an account from random address', async () => {
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortONtoken: whitelistedONtoken.address,
            vaultId: '1',
          }),
        ]
        await expectRevert(controllerProxy.operate(actionArgs, { from: random }), 'C6')
      })

      it('should revert opening a vault a vault with id equal to zero', async () => {
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortONtoken: whitelistedONtoken.address,
            vaultId: '0',
          }),
        ]
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C14')
      })

      it('should revert opening vault with not whitelisted token', async () => {
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortONtoken: ZERO_ADDR,
            vaultId: '1',
          }),
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C19')
      })

      it('should revert opening multiple vaults in the same operate call', async () => {
        const actionArgs: ActionArgsStruct[] = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortONtoken: whitelistedONtoken.address,
            vaultId: 1,
          }),
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortONtoken: whitelistedONtoken.address,
            vaultId: 2,
          }),
        ]
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C13')
      })

      it('should revert opening a vault with vault type other than 0 or 1', async () => {
        const invalidVault = web3.eth.abi.encodeParameter('uint256', 2)

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortONtoken: whitelistedONtoken.address,
            vaultId: invalidVault,
          }),
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C14') //'A3')
      })

      it('should revert opening multiple vaults for different owners in the same operate call', async () => {
        await controllerProxy.setOperator(accountOwner1, true, { from: accountOwner2 })

        const vaultCounter = await controllerProxy.accountVaultCounter(accountOwner1)
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortONtoken: whitelistedONtoken.address,
            vaultId: '1',
          }),
          getAction(ActionType.OpenVault, {
            owner: accountOwner2,
            shortONtoken: whitelistedONtoken.address,
            vaultId: '1',
          }),
        ]
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C12')
      })

      it('should open vault', async () => {
        const vaultCounterBefore = await controllerProxy.accountVaultCounter(accountOwner1)
        assert.equal(vaultCounterBefore.toString(), '0', 'vault counter before mismatch')
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortONtoken: whitelistedONtoken.address,
            vaultId: vaultCounterBefore.toNumber() + 1,
          }),
        ]
        await controllerProxy.operate(actionArgs, { from: accountOwner1 })

        const vaultCounterAfter = await controllerProxy.accountVaultCounter(accountOwner1)
        assert.equal(vaultCounterAfter.sub(vaultCounterBefore).toString(), '1', 'vault counter after mismatch')
      })

      it('should open vault from account operator', async () => {
        await controllerProxy.setOperator(accountOperator1, true, { from: accountOwner1 })
        assert.equal(
          await controllerProxy.isOperator(accountOwner1, accountOperator1),
          true,
          'Operator address mismatch'
        )

        const vaultCounterBefore = await controllerProxy.accountVaultCounter(accountOwner1)

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortONtoken: whitelistedONtoken.address,
            vaultId: vaultCounterBefore.toNumber() + 1,
          }),
        ]
        await controllerProxy.operate(actionArgs, { from: accountOperator1 })

        const vaultCounterAfter = await controllerProxy.accountVaultCounter(accountOwner1)
        assert.equal(vaultCounterAfter.sub(vaultCounterBefore).toString(), '1', 'vault counter after mismatch')
      })
    })

    describe('Expiry', () => {
      it('should return false for non expired onToken', async () => {
        const onToken: MockONtokenInstance = await MockONtoken.new()
        await onToken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          ['0'],
          createTokenAmount(200),
          resp2bn(await time.latest()).add(60000 * 60000),
          true
        )

        const hasExpired = resp2bn(await onToken.expiryTimestamp()) < resp2bn(await time.latest())

        assert.equal(hasExpired, false, 'ONtoken expiry check mismatch')
      })

      it('should return true for expired onToken', async () => {
        // ONtoken deployment
        const expiredONtoken = await MockONtoken.new()
        // init onToken
        await expiredONtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          ['0'],
          createTokenAmount(200),
          1219835219,
          true
        )

        const hasExpired = resp2bn(await expiredONtoken.expiryTimestamp()) < resp2bn(await time.latest())
        assert.equal(hasExpired, true, 'ONtoken expiry check mismatch')
      })
    })

    describe('Call action', () => {
      let callTester: CallTesterInstance

      before(async () => {
        callTester = await CallTester.new()
      })

      it('should revert activating call action restriction from non-owner', async () => {
        await expectRevert(
          controllerProxy.setCallRestriction(true, { from: random }),
          'Ownable: caller is not the owner'
        )
      })

      it('should revert activating call action restriction when it is already activated', async () => {
        await expectRevert(controllerProxy.setCallRestriction(true, { from: owner }), 'C9')
      })

      it('should deactivate call action restriction from owner', async () => {
        await controllerProxy.setCallRestriction(false, { from: owner })

        assert.equal(await controllerProxy.callRestricted(), false, 'Call action restriction deactivation failed')
      })

      it('should revert deactivating call action restriction when it is already deactivated', async () => {
        await expectRevert(controllerProxy.setCallRestriction(false, { from: owner }), 'C9')
      })
    })
  }
)
