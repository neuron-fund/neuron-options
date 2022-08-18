import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook__factory } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'

const deploy: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await namedAccountsSigners(getNamedAccounts)

  await deploy<DeployArgs<AddressBook__factory>>('AddressBook', {
    from: deployer.address,
  })
}

deploy.tags = ['AddressBook']
export default deploy
