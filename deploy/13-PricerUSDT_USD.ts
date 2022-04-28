import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { DeployFunction } from 'hardhat-deploy/types'
import { DeployArgs } from '../types'
import { ChainLinkPricer__factory, Oracle } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'
import { CHAINLINK_FEED, USDT } from '../constants/externalAddresses'
import { ethers } from 'hardhat'

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre
  const { deploy, get } = deployments
  const { deployer, pricerBot } = await namedAccountsSigners(getNamedAccounts)

  const Oracle = await get('Oracle')
  const oracle = (await ethers.getContractAt('Oracle', Oracle.address, deployer)) as Oracle

  const asset = USDT
  const feed = CHAINLINK_FEED.USDT_USD

  const pricerDeployResult = await deploy<DeployArgs<ChainLinkPricer__factory>>('ChainLinkPricer', {
    from: deployer.address,
    args: [pricerBot.address, asset, feed, Oracle.address],
  })

  const lockingPeriod = 0
  const disputePeriod = 60 * 20
  // await oracle.setAssetPricer(asset, pricerDeployResult.address)
  await oracle.setLockingPeriod(pricerDeployResult.address, lockingPeriod)
  await oracle.setDisputePeriod(pricerDeployResult.address, disputePeriod)
}

deploy.tags = ['PricerUSDT_USD']
deploy.dependencies = ['Oracle']
export default deploy
