import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { ActionTester__factory } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await namedAccountsSigners(getNamedAccounts)

  await deploy<DeployArgs<ActionTester__factory>>('ActionTester', {
    from: deployer.address,
  })
}

deploy.tags = ['ActionTester']
export default deploy

