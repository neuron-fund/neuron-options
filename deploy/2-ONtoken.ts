import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, ONtoken__factory } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments, getNamedAccounts } = hre
  const { deploy, get } = deployments
  const { deployer } = await namedAccountsSigners(getNamedAccounts)

  const AddressBook = await get('AddressBook')

  const onTokenImplDeployResult = await deploy<DeployArgs<ONtoken__factory>>('ONtoken', {
    from: deployer.address,
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, deployer)) as AddressBook
  await addressBook.setONtokenImpl(onTokenImplDeployResult.address)
}

deploy.tags = ['ONtoken']
deploy.dependencies = ['AddressBook']
export default deploy
