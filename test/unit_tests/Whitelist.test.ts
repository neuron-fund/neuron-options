import {
  MockERC20 as MockERC20Instance,
  MockAddressBook as MockAddressBookInstance,
  Whitelist as WhitelistInstance,
} from '../../typechain-types'

import { artifacts, contract, web3 } from 'hardhat'
import { assert } from 'chai'

import { createValidExpiry, createTokenAmount } from '../helpers/utils'
import { expectRevert, expectEvent, time } from '@openzeppelin/test-helpers'
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber'

const MockERC20 = artifacts.require('MockERC20.sol')
const MockAddressBook = artifacts.require('MockAddressBook.sol')
const Whitelist = artifacts.require('Whitelist.sol')
// address(0)
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

contract('Whitelist', ([owner, onTokenFactoryAddress, random, newOwner, callee]) => {
  // ERC20 mocks
  let usdc: MockERC20Instance
  let dai: MockERC20Instance
  // option mock
  let onToken: MockERC20Instance
  // address book mock
  let addressBook: MockAddressBookInstance
  // Whitelist module
  let whitelist: WhitelistInstance

  const isPut = true

  const underlyingAsset = ZERO_ADDR

  before('Deployment', async () => {
    // deploy USDC token
    usdc = await MockERC20.new('USDC', 'USDC', 6)
    // deploy DAI token
    dai = await MockERC20.new('DAI', 'DAI', 18)
    // deploy option
    onToken = await MockERC20.new('OETH', 'OETH', 8)

    // deploy AddressBook mock
    addressBook = await MockAddressBook.new()
    // set ONtoken Factory address
    await addressBook.setONtokenFactory(onTokenFactoryAddress)

    // deploy Whitelist module
    whitelist = await Whitelist.new(addressBook.address, { from: owner })
  })

  describe('Whitelist collateral', () => {
    it('should revert whitelisting collateral from non-owner address', async () => {
      await expectRevert(
        whitelist.whitelistCollaterals([usdc.address], { from: random }),
        'Ownable: caller is not the owner'
      )
    })

    it('should whitelist collateral from owner address', async () => {
      const whitelistTx = await whitelist.whitelistCollaterals([usdc.address], { from: owner })

      // wtf?   expectEvent(whitelistTx, 'CollateralWhitelisted')

      const isWhitelistedCollateral = await whitelist.isWhitelistedCollaterals([usdc.address])
      assert.equal(isWhitelistedCollateral, true, 'fail: collateral not whitelisted')
    })
  })

  describe('blacklist collateral', () => {
    it('should revert blacklisting collateral from non-owner address', async () => {
      await expectRevert(
        whitelist.blacklistCollateral([usdc.address], { from: random }),
        'Ownable: caller is not the owner'
      )
    })

    it('should blacklist collateral from owner address', async () => {
      assert.equal(await whitelist.isWhitelistedCollaterals([usdc.address]), true, 'fail: collateral not whitelisted')

      const blacklistTx = await whitelist.blacklistCollateral([usdc.address], { from: owner })

      // expectEvent(blacklistTx, 'CollateralBlacklisted')

      const isWhitelistedCollateral = await whitelist.isWhitelistedCollaterals([usdc.address])
      assert.equal(isWhitelistedCollateral, false, 'fail: collateral not blacklisted')
    })
  })

  describe('Whitelist product', () => {
    it('should revert whitelisting a product from non-owner address', async () => {
      await expectRevert(
        whitelist.whitelistProduct(underlyingAsset, usdc.address, [usdc.address], isPut, { from: random }),
        'Ownable: caller is not the owner'
      )
    })

    it('should revert whitelisting a product when the collateral has not been whitelisted', async () => {
      const isWhitelistedCollateral = await whitelist.isWhitelistedCollaterals([usdc.address])
      assert.equal(isWhitelistedCollateral, false, 'fail: collateral is whitelisted')

      await expectRevert(
        whitelist.whitelistProduct(underlyingAsset, usdc.address, [usdc.address], isPut, { from: owner }),
        'Whitelist: Collateral is not whitelisted'
      )
    })

    it('should whitelist a product from owner address when the collateral has been whitelisted', async () => {
      const collateralWhitelistTx = await whitelist.whitelistCollaterals([usdc.address], { from: owner })

      // expectEvent(collateralWhitelistTx, 'CollateralWhitelisted')

      const isWhitelistedCollateral = await whitelist.isWhitelistedCollaterals([usdc.address])
      assert.equal(isWhitelistedCollateral, true, 'fail: collateral not whitelisted')

      const productWhitelistTx = await whitelist.whitelistProduct(
        underlyingAsset,
        usdc.address,
        [usdc.address],
        isPut,
        {
          from: owner,
        }
      )

      //expectEvent(productWhitelistTx, 'ProductWhitelisted')

      const isWhitelistedProduct = await whitelist.isWhitelistedProduct(
        underlyingAsset,
        usdc.address,
        [usdc.address],
        isPut
      )
      assert.equal(isWhitelistedProduct, true, 'fail: product not whitelisted')
    })
  })

  describe('Blacklist product', () => {
    it('should revert blacklisting a product from non-owner address', async () => {
      await expectRevert(
        whitelist.blacklistProduct(underlyingAsset, usdc.address, [usdc.address], isPut, { from: random }),
        'Ownable: caller is not the owner'
      )
    })

    it('should blacklist a product from owner address', async () => {
      assert.equal(
        await whitelist.isWhitelistedProduct(underlyingAsset, usdc.address, [usdc.address], isPut),
        true,
        'fail: product not whitelisted'
      )

      const blacklistTx = await whitelist.blacklistProduct(underlyingAsset, usdc.address, [usdc.address], isPut, {
        from: owner,
      })

      // expectEvent(blacklistTx, 'ProductBlacklisted')

      const isWhitelistedProduct = await whitelist.isWhitelistedProduct(
        underlyingAsset,
        usdc.address,
        [usdc.address],
        isPut
      )
      assert.equal(isWhitelistedProduct, false, 'fail: product not blacklisted')
    })
  })

  describe('Whitelist onToken', () => {
    it('should revert whitelisting an onToken from sender other than ONtoken Factory', async () => {
      await expectRevert(
        whitelist.whitelistONtoken(onToken.address, { from: owner }),
        'Whitelist: Sender is not ONtokenFactory'
      )
    })

    it('should whitelist an onToken from ONtoken Factory address', async () => {
      const whitelistTx = await whitelist.whitelistONtoken(onToken.address, { from: onTokenFactoryAddress })

      expectEvent(whitelistTx, 'ONtokenWhitelisted')

      const isWhitelistedONtoken = await whitelist.isWhitelistedONtoken(onToken.address)
      assert.equal(isWhitelistedONtoken, true, 'fail: onToken not whitelisted')
    })
  })

  describe('Blacklist onToken', () => {
    it('should revert blacklisting an onToken from sender other than owner', async () => {
      await expectRevert(
        whitelist.blacklistONtoken(onToken.address, { from: onTokenFactoryAddress }),
        'Ownable: caller is not the owner'
      )
    })

    it('should blacklist an onToken from owner address', async () => {
      assert.equal(await whitelist.isWhitelistedONtoken(onToken.address), true, 'fail: onToken not whitelisted')

      const blacklistTx = await whitelist.blacklistONtoken(onToken.address, { from: owner })

      expectEvent(blacklistTx, 'ONtokenBlacklisted')

      const isWhitelistedONtoken = await whitelist.isWhitelistedONtoken(onToken.address)
      assert.equal(isWhitelistedONtoken, false, 'fail: onToken not blacklisted')
    })
  })

  describe('Whitelist callee', () => {
    it('should revert whitelisting callee from non-owner address', async () => {
      await expectRevert(whitelist.whitelistCallee(callee, { from: random }), 'Ownable: caller is not the owner')
    })

    it('should whitelist callee from owner address', async () => {
      const whitelistTx = await whitelist.whitelistCallee(callee, { from: owner })

      expectEvent(whitelistTx, 'CalleeWhitelisted')

      const isWHitelistedCallee = await whitelist.isWhitelistedCallee(callee)
      assert.equal(isWHitelistedCallee, true, 'callee not whitelisted')
    })
  })

  describe('blacklist callee', () => {
    it('should revert blacklisting callee from non-owner address', async () => {
      await expectRevert(whitelist.blacklistCallee(callee, { from: random }), 'Ownable: caller is not the owner')
    })

    it('should blacklist callee from owner address', async () => {
      assert.equal(await whitelist.isWhitelistedCallee(callee), true, 'callee not whitelisted')

      const blacklistTx = await whitelist.blacklistCallee(callee, { from: owner })

      expectEvent(blacklistTx, 'CalleeBlacklisted')

      const isWhitelistedCallee = await whitelist.isWhitelistedCallee(callee)
      assert.equal(isWhitelistedCallee, false, 'callee is not blacklisted')
    })
  })

  describe('Transfer ownership', () => {
    it('should transfer ownership to new owner', async () => {
      await whitelist.transferOwnership(newOwner, { from: owner })

      assert.equal(await whitelist.owner(), newOwner, 'Owner address mismatch')
    })

    it('should revert whitelisting a product from old owner address', async () => {
      const collateralWhitelistTx = await whitelist.whitelistCollaterals([dai.address], { from: newOwner })

      // expectEvent(collateralWhitelistTx, 'CollateralWhitelisted')

      const isWhitelistedCollateral = await whitelist.isWhitelistedCollaterals([dai.address])
      assert.equal(isWhitelistedCollateral, true, 'fail: collateral not whitelisted')

      await expectRevert(
        whitelist.whitelistProduct(underlyingAsset, dai.address, [dai.address], isPut, { from: owner }),
        'Ownable: caller is not the owner'
      )
    })

    it('should whitelist a product from owner address', async () => {
      const whitelistTx = await whitelist.whitelistProduct(underlyingAsset, dai.address, [dai.address], isPut, {
        from: newOwner,
      })

      // expectEvent(whitelistTx, 'ProductWhitelisted')

      const isSupportedProduct = await whitelist.isWhitelistedProduct(
        underlyingAsset,
        dai.address,
        [dai.address],
        isPut
      )
      assert.equal(isSupportedProduct, true, 'fail: product not supported')
    })
  })

  describe('Deployment checks', () => {
    it('should revert deploying Whitelist Module when AddressBook is equal to address(0)', async () => {
      await expectRevert(Whitelist.new(ZERO_ADDR, { from: owner }), 'Invalid address book')
    })
  })
})
