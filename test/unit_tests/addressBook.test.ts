import { expect, assert } from 'chai'
import { ethers, artifacts, contract, web3 } from 'hardhat'

import {
  MockERC20 as MockERC20Instance,
  Whitelist as WhitelistInstance,
  ONtokenFactory as ONtokenFactoryInstance,
  UpgradeableContractV1 as UpgradeableContractV1Instance,
  UpgradeableContractV2 as UpgradeableContractV2Instance,
  OwnedUpgradeabilityProxy as OwnedUpgradeabilityProxyInstance,
  AddressBook as AddressBookInstance,
  Controller as ControllerInstance,
  MarginCalculator as MarginCalculatorInstance,
  Oracle as OracleInstance,
} from '../../typechain-types'

const { expectRevert } = require('@openzeppelin/test-helpers')

const AddressBook = artifacts.require('AddressBook.sol')
const MarginCalculator = artifacts.require('MarginCalculator.sol')

contract('AddressBook', ([owner, onTokenImplAdd, marginPoolAdd, random]) => {
  // ERC20 mocks
  let weth: MockERC20Instance
  // addressbook instance
  let addressBook: AddressBookInstance

  before('Deployment', async () => {
    // const { deployer, random_user, random_user2, random_user3 } = await getNamedAccounts()

    // deploy WETH token
    const MockERC20 = await ethers.getContractFactory('MockERC20')
    weth = (await MockERC20.deploy('WETH', 'WETH', 18)) as MockERC20Instance
    await weth.deployed()
    addressBook = await AddressBook.new()
  })

  describe('Set onToken implementation address', () => {
    it('should revert adding onToken implementation address from non-owner address', async () => {
      await expectRevert(
        addressBook.setONtokenImpl(onTokenImplAdd, { from: random }),
        'Ownable: caller is not the owner'
      )
    })

    it('should set onToken implementation address', async () => {
      await addressBook.setONtokenImpl(onTokenImplAdd)
      assert.equal(await addressBook.getONtokenImpl(), onTokenImplAdd, 'ONtoken implementation address mismatch')
    })
  })

  describe('Set controller', () => {
    let controller: ControllerInstance

    before(async () => {
      const marginVault = await (await ethers.getContractFactory('MarginVault')).deploy()
      await marginVault.deployed()

      const Controller = await ethers.getContractFactory('Controller', {
        libraries: {
          MarginVault: marginVault.address,
          //"ArrayAddressUtils": arrayAddressUtils.address,
        },
      })
      // const MarginVault = await ethers.getContractFactory("MarginVault")
      // const ArrayAddressUtils = await ethers.getContractFactory("ArrayAddressUtils")
      controller = (await Controller.deploy()) as ControllerInstance
      await controller.deployed()
    })

    it('should revert adding controller from non-owner address', async () => {
      await expect(addressBook.setController(controller.address, { from: random })).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set controller address', async () => {
      await addressBook.setController(controller.address, { from: owner })

      const OwnedUpgradeabilityProxy = await ethers.getContractFactory('OwnedUpgradeabilityProxy')
      const proxy: OwnedUpgradeabilityProxyInstance = OwnedUpgradeabilityProxy.attach(
        await addressBook.getController()
      ) as OwnedUpgradeabilityProxyInstance

      const implementationAddress = await proxy.implementation()

      assert.equal(controller.address, implementationAddress, 'Controller implementation address mismatch')
    })
  })

  describe('Set onToken factory', () => {
    let onTokenFactory: ONtokenFactoryInstance

    before(async () => {
      const ONtokenFactory = await ethers.getContractFactory('ONtokenFactory')
      onTokenFactory = (await ONtokenFactory.deploy(addressBook.address)) as ONtokenFactoryInstance
      await onTokenFactory.deployed()
    })

    it('should revert adding onToken factory address from non-owner address', async () => {
      await expect(addressBook.setONtokenFactory(onTokenFactory.address, { from: random })).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set onToken factory address', async () => {
      await addressBook.setONtokenFactory(onTokenFactory.address, { from: owner })

      assert.equal(await addressBook.getONtokenFactory(), onTokenFactory.address, 'ONtoken factory address mismatch')
    })
  })

  describe('Set whitelist', () => {
    let whitelist: WhitelistInstance

    before(async () => {
      const Whitelist = await ethers.getContractFactory('Whitelist')

      whitelist = (await Whitelist.deploy(addressBook.address)) as WhitelistInstance
      await whitelist.deployed()
    })

    it('should revert adding whitelist address from non-owner address', async () => {
      await expect(addressBook.setWhitelist(whitelist.address, { from: random })).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set whitelist address', async () => {
      await addressBook.setWhitelist(whitelist.address, { from: owner })

      assert.equal(await addressBook.getWhitelist(), whitelist.address, 'Whitelist address mismatch')
    })
  })

  describe('Set margin pool', () => {
    it('should revert adding pool address from non-owner address', async () => {
      await expect(addressBook.setMarginPool(marginPoolAdd, { from: random })).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set pool address', async () => {
      await addressBook.setMarginPool(marginPoolAdd, { from: owner })

      assert.equal(await addressBook.getMarginPool(), marginPoolAdd, 'Pool address mismatch')
    })
  })

  describe('Set oracle', () => {
    let oracle: OracleInstance

    before(async () => {
      oracle = (await (await ethers.getContractFactory('Oracle')).deploy()) as OracleInstance
      await oracle.deployed()
    })

    it('should revert adding oracle address from non-owner address', async () => {
      await expect(addressBook.setLiquidationManager(oracle.address, { from: random })).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set oracle address', async () => {
      await addressBook.setOracle(oracle.address, { from: owner })

      assert.equal(oracle.address, await addressBook.getOracle(), 'Oracle module implementation address mismatch')
    })
  })

  describe('Set margin calculator', () => {
    let marginCalculator: MarginCalculatorInstance

    before(async () => {
      const oracleAddress = await addressBook.getOracle()
      marginCalculator = await MarginCalculator.new(oracleAddress)
    })

    it('should revert adding margin calculator address from non-owner address', async () => {
      await expect(addressBook.setMarginCalculator(marginCalculator.address, { from: random })).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set margin calculator address', async () => {
      await addressBook.setMarginCalculator(marginCalculator.address, { from: owner })

      assert.equal(
        marginCalculator.address,
        await addressBook.getMarginCalculator(),
        'Margin calculator implementation address mismatch'
      )
    })
  })

  describe('Set arbitrary address', () => {
    const modulekey = web3.utils.soliditySha3('newModule')
    let module: UpgradeableContractV1Instance

    before(async () => {
      module = (await (
        await ethers.getContractFactory('UpgradeableContractV1')
      ).deploy()) as UpgradeableContractV1Instance
      await module.deployed()
    })

    it('should revert adding arbitrary key:address from non-owner address', async () => {
      await expect(addressBook.updateImpl(modulekey, module.address, { from: random })).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    it('should set new module key and address', async () => {
      console.log(`going to make addressBook.updateImpl(%{modulekey}, %{module.address}}`)

      await addressBook.updateImpl(modulekey, module.address, { from: owner })
      console.log('going to make getContractFactory')

      const OwnedUpgradeabilityProxy = await ethers.getContractFactory('OwnedUpgradeabilityProxy')
      console.log('going to attach')

      const proxy: OwnedUpgradeabilityProxyInstance = OwnedUpgradeabilityProxy.attach(
        await addressBook.getAddress(modulekey)
      ) as OwnedUpgradeabilityProxyInstance
      console.log('going to get proxy.implementation()')

      const implementationAddress = await proxy.implementation()

      assert.equal(module.address, implementationAddress, 'New module implementation address mismatch')
    })
  })

  describe('Upgrade contract', async () => {
    const key = web3.utils.soliditySha3('ammModule')

    let v1Contract: UpgradeableContractV1Instance
    let v2Contract: UpgradeableContractV2Instance

    before(async () => {
      const AddressBook = await ethers.getContractFactory('AddressBook') //reimport
      addressBook = (await AddressBook.deploy()) as AddressBookInstance
      await addressBook.deployed()

      console.log('await v1')

      v1Contract = (await (
        await ethers.getContractFactory('UpgradeableContractV1')
      ).deploy()) as UpgradeableContractV1Instance
      await v1Contract.deployed()

      console.log('updateImpl')
      //await addressBook.updateImpl(key, v1Contract.address, { from: owner })
      await addressBook.updateImpl(key, v1Contract.address)
      const OwnedUpgradeabilityProxy = await ethers.getContractFactory('OwnedUpgradeabilityProxy')

      console.log('attach')
      const proxy: OwnedUpgradeabilityProxyInstance = OwnedUpgradeabilityProxy.attach(
        await addressBook.getAddress(key)
      ) as OwnedUpgradeabilityProxyInstance

      console.log('implementation')
      const implementationAddress = await proxy.implementation()

      console.log('asseretions')
      assert.equal(v1Contract.address, implementationAddress, 'AMM module implementation address mismatch')
      assert.equal((await v1Contract.getV1Version()).toString(), '1', 'AMM implementation version mismatch')
    })

    it('should upgrade contract from V1 to V2', async () => {
      // deploy V2 implementation
      console.log('v2Contract')

      v2Contract = (await (
        await ethers.getContractFactory('UpgradeableContractV2')
      ).deploy()) as UpgradeableContractV2Instance
      await v2Contract.deployed()

      console.log('v2Contract')
      const OwnedUpgradeabilityProxy = await ethers.getContractFactory('OwnedUpgradeabilityProxy')
      const v1Proxy: OwnedUpgradeabilityProxyInstance = OwnedUpgradeabilityProxy.attach(
        await addressBook.getAddress(key)
      ) as OwnedUpgradeabilityProxyInstance

      const v1ImplementationAddress = await v1Proxy.implementation()

      assert.notEqual(v2Contract.address, v1ImplementationAddress, 'AMM v1 and v2 have same implementation address')

      await addressBook.updateImpl(key, v2Contract.address)

      const v2Proxy: OwnedUpgradeabilityProxyInstance = OwnedUpgradeabilityProxy.attach(
        await addressBook.getAddress(key)
      ) as OwnedUpgradeabilityProxyInstance

      const v2ImplementationAddress = await v2Proxy.implementation()

      assert.equal(v2Contract.address, v2ImplementationAddress, 'AMM V2 implementation address mismatch')
      assert.equal(v1Proxy.address, v2Proxy.address, 'AMM proxy address mismatch')

      const UpgradeableContractV2 = await ethers.getContractFactory('UpgradeableContractV2')

      v2Contract = UpgradeableContractV2.attach(await addressBook.getAddress(key)) as UpgradeableContractV2Instance

      assert.equal((await v2Contract.getV2Version()).toString(), '2', 'AMM implementation version mismatch')
    })
  })
})
