import { deployments, ethers } from 'hardhat'
import { DAI } from '../../constants/externalAddresses'
import {
  AddressBook,
  Controller,
  MarginCalculator,
  MarginPool,
  Oracle,
  Otoken,
  OtokenFactory,
  Whitelist,
} from '../../typechain-types'

export const testDeploy = deployments.createFixture(async ({ deployments }) => {
  const { get } = deployments

  await deployments.fixture(['Controller', 'PricerUSDC_USD', 'PricerETH_USD', 'PricerDAI_USD', 'PricerUSDT_USD'], {
    // Without optout this flag hardhat-deploy reverts only the deployment contracts but preserves other state, which is not suitable for tests
    fallbackToGlobal: false,
  })

  const AddressBook = await get('AddressBook')
  const Controller = await get('Controller')
  const Oracle = await get('Oracle')
  const Whitelist = await get('Whitelist')
  const OtokenFactory = await get('OtokenFactory')
  const Otoken = await get('Otoken')
  const MarginCalculator = await get('MarginCalculator')
  const MarginPool = await get('MarginPool')

  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address)) as AddressBook
  const controller = (await ethers.getContractAt('Controller', Controller.address)) as Controller
  const oracle = (await ethers.getContractAt('Oracle', Oracle.address)) as Oracle
  const whitelist = (await ethers.getContractAt('Whitelist', Whitelist.address)) as Whitelist
  const oTokenFactory = (await ethers.getContractAt('OtokenFactory', OtokenFactory.address)) as OtokenFactory
  const oTokenImplementation = (await ethers.getContractAt('Otoken', Otoken.address)) as Otoken
  const marginCalculator = (await ethers.getContractAt('MarginCalculator', MarginCalculator.address)) as MarginCalculator // prettier-ignore
  const marginPool = (await ethers.getContractAt('MarginPool', MarginPool.address)) as MarginPool

  return {
    addressBook,
    controller,
    marginPool,
    oracle,
    whitelist,
    oTokenFactory,
    marginCalculator,
    oTokenImplementation,
  }
})

export type TestDeployResult = Awaited<ReturnType<typeof testDeploy>>
