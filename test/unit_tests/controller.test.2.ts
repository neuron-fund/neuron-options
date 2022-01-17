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

    // deployed and whitelisted otokens
    let longOtoken: MockOtokenInstance
    let shortOtoken: MockOtokenInstance

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
      const libArrayAddressUtils  = await ArrayAddressUtils.new()
      await MarginCalculator.link(libArrayAddressUtils, libMarginVault)

      
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

      //whitelisted dumb otoken
      shortOtoken = await MockOtoken.new()
      whitelist.whitelistOtoken(shortOtoken.address, { from: owner })
      await addressBook.setWhitelist(whitelist.address)
      assert.isTrue(await whitelist.isWhitelistedOtoken(shortOtoken.address))



      await controllerProxy.setOperator(accountOperator1, true, { from: accountOwner1 })
      assert.equal(
        await controllerProxy.isOperator(accountOwner1, accountOperator1),
        true,
        'Operator address mismatch',
      )

    })

    describe('Long otoken', () => {
      /*
      let longOtoken: MockOtokenInstance
      before(async () => {
        const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day
        longOtoken = await MockOtoken.new()
        // init otoken
        const tnow = resp2bn(await time.latest())
        const tokenAmount = createTokenAmount(200)

        await longOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          usdc.address,
          tokenAmount,
          tnow.add(expiryTime),
          true,
        )

        await longOtoken.mintOtoken(accountOwner1, createTokenAmount(100))
        await longOtoken.mintOtoken(accountOperator1, createTokenAmount(100))
      })

      describe('deposit long otoken', () => {
        it('should revert depositing a non-whitelisted long otoken into vault', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const longToDeposit = createTokenAmount(20)
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
        })

        it('should revert depositing long with invalid vault id', async () => {
          // whitelist otoken
          await whitelist.whitelistOtoken(longOtoken.address)

          const vaultCounter = BigNumber.from('100')
          const longToDeposit = createTokenAmount(20)
          const actionArgs = [
            {
              actionType: ActionType.DepositLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address,],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToDeposit,],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await longOtoken.approve(marginPool.address, longToDeposit, { from: accountOwner1 })
          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C35')
        })

        it('should revert depositing long from an address that is not the msg.sender nor the owner account address', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))

          const longToDeposit = createTokenAmount(20)
          const actionArgs = [
            {
              actionType: ActionType.DepositLongOption,
              owner: accountOwner1,
              secondAddress: random,
              assets: [longOtoken.address,]
              vaultId: vaultCounter.toNumber(),
              amounts: [longToDeposit,],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await longOtoken.approve(marginPool.address, longToDeposit, { from: random })
          await longOtoken.approve(marginPool.address, longToDeposit, { from: accountOperator1 })
          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOperator1 }), 'C16')

        })

        it('should deposit long otoken into vault from account owner', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const longToDeposit = createTokenAmount(20)
          const actionArgs = [
            {
              actionType: ActionType.DepositLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address,],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToDeposit,],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const senderBalanceBefore = BigNumber.from(await longOtoken.balanceOf(accountOwner1))

          await longOtoken.approve(marginPool.address, longToDeposit, { from: accountOwner1 })
          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const senderBalanceAfter = BigNumber.from(await longOtoken.balanceOf(accountOwner1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceAfter.sub(marginPoolBalanceBefore).toString(),
            longToDeposit,
            'Margin pool balance long otoken balance mismatch',
          )
          assert.equal(
            senderBalanceBefore.sub(senderBalanceAfter).toString(),
            longToDeposit,
            'Sender balance long otoken balance mismatch',
          )
          assert.equal(vaultAfter.longOtokens.length, 1, 'Vault long otoken array length mismatch')
          assert.equal(
            vaultAfter.longOtokens[0],
            longOtoken.address,
            'Long otoken address deposited into vault mismatch',
          )
          assert.equal(
            BigNumber.from(vaultAfter.longAmounts[0]).toString(),
            longToDeposit,
            'Long otoken amount deposited into vault mismatch',
          )
        })

        it('should deposit long otoken into vault from account operator', async () => {
          assert.equal(
            await controllerProxy.isOperator(accountOwner1, accountOperator1),
            true,
            'Operator address mismatch',
          )

          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const longToDeposit = createTokenAmount(20)
          const actionArgs = [
            {
              actionType: ActionType.DepositLongOption,
              owner: accountOwner1,
              secondAddress: accountOperator1,
              asset: longOtoken.address,
              vaultId: vaultCounter.toNumber(),
              amount: longToDeposit,
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const senderBalanceBefore = BigNumber.from(await longOtoken.balanceOf(accountOperator1))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await longOtoken.approve(marginPool.address, longToDeposit, { from: accountOperator1 })
          await controllerProxy.operate(actionArgs, { from: accountOperator1 })

          const marginPoolBalanceAfter = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const senderBalanceAfter = BigNumber.from(await longOtoken.balanceOf(accountOperator1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceAfter.sub(marginPoolBalanceBefore).toString(),
            longToDeposit.toString(),
            'Margin pool balance long otoken balance mismatch',
          )
          assert.equal(
            senderBalanceBefore.sub(senderBalanceAfter).toString(),
            longToDeposit.toString(),
            'Sender balance long otoken balance mismatch',
          )
          assert.equal(vaultAfter.longOtokens.length, 1, 'Vault long otoken array length mismatch')
          assert.equal(
            vaultAfter.longOtokens[0],
            longOtoken.address,
            'Long otoken address deposited into vault mismatch',
          )
          assert.equal(
            BigNumber.from(vaultAfter.longAmounts[0]).sub(BigNumber.from(vaultBefore.longAmounts[0])).toString(),
            longToDeposit.toString(),
            'Long otoken amount deposited into vault mismatch',
          )
        })

        it('should execute depositing long otoken into vault in multiple actions', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const longToDeposit = BigNumber.from(createTokenAmount(20))
          const actionArgs = [
            {
              actionType: ActionType.DepositLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToDeposit.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.DepositLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToDeposit.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const senderBalanceBefore = BigNumber.from(await longOtoken.balanceOf(accountOwner1))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await longOtoken.approve(marginPool.address, longToDeposit.mul(2).toString(), {
            from: accountOwner1,
          })
          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const senderBalanceAfter = BigNumber.from(await longOtoken.balanceOf(accountOwner1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceAfter.sub(marginPoolBalanceBefore).toString(),
            longToDeposit.mul(2).toString(),
            'Margin pool balance long otoken balance mismatch',
          )
          assert.equal(
            senderBalanceBefore.sub(senderBalanceAfter).toString(),
            longToDeposit.mul(2).toString(),
            'Sender balance long otoken balance mismatch',
          )
          assert.equal(vaultAfter.longOtokens.length, 1, 'Vault long otoken array length mismatch')
          assert.equal(
            vaultAfter.longOtokens[0],
            longOtoken.address,
            'Long otoken address deposited into vault mismatch',
          )
          assert.equal(
            BigNumber.from(vaultAfter.longAmounts[0]).sub(BigNumber.from(vaultBefore.longAmounts[0])).toString(),
            longToDeposit.mul(2).toString(),
            'Long otoken amount deposited into vault mismatch',
          )
        })

        it('should revert depositing long otoken with amount equal to zero', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const longToDeposit = createTokenAmount(20)
          const actionArgs = [
            {
              actionType: ActionType.DepositLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: ['0'],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await longOtoken.approve(marginPool.address, longToDeposit, { from: accountOwner1 })
          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'V4')
        })

        it('should revert depositing an expired long otoken', async () => {
          // deploy expired Otoken
          const expiredLongOtoken: MockOtokenInstance = await MockOtoken.new()
          // init otoken
          await expiredLongOtoken.init(
            addressBook.address,
            weth.address,
            usdc.address,
            usdc.address,
            createTokenAmount(200),
            '1219926985', // 2008
            true,
          )
          await expiredLongOtoken.mintOtoken(accountOwner1, BigNumber.from('100'))

          // whitelist otoken
          await whitelist.whitelistOtoken(expiredLongOtoken.address)

          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const longToDeposit = createTokenAmount(20)
          const actionArgs = [
            {
              actionType: ActionType.DepositLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [expiredLongOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToDeposit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await expiredLongOtoken.approve(marginPool.address, longToDeposit, { from: accountOwner1 })
          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C18')

        })

        it('should revert when vault have more than 1 long otoken', async () => {
          const expiryTime = BigNumber.from(60 * 60) // after 1 hour
          const longToDeposit = createTokenAmount(20)
          // deploy second Otoken
          const secondLongOtoken: MockOtokenInstance = await MockOtoken.new()
          // init otoken
          await secondLongOtoken.init(
            addressBook.address,
            weth.address,
            usdc.address,
            usdc.address,
            createTokenAmount(200),
            BigNumber.from(await time.latest()).add(expiryTime),
            true,
          )
          await secondLongOtoken.mintOtoken(accountOwner1, longToDeposit)
          // whitelist otoken
          await whitelist.whitelistOtoken(secondLongOtoken.address)
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const actionArgs = [
            {
              actionType: ActionType.DepositLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [secondLongOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToDeposit],
              index: '1',
              data: ZERO_ADDR,
            },
          ]

          await secondLongOtoken.approve(marginPool.address, longToDeposit, { from: accountOwner1 })
          await expectRevert(
            controllerProxy.operate(actionArgs, { from: accountOwner1 }),
            'MarginCalculator: Too many long otokens in the vault',
          )

        })

        it('should revert deposting long from controller implementation contract instead of the controller proxy', async () => {
          await controllerImplementation.initialize(addressBook.address, owner)
          const longToDeposit = createTokenAmount(20)
          const actionArgs = [
            getAction(ActionType.OpenVault, {
              owner: accountOwner1,
              shortOtoken: longOtoken.address,
              vaultId: vaultCounterBefore.toNumber() + 1,
            }),
            {
              actionType: ActionType.DepositLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: 1,
              amounts: [longToDeposit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await longOtoken.approve(marginPool.address, longToDeposit, { from: accountOwner1 })
          await expectRevert(
            controllerImplementation.operate(actionArgs, { from: accountOwner1 }),
            'MarginPool: Sender is not Controller',
          )
        })
      })

      describe('withdraw long otoken', () => {
        it('should revert withdrawing long otoken with wrong index from a vault', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const longToWithdraw = createTokenAmount(20)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToWithdraw.toString()],
              index: '1',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'V5')
        })

        it('should revert withdrawing long otoken from random address other than account owner or operator', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const longToWithdraw = createTokenAmount(20)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToWithdraw],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: random }), 'C6')
        })

        it('should revert withdrawing long otoken amount greater than the vault balance', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)
          const longToWithdraw = BigNumber.from(vaultBefore.longAmounts[0]).add(1)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToWithdraw.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(
            controllerProxy.operate(actionArgs, { from: accountOwner1 }),
            'SafeMath: subtraction overflow',
          )
        })

        it('should revert withdrawing long with invalid vault id', async () => {
          const vaultCounter = BigNumber.from('100')

          const longToWithdraw = createTokenAmount(10)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToWithdraw],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C35')
        })

        it('should withdraw long otoken to any random address where msg.sender is account owner', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const longToWithdraw = createTokenAmount(10)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawLongOption,
              owner: accountOwner1,
              secondAddress: random,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToWithdraw],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const receiverBalanceBefore = BigNumber.from(await longOtoken.balanceOf(random))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const receiverBalanceAfter = BigNumber.from(await longOtoken.balanceOf(random))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            longToWithdraw.toString(),
            'Margin pool balance long otoken balance mismatch',
          )
          assert.equal(
            receiverBalanceAfter.sub(receiverBalanceBefore).toString(),
            longToWithdraw.toString(),
            'Receiver long otoken balance mismatch',
          )
          assert.equal(vaultAfter.longOtokens.length, 1, 'Vault long otoken array length mismatch')
          assert.equal(
            BigNumber.from(vaultBefore.longAmounts[0]).sub(BigNumber.from(vaultAfter.longAmounts[0])).toString(),
            longToWithdraw.toString(),
            'Long otoken amount in vault after withdraw mismatch',
          )
        })

        it('should withdraw long otoken to any random address where msg.sender is account operator', async () => {
          assert.equal(
            await controllerProxy.isOperator(accountOwner1, accountOperator1),
            true,
            'Operator address mismatch',
          )

          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const longToWithdraw = createTokenAmount(10)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawLongOption,
              owner: accountOwner1,
              secondAddress: random,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToWithdraw],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const receiverBalanceBefore = BigNumber.from(await longOtoken.balanceOf(random))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await controllerProxy.operate(actionArgs, { from: accountOperator1 })

          const marginPoolBalanceAfter = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const receiverBalanceAfter = BigNumber.from(await longOtoken.balanceOf(random))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            longToWithdraw.toString(),
            'Margin pool balance long otoken balance mismatch',
          )
          assert.equal(
            receiverBalanceAfter.sub(receiverBalanceBefore).toString(),
            longToWithdraw.toString(),
            'Receiver long otoken balance mismatch',
          )
          assert.equal(vaultAfter.longOtokens.length, 1, 'Vault long otoken array length mismatch')
          assert.equal(
            BigNumber.from(vaultBefore.longAmounts[0]).sub(BigNumber.from(vaultAfter.longAmounts[0])).toString(),
            longToWithdraw.toString(),
            'Long otoken amount in vault after withdraw mismatch',
          )
        })

        it('should execute withdrawing long otoken in mutliple actions', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const longToWithdraw = BigNumber.from(createTokenAmount(10))
          const actionArgs = [
            {
              actionType: ActionType.WithdrawLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToWithdraw.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.WithdrawLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToWithdraw.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const receiverBalanceBefore = BigNumber.from(await longOtoken.balanceOf(accountOwner1))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const receiverBalanceAfter = BigNumber.from(await longOtoken.balanceOf(accountOwner1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            longToWithdraw.mul(2).toString(),
            'Margin pool balance long otoken balance mismatch',
          )
          assert.equal(
            receiverBalanceAfter.sub(receiverBalanceBefore).toString(),
            longToWithdraw.mul(2).toString(),
            'Receiver long otoken balance mismatch',
          )
          assert.equal(vaultAfter.longOtokens.length, 1, 'Vault long otoken array length mismatch')
          assert.equal(
            BigNumber.from(vaultBefore.longAmounts[0]).sub(BigNumber.from(vaultAfter.longAmounts[0])).toString(),
            longToWithdraw.mul(2).toString(),
            'Long otoken amount in vault after withdraw mismatch',
          )
        })

        it('should remove otoken address from otoken array if amount is equal to zero after withdrawing', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          const longToWithdraw = BigNumber.from(vaultBefore.longAmounts[0])
          const actionArgs = [
            {
              actionType: ActionType.WithdrawLongOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [longOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [longToWithdraw.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const receiverBalanceBefore = BigNumber.from(await longOtoken.balanceOf(accountOwner1))

          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
          const receiverBalanceAfter = BigNumber.from(await longOtoken.balanceOf(accountOwner1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            longToWithdraw.toString(),
            'Margin pool balance long otoken balance mismatch',
          )
          assert.equal(
            receiverBalanceAfter.sub(receiverBalanceBefore).toString(),
            longToWithdraw.toString(),
            'Receiver long otoken balance mismatch',
          )
          assert.equal(vaultAfter.longOtokens.length, 1, 'Vault long otoken array length mismatch')
          assert.equal(vaultAfter.longOtokens[0], ZERO_ADDR, 'Vault long otoken address after clearing mismatch')
          assert.equal(
            BigNumber.from(vaultBefore.longAmounts[0]).sub(BigNumber.from(vaultAfter.longAmounts[0])).toString(),
            longToWithdraw.toString(),
            'Long otoken amount in vault after withdraw mismatch',
          )
        })

        describe('withdraw expired long otoken', () => {
          let expiredLongOtoken: MockOtokenInstance

          before(async () => {
            const expiryTime = BigNumber.from(60 * 60) // after 1 hour
            expiredLongOtoken = await MockOtoken.new()
            // init otoken
            await expiredLongOtoken.init(
              addressBook.address,
              weth.address,
              usdc.address,
              usdc.address,
              createTokenAmount(200),
              BigNumber.from(await time.latest()).add(expiryTime),
              true,
            )
            // some free money for the account owner
            const longToDeposit = createTokenAmount(100)
            await expiredLongOtoken.mintOtoken(accountOwner1, longToDeposit)
            // whitelist otoken
            await whitelist.whitelistOtoken(expiredLongOtoken.address, { from: owner })
            // deposit long otoken into vault
            const vaultId = BigNumber.from('1')
            const actionArgs = [
              {
                actionType: ActionType.DepositLongOption,
                owner: accountOwner1,
                secondAddress: accountOwner1,
                assets: [expiredLongOtoken.address],
                vaultId: vaultId.toNumber(),
                amounts: [longToDeposit],
                index: '0',
                data: ZERO_ADDR,
              },
            ]
            await expiredLongOtoken.approve(marginPool.address, longToDeposit, { from: accountOwner1 })
            await controllerProxy.operate(actionArgs, { from: accountOwner1 })


            const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultId)
            assert.equal(vaultAfter.longOtokens.length, 1, 'Vault long otoken array length mismatch')
            assert.equal(
              vaultAfter.longOtokens[0],
              expiredLongOtoken.address,
              'Long otoken address deposited into vault mismatch',
            )
            assert.equal(
              BigNumber.from(vaultAfter.longAmounts[0]).toString(),
              longToDeposit.toString(),
              'Long otoken amount deposited into vault mismatch',
            )

          })

          it('should revert withdrawing an expired long otoken', async () => {

            // increment time after expiredLongOtoken expiry
            await time.increase(3601) // increase time with one hour in seconds

            const vaultId = BigNumber.from('1')
            const vault = await controllerProxy.vaults(accountOwner1, vaultId)
            const longToWithdraw = BigNumber.from(vault.longAmounts[0])
            const actionArgs = [
              {
                actionType: ActionType.WithdrawLongOption,
                owner: accountOwner1,
                secondAddress: accountOwner1,
                assets: [expiredLongOtoken.address],
                vaultId: vaultId.toNumber(),
                amounts: [longToWithdraw.toString()],
                index: '0',
                data: ZERO_ADDR,
              },
            ]

            assert.equal(
              await controllerProxy.hasExpired(expiredLongOtoken.address),
              true,
              'Long otoken is not expired yet',
            )

            await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C19')
          })
        })
      })
    })

    describe('Collateral asset', () => {
      describe('Deposit collateral asset', () => {
        it('should deposit a whitelisted collateral asset from account owner', async () => {
          // whitelist usdc
          await whitelist.whitelistCollateral(usdc.address)
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const collateralToDeposit = createTokenAmount(10, usdcDecimals)
          const actionArgs = [
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDeposit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOwner1))

          await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOwner1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceAfter.sub(marginPoolBalanceBefore).toString(),
            collateralToDeposit.toString(),
            'Margin pool balance collateral asset balance mismatch',
          )
          assert.equal(
            senderBalanceBefore.sub(senderBalanceAfter).toString(),
            collateralToDeposit.toString(),
            'Sender balance collateral asset balance mismatch',
          )
          assert.equal(vaultAfter.collateralAssets.length, 1, 'Vault collateral assets array length mismatch')
          assert.equal(
            vaultAfter.collateralAssets[0],
            usdc.address,
            'Collateral asset address deposited into vault mismatch',
          )
          assert.equal(
            BigNumber.from(vaultAfter.collateralAmounts[0]).toString(),
            collateralToDeposit.toString(),
            'Collateral asset amount deposited into vault mismatch',
          )
        })

        it('should deposit a whitelisted collateral asset from account operator', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const collateralToDeposit = createTokenAmount(10, usdcDecimals)
          const actionArgs = [
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOperator1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDeposit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOperator1))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOperator1 })
          await controllerProxy.operate(actionArgs, { from: accountOperator1 })

          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOperator1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceAfter.sub(marginPoolBalanceBefore).toString(),
            collateralToDeposit.toString(),
            'Margin pool balance collateral asset balance mismatch',
          )
          assert.equal(
            senderBalanceBefore.sub(senderBalanceAfter).toString(),
            collateralToDeposit.toString(),
            'Sender balance collateral asset balance mismatch',
          )
          assert.equal(vaultAfter.collateralAssets.length, 1, 'Vault collateral assets array length mismatch')
          assert.equal(
            vaultAfter.collateralAssets[0],
            usdc.address,
            'Collateral asset address deposited into vault mismatch',
          )
          assert.equal(
            BigNumber.from(vaultAfter.collateralAmounts[0])
              .sub(BigNumber.from(vaultBefore.collateralAmounts[0]))
              .toString(),
            collateralToDeposit.toString(),
            'Long otoken amount deposited into vault mismatch',
          )
        })

        it('should revert depositing collateral asset with invalid vault id', async () => {
          const vaultCounter = BigNumber.from('100')

          const collateralToDeposit = createTokenAmount(10, usdcDecimals)
          const actionArgs = [
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDeposit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C35')
        })

        it('should revert depositing long from an address that is not the msg.sender nor the owner account address', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))

          const collateralToDeposit = createTokenAmount(10, usdcDecimals)
          const actionArgs = [
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: random,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDeposit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await usdc.approve(marginPool.address, collateralToDeposit, { from: random })
          await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOperator1 })
          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOperator1 }), 'C20')
        })

        it('should revert depositing a collateral asset with amount equal to zero', async () => {          
          //const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const collateralToDeposit = createTokenAmount(0, usdcDecimals)
          const actionArgs = [
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDeposit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'V7')
        })

        it('should execute depositing collateral into vault in multiple actions', async () => {
          //const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const collateralToDeposit = BigNumber.from(createTokenAmount(20, usdcDecimals))
          const actionArgs = [
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDeposit.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDeposit.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOwner1))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await usdc.approve(marginPool.address, collateralToDeposit.mul(2), { from: accountOwner1 })
          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOwner1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceAfter.sub(marginPoolBalanceBefore).toString(),
            collateralToDeposit.mul(2).toString(),
            'Margin pool collateral balance mismatch',
          )
          assert.equal(
            senderBalanceBefore.sub(senderBalanceAfter).toString(),
            collateralToDeposit.mul(2).toString(),
            'Sender collateral asset balance mismatch',
          )
          assert.equal(vaultAfter.collateralAmounts.length, 1, 'Vault collateral asset array length mismatch')
          assert.equal(
            vaultAfter.collateralAssets[0],
            usdc.address,
            'Collateral asset address deposited into vault mismatch',
          )
          assert.equal(
            BigNumber.from(vaultAfter.collateralAmounts[0])
              .sub(BigNumber.from(vaultBefore.collateralAmounts[0]))
              .toString(),
            collateralToDeposit.mul(2).toString(),
            'Collateral asset amount deposited into vault mismatch',
          )
        })

        describe('Deposit un-whitelisted collateral asset', () => {
          it('should revert depositing a collateral asset that is not whitelisted', async () => {
            // deploy a shitcoin
            const trx: MockERC20Instance = await MockERC20.new('TRX', 'TRX', 18)
            await trx.mint(accountOwner1, BigNumber.from('1000'))

            const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
            assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

            const collateralDeposit = createTokenAmount(10, wethDecimals)
            const actionArgs = [
              {
                actionType: ActionType.DepositCollateral,
                owner: accountOwner1,
                secondAddress: accountOwner1,
                assets: [trx.address],
                vaultId: vaultCounter.toNumber(),
                amounts: [collateralDeposit],
                index: '0',
                data: ZERO_ADDR,
              },
            ]

            await trx.approve(marginPool.address, collateralDeposit, { from: accountOwner1 })
            await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C21')
          })
        })

        it('should revert when vault have more than 1 collateral type', async () => {
          const collateralToDeposit = createTokenAmount(10, wethDecimals)
          //whitelist weth to use in this test
          await whitelist.whitelistCollateral(weth.address)
          await weth.mint(accountOwner1, collateralToDeposit)

          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const actionArgs = [
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [weth.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDeposit],
              index: '1',
              data: ZERO_ADDR,
            },
          ]

          await weth.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
          await expectRevert(
            controllerProxy.operate(actionArgs, { from: accountOwner1 }),
            'MarginCalculator: Too many collateral assets in the vault',
          )
        })
      })

      describe('withdraw collateral', () => {
        it('should revert withdrawing collateral asset with wrong index from a vault', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const collateralToWithdraw = createTokenAmount(20, usdcDecimals)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToWithdraw],
              index: '1',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'V8')
        })

        it('should revert withdrawing collateral asset from an invalid id', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const collateralToWithdraw = createTokenAmount(20, usdcDecimals)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: '1350',
              amounts: [collateralToWithdraw],
              index: '1',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C35')
        })

        it('should revert withdrawing collateral asset amount greater than the vault balance', async () => {
          /*
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)
          const collateralToWithdraw = BigNumber.from(vaultBefore.collateralAmounts[0]).add(1)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToWithdraw.toNumber()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(
            controllerProxy.operate(actionArgs, { from: accountOwner1 }),
            'SafeMath: subtraction overflow',
          )

        })

        it('should withdraw collateral to any random address where msg.sender is account owner', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const collateralToWithdraw = createTokenAmount(10, usdcDecimals)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawCollateral,
              owner: accountOwner1,
              secondAddress: random,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToWithdraw],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const receiverBalanceBefore = BigNumber.from(await usdc.balanceOf(random))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const receiverBalanceAfter = BigNumber.from(await usdc.balanceOf(random))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            collateralToWithdraw.toString(),
            'Margin pool collateral asset balance mismatch',
          )
          assert.equal(
            receiverBalanceAfter.sub(receiverBalanceBefore).toString(),
            collateralToWithdraw.toString(),
            'Receiver collateral asset balance mismatch',
          )
          assert.equal(vaultAfter.collateralAssets.length, 1, 'Vault collateral asset array length mismatch')
          assert.equal(
            BigNumber.from(vaultBefore.collateralAmounts[0])
              .sub(BigNumber.from(vaultAfter.collateralAmounts[0]))
              .toString(),
            collateralToWithdraw.toString(),
            'Collateral asset amount in vault after withdraw mismatch',
          )
        })

        it('should withdraw collateral asset to any random address where msg.sender is account operator', async () => {
          assert.equal(
            await controllerProxy.isOperator(accountOwner1, accountOperator1),
            true,
            'Operator address mismatch',
          )

          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const collateralToWithdraw = createTokenAmount(10, usdcDecimals)
          const actionArgs = [
            {
              actionType: ActionType.WithdrawCollateral,
              owner: accountOwner1,
              secondAddress: random,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToWithdraw],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const receiverBalanceBefore = BigNumber.from(await usdc.balanceOf(random))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await controllerProxy.operate(actionArgs, { from: accountOperator1 })

          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const receiverBalanceAfter = BigNumber.from(await usdc.balanceOf(random))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            collateralToWithdraw.toString(),
            'Margin pool collateral asset balance mismatch',
          )
          assert.equal(
            receiverBalanceAfter.sub(receiverBalanceBefore).toString(),
            collateralToWithdraw.toString(),
            'Receiver collateral asset balance mismatch',
          )
          assert.equal(vaultAfter.collateralAssets.length, 1, 'Vault collateral asset array length mismatch')
          assert.equal(
            BigNumber.from(vaultBefore.collateralAmounts[0])
              .sub(BigNumber.from(vaultAfter.collateralAmounts[0]))
              .toString(),
            collateralToWithdraw.toString(),
            'Collateral asset amount in vault after withdraw mismatch',
          )
        })

        it('should execute withdrawing collateral asset in mutliple actions', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const collateralToWithdraw = BigNumber.from(createTokenAmount(10, usdcDecimals))
          const actionArgs = [
            {
              actionType: ActionType.WithdrawCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToWithdraw.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.WithdrawCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToWithdraw.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const receiverBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOwner1))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const receiverBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOwner1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            collateralToWithdraw.mul(2).toString(),
            'Margin pool collateral asset balance mismatch',
          )
          assert.equal(
            receiverBalanceAfter.sub(receiverBalanceBefore).toString(),
            collateralToWithdraw.mul(2).toString(),
            'Receiver collateral asset balance mismatch',
          )
          assert.equal(vaultAfter.collateralAssets.length, 1, 'Vault long otoken array length mismatch')
          assert.equal(
            BigNumber.from(vaultBefore.collateralAmounts[0])
              .sub(BigNumber.from(vaultAfter.collateralAmounts[0]))
              .toString(),
            collateralToWithdraw.mul(2).toString(),
            'Collateral asset amount in vault after withdraw mismatch',
          )
        })

        it('should remove collateral asset address from collateral array if amount is equal to zero after withdrawing', async () => {
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          const collateralToWithdraw = BigNumber.from(vaultBefore.collateralAmounts[0])
          const actionArgs = [
            {
              actionType: ActionType.WithdrawCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              asset: usdc.address,
              vaultId: vaultCounter.toNumber(),
              amount: collateralToWithdraw.toNumber(),
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const receiverBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOwner1))

          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const receiverBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOwner1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            collateralToWithdraw.toString(),
            'Margin pool balance long otoken balance mismatch',
          )
          assert.equal(
            receiverBalanceAfter.sub(receiverBalanceBefore).toString(),
            collateralToWithdraw.toString(),
            'Receiver long otoken balance mismatch',
          )
          assert.equal(vaultAfter.collateralAssets.length, 1, 'Vault collateral asset array length mismatch')
          assert.equal(
            vaultAfter.collateralAssets[0],
            ZERO_ADDR,
            'Vault collater asset address after clearing mismatch',
          )
          assert.equal(
            BigNumber.from(vaultBefore.collateralAmounts[0])
              .sub(BigNumber.from(vaultAfter.collateralAmounts[0]))
              .toString(),
            collateralToWithdraw.toString(),
            'Collateral asset amount in vault after withdraw mismatch',
          )
        })
        
      })
    
    */
    })

    describe('Short otoken', () => {
      before(async () => {
        const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day

        longOtoken = await MockOtoken.new()
        // shortOtoken = await MockOtoken.new()
        // init otoken
        await longOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(250),
          resp2bn(await time.latest()).add(expiryTime),
          true,
        )
        await shortOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(200),
          resp2bn(await time.latest()).add(expiryTime),
          true,
        )

        // whitelist short otoken to be used in the protocol
        // await whitelist.whitelistOtoken(shortOtoken.address, { from: owner })

        // give free money
        const collateralAmount = 10
        const collateralValue = 5

        await longOtoken.mintOtoken(accountOwner1, BigNumber.from('100'), [collateralAmount], [collateralValue])
        await longOtoken.mintOtoken(accountOperator1, BigNumber.from('100'), [collateralAmount], [collateralValue])
        await usdc.mint(accountOwner1, BigNumber.from('1000000'))
        await usdc.mint(accountOperator1, BigNumber.from('1000000'))
        await usdc.mint(random, BigNumber.from('1000000'))
      })

      describe('Mint short otoken', () => {
        it('should revert minting from random address other than owner or operator', async () => {
          const vaultCounter = await controllerProxy.accountVaultCounter(accountOwner1)
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const amountToMint = createTokenAmount(1)
          const actionArgs = [
            {
              actionType: ActionType.MintShortOption,
              owner: accountOwner1,
              secondAddress: random,
              assets: [shortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [amountToMint],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: random }), 'C6')
        })

        it('should revert minting short with invalid vault id', async () => {
          const vaultCounter = BigNumber.from('100')

          const amountToMint = createTokenAmount(1)
          const actionArgs = [
            {
              actionType: ActionType.MintShortOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [shortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [amountToMint],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C35')
        })

        it('mint naked short otoken from owner', async () => {
          const vaultCounter = await controllerProxy.accountVaultCounter(accountOwner1)
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          await whitelist.whitelistCollaterals([usdc.address])

          const collateralToDeposit = resp2bn(await shortOtoken.strikePrice()).div(100)
          const amountToMint = createTokenAmount(1)
          const actionArgs = [
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDeposit.toNumber()],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.MintShortOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [shortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [amountToMint],
              index: '0',
              data: ZERO_ADDR,
            },

          ]

          const marginPoolBalanceBefore = resp2bn(await usdc.balanceOf(marginPool.address))
          const senderBalanceBefore = resp2bn(await usdc.balanceOf(accountOwner1))
          const senderShortBalanceBefore = resp2bn(await shortOtoken.balanceOf(accountOwner1))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = resp2bn(await usdc.balanceOf(marginPool.address))
          const senderBalanceAfter = resp2bn(await usdc.balanceOf(accountOwner1))
          const senderShortBalanceAfter = resp2bn(await shortOtoken.balanceOf(accountOwner1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceAfter.sub(marginPoolBalanceBefore).toString(),
            collateralToDeposit.toString(),
            'Margin pool collateral asset balance mismatch',
          )
          assert.equal(
            senderBalanceBefore.sub(senderBalanceAfter).toString(),
            collateralToDeposit.toString(),
            'Sender collateral asset balance mismatch',
          )
          const collateralAssets = await shortOtoken.getCollateralAssets()
          const collateralAmounts = await shortOtoken.getCollateralsAmounts()
          assert.equal(collateralAssets.length, 1, 'Vault collateral asset array length mismatch')

          assert.equal(
            collateralAssets[0],
            usdc.address,
            'Collateral asset address deposited into vault mismatch',
          )
          assert.equal(
            vaultAfter.shortOtoken,
            shortOtoken.address,
            'Short otoken address deposited into vault mismatch',
          )
          assert.equal(
            senderShortBalanceAfter.sub(senderShortBalanceBefore).toString(),
            amountToMint.toString(),
            'Short otoken amount minted mismatch',
          )
          assert.equal(collateralAmounts[0]
              .sub(collateralAmounts[0])
              .toString(),
            collateralToDeposit.toString(),
            'Collateral asset amount deposited into vault mismatch',
          )
          assert.equal((vaultAfter.shortAmount).toString(),
            amountToMint.toString(),
            'Short otoken amount minted into vault mismatch',
          )
        })

        it('mint naked short otoken from operator', async () => {
          /*
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const collateralToDeposit = BigNumber.from(await shortOtoken.strikePrice()).div(100)
          const amountToMint = createTokenAmount(1)
          const actionArgs = [
            {
              actionType: ActionType.MintShortOption,
              owner: accountOwner1,
              secondAddress: accountOperator1,
              assets: [shortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [amountToMint],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOperator1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDeposit.toNumber()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOperator1))
          const senderShortBalanceBefore = BigNumber.from(await shortOtoken.balanceOf(accountOperator1))
          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOperator1 })
          await controllerProxy.operate(actionArgs, { from: accountOperator1 })

          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOperator1))
          const senderShortBalanceAfter = BigNumber.from(await shortOtoken.balanceOf(accountOperator1))
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            marginPoolBalanceAfter.sub(marginPoolBalanceBefore).toString(),
            collateralToDeposit.toString(),
            'Margin pool collateral asset balance mismatch',
          )
          assert.equal(
            senderBalanceBefore.sub(senderBalanceAfter).toString(),
            collateralToDeposit.toString(),
            'Sender collateral asset balance mismatch',
          )
          assert.equal(vaultAfter.collateralAssets.length, 1, 'Vault collateral asset array length mismatch')
          assert.equal(vaultAfter.shortOtokens.length, 1, 'Vault short otoken array length mismatch')
          assert.equal(
            vaultAfter.collateralAssets[0],
            usdc.address,
            'Collateral asset address deposited into vault mismatch',
          )
          assert.equal(
            vaultAfter.shortOtokens[0],
            shortOtoken.address,
            'Short otoken address deposited into vault mismatch',
          )
          assert.equal(
            senderShortBalanceAfter.sub(senderShortBalanceBefore).toString(),
            amountToMint.toString(),
            'Short otoken amount minted mismatch',
          )
          assert.equal(
            BigNumber.from(vaultAfter.collateralAmounts[0])
              .sub(BigNumber.from(vaultBefore.collateralAmounts[0]))
              .toString(),
            collateralToDeposit.toString(),
            'Collateral asset amount deposited into vault mismatch',
          )
          assert.equal(
            BigNumber.from(vaultAfter.shortAmounts[0]).sub(BigNumber.from(vaultBefore.shortAmounts[0])).toString(),
            amountToMint.toString(),
            'Short otoken amount minted into vault mismatch',
          )
          */
        })

        it('should revert withdrawing collateral from naked short position when net value is equal to zero', async () => {
          /*


          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const vaultBefore = await controllerProxy.getVaultWithDetails(accountOwner1, vaultCounter)

          const [netValue, isExcess] = await calculator.getExcessCollateral(vaultBefore[0], vaultBefore[1])

          const proceed = await controllerProxy.getProceed(accountOwner1, vaultCounter)
          assert.equal(netValue.toString(), proceed.toString())

          assert.equal(netValue.toString(), '0', 'Position net value mistmatch')
          assert.equal(isExcess, true, 'Position collateral excess mismatch')

          const collateralToWithdraw = BigNumber.from(vaultBefore[0].collateralAmounts[0])
          const actionArgs = [
            {
              actionType: ActionType.WithdrawCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToWithdraw.toNumber()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C14')

          */

        })

        it('should withdraw exceeded collateral from naked short position when net value > 0 ', async () => {

          /*
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          // deposit more collateral
          const excessCollateralToDeposit = createTokenAmount(50, usdcDecimals)
          const firstActionArgs = [
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [excessCollateralToDeposit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          await usdc.approve(marginPool.address, excessCollateralToDeposit, { from: accountOwner1 })
          await controllerProxy.operate(firstActionArgs, { from: accountOwner1 })

          const vaultBefore = await controllerProxy.getVaultWithDetails(accountOwner1, vaultCounter)
          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const withdrawerBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOwner1))

          const [netValue, isExcess] = await calculator.getExcessCollateral(vaultBefore[0], vaultBefore[1])

          const proceed = await controllerProxy.getProceed(accountOwner1, vaultCounter)
          assert.equal(netValue.toString(), proceed.toString())

          assert.equal(netValue.toString(), excessCollateralToDeposit.toString(), 'Position net value mistmatch')
          assert.equal(isExcess, true, 'Position collateral excess mismatch')

          const secondActionArgs = [
            {
              actionType: ActionType.WithdrawCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [excessCollateralToDeposit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await controllerProxy.operate(secondActionArgs, { from: accountOwner1 })

          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)
          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const withdrawerBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOwner1))

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            excessCollateralToDeposit.toString(),
            'Margin pool collateral asset balance mismatch',
          )
          assert.equal(
            withdrawerBalanceAfter.sub(withdrawerBalanceBefore).toString(),
            excessCollateralToDeposit.toString(),
            'Receiver collateral asset balance mismatch',
          )
          assert.equal(vaultAfter.collateralAssets.length, 1, 'Vault collateral asset array length mismatch')
          assert.equal(
            BigNumber.from(vaultBefore[0].collateralAmounts[0])
              .sub(BigNumber.from(vaultAfter.collateralAmounts[0]))
              .toString(),
            excessCollateralToDeposit.toString(),
            'Collateral asset amount in vault after withdraw mismatch',
          )
          
          */


        })

        describe('Mint un-whitelisted short otoken', () => {
          it('should revert minting an otoken that is not whitelisted in Whitelist module', async () => {
            const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day

            const vaultCounter = await controllerProxy.accountVaultCounter(accountOwner1)
            const vaultId = vaultCounter.toNumber() + 1

            const notWhitelistedShortOtoken: MockOtokenInstance = await MockOtoken.new()
            await notWhitelistedShortOtoken.init(
              addressBook.address,
              weth.address,
              usdc.address,
              [usdc.address],
              createTokenAmount(200),
              resp2bn(await time.latest()).add(expiryTime),
              true,
            )
            const collateralToDeposit = resp2bn(await notWhitelistedShortOtoken.strikePrice()).div(100)
            const amountToMint = createTokenAmount(1)


            const actionArgs = [
              getAction(ActionType.OpenVault, {
                owner: accountOwner1,
                shortOtoken:notWhitelistedShortOtoken.address,
                vaultId: vaultId,
              }),
              {
                actionType: ActionType.MintShortOption,
                owner: accountOperator1,
                secondAddress: accountOperator1,
                assets: [notWhitelistedShortOtoken.address],
                vaultId: vaultId,
                amounts: [amountToMint],
                index: '0',
                data: ZERO_ADDR,
              },
              {
                actionType: ActionType.DepositCollateral,
                owner: accountOperator1,
                secondAddress: accountOperator1,
                assets: [usdc.address],
                vaultId: vaultId,
                amounts: [collateralToDeposit.toNumber()],
                index: '0',
                data: ZERO_ADDR,
              },
            ]

            await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOperator1 })
            await expectRevert(controllerProxy.operate(actionArgs, { from: accountOperator1 }), 'C23')
          })
        })

        describe('Mint negligible amount', () => {
          let oneDollarPut: MockOtokenInstance
          let smallestPut: MockOtokenInstance
          before('create options with small strike price', async () => {
            oneDollarPut = await MockOtoken.new()
            smallestPut = await MockOtoken.new()
            // init otoken
            await oneDollarPut.init(
              addressBook.address,
              weth.address,
              usdc.address,
              [usdc.address],
              createTokenAmount(1),
              resp2bn(await time.latest()).add(86400),
              true,
            )
            await smallestPut.init(
              addressBook.address,
              weth.address,
              usdc.address,
              [usdc.address],
              1,
              resp2bn(await time.latest()).add(86400),
              true,
            )
            await whitelist.whitelistOtoken(oneDollarPut.address)
            await whitelist.whitelistOtoken(smallestPut.address)
          })
          it('should revert if trying to mint 1 wei of oToken with strikePrice = 1 USD without putting collateral', async () => {
            const vaultId = (await controllerProxy.accountVaultCounter(accountOwner2)).toNumber() + 1
            const actionArgs = [
              getAction(ActionType.OpenVault, {
                owner: accountOwner2,
                shortOtoken: oneDollarPut.address,
                vaultId: vaultId,
              }),
              {
                actionType: ActionType.MintShortOption,
                owner: accountOwner2,
                secondAddress: accountOwner2,
                assets: [oneDollarPut.address],
                vaultId: vaultId,
                amounts: ['1'],
                index: '0',
                data: ZERO_ADDR,
              },
            ]
            await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner2 }), 'Vault value is not enough to collaterize the amount')
          })

          it('should revert minting 1 wei of oToken with minimal strikePrice without putting collateral', async () => {
            const vaultId = (await controllerProxy.accountVaultCounter(accountOwner2)).toNumber() + 1
            const actionArgs = [
              getAction(ActionType.OpenVault, {
                owner: accountOwner2,
                shortOtoken: smallestPut.address,
                vaultId: vaultId,
              }),
              {
                actionType: ActionType.MintShortOption,
                owner: accountOwner2,
                secondAddress: accountOwner2,
                assets: [smallestPut.address],
                vaultId: vaultId,
                amounts: ['1'],
                index: '0',
                data: ZERO_ADDR,
              },
            ]

            await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner2 }), 'Vault value is not enough to collaterize the amount')
          })
        })
      })

      describe('Burn short otoken', () => {
        if('should mint some otoken in vault')


        it('should revert burning short otoken with wrong index from a vault', async () => {
          const vaultCounter = await controllerProxy.accountVaultCounter(accountOwner1)
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const shortOtokenToBurn = await shortOtoken.balanceOf(accountOwner1)
          const actionArgs = [
            {
              actionType: ActionType.BurnShortOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [shortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [shortOtokenToBurn.toString()],
              index: '1',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'V3')
        })


        it('should revert burning when there is no enough balance', async () => {

          // mint to accountOperator1 balance
          const collateralAmount = 10000
          const collateralValue = 10000
          await shortOtoken.mintOtoken(accountOperator1, '10000', [collateralAmount], [collateralValue])

          // transfer operator balance
          const operatorShortBalance = await shortOtoken.balanceOf(accountOperator1)
          console.log('operatorShortBalance', operatorShortBalance.toString())

          await shortOtoken.transfer(accountOwner1, operatorShortBalance, { from: accountOperator1 })

          const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const vaultId = vaultCounter.add(1)

          const shortOtokenToBurn = resp2bn(await shortOtoken.balanceOf(accountOwner1)).add(1)
          const actionArgs = [
            getAction(ActionType.OpenVault, {
              owner: accountOwner1,
              shortOtoken: shortOtoken.address,
              vaultId: vaultId,
            }),
            getAction(ActionType.BurnShortOption, {
                owner: accountOwner1,
                vaultId: vaultId,
                from: accountOperator1,
                otoken: [shortOtoken.address],
                amount: [shortOtokenToBurn.toString()]
            })
          ]

          await expectRevert(
            controllerProxy.operate(actionArgs, { from: accountOperator1 }),
            'ERC20: burn amount exceeds balance',
          )

          // transfer back
          await shortOtoken.transfer(accountOperator1, operatorShortBalance, { from: accountOwner1 })
        })

        it('should revert burning when called from an address other than account owner or operator', async () => {
          const vaultCounter = await controllerProxy.accountVaultCounter(accountOwner1)
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const shortOtokenToBurn = await shortOtoken.balanceOf(accountOwner1)
          const actionArgs = [
            {
              actionType: ActionType.BurnShortOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [shortOtokenToBurn.toString()],
              index: '1',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: random }), 'C6')
        })

        it('should revert minting short with invalid vault id', async () => {
          const vaultCounter = BigNumber.from('100')

          const shortOtokenToBurn = await shortOtoken.balanceOf(accountOperator1)
          const actionArgs = [
            {
              actionType: ActionType.BurnShortOption,
              owner: accountOwner1,
              secondAddress: accountOperator1,
              assets: [shortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [shortOtokenToBurn.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C35')
        })

        it('should revert depositing long from an address that is not the msg.sender nor the owner account address', async () => {
          const vaultCounter = await controllerProxy.accountVaultCounter(accountOwner1)

          const shortOtokenToBurn = await shortOtoken.balanceOf(accountOperator1)
          const actionArgs = [
            {
              actionType: ActionType.BurnShortOption,
              owner: accountOwner1,
              secondAddress: random,
              assets: [shortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [shortOtokenToBurn.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          await expectRevert(controllerProxy.operate(actionArgs, { from: accountOperator1 }), 'C25')
        })

        it('should burn short otoken when called from account operator', async () => {
          const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(accountOwner1))
          assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

          const vaultBefore = await controllerProxy.vaults(accountOwner1, vaultCounter)

          const shortOtokenToBurn = await shortOtoken.balanceOf(accountOperator1)
          console.log('shortOtokenToBurn', shortOtokenToBurn.toString())

          const vaultId = vaultCounter.add(1)

          const actionArgs = [
            getAction(ActionType.OpenVault, {
              owner: accountOwner1,
              shortOtoken: shortOtoken.address,
              vaultId: vaultId,
            }),
            getAction(ActionType.BurnShortOption, {
              owner: accountOwner1,
              vaultId: vaultId,
              from: accountOperator1,
              otoken: [shortOtoken.address],
              amount: [shortOtokenToBurn.toString()]
            })
          ]


          const sellerBalanceBefore = await shortOtoken.balanceOf(accountOperator1)

          await controllerProxy.operate(actionArgs, { from: accountOperator1 })

          const sellerBalanceAfter = await shortOtoken.balanceOf(accountOperator1)
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)

          assert.equal(
            sellerBalanceBefore.sub(sellerBalanceAfter).toString(),
            shortOtokenToBurn.toString(),
            'Short otoken burned amount mismatch',
          )
          assert.equal(vaultAfter.shortOtoken.length, 1, 'Vault short otoken array length mismatch')
          assert.equal(
            vaultAfter.shortOtoken,
            shortOtoken.address,
            'Vault short otoken address after burning mismatch',
          )
          assert.equal(
            BigNumber.from(vaultBefore.shortAmount).sub(BigNumber.from(vaultAfter.shortAmount)).toString(),
            shortOtokenToBurn.toString(),
            'Short otoken amount in vault after burn mismatch')
          assert.equal(vaultAfter.shortOtoken, ZERO_ADDR, 'Vault short otoken address after clearing mismatch')
          assert.equal(
            BigNumber.from(vaultBefore.shortAmount).sub(BigNumber.from(vaultAfter.shortAmount)).toString(),
            shortOtokenToBurn.toString(),
            'Short otoken amount in vault after burn mismatch',
          )

        })

        it('should mint and burn at the same transaction', async () => {
          const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)
          // const vaultCounter = 1
          const amountToMint = createScaledNumber(1)
          const actionArgs = [
            getAction(ActionType.OpenVault, {
              owner: accountOwner1,
              shortOtoken: shortOtoken.address,
              vaultId:  vaultCounter.toNumber(),
            }),
            {
              actionType: ActionType.MintShortOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [shortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [amountToMint],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.BurnShortOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [shortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [amountToMint],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          const senderShortBalanceBefore = await shortOtoken.balanceOf(accountOwner1)
          await controllerProxy.operate(actionArgs, { from: accountOwner1 })
          const senderShortBalanceAfter = await shortOtoken.balanceOf(accountOwner1)
          const vaultAfter = await controllerProxy.vaults(accountOwner1, vaultCounter)
          assert.equal(vaultAfter.shortOtoken, ZERO_ADDR)
          assert.equal(
            senderShortBalanceBefore.toString(),
            senderShortBalanceAfter.toString(),
            'Sender short otoken amount mismatch',
          )
        })

        describe('Expired otoken', () => {
          let expiredShortOtoken: MockOtokenInstance

          before(async () => {
            const vaultCounterBefore = await controllerProxy.accountVaultCounter(accountOwner1)
            const expiryTime = BigNumber.from(60 * 60) // after 1 hour
            expiredShortOtoken = await MockOtoken.new()
            // init otoken
            await expiredShortOtoken.init(
              addressBook.address,
              weth.address,
              usdc.address,
              [usdc.address],
              createTokenAmount(200),
              resp2bn(await time.latest()).add(expiryTime),
              true,
            )

            // whitelist otoken to be minted
            await whitelist.whitelistOtoken(expiredShortOtoken.address, { from: owner })
            const collateralToDeposit = resp2bn(await expiredShortOtoken.strikePrice()).div(100)
            const amountToMint = createTokenAmount(1)
            const actionArgs = [
              getAction(ActionType.OpenVault, {
                owner: accountOwner1,
                shortOtoken: expiredShortOtoken.address,
                vaultId:  vaultCounterBefore.toNumber() + 1,
              }),
              {
                actionType: ActionType.MintShortOption,
                owner: accountOwner1,
                secondAddress: accountOwner1,
                assets: [expiredShortOtoken.address],
                vaultId: vaultCounterBefore.toNumber() + 1,
                amounts: [amountToMint],
                index: '0',
                data: ZERO_ADDR,
              },
              {
                actionType: ActionType.DepositCollateral,
                owner: accountOwner1,
                secondAddress: accountOwner1,
                assets: [usdc.address],
                vaultId: vaultCounterBefore.toNumber() + 1,
                amounts: [collateralToDeposit.toNumber()],
                index: '0',
                data: ZERO_ADDR,
              },
            ]

            const marginPoolBalanceBefore = await usdc.balanceOf(marginPool.address)
            const senderBalanceBefore = await usdc.balanceOf(accountOwner1)

            await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
            await controllerProxy.operate(actionArgs, { from: accountOwner1 })

            const marginPoolBalanceAfter = await usdc.balanceOf(marginPool.address)
            const senderBalanceAfter = await usdc.balanceOf(accountOwner1)

            assert.equal(
              marginPoolBalanceAfter.sub(marginPoolBalanceBefore).toString(),
              collateralToDeposit.toString(),
              'Margin pool collateral asset balance mismatch',
            )
            assert.equal(
              senderBalanceBefore.sub(senderBalanceAfter).toString(),
              collateralToDeposit.toString(),
              'Sender collateral asset balance mismatch',
            )
          })

          it('should revert burning an expired short otoken', async () => {
            // increment time after expiredLongOtoken expiry
            await time.increase(3601) // increase time with one hour in seconds

            const vaultId = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
            const shortAmountToBurn = BigNumber.from('1')
            const actionArgs = [
              {
                actionType: ActionType.BurnShortOption,
                owner: accountOwner1,
                secondAddress: accountOwner1,
                assets: [expiredShortOtoken.address],
                vaultId: vaultId.toNumber(),
                amounts: [shortAmountToBurn.toNumber()],
                index: '0',
                data: ZERO_ADDR,
              },
            ]

            const expiryTimestamp = await expiredShortOtoken.expiryTimestamp()
            const curTime = resp2bn(await time.latest())            

            assert.isTrue(curTime > expiryTimestamp, 'Long otoken is not expired yet')

            /*
            assert.equal(
              await controllerProxy.hasExpired(expiredShortOtoken.address),
              true,
              'Long otoken is not expired yet',
            )*/

            await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C26')

          })

          it('should revert minting an expired short otoken', async () => {
            const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
            assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

            const collateralToDeposit = BigNumber.from(await expiredShortOtoken.strikePrice()).div(100)
            const amountToMint = createTokenAmount(1)
            const actionArgs = [
              {
                actionType: ActionType.MintShortOption,
                owner: accountOwner1,
                secondAddress: accountOwner1,
                assets: [expiredShortOtoken.address],
                vaultId: vaultCounter.toNumber(),
                amounts: [amountToMint],
                index: '0',
                data: ZERO_ADDR,
              },
              {
                actionType: ActionType.DepositCollateral,
                owner: accountOwner1,
                secondAddress: accountOwner1,
                assets: [usdc.address],
                vaultId: vaultCounter.toNumber(),
                amounts: [collateralToDeposit.toNumber()],
                index: '0',
                data: ZERO_ADDR,
              },
            ]

            await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOperator1 })
            await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C24')
          })

          it('should revert withdraw collateral from a vault with an expired short otoken', async () => {
            const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
            assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

            const collateralToWithdraw = createTokenAmount(10, usdcDecimals)
            const actionArgs = [
              {
                actionType: ActionType.WithdrawCollateral,
                owner: accountOwner1,
                secondAddress: accountOwner1,
                assets: [usdc.address],
                vaultId: vaultCounter.toNumber(),
                amounts: [collateralToWithdraw],
                index: '0',
                data: ZERO_ADDR,
              },
            ]

            await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C22')
          })
        })
      })
    })

    describe('Redeem', () => {
      let shortOtoken: MockOtokenInstance
      let fakeOtoken: MockOtokenInstance

      before(async () => {
        const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day

        shortOtoken = await MockOtoken.new()
        // init otoken
        await shortOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(200),
          resp2bn(await time.latest()).add(expiryTime),
          true,
        )

        fakeOtoken = await MockOtoken.new()
        // init otoken
        await fakeOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(200),
          resp2bn(await time.latest()).add(expiryTime),
          true,
        )

        // whitelist short otoken to be used in the protocol
        await whitelist.whitelistOtoken(shortOtoken.address, { from: owner })
        // open new vault, mintnaked short, sell it to holder 1
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)
        const collateralToDeposit = resp2bn(await shortOtoken.strikePrice()).div(100)
        const amountToMint = createTokenAmount(1)
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken:shortOtoken.address,
            vaultId: vaultCounter.toNumber(),
          }),
          {
            actionType: ActionType.MintShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [amountToMint],
            index: '0',
            data: ZERO_ADDR,
          },
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [collateralToDeposit.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
        await controllerProxy.operate(actionArgs, { from: accountOwner1 })
        // transfer minted short otoken to hodler`
        await shortOtoken.transfer(holder1, amountToMint.toString(), { from: accountOwner1 })
      })
      it('should revert exercising non-whitelisted otoken', async () => {
        const shortAmountToBurn = BigNumber.from('1')
        const actionArgs = [
          {
            actionType: ActionType.Redeem,
            owner: ZERO_ADDR,
            secondAddress: holder1,
            assets: [fakeOtoken.address],
            vaultId: '0',
            amounts: [shortAmountToBurn.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: holder1 }), 'C23') // 'C27')
      })

      it('should revert exercising un-expired otoken', async () => {
        const shortAmountToBurn = BigNumber.from('1')
        const actionArgs = [
          {
            actionType: ActionType.Redeem,
            owner: ZERO_ADDR,
            secondAddress: holder1,
            assets: [shortOtoken.address],
            vaultId: '0',
            amounts: [shortAmountToBurn.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        const expiryTimestamp = await shortOtoken.expiryTimestamp()
        const curTime = resp2bn(await time.latest())

        assert.isTrue(curTime < expiryTimestamp, 'Short otoken has already expired')

        /*assert.equal(await controllerProxy.hasExpired(shortOtoken.address), false, 'Short otoken has already expired')*/



        await expectRevert(controllerProxy.operate(actionArgs, { from: holder1 }), 'C28')

      })

      it('should revert exercising after expiry, when underlying price is not finalized yet', async () => {
        // past time after expiry
        await time.increase(60 * 61 * 24) // increase time with one hour in seconds
        // set price in Oracle Mock, 150$ at expiry, expire ITM
        await oracle.setExpiryPriceFinalizedAllPeiodOver(
          await shortOtoken.underlyingAsset(),
          BigNumber.from(await shortOtoken.expiryTimestamp()),
          createTokenAmount(150),
          true,
        )
        // set it as not finalized in mock
        await oracle.setIsDisputePeriodOver(
          await shortOtoken.underlyingAsset(),
          BigNumber.from(await shortOtoken.expiryTimestamp()),
          false,
        )

        await oracle.setExpiryPriceFinalizedAllPeiodOver(
          await shortOtoken.strikeAsset(),
          BigNumber.from(await shortOtoken.expiryTimestamp()),
          createTokenAmount(1),
          true,
        )

        const shortAmountToBurn = BigNumber.from('1')
        const actionArgs = [
          {
            actionType: ActionType.Redeem,
            owner: ZERO_ADDR,
            secondAddress: holder1,
            assets: [shortOtoken.address],
            vaultId: '0',
            amounts: [shortAmountToBurn.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]


        const expiryTimestamp = await shortOtoken.expiryTimestamp()
        const curTime = resp2bn(await time.latest())

        assert.isTrue(curTime > expiryTimestamp, 'Short otoken is not expired yet')


        // assert.equal(await controllerProxy.hasExpired(shortOtoken.address), true, 'Short otoken is not expired yet')

        await expectRevert(controllerProxy.operate(actionArgs, { from: holder1 }), 'C29')
      
      })

      it('should revert exercising if cash value receiver address in equal to address zero', async () => {
        // set it as finalized in mock
        await oracle.setIsDisputePeriodOver(
          await shortOtoken.underlyingAsset(),
          BigNumber.from(await shortOtoken.expiryTimestamp()),
          true,
        )

        const shortAmountToBurn = createTokenAmount(1)
        const actionArgs = [
          {
            actionType: ActionType.Redeem,
            owner: ZERO_ADDR,
            secondAddress: ZERO_ADDR,
            assets: [shortOtoken.address],
            vaultId: '0',
            amounts: [shortAmountToBurn],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        const expiryTimestamp = await shortOtoken.expiryTimestamp()
        const curTime = resp2bn(await  time.latest())

        assert.isTrue(curTime > expiryTimestamp, 'Short otoken is not expired yet')
        
        
        //  assert.equal(await controllerProxy.hasExpired(shortOtoken.address), true, 'Short otoken is not expired yet')

        await expectRevert(controllerProxy.operate(actionArgs, { from: holder1 }), 'A14')

      })

      it('should redeem after expiry + price is finalized', async () => {

        const shortAmountToBurn = createTokenAmount(1)
        const actionArgs = [
          {
            actionType: ActionType.Redeem,
            owner: ZERO_ADDR,
            secondAddress: holder1,
            assets: [shortOtoken.address],
            vaultId: '0',
            amounts: [shortAmountToBurn],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        const expiryTimestamp = await shortOtoken.expiryTimestamp()
        const curTime = resp2bn(await  time.latest())

        assert.isTrue(curTime > expiryTimestamp, 'Short otoken is not expired yet')


        // assert.equal(await controllerProxy.hasExpired(shortOtoken.address), true, 'Short otoken is not expired yet')

        const payout = createTokenAmount(50, usdcDecimals)
        const marginPoolBalanceBefore = await usdc.balanceOf(marginPool.address)
        const senderBalanceBefore = await usdc.balanceOf(holder1)
        const senderShortBalanceBefore = await shortOtoken.balanceOf(holder1)

        await controllerProxy.operate(actionArgs, { from: holder1 })

        const marginPoolBalanceAfter = await usdc.balanceOf(marginPool.address)
        const senderBalanceAfter = await usdc.balanceOf(holder1)
        const senderShortBalanceAfter = await shortOtoken.balanceOf(holder1)

        assert.equal(
          marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
          payout.toString(),
          'Margin pool collateral asset balance mismatch',
        )
        assert.equal(
          senderBalanceAfter.sub(senderBalanceBefore).toString(),
          payout.toString(),
          'Sender collateral asset balance mismatch',
        )
        assert.equal(
          senderShortBalanceBefore.sub(senderShortBalanceAfter).toString(),
          shortAmountToBurn.toString(),
          ' Burned short otoken amount mismatch',
        )
      })

      it('should redeem call option correctly', async () => {
        const expiry = BigNumber.from(await time.latest()).add(BigNumber.from(60 * 60)).toNumber()
        const call: MockOtokenInstance = await MockOtoken.new()
        await call.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [weth.address],
          createTokenAmount(200),
          expiry,
          false,
        )

        await whitelist.whitelistOtoken(call.address)
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)
        const amountCollateral = createTokenAmount(1, wethDecimals)
        await weth.mint(accountOwner1, amountCollateral)
        await weth.approve(marginPool.address, amountCollateral, { from: accountOwner1 })
        const amountOtoken = createTokenAmount(1)
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken: call.address,
            vaultId: vaultCounter.toNumber(),
          }),
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [weth.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [amountCollateral],
            index: '0',
            data: ZERO_ADDR,
          },
          {
            actionType: ActionType.MintShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [call.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [amountOtoken],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await controllerProxy.operate(actionArgs, { from: accountOwner1 })
        await call.transfer(holder1, amountOtoken, { from: accountOwner1 })

        await time.increaseTo(expiry + 10)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiry, createTokenAmount(400), true)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiry, createTokenAmount(1), true)
        const redeemArgs = [
          {
            actionType: ActionType.Redeem,
            owner: ZERO_ADDR,
            secondAddress: holder1,
            assets: [call.address],
            vaultId: '0',
            amounts: [amountOtoken],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        const expectedPayout = createTokenAmount(0.5, wethDecimals)

        const userBalanceBefore = BigNumber.from(await weth.balanceOf(holder1))
        await controllerProxy.operate(redeemArgs, { from: holder1 })
        const userBalanceAfter = BigNumber.from(await weth.balanceOf(holder1))
        assert.equal(userBalanceAfter.sub(userBalanceBefore).toString(), expectedPayout)
      })

      it('should revert redeem option if collateral is different from underlying, and collateral price is not finalized', async () => {
        const expiry = BigNumber.from(await time.latest()).add(BigNumber.from(60 * 60)).toNumber()

        await whitelist.whitelistCollaterals([weth2.address])
        const call: MockOtokenInstance = await MockOtoken.new()
        await call.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [weth2.address],
          createTokenAmount(200),
          expiry,
          false,
        )

        await oracle.setRealTimePrice(weth.address, createTokenAmount(400))
        await oracle.setRealTimePrice(weth2.address, createTokenAmount(400))

        await whitelist.whitelistOtoken(call.address)
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)
        const amountCollateral = createTokenAmount(1, wethDecimals)
        await weth2.mint(accountOwner1, amountCollateral)
        await weth2.approve(marginPool.address, amountCollateral, { from: accountOwner1 })

        const amountOtoken = createTokenAmount(1)
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken: call.address,
            vaultId: vaultCounter.toNumber(),
          }),
          {
            actionType: ActionType.MintShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [call.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [amountOtoken],
            index: '0',
            data: ZERO_ADDR,
          },
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [weth2.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [amountCollateral],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await controllerProxy.operate(actionArgs, { from: accountOwner1 })
        await call.transfer(holder1, amountOtoken, { from: accountOwner1 })

        await time.increaseTo(expiry + 10)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiry, createTokenAmount(400), true)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiry, createTokenAmount(1), true)

        const redeemArgs = [
          {
            actionType: ActionType.Redeem,
            owner: ZERO_ADDR,
            secondAddress: holder1,
            assets: [call.address],
            vaultId: '0',
            amounts: [amountOtoken],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await expectRevert(controllerProxy.operate(redeemArgs, { from: holder1 }), 'C29')
        
      })

      describe('Redeem multiple Otokens', () => {
        let firstOtoken: MockOtokenInstance
        let secondOtoken: MockOtokenInstance

        before(async () => {
          const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day

          firstOtoken = await MockOtoken.new()
          secondOtoken = await MockOtoken.new()

          const expiry = BigNumber.from(await time.latest()).add(expiryTime)
          // init otoken
          await firstOtoken.init(
            addressBook.address,
            weth.address,
            usdc.address,
            [usdc.address],
            createTokenAmount(200),
            expiry,
            true,
          )
          await secondOtoken.init(
            addressBook.address,
            weth.address,
            usdc.address,
            [usdc.address],
            createTokenAmount(200),
            expiry,
            true,
          )
          // whitelist otoken to be used in the protocol
          await whitelist.whitelistOtoken(firstOtoken.address, { from: owner })
          await whitelist.whitelistOtoken(secondOtoken.address, { from: owner })

          // open new vault, mint naked short, sell it to holder 1
          const firstCollateralToDeposit = BigNumber.from(await firstOtoken.strikePrice()).div(100)
          const secondCollateralToDeposit = BigNumber.from(await secondOtoken.strikePrice()).div(100)
          const amountToMint = createTokenAmount(1)
          let vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)
          let actionArgs = [
            getAction(ActionType.OpenVault, {
              owner: accountOwner1,
              shortOtoken: firstOtoken.address,
              vaultId: vaultCounter.toNumber(),
            }),
            {
              actionType: ActionType.MintShortOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [firstOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [amountToMint],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [firstCollateralToDeposit.toNumber()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          await usdc.approve(marginPool.address, firstCollateralToDeposit, { from: accountOwner1 })
          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)

          actionArgs = [
            getAction(ActionType.OpenVault, {
              owner: accountOwner1,
              shortOtoken: secondOtoken.address,
              vaultId: vaultCounter.toNumber(),
            }),
            {
              actionType: ActionType.MintShortOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [secondOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [amountToMint],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [secondCollateralToDeposit.toNumber()],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          await usdc.approve(marginPool.address, firstCollateralToDeposit, { from: accountOwner1 })
          await controllerProxy.operate(actionArgs, { from: accountOwner1 })
          // transfer minted short otoken to hodler
          await firstOtoken.transfer(holder1, amountToMint, { from: accountOwner1 })
          await secondOtoken.transfer(holder1, amountToMint, { from: accountOwner1 })
        })

        it('should redeem multiple Otokens in one transaction', async () => {
          // past time after expiry
          await time.increase(60 * 61 * 24)
          // set price in Oracle Mock, 150$ at expiry, expire ITM
          await oracle.setExpiryPriceFinalizedAllPeiodOver(
            await firstOtoken.underlyingAsset(),
            BigNumber.from(await firstOtoken.expiryTimestamp()),
            createTokenAmount(150),
            true,
          )
          await oracle.setExpiryPriceFinalizedAllPeiodOver(
            await secondOtoken.underlyingAsset(),
            BigNumber.from(await secondOtoken.expiryTimestamp()),
            createTokenAmount(150),
            true,
          )

          await oracle.setExpiryPriceFinalizedAllPeiodOver(
            await firstOtoken.strikeAsset(),
            BigNumber.from(await firstOtoken.expiryTimestamp()),
            createTokenAmount(1),
            true,
          )
          await oracle.setExpiryPriceFinalizedAllPeiodOver(
            await secondOtoken.strikeAsset(),
            BigNumber.from(await firstOtoken.expiryTimestamp()),
            createTokenAmount(1),
            true,
          )

          const amountToRedeem = createTokenAmount(1)
          const actionArgs = [
            {
              actionType: ActionType.Redeem,
              owner: ZERO_ADDR,
              secondAddress: holder1,
              assets: [firstOtoken.address],
              vaultId: '0',
              amounts: [amountToRedeem],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.Redeem,
              owner: ZERO_ADDR,
              secondAddress: holder1,
              assets: [secondOtoken.address],
              vaultId: '0',
              amounts: [amountToRedeem],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          const payout = createTokenAmount(100, usdcDecimals)
          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceBefore = BigNumber.from(await usdc.balanceOf(holder1))

          await controllerProxy.operate(actionArgs, { from: holder1 })

          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceAfter = BigNumber.from(await usdc.balanceOf(holder1))
          const senderFirstBalanceAfter = BigNumber.from(await firstOtoken.balanceOf(holder1))
          const senderSecondBalanceAfter = BigNumber.from(await secondOtoken.balanceOf(holder1))

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            payout.toString(),
            'Margin pool collateral asset balance mismatch',
          )
          assert.equal(
            senderBalanceAfter.sub(senderBalanceBefore).toString(),
            payout.toString(),
            'Sender collateral asset balance mismatch',
          )
          assert.equal(senderFirstBalanceAfter.toString(), '0', ' Burned first otoken amount mismatch')
          assert.equal(senderSecondBalanceAfter.toString(), '0', ' Burned first otoken amount mismatch')
        })
      })
    })

    describe('Settle vault', () => {
      let shortOtoken: MockOtokenInstance

      before(async () => {
        const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day

        shortOtoken = await MockOtoken.new()
        // init otoken
        await shortOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(200),
          resp2bn(await time.latest()).add(expiryTime),
          true,
        )
        // whitelist otoken to be used in the protocol
        await whitelist.whitelistOtoken(shortOtoken.address, { from: owner })
        // open new vault, mint naked short, sell it to holder 1
        const collateralToDespoit = resp2bn(await shortOtoken.strikePrice()).div(100)
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken:shortOtoken.address,
            vaultId: vaultCounter.toNumber(),
          }),
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [collateralToDespoit.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await usdc.approve(marginPool.address, collateralToDespoit, { from: accountOwner1 })
        await controllerProxy.operate(actionArgs, { from: accountOwner1 })
      })

      it('should revert settling a vault that have no long or short otoken', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          {
            actionType: ActionType.SettleVault,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C30')
      })

      it('should revert settling vault before expiry', async () => {
        // mint token in vault before
        const amountToMint = createTokenAmount(1)
        let vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))

        let actionArgs = [
          {
            actionType: ActionType.MintShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [amountToMint],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await controllerProxy.operate(actionArgs, { from: accountOwner1 })
        await shortOtoken.transfer(holder1, amountToMint, { from: accountOwner1 })

        vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        actionArgs = [
          {
            actionType: ActionType.SettleVault,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C31')
      })

      it('should revert settling an invalid vault', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          {
            actionType: ActionType.SettleVault,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.add(10000).toNumber(),
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C35')
      })

      it('should revert settling after expiry when price is not finalized', async () => {
        // past time after expiry
        await time.increase(60 * 61 * 24) // increase time with one hour in seconds
        // set price in Oracle Mock, 150$ at expiry, expire ITM
        const expiry = BigNumber.from(await shortOtoken.expiryTimestamp())
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiry, createTokenAmount(150), true)
        // set it as not finalized in mock
        await oracle.setIsFinalized(
          await shortOtoken.underlyingAsset(),
          BigNumber.from(await shortOtoken.expiryTimestamp()),
          false,
        )
        await oracle.setIsDisputePeriodOver(
          await shortOtoken.underlyingAsset(),
          BigNumber.from(await shortOtoken.expiryTimestamp()),
          false,
        )

        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          {
            actionType: ActionType.SettleVault,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        //fix it!    assert.equal(await controllerProxy.hasExpired(shortOtoken.address), true, 'Short otoken is not expired yet')

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C29')
      })

      it('should settle ITM otoken after expiry + price is finalized', async () => {
        const expiry = BigNumber.from(await shortOtoken.expiryTimestamp())
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiry, createTokenAmount(150), true)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiry, createTokenAmount(1), true)
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          {
            actionType: ActionType.SettleVault,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        const payout = createTokenAmount(150, usdcDecimals)
        const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
        const senderBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOwner1))
        const proceed = await controllerProxy.getProceed(accountOwner1, vaultCounter)

        assert.equal(payout, proceed.toString())

        await controllerProxy.operate(actionArgs, { from: accountOwner1 })

        const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
        const senderBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOwner1))

        assert.equal(
          marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
          payout.toString(),
          'Margin pool collateral asset balance mismatch',
        )
        assert.equal(
          senderBalanceAfter.sub(senderBalanceBefore).toString(),
          payout.toString(),
          'Sender collateral asset balance mismatch',
        )
      })

      it('should settle vault with only long otokens in it', async () => {
        const stirkePrice = 250
        const expiry = BigNumber.from(await time.latest()).add(86400)
        const longOtoken: MockOtokenInstance = await MockOtoken.new()
        // create a new otoken
        await longOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createScaledNumber(stirkePrice),
          expiry,
          true,
        )

        await whitelist.whitelistOtoken(longOtoken.address)

        // mint some long otokens, (so we can put it as long)
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)
        const longAmount = createTokenAmount(1)
        const collateralAmount = createTokenAmount(stirkePrice, usdcDecimals)
        const mintArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken:longOtoken.address,
            vaultId: vaultCounter.toNumber(),
          }),
          {
            actionType: ActionType.MintShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [longOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [longAmount],
            index: '0',
            data: ZERO_ADDR,
          },
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [collateralAmount],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await usdc.approve(marginPool.address, collateralAmount, { from: accountOwner1 })
        await controllerProxy.operate(mintArgs, { from: accountOwner1 })

        // Use the newly minted otoken as long and put it in a new vault
        const newVaultId = vaultCounter.toNumber() + 1

        const newVaultArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken:longOtoken.address,
            vaultId: vaultCounter.toNumber(),
          }),
          {
            actionType: ActionType.DepositLongOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [longOtoken.address],
            vaultId: newVaultId,
            amounts: [longAmount],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await longOtoken.approve(marginPool.address, longAmount, { from: accountOwner1 })
        await whitelist.whitelistOtoken(longOtoken.address)
        await controllerProxy.operate(newVaultArgs, { from: accountOwner1 })
        // go to expiry
        await time.increaseTo(expiry.toNumber() + 10)
        const ethPriceAtExpiry = 200
        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiry, createScaledNumber(1), true)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(
          weth.address,
          expiry,
          createScaledNumber(ethPriceAtExpiry),
          true,
        )
        // settle the secont vault (with only long otoken in it)
        const settleArgs = [
          {
            actionType: ActionType.SettleVault,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [ZERO_ADDR],
            vaultId: newVaultId,
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        const expectedPayout = BigNumber.from(createTokenAmount(stirkePrice - ethPriceAtExpiry, usdcDecimals))
        const ownerUSDCBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOwner1))
        const poolOtokenBefore = BigNumber.from(await longOtoken.balanceOf(marginPool.address))

        const amountPayout = await controllerProxy.getProceed(accountOwner1, newVaultId)

        assert.equal(amountPayout.toString(), expectedPayout.toString(), 'payout calculation mismatch')

        await controllerProxy.operate(settleArgs, { from: accountOwner1 })
        const ownerUSDCBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOwner1))
        const poolOtokenAfter = BigNumber.from(await longOtoken.balanceOf(marginPool.address))
        assert.equal(
          ownerUSDCBalanceAfter.toString(),
          ownerUSDCBalanceBefore.add(amountPayout[0]).toString(),
          'settle long vault payout mismatch',
        )
        assert.equal(
          poolOtokenAfter.toString(),
          poolOtokenBefore.sub(BigNumber.from(longAmount)).toString(),
          'settle long vault otoken mismatch',
        )
      })

      describe('Settle multiple vaults ATM and OTM', () => {
        let firstShortOtoken: MockOtokenInstance
        let secondShortOtoken: MockOtokenInstance

        before(async () => {
          let expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day

          firstShortOtoken = await MockOtoken.new()
          await firstShortOtoken.init(
            addressBook.address,
            weth.address,
            usdc.address,
            [usdc.address],
            createTokenAmount(200),
            BigNumber.from(await time.latest()).add(expiryTime),
            true,
          )
          // whitelist otoken to be used in the protocol
          await whitelist.whitelistOtoken(firstShortOtoken.address, { from: owner })
          // open new vault, mint naked short, sell it to holder 1
          let collateralToDespoit = createTokenAmount(200, usdcDecimals)
          let amountToMint = createTokenAmount(1)
          let vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)
          let actionArgs = [
            getAction(ActionType.OpenVault, {
              owner: accountOwner1,
              shortOtoken:firstShortOtoken.address,
              vaultId: vaultCounter.toNumber(),
            }),
            {
              actionType: ActionType.MintShortOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [firstShortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [amountToMint.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDespoit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          await usdc.approve(marginPool.address, collateralToDespoit, { from: accountOwner1 })
          await controllerProxy.operate(actionArgs, { from: accountOwner1 })

          expiryTime = BigNumber.from(60 * 60 * 24 * 2) // after 1 day
          secondShortOtoken = await MockOtoken.new()
          await secondShortOtoken.init(
            addressBook.address,
            weth.address,
            usdc.address,
            [usdc.address],
            createTokenAmount(200),
            BigNumber.from(await time.latest()).add(expiryTime),
            true,
          )
          // whitelist otoken to be used in the protocol
          await whitelist.whitelistOtoken(secondShortOtoken.address, { from: owner })
          // open new vault, mint naked short, sell it to holder 1
          collateralToDespoit = createTokenAmount(200, usdcDecimals)
          amountToMint = createTokenAmount(1)
          vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)
          actionArgs = [
            getAction(ActionType.OpenVault, {
              owner: accountOwner1,
              shortOtoken:secondShortOtoken.address,
              vaultId: vaultCounter.toNumber(),
            }),
            {
              actionType: ActionType.MintShortOption,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [secondShortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [amountToMint.toString()],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.DepositCollateral,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [usdc.address],
              vaultId: vaultCounter.toNumber(),
              amounts: [collateralToDespoit],
              index: '0',
              data: ZERO_ADDR,
            },
          ]
          await usdc.approve(marginPool.address, collateralToDespoit, { from: accountOwner1 })
          await controllerProxy.operate(actionArgs, { from: accountOwner1 })
        })

        it('should settle multiple vaults in one transaction (ATM,OTM)', async () => {
          await time.increaseTo(BigNumber.from(await secondShortOtoken.expiryTimestamp()).add(1000).toString())
          const expiry = BigNumber.from(await firstShortOtoken.expiryTimestamp())
          const expiry2 = BigNumber.from(await secondShortOtoken.expiryTimestamp())
          await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiry, createTokenAmount(200), true)
          await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiry, createTokenAmount(1), true)
          await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiry2, createTokenAmount(200), true)
          await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiry2, createTokenAmount(1), true)
          const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
          const actionArgs = [
            {
              actionType: ActionType.SettleVault,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [secondShortOtoken.address],
              vaultId: vaultCounter.toNumber(),
              amounts: ['0'],
              index: '0',
              data: ZERO_ADDR,
            },
            {
              actionType: ActionType.SettleVault,
              owner: accountOwner1,
              secondAddress: accountOwner1,
              assets: [firstShortOtoken.address],
              vaultId: vaultCounter.sub(1).toNumber(),
              amounts: ['0'],
              index: '0',
              data: ZERO_ADDR,
            },
          ]

          const payout = createTokenAmount(400, usdcDecimals)
          const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOwner1))

          controllerProxy.operate(actionArgs, { from: accountOwner1 })

          const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
          const senderBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOwner1))

          assert.equal(
            marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
            payout,
            'Margin pool collateral asset balance mismatch',
          )
          assert.equal(
            senderBalanceAfter.sub(senderBalanceBefore).toString(),
            payout,
            'Sender collateral asset balance mismatch',
          )
        })
      })
    })

    describe('Check if price is finalized', () => {
      let expiredOtoken: MockOtokenInstance
      let expiry: BigNumber

      before(async () => {
        expiry = resp2bn(await time.latest())
        expiredOtoken = await MockOtoken.new()
        // init otoken
        await expiredOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(200),
          resp2bn(await time.latest()),
          true,
        )

        // set finalized
        await oracle.setIsFinalized(weth.address, expiry, true)
        await oracle.setIsDisputePeriodOver(weth.address, expiry, true)
      })

      it('should return false when price is pushed and dispute period not over yet', async () => {
        const priceMock = BigNumber.from('200')

        // Mock oracle returned data.
        await oracle.setIsLockingPeriodOver(weth.address, expiry, true)
        await oracle.setIsDisputePeriodOver(weth.address, expiry, false)
        await oracle.setExpiryPrice(weth.address, expiry, priceMock)

        const underlying = await expiredOtoken.underlyingAsset()
        const strike = await expiredOtoken.strikeAsset()
        const collateral = await expiredOtoken.collateralAssets(0)
        const expiryTimestamp = await expiredOtoken.expiryTimestamp()

        const expectedResult = false
        assert.equal(
          await controllerProxy.canSettleAssets(underlying, strike, [collateral], expiryTimestamp),
          expectedResult,
          'Price is not finalized because dispute period is not over yet',
        )
        //assert.equal(
        //  await controllerProxy.isSettlementAllowed(expiredOtoken.address),
        //  expectedResult,
        //  'Price is not finalized',
        //)
      })

      it('should return true when price is finalized', async () => {
        expiredOtoken = await MockOtoken.new()
        const expiry = resp2bn(await time.latest())
        // init otoken
        await expiredOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(200),
          expiry,
          true,
        )

        // Mock oracle: dispute periodd over, set price to 200.
        const priceMock = BigNumber.from('200')
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiry, priceMock, true)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiry, createTokenAmount(1), true)

        const underlying = await expiredOtoken.underlyingAsset()
        const strike = await expiredOtoken.strikeAsset()
        const collateral = await expiredOtoken.collateralAssets(1)
        const expiryTimestamp = await expiredOtoken.expiryTimestamp()

        const expectedResult = true
        assert.equal(
          await controllerProxy.canSettleAssets(underlying, strike, [collateral], expiryTimestamp),
          expectedResult,
          'Price is not finalized',
        )
        //assert.equal(
        //  await controllerProxy.isSettlementAllowed(expiredOtoken.address),
        //  expectedResult,
        //  'Price is not finalized',
        //)
      })
    })

    describe('Expiry', () => {
      it('should return false for non expired otoken', async () => {
        const otoken: MockOtokenInstance = await MockOtoken.new()
        await otoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(200),
          resp2bn(await time.latest()).add(60000 * 60000),
          true,
        )

        //fix it!    assert.equal(await controllerProxy.hasExpired(otoken.address), false, 'Otoken expiry check mismatch')
      })

      it('should return true for expired otoken', async () => {
        // Otoken deployment
        const expiredOtoken = await MockOtoken.new()
        // init otoken
        await expiredOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(200),
          1219835219,
          true,
        )

        //fix it!    assert.equal(await controllerProxy.hasExpired(expiredOtoken.address), true, 'Otoken expiry check mismatch')

      })
    })

    describe('Call action', () => {
      let callTester: CallTesterInstance

      before(async () => {
        callTester = await CallTester.new()
      })

      it('should call any arbitrary destination address when restriction is not activated', async () => {
        //whitelist callee before call action
        await whitelist.whitelistCallee(callTester.address, { from: owner })

        const actionArgs = [
          {
            actionType: ActionType.Call,
            owner: ZERO_ADDR,
            secondAddress: callTester.address,
            assets: [ZERO_ADDR],
            vaultId: '0',
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        expectEvent(await controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'CallExecuted', {
          from: accountOwner1,
          to: callTester.address,
          data: ZERO_ADDR,
        })
      })

      it('should revert activating call action restriction from non-owner', async () => {
        await expectRevert(
          controllerProxy.setCallRestriction(true, { from: random }),
          'Ownable: caller is not the owner',
        )
      })

      it('should revert activating call action restriction when it is already activated', async () => {
        await expectRevert(controllerProxy.setCallRestriction(true, { from: owner }), 'C9')
      })

      it('should revert calling any arbitrary address when call restriction is activated', async () => {
        const arbitraryTarget: CallTesterInstance = await CallTester.new()

        const actionArgs = [
          {
            actionType: ActionType.Call,
            owner: ZERO_ADDR,
            secondAddress: arbitraryTarget.address,
            assets: [ZERO_ADDR],
            vaultId: '0',
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C3')
      })

      it('should call whitelisted callee address when restriction is activated', async () => {
        // whitelist callee
        await whitelist.whitelistCallee(callTester.address, { from: owner })

        const actionArgs = [
          {
            actionType: ActionType.Call,
            owner: ZERO_ADDR,
            secondAddress: callTester.address,
            assets: [ZERO_ADDR],
            vaultId: '0',
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        expectEvent(await controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'CallExecuted', {
          from: accountOwner1,
          to: callTester.address,
          data: ZERO_ADDR,
        })
      })

      it('should deactivate call action restriction from owner', async () => {
        await controllerProxy.setCallRestriction(false, { from: owner })

        assert.equal(await controllerProxy.callRestricted(), false, 'Call action restriction deactivation failed')
      })

      it('should revert deactivating call action restriction when it is already deactivated', async () => {
        await expectRevert(controllerProxy.setCallRestriction(false, { from: owner }), 'C9')
      })
    })

    describe('Sync vault latest update timestamp', () => {
      it('should update vault latest update timestamp', async () => {
        const vaultCounter = await controllerProxy.accountVaultCounter(accountOwner1)
        const timestampBefore = (await controllerProxy.getVaultWithDetails(accountOwner1, vaultCounter.toNumber()))[1]


        await controllerProxy.sync(accountOwner1, vaultCounter.toNumber(), { from: random })

         const timestampAfter = (await controllerProxy.getVaultWithDetails(accountOwner1, vaultCounter.toNumber()))[1]

        assert.isAbove(
            timestampAfter.toNumber(),
            timestampBefore.toNumber(),
            'Vault latest update timestamp did not sync',
        )
      })

    })

    describe('Interact with Otoken implementation v1.0.0', () => {
      let shortOtokenV1: OtokenImplV1Instance

      before(async () => {
        const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day

        shortOtokenV1 = await OtokenImplV1.new()
        // init otoken
        await shortOtokenV1.init(
          addressBook.address,
          weth.address,
          usdc.address,
          usdc.address,
          createTokenAmount(200),
          resp2bn(await time.latest()).add(expiryTime),
          true,
        )
        // whitelist otoken to be used in the protocol
        await whitelist.whitelistOtoken(shortOtokenV1.address, { from: owner })
        // open new vault, mint naked short, sell it to holder 1
        const collateralToDespoit = resp2bn(await shortOtokenV1.strikePrice()).div(100)
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(accountOwner1)).add(1)
        const amountToMint = createTokenAmount(1)
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken:shortOtokenV1.address,
            vaultId: vaultCounter.toNumber(),
          }),
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [collateralToDespoit.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
          {
            actionType: ActionType.MintShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtokenV1.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [amountToMint],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await usdc.approve(marginPool.address, collateralToDespoit, { from: accountOwner1 })
        await controllerProxy.operate(actionArgs, { from: accountOwner1 })

        //transfer to holder
        await shortOtokenV1.transfer(holder1, amountToMint, { from: accountOwner1 })
      })

      it('should settle v1 Otoken implementation', async () => {
        // past time after expiry
        await time.increase(60 * 61 * 24) // increase time with one hour in seconds

        const expiry = BigNumber.from(await shortOtokenV1.expiryTimestamp())
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiry, createTokenAmount(150), true)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiry, createTokenAmount(1), true)
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          {
            actionType: ActionType.SettleVault,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtokenV1.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        const payout = createTokenAmount(150, usdcDecimals)
        const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
        const senderBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOwner1))
        const proceed = await controllerProxy.getProceed(accountOwner1, vaultCounter)

        assert.equal(payout, proceed.toString())

        await controllerProxy.operate(actionArgs, { from: accountOwner1 })

        const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
        const senderBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOwner1))

        assert.equal(
          marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
          payout.toString(),
          'Margin pool collateral asset balance mismatch',
        )
        assert.equal(
          senderBalanceAfter.sub(senderBalanceBefore).toString(),
          payout.toString(),
          'Sender collateral asset balance mismatch',
        )
      })

      it('should redeem v1 Otoken implementation', async () => {
        const redeemArgs = [
          {
            actionType: ActionType.Redeem,
            owner: ZERO_ADDR,
            secondAddress: holder1,
            assets: [shortOtokenV1.address],
            vaultId: '0',
            amounts: [createTokenAmount(1)],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        const expectedPayout = createTokenAmount(50, usdcDecimals)

        const userBalanceBefore = BigNumber.from(await usdc.balanceOf(holder1))
        await controllerProxy.operate(redeemArgs, { from: holder1 })
        const userBalanceAfter = BigNumber.from(await usdc.balanceOf(holder1))
        assert.equal(userBalanceAfter.sub(userBalanceBefore).toString(), expectedPayout)
      })
    })

    describe('Pause mechanism', () => {
      let shortOtoken: MockOtokenInstance

      before(async () => {
        const vaultCounterBefore = await controllerProxy.accountVaultCounter(accountOwner1)
        const expiryTime = BigNumber.from(60 * 60) // after 1 hour
        shortOtoken = await MockOtoken.new()
        // init otoken
        await shortOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(200),
          resp2bn(await time.latest()).add(expiryTime),
          true,
        )

        // whitelist otoken to be minted
        await whitelist.whitelistOtoken(shortOtoken.address, { from: owner })

        const collateralToDeposit = createTokenAmount(200, usdcDecimals)
        const amountToMint = createTokenAmount(1) // mint 1 otoken
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken:shortOtoken.address,
            vaultId: vaultCounterBefore.toNumber(),
          }),
          {
            actionType: ActionType.MintShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounterBefore.toNumber() + 1,
            shortOtoken: shortOtoken.address,
            amounts: [amountToMint],
            index: '0',
            data: ZERO_ADDR,
          },
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounterBefore.toNumber() + 1,
            shortOtoken: shortOtoken.address,
            amounts: [collateralToDeposit],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
        await controllerProxy.operate(actionArgs, { from: accountOwner1 })
      })

      it('should revert set pauser address from non-owner', async () => {
        await expectRevert(
          controllerProxy.setPartialPauser(partialPauser, { from: random }),
          'Ownable: caller is not the owner',
        )
      })

      it('should set pauser address', async () => {
        await controllerProxy.setPartialPauser(partialPauser, { from: owner })
        assert.equal(await controllerProxy.partialPauser(), partialPauser, 'pauser address mismatch')
      })

      it('should revert set pauser address to the same previous address', async () => {
        await expectRevert(controllerProxy.setPartialPauser(partialPauser, { from: owner }), 'C9')
      })

      it('should revert when pausing the system from address other than pauser', async () => {
        await expectRevert(controllerProxy.setSystemPartiallyPaused(true, { from: random }), 'C2')
      })

      it('should revert partially un-pausing an already running system', async () => {
        await expectRevert(controllerProxy.setSystemPartiallyPaused(false, { from: partialPauser }), 'C9')
      })

      it('should pause system', async () => {
        const stateBefore = await controllerProxy.systemPartiallyPaused()
        assert.equal(stateBefore, false, 'System already paused')

        await controllerProxy.setSystemPartiallyPaused(true, { from: partialPauser })

        const stateAfter = await controllerProxy.systemPartiallyPaused()
        assert.equal(stateAfter, true, 'System not paused')
      })

      it('should revert partially pausing an already patially paused system', async () => {
        await expectRevert(controllerProxy.setSystemPartiallyPaused(true, { from: partialPauser }), 'C9')
      })

      it('should revert opening a vault when system is partially paused', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken:shortOtoken.address,
            vaultId: vaultCounter.toNumber() + 1,
          })
        ]
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C4')
      })

      it('should revert depositing collateral when system is partially paused', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const collateralToDeposit = BigNumber.from(await shortOtoken.strikePrice()).div(1e8)
        const actionArgs = [
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber() + 1,
            amounts: [collateralToDeposit.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C4')
      })

      it('should revert minting short otoken when system is partially paused', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const collateralToDeposit = BigNumber.from(await shortOtoken.strikePrice()).div(1e8)
        const actionArgs = [
          {
            actionType: ActionType.MintShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['1'],
            index: '0',
            data: ZERO_ADDR,
          },
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [collateralToDeposit.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C4')
      })

      it('should revert withdrawing collateral when system is partially paused', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const collateralToWithdraw = BigNumber.from(await shortOtoken.strikePrice()).div(100)
        const actionArgs = [
          {
            actionType: ActionType.WithdrawCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [collateralToWithdraw.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C4')
      })

      it('should revert burning short otoken when system is partially paused', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          {
            actionType: ActionType.BurnShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['1'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C4')
      })

      it('should settle vault when system is partially paused', async () => {
        // past time after expiry
        await time.increase(60 * 61) // increase time with one hour in seconds
        // set price in Oracle Mock, 150$ at expiry, expire ITM
        const expiry = BigNumber.from(await shortOtoken.expiryTimestamp())
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiry, createTokenAmount(150), true)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiry, createTokenAmount(1), true)

        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          {
            actionType: ActionType.SettleVault,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        const payout = createTokenAmount(150, usdcDecimals)
        const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
        const senderBalanceBefore = BigNumber.from(await usdc.balanceOf(accountOwner1))

        await controllerProxy.operate(actionArgs, { from: accountOwner1 })

        const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
        const senderBalanceAfter = BigNumber.from(await usdc.balanceOf(accountOwner1))

        assert.equal(
          marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
          payout.toString(),
          'Margin pool collateral asset balance mismatch',
        )
        assert.equal(
          senderBalanceAfter.sub(senderBalanceBefore).toString(),
          payout.toString(),
          'Seller collateral asset balance mismatch',
        )
      })

      it('should redeem when system is partially paused', async () => {
        const amountToRedeem = createTokenAmount(1)
        // transfer to holder
        await shortOtoken.transfer(holder1, amountToRedeem, { from: accountOwner1 })

        const actionArgs = [
          {
            actionType: ActionType.Redeem,
            owner: ZERO_ADDR,
            secondAddress: holder1,
            assets: [shortOtoken.address],
            vaultId: '0',
            amounts: [amountToRedeem],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        //fix it!    assert.equal(await controllerProxy.hasExpired(shortOtoken.address), true, 'Short otoken is not expired yet')

        const payout = createTokenAmount(50, usdcDecimals)
        const marginPoolBalanceBefore = BigNumber.from(await usdc.balanceOf(marginPool.address))
        const senderBalanceBefore = BigNumber.from(await usdc.balanceOf(holder1))
        const senderShortBalanceBefore = BigNumber.from(await shortOtoken.balanceOf(holder1))

        await controllerProxy.operate(actionArgs, { from: holder1 })

        const marginPoolBalanceAfter = BigNumber.from(await usdc.balanceOf(marginPool.address))
        const senderBalanceAfter = BigNumber.from(await usdc.balanceOf(holder1))
        const senderShortBalanceAfter = BigNumber.from(await shortOtoken.balanceOf(holder1))

        assert.equal(
          marginPoolBalanceBefore.sub(marginPoolBalanceAfter).toString(),
          payout.toString(),
          'Margin pool collateral asset balance mismatch',
        )
        assert.equal(
          senderBalanceAfter.sub(senderBalanceBefore).toString(),
          payout.toString(),
          'Sender collateral asset balance mismatch',
        )
        assert.equal(
          senderShortBalanceBefore.sub(senderShortBalanceAfter).toString(),
          amountToRedeem.toString(),
          ' Burned short otoken amount mismatch',
        )

      })
    })

    describe('Full Pause', () => {
      let shortOtoken: MockOtokenInstance

      before(async () => {
        // deactivate pausing mechanism
        await controllerProxy.setSystemPartiallyPaused(false, { from: partialPauser })

        const vaultCounterBefore = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const expiryTime = BigNumber.from(60 * 60) // after 1 hour
        shortOtoken = await MockOtoken.new()
        // init otoken
        await shortOtoken.init(
          addressBook.address,
          weth.address,
          usdc.address,
          [usdc.address],
          createTokenAmount(200),
          BigNumber.from(await time.latest()).add(expiryTime),
          true,
        )

        // whitelist otoken to be minted
        await whitelist.whitelistOtoken(shortOtoken.address, { from: owner })

        const collateralToDeposit = createTokenAmount(200, usdcDecimals)
        const amountToMint = createTokenAmount(1) // mint 1 otoken
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken: shortOtoken.address,
            vaultId: vaultCounterBefore.toNumber() + 1,
          }),
          {
            actionType: ActionType.MintShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounterBefore.toNumber() + 1,
            amounts: [amountToMint],
            index: '0',
            data: ZERO_ADDR,
          },
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounterBefore.toNumber() + 1,
            amounts: [collateralToDeposit],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
        await controllerProxy.operate(actionArgs, { from: accountOwner1 })
      })

      it('should revert set fullPauser address from non-owner', async () => {
        await expectRevert(
          controllerProxy.setFullPauser(fullPauser, { from: random }),
          'Ownable: caller is not the owner',
        )
      })

      it('should revert set fullPauser address to address zero', async () => {
        await expectRevert(controllerProxy.setFullPauser(ZERO_ADDR, { from: owner }), 'C10')
      })

      it('should set fullPauser', async () => {
        await controllerProxy.setFullPauser(fullPauser, { from: owner })
        assert.equal(await controllerProxy.fullPauser(), fullPauser, 'Full pauser wrong')
      })

      it('should revert when triggering full pause from address other than pauser', async () => {
        await expectRevert(controllerProxy.setSystemFullyPaused(true, { from: random }), 'C1')
      })

      it('should revert fully un-pausing an already running system', async () => {
        await expectRevert(controllerProxy.setSystemFullyPaused(false, { from: fullPauser }), 'C9')
      })

      it('should trigger full pause', async () => {
        const stateBefore = await controllerProxy.systemFullyPaused()
        assert.equal(stateBefore, false, 'System already in full pause state')

        await controllerProxy.setSystemFullyPaused(true, { from: fullPauser })

        const stateAfter = await controllerProxy.systemFullyPaused()
        assert.equal(stateAfter, true, 'System not in full pause state')
      })

      it('should revert fully pausing an already fully paused system', async () => {
        await expectRevert(controllerProxy.setSystemFullyPaused(true, { from: fullPauser }), 'C9')
      })

      it('should revert opening a vault when system is in full pause state', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: accountOwner1,
            shortOtoken:shortOtoken.address,
            vaultId: vaultCounter.toNumber() + 1,
          })
        ]
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), '.')
      })

      it('should revert depositing collateral when system is in full pause state', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const collateralToDeposit = BigNumber.from(await shortOtoken.strikePrice()).div(1e8)
        const actionArgs = [
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber() + 1,
            amounts: [collateralToDeposit.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C5')
      })

      it('should revert minting short otoken when system is in full pause state', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const collateralToDeposit = BigNumber.from(await shortOtoken.strikePrice()).div(1e8)
        const actionArgs = [
          {
            actionType: ActionType.MintShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['1'],
            index: '0',
            data: ZERO_ADDR,
          },
          {
            actionType: ActionType.DepositCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [collateralToDeposit.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C5')
      })

      it('should revert withdrawing collateral when system is in full pause state', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const collateralToWithdraw = BigNumber.from(await shortOtoken.strikePrice()).div(1e8)
        const actionArgs = [
          {
            actionType: ActionType.WithdrawCollateral,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [collateralToWithdraw.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]
        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C5')
      })

      it('should revert burning short otoken when system is in full pause state', async () => {
        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          {
            actionType: ActionType.BurnShortOption,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['1'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C5')
      })

      it('should revert settling vault when system is in full pause state', async () => {
        // past time after expiry
        await time.increase(60 * 61) // increase time with one hour in seconds
        // set price in Oracle Mock, 150$ at expiry, expire ITM
        await oracle.setExpiryPrice(
          await shortOtoken.underlyingAsset(),
          BigNumber.from(await shortOtoken.expiryTimestamp()),
          createTokenAmount(150),
        )
        // set it as finalized in mock
        await oracle.setIsFinalized(
          await shortOtoken.underlyingAsset(),
          BigNumber.from(await shortOtoken.expiryTimestamp()),
          true,
        )
        await oracle.setIsDisputePeriodOver(
          await shortOtoken.underlyingAsset(),
          BigNumber.from(await shortOtoken.expiryTimestamp()),
          true,
        )

        const vaultCounter = BigNumber.from(await controllerProxy.accountVaultCounter(accountOwner1))
        const actionArgs = [
          {
            actionType: ActionType.SettleVault,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [shortOtoken.address],
            vaultId: vaultCounter.toNumber(),
            amounts: ['0'],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C5')
      })

      it('should revert redeem when system is in full pause state', async () => {
        const shortAmountToBurn = BigNumber.from('1')
        // transfer to holder
        await shortOtoken.transfer(holder1, shortAmountToBurn, { from: accountOwner1 })

        const actionArgs = [
          {
            actionType: ActionType.Redeem,
            owner: ZERO_ADDR,
            secondAddress: holder1,
            assets: [shortOtoken.address],
            vaultId: '0',
            amounts: [shortAmountToBurn.toNumber()],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await expectRevert(controllerProxy.operate(actionArgs, { from: accountOwner1 }), 'C5')
      })
    })

    describe('Donate to pool', () => {
      it('it should donate to margin pool', async () => {
        const amountToDonate = createTokenAmount(10, usdcDecimals)
        const storedBalanceBefore = await marginPool.getStoredBalance(usdc.address)

        await usdc.approve(marginPool.address, amountToDonate, { from: donor })
        await controllerProxy.donate(usdc.address, amountToDonate, { from: donor })

        const storedBalanceAfter = await marginPool.getStoredBalance(usdc.address)

        assert.equal(
          storedBalanceAfter.sub(storedBalanceBefore).toString(),
          amountToDonate,
          'Donated amount mismatch',
        )
      })
    })

    describe('Refresh configuration', () => {
      it('should revert refreshing configuration from address other than owner', async () => {
        await expectRevert(controllerProxy.refreshConfiguration({ from: random }), 'Ownable: caller is not the owner')
      })

      it('should refresh configuratiom', async () => {
        // update modules
        const oracle = await MockOracle.new(addressBook.address, { from: owner })
        const calculator = await MarginCalculator.new(addressBook.address, { from: owner })
        const marginPool = await MarginPool.new(addressBook.address, { from: owner })
        const whitelist = await MockWhitelistModule.new({ from: owner })

        await addressBook.setOracle(oracle.address)
        await addressBook.setMarginCalculator(calculator.address)
        await addressBook.setMarginPool(marginPool.address)
        await addressBook.setWhitelist(whitelist.address)

        // referesh controller configuration
        await controllerProxy.refreshConfiguration()
        //fix it!    const [_whitelist, _oracle, _calculator, _pool] = await controllerProxy.getConfiguration()
        //fix it!    assert.equal(_oracle, oracle.address, 'Oracle address mismatch after refresh')
        //fix it!    assert.equal(_calculator, calculator.address, 'Calculator address mismatch after refresh')
        //fix it!    assert.equal(_pool, marginPool.address, 'Oracle address mismatch after refresh')
        //fix it!    assert.equal(_whitelist, whitelist.address, 'Oracle address mismatch after refresh')
      })
    })

    describe('Execute an invalid action', () => {
      it('Should execute transaction with no state updates', async () => {
        const vaultCounter = await controllerProxy.accountVaultCounter(accountOwner1)
        assert.isAbove(vaultCounter.toNumber(), 0, 'Account owner have no vault')

        const collateralToDeposit = createTokenAmount(10, usdcDecimals)
        const actionArgs = [
          {
            actionType: 999, //ActionType.InvalidAction,
            owner: accountOwner1,
            secondAddress: accountOwner1,
            assets: [usdc.address],
            vaultId: vaultCounter.toNumber(),
            amounts: [collateralToDeposit],
            index: '0',
            data: ZERO_ADDR,
          },
        ]

        await usdc.approve(marginPool.address, collateralToDeposit, { from: accountOwner1 })
        await expectRevert.unspecified(controllerProxy.operate(actionArgs, { from: accountOwner1 }))
      })
    })
  })
