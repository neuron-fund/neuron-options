import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, Controller__factory } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments, getNamedAccounts } = hre
  const { deploy, get } = deployments
  const { deployer } = await namedAccountsSigners(getNamedAccounts)

  const MarginVault = await get('MarginVault')
  const ArrayAddressUtils = await get('ArrayAddressUtils')
  const AddressBook = await get('AddressBook')

  const ControllerDeployResult = await deploy<DeployArgs<Controller__factory>>('Controller', {
    from: deployer.address,
    libraries: {
      MarginVault: MarginVault.address,
      ArrayAddressUtils: ArrayAddressUtils.address,
    },
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, deployer)) as AddressBook
  // Address book takes controller address as implementation and deploys or updates proxy and sets implementation
  await addressBook.setController(ControllerDeployResult.address)
  const controller = await get('Controller')
  // Set controller to proxy address not implementation
  controller.address = await addressBook.getController()
}

deploy.tags = ['Controller']
deploy.dependencies = [
  'MarginVault',
  'MarginPool',
  'AddressBook',
  'ArrayAddressUtils',
  'MarginCalculator',
  'Whitelist',
  'OtokenFactory',
]
export default deploy
