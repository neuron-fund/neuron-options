import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, Otoken__factory } from '../typechain-types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments
  const signer = (await ethers.getSigners())[0]

  const AddressBook = await get('AddressBook')

  const oTokenImplDeployResult = await deploy<DeployArgs<Otoken__factory>>('Otoken', {
    from: signer.address,
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, signer)) as AddressBook
  await addressBook.setOtokenImpl(oTokenImplDeployResult.address)
}

deploy.tags = ['Otoken']
deploy.dependencies = ['AddressBook']
export default deploy
