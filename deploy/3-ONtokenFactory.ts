import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, ONtokenFactory__factory } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments, getNamedAccounts } = hre
  const { deploy, get } = deployments
  const { deployer } = await namedAccountsSigners(getNamedAccounts)

  const AddressBook = await get('AddressBook')

  const onTokenFactoryDeployResult = await deploy<DeployArgs<ONtokenFactory__factory>>('ONtokenFactory', {
    from: deployer.address,
    args: [AddressBook.address],
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, deployer)) as AddressBook
  await addressBook.setONtokenFactory(onTokenFactoryDeployResult.address)
}

deploy.tags = ['ONtokenFactory']
deploy.dependencies = ['AddressBook', 'ONtoken']
export default deploy
