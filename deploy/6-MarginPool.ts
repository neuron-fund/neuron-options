import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, MarginPool__factory } from '../typechain-types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments
  const signer = (await ethers.getSigners())[0]

  const AddressBook = await get('AddressBook')

  const MarginPoolDeployResult = await deploy<DeployArgs<MarginPool__factory>>('MarginPool', {
    from: signer.address,
    args: [AddressBook.address],
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, signer)) as AddressBook
  await addressBook.setMarginPool(MarginPoolDeployResult.address)
}

deploy.tags = ['MarginPool']
deploy.dependencies = ['AddressBook']
export default deploy
