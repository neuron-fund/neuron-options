import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, OtokenFactory__factory } from '../typechain-types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments
  const signer = (await ethers.getSigners())[0]

  const AddressBook = await get('AddressBook')

  const oTokenFactoryDeployResult = await deploy<DeployArgs<OtokenFactory__factory>>('OtokenFactory', {
    from: signer.address,
    args: [AddressBook.address],
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, signer)) as AddressBook
  await addressBook.setOtokenFactory(oTokenFactoryDeployResult.address)
}

deploy.tags = ['OtokenFactory']
deploy.dependencies = ['AddressBook']
export default deploy
