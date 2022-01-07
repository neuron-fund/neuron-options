import { 
  MockERC20 as MockERC20Instance,
  MockAddressBook as MockAddressBookInstance,
  MarginVaultTester as MarginVaultTesterInstance,
  Otoken as OtokenInstance,
 // WETH9 as WETH9Instance,
  MarginPool as MarginPoolInstance,
  MockDumbERC20 as MockDumbERC20Instance
} from '../../typechain-types' 

import { expectRevert, ether } from '@openzeppelin/test-helpers'
import { artifacts, contract, web3 } from 'hardhat'
import { BigNumber } from 'ethers'
import { assert } from 'chai'

import { createTokenAmount } from './helpers/utils'

const Otoken = artifacts.require('Otoken.sol')
const MockERC20 = artifacts.require('MockERC20.sol')
const MarginVaultTester = artifacts.require('MarginVaultTester.sol')
const MockAddressBook = artifacts.require('MockAddressBook')
const MarginVault = artifacts.require('MarginVault.sol')

const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

contract('MarginVault', ([deployer, controller]) => {
  let weth: MockERC20Instance
  let usdc: MockERC20Instance
  let otoken: OtokenInstance
  let otoken2: OtokenInstance
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
    // deploy otoken
    otoken = await Otoken.new()
    await otoken.init(addressBook.address, weth.address, usdc.address, [usdc.address], strikePrice, expiry, isPut, {
      from: deployer,
    })
    // deploy second otoken
    otoken2 = await Otoken.new()
    await otoken2.init(addressBook.address, weth.address, usdc.address, [usdc.address], strikePrice, expiry, isPut, {
      from: deployer,
    })
    // margin vault
    const lib = await MarginVault.new()

    //await MarginVaultTester.link('MarginVault', lib.address)
    await MarginVaultTester.link(lib)
    marginVaultTester = await MarginVaultTester.new()
  })

  describe('Add short', async () => {
    it('should add short otokens', async () => {
      const vaultCounter = BigNumber.from(0)

      await marginVaultTester.testAddShort(vaultCounter, otoken.address, 10)
      const vault = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vault.shortAmount.toString(), (BigNumber.from(10)).toString())
    })

    it('should revert when adding 0 short', async () => {
      const vaultCounter = BigNumber.from(0)

      await expectRevert(marginVaultTester.testAddShort(vaultCounter, otoken.address, 0), 'V1')
    })


    it('should revert V10 when trying to add second short otoken', async () => {
      const vaultCounter = BigNumber.from(0)

      await expectRevert(marginVaultTester.testAddShort(vaultCounter, otoken2.address, 12), 'V10')
    })
  })

  describe('Remove short', () => {
    it('should remove some of the short otokens', async () => {
      const toRemove = 5
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)

      await marginVaultTester.testRemoveShort(vaultCounter, otoken.address, toRemove)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      assert.equal(
        BigNumber.from(vaultBefore.shortAmount).sub(BigNumber.from(vaultAfter.shortAmount)).toString(),
        BigNumber.from(toRemove).toString(),
        'short amount removed mismatch',
      )
    })

    it('should be able to remove all of the remaining amount of first short otoken and delete short otoken address', async () => {
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)
      const toRemove = vaultBefore.shortAmount

      await marginVaultTester.testRemoveShort(vaultCounter, otoken.address, toRemove)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      assert.equal(
        BigNumber.from(vaultBefore.shortAmount).sub(BigNumber.from(vaultAfter.shortAmount)).toString(),
        BigNumber.from(toRemove).toString(),
        'short amount removed mismatch',
      )

      assert.equal(
        BigNumber.from(vaultAfter.shortAmount).toString(),
        '0',
        'resutl amount should be 0',
      )

      //  assert.equal(vaultAfter.shortOtoken, ZERO_ADDR, 'short otken address mismatch')
    })

    it('should revert when trying to remove wrong short otoken', async () => {
      const vaultCounter = BigNumber.from(0)
      await expectRevert(marginVaultTester.testRemoveShort(vaultCounter, otoken2.address, 1), 'V3')
    })
  })

  describe('Add long', () => {
    /*
    it('should add long otokens', async () => {
      const index = 0
      const amount = 10
      const vaultCounter = BigNumber.from(0)

      await marginVaultTester.testAddLong(vaultCounter, otoken.address, amount, index)
      const vault = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vault.longAmounts[index], BigNumber.from(amount))
    })

    it('should add a different long otoken', async () => {
      const index = 1
      const amount = 10
      const vaultCounter = BigNumber.from(0)

      await marginVaultTester.testAddLong(vaultCounter, otoken2.address, amount, index)
      const vault = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vault.longAmounts[index], BigNumber.from(amount))
    })

    it('should add more amount of the second long otoken', async () => {
      const index = 1
      const amount = 10
      const vaultCounter = BigNumber.from(0)

      await marginVaultTester.testAddLong(vaultCounter, otoken2.address, amount, index)
      const vault = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vault.longAmounts[index], BigNumber.from(20))
    })

    it('should revert if trying to add wrong long otoken to an index', async () => {
      const index = 1
      const amount = 10
      const vaultCounter = BigNumber.from(0)

      await expectRevert(marginVaultTester.testAddLong(vaultCounter, otoken.address, amount, index), 'V6')
    })
    */
  })

  describe('Remove long', () => {
    /*
    it('should remove some of the long otokens', async () => {
      const index = 0
      const toRemove = 5
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)

      await marginVaultTester.testRemoveLong(vaultCounter, otoken.address, toRemove, index)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      assert.equal(
        (vaultBefore.longAmounts[index]).sub(vaultAfter.longAmounts[index]).toString(),
        toRemove.toString(),
        'long amount removed mismatch',
      )
    })

    it('should be able to remove all of the remaining amount of first long otoken and delete long otoken address', async () => {
      const index = 0
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)
      const toRemove = vaultBefore.longAmounts[index]

      await marginVaultTester.testRemoveLong(vaultCounter, otoken.address, toRemove, index)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      assert.equal(
        (vaultBefore.longAmounts[index]).sub(vaultAfter.longAmounts[index]).toString(),
        toRemove.toString(),
        'long amount removed mismatch',
      )
      assert.equal(vaultAfter.longOtokens[index], ZERO_ADDR, 'short otken address mismatch')
    })

    it('should revert when trying to remove wrong long otoken from an index', async () => {
      const vaultCounter = BigNumber.from(0)
      await expectRevert(marginVaultTester.testRemoveLong(vaultCounter, otoken2.address, 1, 0), 'V6')
    })

    it('should be able to add different long in the index of the old long otoken without increase long array length', async () => {
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)

      await marginVaultTester.testAddLong(vaultCounter, otoken2.address, 10, 0)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)
      assert.equal(vaultAfter.shortAmount, BigNumber.from(10))
      assert.equal(vaultBefore.longOtokens.length, vaultAfter.longOtokens.length, 'long otokens array length mismatch')
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

      await marginVaultTester.testRemoveCollateral(vaultCounter, weth.address, toRemove, 0)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      const amountBefore = BigNumber.from(vaultBefore.collateralAmounts[0].toString())
      const amountAfter = BigNumber.from(vaultAfter.collateralAmounts[0].toString())

      assert.equal(
        amountBefore.sub(amountAfter).toString(), 
        toRemove.toString(),
        'collateral amount removed mismatch'
      )
    })

    it('should be able to remove all of the remaining amount of first collateral asset', async () => {
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)
      const toRemove = vaultBefore.collateralAmounts[0]

      await marginVaultTester.testRemoveCollateral(vaultCounter, weth.address, toRemove, 0)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      const amountBefore = BigNumber.from(vaultBefore.collateralAmounts[0].toString())
      const amountAfter = BigNumber.from(vaultAfter.collateralAmounts[0].toString())

      assert.equal(
        amountBefore.sub(amountAfter).toString(), 
        toRemove.toString(),
        'collateral amount removed mismatch'
      )
      //assert.equal(vaultAfter.collateralAssets[0], ZERO_ADDR, 'collateral asset address mismatch')
    })

    it('should remove some of the second collateral asset', async () => {
      const toRemove = 5
      const assetIndex = 1
      const vaultCounter = BigNumber.from(0)
      const vaultBefore = await marginVaultTester.getVault(vaultCounter)

      await marginVaultTester.testRemoveCollateral(vaultCounter, usdc.address, toRemove, assetIndex)
      const vaultAfter = await marginVaultTester.getVault(vaultCounter)

      const amountBefore = BigNumber.from(vaultBefore.collateralAmounts[assetIndex].toString())
      const amountAfter = BigNumber.from(vaultAfter.collateralAmounts[assetIndex].toString())

      assert.equal(
        amountBefore.sub(amountAfter).toString(), 
        toRemove.toString(),
        'collateral amount removed mismatch'
      )
    })

    it('should revert when trying to remove wrong collateral asset from an index', async () => {
      const vaultCounter = BigNumber.from(0)

      await expectRevert(marginVaultTester.testRemoveCollateral(vaultCounter, usdc.address, 1, 0), 'V9')
    })
  })
})
