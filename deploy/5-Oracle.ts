import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, Oracle__factory } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments, getNamedAccounts } = hre
  const { deploy, get } = deployments
  const { deployer } = await namedAccountsSigners(getNamedAccounts)

  const AddressBook = await get('AddressBook')

  const OracleDeployResult = await deploy<DeployArgs<Oracle__factory>>('Oracle', {
    from: deployer.address,
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, deployer)) as AddressBook
  await addressBook.setOracle(OracleDeployResult.address)
}

deploy.tags = ['Oracle']
deploy.dependencies = ['AddressBook']
export default deploy
