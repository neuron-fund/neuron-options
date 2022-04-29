import {
  ONtokenFactory as ONtokenFactoryInstance,
  MockONtoken as MockONtokenInstance,
  MockAddressBook as MockAddressBookInstance,
  MockWhitelistModule as MockWhitelistModuleInstance,
  MockERC20 as MockERC20Instance,
} from '../../typechain-types'

import { artifacts, contract, web3 } from 'hardhat'
import { assert, expect } from 'chai'

import { createValidExpiry, createTokenAmount } from '../helpers/utils'
import { expectRevert, expectEvent, time } from '@openzeppelin/test-helpers'
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber'

const ONTokenFactory = artifacts.require('ONtokenFactory.sol')
const MockAddressBook = artifacts.require('MockAddressBook.sol')
const MockWhitelist = artifacts.require('MockWhitelistModule.sol')
const MockERC20 = artifacts.require('MockERC20.sol')
const MockONtoken = artifacts.require('MockONtoken.sol')
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

contract('ONTokenFactory', ([user1, user2, controller]) => {
  let firstONtoken: MockONtokenInstance
  let addressBook: MockAddressBookInstance
  let onTokenFactory: ONtokenFactoryInstance

  // Paramter used for onToken init(). (Use random addresses as usdc and eth)
  let usdc: MockERC20Instance
  let weth: MockERC20Instance
  let shitcoin: MockERC20Instance

  const strikePrice = createTokenAmount(200)
  const isPut = true
  let expiry: number

  before('Deploy onToken logic and Factory contract', async () => {
    expiry = createValidExpiry(Number(await time.latest()), 100)
    usdc = await MockERC20.new('USDC', 'USDC', 6)
    weth = await MockERC20.new('WETH', 'WETH', 18)
    shitcoin = await MockERC20.new('Shit coin', 'STC', 18)

    const logic = await MockONtoken.new()

    // Deploy and whitelist ETH:USDC product
    const mockWhitelist: MockWhitelistModuleInstance = await MockWhitelist.new()
    await mockWhitelist.whitelistCollaterals([usdc.address])
    await mockWhitelist.whitelistCollaterals([weth.address])
    await mockWhitelist.whitelistProduct(weth.address, usdc.address, [usdc.address], isPut)
    await mockWhitelist.whitelistProduct(usdc.address, weth.address, [weth.address], isPut)
    // Deploy addressbook
    addressBook = await MockAddressBook.new()
    await addressBook.setONtokenImpl(logic.address)
    await addressBook.setWhitelist(mockWhitelist.address)
    await addressBook.setController(controller)

    onTokenFactory = await ONTokenFactory.new(addressBook.address)
  })

  describe('Get onToken address', () => {
    it('Should have no onToken records at the begining', async () => {
      const counter = await onTokenFactory.getONtokensLength()
      assert.equal(counter.toString(), '0', 'Should have no onToken records')
    })

    it('Should return address(0) if token is not deployed', async () => {
      const existAddress = await onTokenFactory.getONtoken(
        weth.address,
        usdc.address,
        [usdc.address],
        [0],
        strikePrice,
        expiry,
        isPut
      )
      assert.equal(existAddress, ZERO_ADDR, 'getONtoken check failed on undeployed tokens.')
    })

    it('should get deterministic address with new onToken paramters', async () => {
      const targetAddress = await onTokenFactory.getTargetONtokenAddress(
        weth.address,
        usdc.address,
        [usdc.address],
        [0],
        strikePrice,
        expiry,
        isPut
      )
      assert.notEqual(targetAddress, ZERO_ADDR, 'getTargetONtokenAddress should never give 0 address.')
    })

    it('should get same target address with same onToken paramters', async () => {
      const targetAddress1 = await onTokenFactory.getTargetONtokenAddress(
        weth.address,
        usdc.address,
        [usdc.address],
        [0],
        strikePrice,
        expiry,
        false
      )
      const targetAddress2 = await onTokenFactory.getTargetONtokenAddress(
        weth.address,
        usdc.address,
        [usdc.address],
        [0],
        strikePrice,
        expiry,
        false
      )
      assert.equal(targetAddress1, targetAddress2)
    })

    it('should get different target address with different onToken parameters', async () => {
      const targetAddress1 = await onTokenFactory.getTargetONtokenAddress(
        weth.address,
        usdc.address,
        [usdc.address],
        [0],
        strikePrice,
        expiry,
        isPut
      )
      const targetAddress2 = await onTokenFactory.getTargetONtokenAddress(
        ZERO_ADDR,
        ZERO_ADDR,
        [ZERO_ADDR],
        [0],
        strikePrice,
        expiry,
        isPut
      )
      assert.notEqual(targetAddress1, targetAddress2)
    })
  })

  describe('Create new onToken', () => {
    it('Should revert when creating expired option', async () => {
      const lastTimeStamp = await time.latest()

      await expectRevert(
        onTokenFactory.createONtoken(
          weth.address,
          usdc.address,
          [usdc.address],
          [0],
          strikePrice,
          lastTimeStamp.toString(),
          isPut
        ),
        "ONtokenFactory: Can't create expired option"
      )
    })

    it('Should revert when using random timestamp.', async () => {
      const randomTime = (await time.latest()).toNumber() + time.duration.days(30).toNumber()
      await expectRevert(
        onTokenFactory.createONtoken(
          weth.address,
          usdc.address,
          [usdc.address],
          [0],
          strikePrice,
          randomTime.toString(),
          isPut,
          {
            from: user1,
          }
        ),
        'ONtokenFactory: Option has to expire 08:00 UTC'
      )
    })

    it('Should revert when timestamp > 2345/12/31', async () => {
      const tooFar = 11865398400 // 01/01/2346 @ 12:00am (UTC)
      await expectRevert(
        onTokenFactory.createONtoken(weth.address, usdc.address, [usdc.address], [0], strikePrice, tooFar, isPut, {
          from: user1,
        }),
        "ONtokenFactory: Can't create option with expiry > 2345/12/31"
      )
    })

    it('Should revert when creating a 0 strike put', async () => {
      await expectRevert(
        onTokenFactory.createONtoken(weth.address, usdc.address, [usdc.address], [0], 0, expiry, isPut, {
          from: user1,
        }),
        "ONtokenFactory: Can't create a $0 strike option"
      )
    })

    it('Should create new contract at expected address', async () => {
      const targetAddress = await onTokenFactory.getTargetONtokenAddress(
        weth.address,
        usdc.address,
        [usdc.address],
        [0],
        strikePrice,
        expiry,
        isPut
      )

      const tx = await onTokenFactory.createONtoken(
        weth.address,
        usdc.address,
        [usdc.address],
        [0],
        strikePrice,
        expiry,
        isPut,
        { from: user1 }
      )

      /*
      const receipt = await web3.eth.getTransactionReceipt(tx['receipt']['transactionHash'])
      console.log(receipt)

      const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
      await delay(5000);
      const receipt2 = await web3.eth.getTransactionReceipt(tx['receipt']['transactionHash'])
      console.log(receipt2)

      */

      //await expect(receipt).to.emit(onTokenFactory, 'ONtokenCreated')
      /* expectEvent(receipt, 'ONtokenCreated' , {
        creator: user1,
        underlying: weth.address,
        strike: usdc.address,
        collaterals: [usdc.address],
        strikePrice: strikePrice.toString(),
        expiry: expiry.toString(),
        isPut: isPut,
        tokenAddress: targetAddress,
      })
      */

      firstONtoken = await MockONtoken.at(targetAddress)
    })

    /*
    it('The init() function in Mocked ONtoken contract should have been called', async () => {
      assert.isTrue(await firstONtoken.inited())
    })*/

    it('Should be able to create a new ONtoken by another user', async () => {
      const _strikePrice = createTokenAmount(250)
      const targetAddress = await onTokenFactory.getTargetONtokenAddress(
        weth.address,
        usdc.address,
        [usdc.address],
        [0],
        _strikePrice,
        expiry,
        isPut
      )

      const txResponse = await onTokenFactory.createONtoken(
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        _strikePrice,
        expiry,
        isPut,
        { from: user2 }
      )

      /*
      expectEvent(txResponse, 'ONtokenCreated', {
        creator: user2,
        underlying: weth.address,
        strike: usdc.address,
        collateral: usdc.address,
        strikePrice: _strikePrice.toString(),
        expiry: expiry.toString(),
        isPut: isPut,
        tokenAddress: targetAddress,
      })*/
    })

    it('Should revert when creating non-whitelisted options', async () => {
      await expectRevert(
        onTokenFactory.createONtoken(shitcoin.address, usdc.address, [usdc.address], ['0'], strikePrice, expiry, isPut),
        'ONtokenFactory: Unsupported Product'
      )
    })

    it('Should revert when creating duplicated option', async () => {
      await expectRevert(
        onTokenFactory.createONtoken(weth.address, usdc.address, [usdc.address], ['0'], strikePrice, expiry, isPut),
        'ONtokenFactory: Option already created'
      )
    })
  })

  describe('Get onToken address after creation', () => {
    it('Should have two onToken records', async () => {
      const counter = await onTokenFactory.getONtokensLength()
      assert.equal(counter.toString(), '2')

      const firstToken = await onTokenFactory.onTokens(0)
      assert.equal(firstToken, firstONtoken.address)
    })

    it('should get same address if calling getTargetONTokenAddress with existing option paramters', async () => {
      const addr = await onTokenFactory.getTargetONtokenAddress(
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        expiry,
        isPut
      )
      assert.equal(addr, firstONtoken.address)
    })

    it('Should return correct token address', async () => {
      const existAddress = await onTokenFactory.getONtoken(
        weth.address,
        usdc.address,
        [usdc.address],
        [0],
        strikePrice,
        expiry,
        isPut
      )
      assert.equal(existAddress, firstONtoken.address)
    })
  })

  describe('Wrong setup: wrong implementation contract', () => {
    it('Should revert on token creation', async () => {
      // Set the onToken Impl contract to a wrong address
      await addressBook.setONtokenImpl(onTokenFactory.address)
      // Try to create a 250 strike (use the 200 strike will throw "Option Created" error first.)
      const newStrikePrice = 250
      await expectRevert(
        onTokenFactory.createONtoken(weth.address, usdc.address, [usdc.address], ['0'], newStrikePrice, expiry, isPut),
        'Create2: Failed on deploy'
      )
    })
  })
})
