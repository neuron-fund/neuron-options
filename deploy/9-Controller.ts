import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, Controller__factory } from '../typechain-types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments
  const signer = (await ethers.getSigners())[0]

  const MarginVault = await get('MarginVault')

  const ControllerDeployResult = await deploy<DeployArgs<Controller__factory>>('Controller', {
    from: signer.address,
    libraries: {
      MarginVault: MarginVault.address,
    },
  })
  const AddressBook = await get('AddressBook')
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, signer)) as AddressBook
  await addressBook.setController(ControllerDeployResult.address)
}

deploy.tags = ['Controller']
deploy.dependencies = ['MarginVault', 'AddressBook']
export default deploy
