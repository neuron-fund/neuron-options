import { deployments, ethers } from 'hardhat'
import { DAI } from '../../constants/externalAddresses'
import {
  AddressBook,
  Controller,
  MarginCalculator,
  MarginPool,
  Oracle,
  ONtoken,
  ONtokenFactory,
  Whitelist,
} from '../../typechain-types'

export const testDeploy = deployments.createFixture(async ({ deployments }) => {
  const { get } = deployments

  await deployments.fixture(['Controller'], {
    // Without optout this flag hardhat-deploy reverts only the deployment contracts but preserves other state, which is not suitable for tests
    fallbackToGlobal: false,
  })

  const AddressBook = await get('AddressBook')
  const Controller = await get('Controller')
  const Oracle = await get('Oracle')
  const Whitelist = await get('Whitelist')
  const ONtokenFactory = await get('ONtokenFactory')
  const ONtoken = await get('ONtoken')
  const MarginCalculator = await get('MarginCalculator')
  const MarginPool = await get('MarginPool')

  const addressBook = (await ethers.getContractAt('AddressBook', AddressBook.address)) as AddressBook
  const controller = (await ethers.getContractAt('Controller', Controller.address)) as Controller
  const oracle = (await ethers.getContractAt('Oracle', Oracle.address)) as Oracle
  const whitelist = (await ethers.getContractAt('Whitelist', Whitelist.address)) as Whitelist
  const onTokenFactory = (await ethers.getContractAt('ONtokenFactory', ONtokenFactory.address)) as ONtokenFactory
  const onTokenImplementation = (await ethers.getContractAt('ONtoken', ONtoken.address)) as ONtoken
  const marginCalculator = (await ethers.getContractAt('MarginCalculator', MarginCalculator.address)) as MarginCalculator // prettier-ignore
  const marginPool = (await ethers.getContractAt('MarginPool', MarginPool.address)) as MarginPool

  return {
    addressBook,
    controller,
    marginPool,
    oracle,
    whitelist,
    onTokenFactory,
    marginCalculator,
    onTokenImplementation,
  }
})

export type TestDeployResult = Awaited<ReturnType<typeof testDeploy>>
