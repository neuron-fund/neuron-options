import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, Whitelist__factory } from '../typechain-types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments
  const signer = (await ethers.getSigners())[0]

  const AddressBook = await get('AddressBook')

  const WhitelistDeployResult = await deploy<DeployArgs<Whitelist__factory>>('Whitelist', {
    from: signer.address,
    args: [AddressBook.address],
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, signer)) as AddressBook
  await addressBook.setWhitelist(WhitelistDeployResult.address)
}

deploy.tags = ['Whitelist']
deploy.dependencies = ['AddressBook']
export default deploy
