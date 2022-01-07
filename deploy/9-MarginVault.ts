import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { namedAccountsSigners } from '../utils/hardhat'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy } = deployments
  const { deployer } = await namedAccountsSigners(getNamedAccounts)

  await deploy('MarginVault', {
    from: deployer.address,
  })
}

deploy.tags = ['MarginVault']
export default deploy
