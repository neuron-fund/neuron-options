import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, MarginCalculator__factory } from '../typechain-types'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments } = hre
  const { deploy, get } = deployments
  const signer = (await ethers.getSigners())[0]

  const AddressBook = await get('AddressBook')
  const Oracle = await get('Oracle')
  const ArrayAddressUtils = await get('ArrayAddressUtils')

  const MarginCalculatorDeployResult = await deploy<DeployArgs<MarginCalculator__factory>>('MarginCalculator', {
    from: signer.address,
    args: [Oracle.address],
    libraries: {
      ArrayAddressUtils: ArrayAddressUtils.address,
    },
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, signer)) as AddressBook
  await addressBook.setMarginCalculator(MarginCalculatorDeployResult.address)
}

deploy.tags = ['MarginCalculator']
deploy.dependencies = ['AddressBook', 'Oracle', 'ArrayAddressUtils']
export default deploy
