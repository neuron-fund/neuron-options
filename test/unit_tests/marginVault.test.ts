import {
  MockERC20 as MockERC20Instance,
  MockAddressBook as MockAddressBookInstance,
  MarginVaultTester as MarginVaultTesterInstance,
  ONtoken as ONtokenInstance,
  // WETH9 as WETH9Instance,
  MarginPool as MarginPoolInstance,
  MockDumbERC20 as MockDumbERC20Instance,
} from '../../typechain-types'

import { expectRevert, ether } from '@openzeppelin/test-helpers'
import { artifacts, contract, web3 } from 'hardhat'
import { BigNumber } from 'ethers'
import { assert } from 'chai'

import { createTokenAmount } from '../helpers/utils'
import { FixedPointIntStruct } from '../../typechain-types/MarginVaultTester'

const ONtoken = artifacts.require('ONtoken.sol')
const MockERC20 = artifacts.require('MockERC20.sol')
const MarginVaultTester = artifacts.require('MarginVaultTester.sol')
const MockAddressBook = artifacts.require('MockAddressBook')
const MarginVault = artifacts.require('MarginVault.sol')

const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

contract('MarginVault', ([deployer, controller]) => {
  let weth: MockERC20Instance
  let usdc: MockERC20Instance
  let onToken: ONtokenInstance
  let onToken2: ONtokenInstance
  let addressBook: MockAddressBookInstance
  let marginVaultTester: MarginVaultTesterInstance

  // let expiry: number;
  const strikePrice = createTokenAmount(200)
  const expiry = 1601020800 // 2020/09/25 0800 UTC
  const isPut = true

  before('Deployment', async () => {
    // deploy WETH token
    weth = await MockERC20.new('WETH', 'WETH', 18)
    // usdc
    usdc = await MockERC20.new('USDC', 'USDC', 6)
    // deploy AddressBook token
    addressBook = await MockAddressBook.new()
    await addressBook.setController(controller)
    // deploy onToken
    onToken = await ONtoken.new()
    await onToken.init(
      addressBook.address,
      weth.address,
      usdc.address,
      [usdc.address],
      ['0'],
      strikePrice,
      expiry,
      isPut,
      {
        from: deployer,
      }
    )
    // deploy second onToken
    onToken2 = await ONtoken.new()
    await onToken2.init(
      addressBook.address,
      weth.address,
      usdc.address,
      [usdc.address],
      ['0'],
      strikePrice,
      expiry,
      isPut,
      {
        from: deployer,
      }
    )
    // margin vault
    const lib = await MarginVault.new()

    //await MarginVaultTester.link('MarginVault', lib.address)
    await MarginVaultTester.link(lib)
    marginVaultTester = await MarginVaultTester.new()
  })

  describe('Add short', async () => {
    it('should add short onTokens', async () => {
      const vaultCounter = BigNumber.from(0)

      await marginVaultTester.testAddShort(vaultCounter, onToken.address, 10)
      const vault = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vault.shortAmount.toString(), BigNumber.from(10).toString())
    })

    it('should revert when adding 0 short', async () => {
      const vaultCounter = BigNumber.from(0)

      await expectRevert(marginVaultTester.testAddShort(vaultCounter, onToken.address, 0), 'V1')
    })

    it('should revert V10 when trying to add second short onToken', async () => {
      const vaultCounter = BigNumber.from(0)

      await expectRevert(marginVaultTester.testAddShort(vaultCounter, onToken2.address, 12), 'V10')
    })
  })

  describe('Remove short', () => {
    it('should remove some of the short onTokens', async () => {
      const toRemove = 5
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)
      const fpiZero: FixedPointIntStruct = { value: BigNumber.from(0) }

      await marginVaultTester.testRemoveShort(vaultCounter, onToken.address, toRemove, fpiZero, 0)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      assert.equal(
        BigNumber.from(vaultBefore.shortAmount).sub(BigNumber.from(vaultAfter.shortAmount)).toString(),
        BigNumber.from(toRemove).toString(),
        'short amount removed mismatch'
      )
    })

    it('should be able to remove all of the remaining amount of first short onToken and delete short onToken address', async () => {
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)
      const toRemove = vaultBefore.shortAmount
      const fpiZero: FixedPointIntStruct = { value: BigNumber.from(0) }

      await marginVaultTester.testRemoveShort(vaultCounter, onToken.address, toRemove, fpiZero, 0)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      assert.equal(
        BigNumber.from(vaultBefore.shortAmount).sub(BigNumber.from(vaultAfter.shortAmount)).toString(),
        BigNumber.from(toRemove).toString(),
        'short amount removed mismatch'
      )

      assert.equal(BigNumber.from(vaultAfter.shortAmount).toString(), '0', 'resutl amount should be 0')

      //  assert.equal(vaultAfter.shortONtoken, ZERO_ADDR, 'short otken address mismatch')
    })

    it('should revert when trying to remove wrong short onToken', async () => {
      const fpiZero: FixedPointIntStruct = { value: BigNumber.from(0) }
      const vaultCounter = BigNumber.from(0)
      await expectRevert(marginVaultTester.testRemoveShort(vaultCounter, onToken2.address, 1, fpiZero, 0), 'V3')
    })
  })

  describe('Add long', () => {
    /*
    it('should add long onTokens', async () => {
      const index = 0
      const amount = 10
      const vaultCounter = BigNumber.from(0)

      await marginVaultTester.testAddLong(vaultCounter, onToken.address, amount, index)
      const vault = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vault.longAmounts[index], BigNumber.from(amount))
    })

    it('should add a different long onToken', async () => {
      const index = 1
      const amount = 10
      const vaultCounter = BigNumber.from(0)

      await marginVaultTester.testAddLong(vaultCounter, onToken2.address, amount, index)
      const vault = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vault.longAmounts[index], BigNumber.from(amount))
    })

    it('should add more amount of the second long onToken', async () => {
      const index = 1
      const amount = 10
      const vaultCounter = BigNumber.from(0)

      await marginVaultTester.testAddLong(vaultCounter, onToken2.address, amount, index)
      const vault = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vault.longAmounts[index], BigNumber.from(20))
    })

    it('should revert if trying to add wrong long onToken to an index', async () => {
      const index = 1
      const amount = 10
      const vaultCounter = BigNumber.from(0)

      await expectRevert(marginVaultTester.testAddLong(vaultCounter, onToken.address, amount, index), 'V6')
    })
    */
  })

  describe('Remove long', () => {
    /*
    it('should remove some of the long onTokens', async () => {
      const index = 0
      const toRemove = 5
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)

      await marginVaultTester.testRemoveLong(vaultCounter, onToken.address, toRemove, index)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      assert.equal(
        (vaultBefore.longAmounts[index]).sub(vaultAfter.longAmounts[index]).toString(),
        toRemove.toString(),
        'long amount removed mismatch',
      )
    })

    it('should be able to remove all of the remaining amount of first long onToken and delete long onToken address', async () => {
      const index = 0
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)
      const toRemove = vaultBefore.longAmounts[index]

      await marginVaultTester.testRemoveLong(vaultCounter, onToken.address, toRemove, index)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      assert.equal(
        (vaultBefore.longAmounts[index]).sub(vaultAfter.longAmounts[index]).toString(),
        toRemove.toString(),
        'long amount removed mismatch',
      )
      assert.equal(vaultAfter.longONtokens[index], ZERO_ADDR, 'short otken address mismatch')
    })

    it('should revert when trying to remove wrong long onToken from an index', async () => {
      const vaultCounter = BigNumber.from(0)
      await expectRevert(marginVaultTester.testRemoveLong(vaultCounter, onToken2.address, 1, 0), 'V6')
    })

    it('should be able to add different long in the index of the old long onToken without increase long array length', async () => {
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)

      await marginVaultTester.testAddLong(vaultCounter, onToken2.address, 10, 0)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vaultAfter.shortAmount, BigNumber.from(10))
      assert.equal(vaultBefore.longONtokens.length, vaultAfter.longONtokens.length, 'long onTokens array length mismatch')
    })

    */
  })

  describe('Add collateral', () => {
    it('should add weth collateral', async () => {
      const amount = 10
      const vaultCounter = BigNumber.from(0)

      // init collaterals
      await marginVaultTester.initCollaterals(vaultCounter, [weth.address, usdc.address])

      await marginVaultTester.testAddCollaterals(vaultCounter, [weth.address, usdc.address], [amount, 0])
      const vault = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vault.collateralAmounts[0], BigNumber.from(amount))
    })

    it('should add some more weth collateral', async () => {
      const changeAmt = 20
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)

      await marginVaultTester.testAddCollaterals(vaultCounter, [weth.address, usdc.address], [changeAmt, 0])
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      const amountBefore = BigNumber.from(vaultBefore.collateralAmounts[0].toString())
      const amountAfter = BigNumber.from(vaultAfter.collateralAmounts[0].toString())

      assert.equal(amountAfter.sub(amountBefore).toString(), changeAmt.toString())
    })

    it('should add usdc collateral', async () => {
      const amount = 20
      const vaultCounter = BigNumber.from(0)

      await marginVaultTester.testAddCollaterals(vaultCounter, [weth.address, usdc.address], [0, amount])
      const vault = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vault.collateralAmounts[1].toString(), BigNumber.from(amount).toString())
    })

    it('should add some more usdc collateral', async () => {
      const changeAmt = 30
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)

      await marginVaultTester.testAddCollaterals(vaultCounter, [weth.address, usdc.address], [0, changeAmt])
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      const amountBefore = BigNumber.from(vaultBefore.collateralAmounts[1].toString())
      const amountAfter = BigNumber.from(vaultAfter.collateralAmounts[1].toString())

      assert.equal(amountAfter.sub(amountBefore).toString(), changeAmt.toString())
    })
  })

  describe('Remove collateral', () => {
    it('should remove some of the collateral asset', async () => {
      const toRemove = 5
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)

      await marginVaultTester.testRemoveCollateral(vaultCounter, [toRemove, 0])
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      const amountBefore = BigNumber.from(vaultBefore.collateralAmounts[0].toString())
      const amountAfter = BigNumber.from(vaultAfter.collateralAmounts[0].toString())

      assert.equal(amountBefore.sub(amountAfter).toString(), toRemove.toString(), 'collateral amount removed mismatch')
    })

    it('should be able to remove all of the remaining amount of first collateral asset', async () => {
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)
      const toRemove = vaultBefore.collateralAmounts[0]

      await marginVaultTester.testRemoveCollateral(vaultCounter, [toRemove, 0])
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      const amountBefore = BigNumber.from(vaultBefore.collateralAmounts[0].toString())
      const amountAfter = BigNumber.from(vaultAfter.collateralAmounts[0].toString())

      assert.equal(amountBefore.sub(amountAfter).toString(), toRemove.toString(), 'collateral amount removed mismatch')
      //assert.equal(vaultAfter.collateralAssets[0], ZERO_ADDR, 'collateral asset address mismatch')
    })

    it('should remove some of the second collateral asset', async () => {
      const toRemove = 5
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)

      await marginVaultTester.testRemoveCollateral(vaultCounter, [0, toRemove])
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      const amountBefore = BigNumber.from(vaultBefore.collateralAmounts[1].toString())
      const amountAfter = BigNumber.from(vaultAfter.collateralAmounts[1].toString())

      assert.equal(amountBefore.sub(amountAfter).toString(), toRemove.toString(), 'collateral amount removed mismatch')
    })

    it('should revert when trying to remove wrong collateral amount from an index', async () => {
      const vaultCounter = BigNumber.from(0)

      await expectRevert(
        marginVaultTester.testRemoveCollateral(vaultCounter, [100000, 100000]),
        'VM Exception while processing transaction: reverted with panic code 0x11 (Arithmetic operation underflowed or overflowed outside of an unchecked block)'
      )
    })
  })
})
