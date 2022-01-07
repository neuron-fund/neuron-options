import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, Whitelist__factory } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments, getNamedAccounts } = hre
  const { deploy, get } = deployments
  const { deployer } = await namedAccountsSigners(getNamedAccounts)

  const AddressBook = await get('AddressBook')

  const WhitelistDeployResult = await deploy<DeployArgs<Whitelist__factory>>('Whitelist', {
    from: deployer.address,
    args: [AddressBook.address],
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, deployer)) as AddressBook
  await addressBook.setWhitelist(WhitelistDeployResult.address)
}

deploy.tags = ['Whitelist']
deploy.dependencies = ['AddressBook']
export default deploy
