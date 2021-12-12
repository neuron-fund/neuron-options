import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy } = deployments
  const signer = (await ethers.getSigners())[0]

  await deploy('ArrayAddressUtils', {
    from: signer.address,
  })
}

deploy.tags = ['ArrayAddressUtils']
export default deploy
