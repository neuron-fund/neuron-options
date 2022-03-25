import { expect, assert } from 'chai'
import { ethers, contract, web3 } from 'hardhat'

import {
  MockERC20 as MockERC20Instance,
  Whitelist as WhitelistInstance,
  OtokenFactory as OtokenFactoryInstance,
  UpgradeableContractV1 as UpgradeableContractV1Instance,
  UpgradeableContractV2 as UpgradeableContractV2Instance,
  OwnedUpgradeabilityProxy as OwnedUpgradeabilityProxyInstance,
  AddressBook as AddressBookInstance,
  Controller as ControllerInstance,
  MarginCalculator as MarginCalculatorInstance,
  Oracle as OracleInstance,
} from '../../typechain-types'


contract('AddressBook', ([owner, otokenImplAdd, marginPoolAdd, random]) => {
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

    const AddressBook = await ethers.getContractFactory('AddressBook')
    addressBook = (await AddressBook.deploy()) as AddressBookInstance
    await addressBook.deployed()
  })

  describe('Set otoken implementation address', () => {
    xit('should revert adding otoken implementation address from non-owner address', async () => {
      await expect(addressBook.connect(random).setOtokenImpl(otokenImplAdd)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    xit('should set otoken implementation address', async () => {
      await addressBook.setOtokenImpl(otokenImplAdd, { from: owner })

      assert.equal(await addressBook.getOtokenImpl(), otokenImplAdd, 'Otoken implementation address mismatch')
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

    xit('should revert adding controller from non-owner address', async () => {
      await expect(addressBook.connect(random).setController(controller.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    xit('should set controller address', async () => {
      await addressBook.setController(controller.address, { from: owner })

      const OwnedUpgradeabilityProxy = await ethers.getContractFactory('OwnedUpgradeabilityProxy')
      const proxy: OwnedUpgradeabilityProxyInstance = OwnedUpgradeabilityProxy.attach(
        await addressBook.getController()
      ) as OwnedUpgradeabilityProxyInstance

      const implementationAddress = await proxy.implementation()

      assert.equal(controller.address, implementationAddress, 'Controller implementation address mismatch')
    })
  })

  describe('Set otoken factory', () => {
    let otokenFactory: OtokenFactoryInstance

    before(async () => {
      const OtokenFactory = await ethers.getContractFactory('OtokenFactory')
      otokenFactory = (await OtokenFactory.deploy(addressBook.address)) as OtokenFactoryInstance
      await otokenFactory.deployed()
    })

    xit('should revert adding otoken factory address from non-owner address', async () => {
      await expect(addressBook.connect(random).setOtokenFactory(otokenFactory.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    xit('should set otoken factory address', async () => {
      await addressBook.setOtokenFactory(otokenFactory.address, { from: owner })

      assert.equal(await addressBook.getOtokenFactory(), otokenFactory.address, 'Otoken factory address mismatch')
    })
  })

  describe('Set whitelist', () => {
    let whitelist: WhitelistInstance

    before(async () => {
      const Whitelist = await ethers.getContractFactory('Whitelist')

      whitelist = (await Whitelist.deploy(addressBook.address)) as WhitelistInstance
      await whitelist.deployed()
    })

    xit('should revert adding whitelist address from non-owner address', async () => {
      await expect(addressBook.connect(random).setWhitelist(whitelist.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    xit('should set whitelist address', async () => {
      await addressBook.setWhitelist(whitelist.address, { from: owner })

      assert.equal(await addressBook.getWhitelist(), whitelist.address, 'Whitelist address mismatch')
    })
  })

  describe('Set margin pool', () => {
    xit('should revert adding pool address from non-owner address', async () => {
      await expect(addressBook.connect(random).setMarginPool(marginPoolAdd)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    xit('should set pool address', async () => {
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

    xit('should revert adding oracle address from non-owner address', async () => {
      await expect(addressBook.connect(random).setLiquidationManager(oracle.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    xit('should set oracle address', async () => {
      await addressBook.setOracle(oracle.address, { from: owner })

      assert.equal(oracle.address, await addressBook.getOracle(), 'Oracle module implementation address mismatch')
    })
  })

  describe('Set margin calculator', () => {
    let marginCalculator: MarginCalculatorInstance

    before(async () => {
      const oracleAddress = await addressBook.getOracle()
      // const MarginCalculator =  await ethers.getContractFactory("MarginCalculator")
      // marginCalculator = await MarginCalculator.deploy(oracleAddress) as MarginCalculatorInstance



      /*

      const arrayAddressUtils = await (await ethers.getContractFactory('ArrayAddressUtils')).deploy()
      await arrayAddressUtils.deployed()

      marginCalculator = (await (
        await ethers.getContractFactory('MarginCalculator')
      ).deploy(oracleAddress)) as MarginCalculatorInstance
      await marginCalculator.deployed()

      */
    })

    xit('should revert adding margin calculator address from non-owner address', async () => {
      await expect(addressBook.connect(random).setMarginCalculator(marginCalculator.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    xit('should set margin calculator address', async () => {
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

    xit('should revert adding arbitrary key:address from non-owner address', async () => {
      await expect(addressBook.connect(random).updateImpl(modulekey, module.address)).to.be.revertedWith(
        'Ownable: caller is not the owner'
      )
    })

    xit('should set new module key and address', async () => {
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
