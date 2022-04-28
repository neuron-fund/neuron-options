import {
  MockERC20 as MockERC20Instance,
  MockAddressBook as MockAddressBookInstance,
  // WETH9 as WETH9Instance,
  MarginPool as MarginPoolInstance,
  MockDumbERC20 as MockDumbERC20Instance,
} from '../../typechain-types'

import { expectRevert, ether } from '@openzeppelin/test-helpers'
import { artifacts, contract, web3 } from 'hardhat'
import { BigNumber } from 'ethers'
import { assert } from 'chai'

const MockERC20 = artifacts.require('MockERC20.sol')
const MockDumbERC20 = artifacts.require('MockDumbERC20.sol')
const MockAddressBook = artifacts.require('MockAddressBook.sol')
//const WETH9 = artifacts.require('WETH9.sol')
const MarginPool = artifacts.require('MarginPool.sol')

// address(0)
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

contract('MarginPool', ([owner, controllerAddress, farmer, user1, random]) => {
  const usdcToMint = ether('1000')
  const wethToMint = ether('50')
  // ERC20 mocks
  let usdc: MockERC20Instance
  //let weth: WETH9Instance
  let weth: MockERC20Instance
  // DumbER20: Return false when transfer fail.
  let dumbToken: MockDumbERC20Instance
  // addressbook module mock
  let addressBook: MockAddressBookInstance
  // margin pool
  let marginPool: MarginPoolInstance

  before('Deployment', async () => {
    // deploy USDC token
    usdc = await MockERC20.new('USDC', 'USDC', 6)
    // deploy WETH token for testing
    weth = await MockERC20.new('WETH9', 'WETH9', 18)
    // deploy dumb erc20
    dumbToken = await MockDumbERC20.new('DUSDC', 'DUSDC', 6)
    // deploy AddressBook mock
    addressBook = await MockAddressBook.new()
    // set Controller module address
    await addressBook.setController(controllerAddress)
    // deploy MarginPool module
    marginPool = await MarginPool.new(addressBook.address)

    // mint usdc
    await usdc.mint(user1, usdcToMint)
    // wrap ETH in Controller module level
    //await weth.deposit({ from: controllerAddress, value: wethToMint })
    await weth.mint(controllerAddress, wethToMint)
    // controller approving infinite amount of WETH to pool
    await weth.approve(marginPool.address, wethToMint, { from: controllerAddress })
  })

  describe('MarginPool initialization', () => {
    it('should revert if initilized with 0 addressBook address', async () => {
      await expectRevert(MarginPool.new(ZERO_ADDR), 'Invalid address book')
    })
  })

  describe('Transfer to pool', () => {
    const usdcToTransfer = ether('250')
    const wethToTransfer = ether('25')

    it('should revert transfering to pool from caller other than controller address', async () => {
      // user approve USDC transfer
      await usdc.approve(marginPool.address, usdcToTransfer, { from: user1 })

      await expectRevert(
        marginPool.transferToPool(usdc.address, user1, usdcToTransfer, { from: random }),
        'MarginPool: Sender is not Controller'
      )
    })

    it('should revert transfering to pool an amount equal to zero', async () => {
      // user approve USDC transfer
      await usdc.approve(marginPool.address, usdcToTransfer, { from: user1 })

      await expectRevert(
        marginPool.transferToPool(usdc.address, user1, ether('0'), { from: controllerAddress }),
        'MarginPool: transferToPool amount is equal to 0'
      )
    })

    it('should revert transfering to pool if the address of the sender is the margin pool', async () => {
      // user approve USDC transfer
      await usdc.approve(marginPool.address, usdcToTransfer, { from: user1 })

      await expectRevert(
        marginPool.transferToPool(usdc.address, marginPool.address, ether('1'), { from: controllerAddress }),
        'ERC20: transfer amount exceeds balance'
      )
    })

    it('should transfer to pool from user when called by the controller address', async () => {
      const userBalanceBefore = await usdc.balanceOf(user1)
      const poolBalanceBefore = await usdc.balanceOf(marginPool.address)

      // user approve USDC transfer
      await usdc.approve(marginPool.address, usdcToTransfer, { from: user1 })

      await marginPool.transferToPool(usdc.address, user1, usdcToTransfer, { from: controllerAddress })

      const userBalanceAfter = await usdc.balanceOf(user1)
      const poolBalanceAfter = await usdc.balanceOf(marginPool.address)

      assert.equal(
        BigNumber.from(usdcToTransfer.toString()).toString(),
        userBalanceBefore.sub(userBalanceAfter).toString(),
        'USDC value transfered from user mismatch'
      )

      assert.equal(
        BigNumber.from(usdcToTransfer.toString()).toString(),
        poolBalanceAfter.sub(poolBalanceBefore).toString(),
        'USDC value transfered into pool mismatch'
      )
    })

    it('should transfer WETH to pool from controller when called by the controller address', async () => {
      const controllerBalanceBefore = await weth.balanceOf(controllerAddress)
      const poolBalanceBefore = await weth.balanceOf(marginPool.address)

      await marginPool.transferToPool(weth.address, controllerAddress, wethToTransfer, { from: controllerAddress })

      const controllerBalanceAfter = await weth.balanceOf(controllerAddress)
      const poolBalanceAfter = await weth.balanceOf(marginPool.address)

      assert.equal(
        wethToTransfer.toString(),
        controllerBalanceBefore.sub(controllerBalanceAfter).toString(),
        'WETH value transfered from controller mismatch'
      )

      assert.equal(
        wethToTransfer.toString(),
        poolBalanceAfter.sub(poolBalanceBefore).toString(),
        'WETH value transfered into pool mismatch'
      )
    })

    it('should revert when transferFrom return false on dumbERC20', async () => {
      await expectRevert(
        marginPool.transferToPool(dumbToken.address, user1, ether('1'), { from: controllerAddress }),
        'SafeERC20: ERC20 operation did not succeed'
      )
    })
  })

  describe('Transfer to user', () => {
    const usdcToTransfer = ether('250')
    const wethToTransfer = ether('25')

    it('should revert transfering to user from caller other than controller address', async () => {
      await expectRevert(
        marginPool.transferToUser(usdc.address, user1, usdcToTransfer, { from: random }),
        'MarginPool: Sender is not Controller'
      )
    })

    it('should revert transfering to user if the user address is the margin pool addres', async () => {
      await expectRevert(
        marginPool.transferToUser(usdc.address, marginPool.address, usdcToTransfer, { from: controllerAddress }),
        'MarginPool: cannot transfer assets to oneself'
      )
    })

    it('should transfer an ERC-20 to user from pool when called by the controller address', async () => {
      const userBalanceBefore = await usdc.balanceOf(user1)
      const poolBalanceBefore = await usdc.balanceOf(marginPool.address)

      await marginPool.transferToUser(usdc.address, user1, usdcToTransfer, { from: controllerAddress })

      const userBalanceAfter = await usdc.balanceOf(user1)
      const poolBalanceAfter = await usdc.balanceOf(marginPool.address)

      assert.equal(
        usdcToTransfer.toString(),
        userBalanceAfter.sub(userBalanceBefore).toString(),
        'USDC value transfered to user mismatch'
      )

      assert.equal(
        usdcToTransfer.toString(),
        poolBalanceBefore.sub(poolBalanceAfter).toString(),
        'USDC value transfered from pool mismatch'
      )
    })

    it('should transfer WETH to controller from pool, unwrap it and transfer ETH to user when called by the controller address', async () => {
      const poolBalanceBefore = await weth.balanceOf(marginPool.address)
      const userBalanceBefore = await web3.eth.getBalance(user1)

      // transfer to controller
      await marginPool.transferToUser(weth.address, controllerAddress, wethToTransfer, { from: controllerAddress })
      // unwrap WETH to ETH
      ///// await weth.withdraw(wethToTransfer, { from: controllerAddress })
      // send ETH to user
      await web3.eth.sendTransaction({ from: controllerAddress, to: user1, value: wethToTransfer })

      const poolBalanceAfter = await weth.balanceOf(marginPool.address)
      const userBalanceAfter = await web3.eth.getBalance(user1)

      assert.equal(
        wethToTransfer.toString(),
        poolBalanceBefore.sub(poolBalanceAfter).toString(),
        'WETH value un-wrapped from pool mismatch'
      )

      assert.equal(
        wethToTransfer.toString(),
        BigNumber.from(userBalanceAfter).sub(BigNumber.from(userBalanceBefore)).toString(),
        'ETH value transfered to user mismatch'
      )
    })

    it('should revert when transfer return false on dumbERC20', async () => {
      await dumbToken.mint(user1, ether('1'))
      await dumbToken.approve(marginPool.address, ether('1'), { from: user1 })
      await marginPool.transferToPool(dumbToken.address, user1, ether('1'), { from: controllerAddress })
      // let the transfer failed
      await dumbToken.setLocked(true)
      await expectRevert(
        marginPool.transferToUser(dumbToken.address, user1, ether('1'), { from: controllerAddress }),
        'SafeERC20: ERC20 operation did not succeed'
      )
      await dumbToken.setLocked(false)
    })
  })

  describe('Transfer multiple assets to pool', () => {
    const usdcToTransfer = ether('250')
    const wethToTransfer = ether('25')

    it('should revert transfering an array to pool from caller other than controller address', async () => {
      // user approve USDC and WETH transfer
      await usdc.approve(marginPool.address, usdcToTransfer, { from: user1 })
      await weth.approve(marginPool.address, wethToTransfer, { from: user1 })

      await expectRevert(
        marginPool.batchTransferToPool([usdc.address, weth.address], [user1, user1], [usdcToTransfer, wethToTransfer], {
          from: random,
        }),
        'MarginPool: Sender is not Controller'
      )
    })
    it('should revert transfering to pool an array with an amount equal to zero', async () => {
      // user approve USDC transfer
      await usdc.approve(marginPool.address, usdcToTransfer, { from: user1 })
      await weth.approve(marginPool.address, wethToTransfer, { from: user1 })

      await expectRevert(
        marginPool.batchTransferToPool([usdc.address, weth.address], [user1, user1], [ether('0'), wethToTransfer], {
          from: controllerAddress,
        }),
        'MarginPool: transferToPool amount is equal to 0'
      )
    })

    it('should revert with different size arrays', async () => {
      await expectRevert(
        marginPool.batchTransferToPool(
          [usdc.address, weth.address],
          [user1, user1],
          [usdcToTransfer, usdcToTransfer, usdcToTransfer],
          { from: controllerAddress }
        ),
        'MarginPool: batchTransferToPool array lengths are not equal'
      )
    })

    it('should transfer an array including weth and usdc to pool from user/controller when called by the controller address', async () => {
      const userUsdcBalanceBefore = await usdc.balanceOf(user1)
      const poolUsdcBalanceBefore = await usdc.balanceOf(marginPool.address)
      const controllerWethBalanceBefore = await weth.balanceOf(controllerAddress)
      const poolWethBalanceBefore = await weth.balanceOf(marginPool.address)

      // user approve USDC and WETH transfer
      await usdc.approve(marginPool.address, usdcToTransfer, { from: user1 })
      await weth.approve(marginPool.address, wethToTransfer, { from: user1 })

      await marginPool.batchTransferToPool(
        [usdc.address, weth.address],
        [user1, controllerAddress],
        [usdcToTransfer, wethToTransfer],
        { from: controllerAddress }
      )

      const userUsdcBalanceAfter = await usdc.balanceOf(user1)
      const poolUsdcBalanceAfter = await usdc.balanceOf(marginPool.address)
      const controllerWethBalanceAfter = await weth.balanceOf(controllerAddress)
      const poolWethBalanceAfter = await weth.balanceOf(marginPool.address)

      assert.equal(
        usdcToTransfer.toString(),
        userUsdcBalanceBefore.sub(userUsdcBalanceAfter).toString(),
        'USDC value transfered from user mismatch'
      )

      assert.equal(
        usdcToTransfer.toString(),
        poolUsdcBalanceAfter.sub(poolUsdcBalanceBefore).toString(),
        'USDC value transfered into pool mismatch'
      )

      assert.equal(
        wethToTransfer.toString(),
        controllerWethBalanceBefore.sub(controllerWethBalanceAfter).toString(),
        'WETH value transfered from controller mismatch'
      )

      assert.equal(
        wethToTransfer.toString(),
        poolWethBalanceAfter.sub(poolWethBalanceBefore).toString(),
        'WETH value transfered into pool mismatch'
      )
    })
  })

  describe('Transfer multiple assets to user', () => {
    const usdcToTransfer = ether('250')
    const wethToTransfer = ether('25')

    it('should revert transfering to user from caller other than controller address', async () => {
      await expectRevert(
        marginPool.batchTransferToUser([usdc.address, weth.address], [user1, user1], [usdcToTransfer, wethToTransfer], {
          from: random,
        }),
        'MarginPool: Sender is not Controller'
      )
    })

    it('should revert with different size arrays', async () => {
      await expectRevert(
        marginPool.batchTransferToUser(
          [usdc.address, weth.address],
          [user1, user1],
          [usdcToTransfer, usdcToTransfer, usdcToTransfer],
          { from: controllerAddress }
        ),
        'MarginPool: batchTransferToUser array lengths are not equal'
      )
    })

    it('should batch transfer to users when called from controller', async () => {
      const userUsdcBalanceBefore = await usdc.balanceOf(user1)
      const poolUsdcBalanceBefore = await usdc.balanceOf(marginPool.address)
      const controllerWethBalanceBefore = await weth.balanceOf(controllerAddress)
      const poolWethBalanceBefore = await weth.balanceOf(marginPool.address)

      await marginPool.batchTransferToUser(
        [usdc.address, weth.address],
        [user1, controllerAddress],
        [poolUsdcBalanceBefore, poolWethBalanceBefore],
        { from: controllerAddress }
      )

      const userUsdcBalanceAfter = await usdc.balanceOf(user1)
      const poolUsdcBalanceAfter = await usdc.balanceOf(marginPool.address)
      const controllerWethBalanceAfter = await weth.balanceOf(controllerAddress)
      const poolWethBalanceAfter = await weth.balanceOf(marginPool.address)

      assert.equal(
        poolUsdcBalanceBefore.toString(),
        userUsdcBalanceAfter.sub(userUsdcBalanceBefore).toString(),
        'USDC value transfered to user mismatch'
      )

      assert.equal(
        poolUsdcBalanceBefore.toString(),
        poolUsdcBalanceBefore.sub(poolUsdcBalanceAfter).toString(),
        'USDC value transfered from pool mismatch'
      )

      assert.equal(
        poolWethBalanceBefore.toString(),
        controllerWethBalanceAfter.sub(controllerWethBalanceBefore).toString(),
        'WETH value transfered to controller mismatch'
      )

      assert.equal(
        poolWethBalanceBefore.toString(),
        poolWethBalanceBefore.sub(poolWethBalanceAfter).toString(),
        'WETH value transfered from pool mismatch'
      )
    })
  })
})
