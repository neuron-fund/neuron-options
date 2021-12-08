import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook__factory } from '../typechain-types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy } = deployments
  const signer = (await ethers.getSigners())[0]

  await deploy<DeployArgs<AddressBook__factory>>('AddressBook', {
    from: signer.address,
  })
}

deploy.tags = ['AddressBook']
export default deploy
