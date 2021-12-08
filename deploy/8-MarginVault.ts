import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy } = deployments
  const signer = (await ethers.getSigners())[0]

  await deploy('MarginVault', {
    from: signer.address,
  })
}

deploy.tags = ['MarginVault']
export default deploy
