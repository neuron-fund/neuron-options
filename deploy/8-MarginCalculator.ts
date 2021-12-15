import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { AddressBook, MarginCalculator__factory } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { ethers, deployments, getNamedAccounts } = hre
  const { deploy, get } = deployments
  const { deployer } = await namedAccountsSigners(getNamedAccounts)

  const AddressBook = await get('AddressBook')
  const Oracle = await get('Oracle')
  const ArrayAddressUtils = await get('ArrayAddressUtils')

  const MarginCalculatorDeployResult = await deploy<DeployArgs<MarginCalculator__factory>>('MarginCalculator', {
    from: deployer.address,
    args: [Oracle.address],
    libraries: {
      ArrayAddressUtils: ArrayAddressUtils.address,
    },
  })
  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address, deployer)) as AddressBook
  await addressBook.setMarginCalculator(MarginCalculatorDeployResult.address)
}

deploy.tags = ['MarginCalculator']
deploy.dependencies = ['AddressBook', 'Oracle', 'ArrayAddressUtils']
export default deploy
