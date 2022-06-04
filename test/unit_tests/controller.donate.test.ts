import { expect, getNamedAccounts } from 'hardhat'
import { AddressZero } from '@ethersproject/constants'
import { testDeploy } from '../helpers/fixtures'
import { namedAccountsSigners } from '../../utils/hardhat'
import { BigNumber } from '@ethersproject/bignumber'
import { getFunds } from '../helpers/e2e/getFunds'
import { DAI, USDC, USDT, WETH } from '../../constants/externalAddresses'
import { findONToken, whitelistAndCreateONtoken } from '../helpers/onToken'
import { createValidExpiry } from '../../utils/time'
import { IERC20__factory } from '../../typechain-types'

describe('Controller "donate" function test', () => {
  let deployResult: Awaited<ReturnType<typeof testDeploy>>

  before(async () => {
    deployResult = await testDeploy()
  })

  afterEach(async () => {
    deployResult = await testDeploy()
  })

  it('Fails if asset address is zero', async () => {
    const { controller } = deployResult
    const { user } = await namedAccountsSigners(getNamedAccounts)
    await expect(controller.connect(user).donate(AddressZero, BigNumber.from(1), AddressZero)).revertedWith('C30')
  })

  it('Fails if not whitelisted onToken address provided', async () => {
    const { controller } = deployResult
    const { user } = await namedAccountsSigners(getNamedAccounts)
    const amount = BigNumber.from('10000000')
    const asset = USDC
    await getFunds(asset, amount, user.address)
    await expect(controller.connect(user).donate(asset, amount, AddressZero)).revertedWith('C19')
  })

  it('Fails if asset is not collateral of onToken', async () => {
    const { controller, whitelist, onTokenFactory } = deployResult
    const { user, deployer } = await namedAccountsSigners(getNamedAccounts)
    const amount = BigNumber.from('10000000')
    const asset = DAI
    await getFunds(asset, amount, user.address)
    const onTokenParams = {
      collateralAssets: [USDC, USDT],
      collateralConstraints: [0, 0],
      expiry: createValidExpiry(7),
      isPut: true,
      strikeAsset: USDC,
      strikePriceFormatted: 3200,
      underlyingAsset: WETH,
    }
    await whitelistAndCreateONtoken(
      {
        whitelist,
        onTokenFactory,
        protocolOwner: deployer,
        onTokenCreator: deployer,
      },
      onTokenParams
    )
    const onToken = await findONToken(user, onTokenFactory, onTokenParams)
    await expect(controller.connect(user).donate(asset, amount, onToken.address)).revertedWith('C31')
  })

  it('Fails if provided zero amount', async () => {
    const { controller, whitelist, onTokenFactory } = deployResult
    const { user, deployer } = await namedAccountsSigners(getNamedAccounts)
    const amount = BigNumber.from('10000000')
    const asset = USDC
    const onTokenParams = {
      collateralAssets: [USDC, USDT],
      collateralConstraints: [0, 0],
      expiry: createValidExpiry(7),
      isPut: true,
      strikeAsset: USDC,
      strikePriceFormatted: 3200,
      underlyingAsset: WETH,
    }
    await whitelistAndCreateONtoken(
      {
        whitelist,
        onTokenFactory,
        protocolOwner: deployer,
        onTokenCreator: deployer,
      },
      onTokenParams
    )
    const onToken = await findONToken(user, onTokenFactory, onTokenParams)
    await expect(controller.connect(user).donate(asset, BigNumber.from(0), onToken.address)).revertedWith(
      'MarginPool: transferToPool amount is equal to 0'
    )
  })

  it('Works if everyting provided right', async () => {
    const { controller, whitelist, onTokenFactory, marginPool } = deployResult
    const { user, deployer } = await namedAccountsSigners(getNamedAccounts)
    const amount = BigNumber.from('10000000')
    const asset = USDC
    await getFunds(asset, amount, user.address)
    const onTokenParams = {
      collateralAssets: [USDC, USDT],
      collateralConstraints: [0, 0],
      expiry: createValidExpiry(7),
      isPut: true,
      strikeAsset: USDC,
      strikePriceFormatted: 3200,
      underlyingAsset: WETH,
    }
    await whitelistAndCreateONtoken(
      {
        whitelist,
        onTokenFactory,
        protocolOwner: deployer,
        onTokenCreator: deployer,
      },
      onTokenParams
    )
    const onToken = await findONToken(user, onTokenFactory, onTokenParams)
    await IERC20__factory.connect(asset, user).approve(marginPool.address, amount)
    await expect(controller.connect(user).donate(asset, amount, onToken.address)).to.not.reverted
  })
})
