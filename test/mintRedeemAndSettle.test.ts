import { parseUnits } from '@ethersproject/units'
import { assert } from 'chai'
import { getNamedAccounts, network, ethers } from 'hardhat'
import { USDC, DAI, WETH } from '../constants/externalAddresses'
import { ActionArgsStruct } from '../typechain-types/Controller'
import { AddressZero } from '../utils/ethers'
import { namedAccountsSigners } from '../utils/hardhat'
import { createValidExpiry, waitNDays } from '../utils/time'
import { Await, FixedSizeArray } from '../utils/types'
import { ActionType, getAction } from './helpers/actions'
import {
  addTokenDecimalsToAmount,
  approveERC20,
  getERC20BalanceOf,
  getEthOrERC20BalanceFormatted,
} from './helpers/erc20'
import { deploy } from './helpers/fixtures'
import { getAssetFromWhale } from './helpers/funds'
import { setStablePrices } from './helpers/oracle'
import { findOToken, oTokenDecimals, OTokenPrices, whitelistAndCreateOtoken } from './helpers/otoken'

describe('Redeems tests using stablePrice in Oracle', function () {
  let deployResult: Await<ReturnType<typeof deploy>>

  before(async () => {
    deployResult = await deploy()
  })

  afterEach(async () => {
    deployResult = await deploy()
  })

  it(`ITM redeem, collaterals prices didn't change`, async () => {
    const { user, deployer, redeemer } = await namedAccountsSigners(getNamedAccounts)
    const { controller, whitelist, oTokenFactory, marginPool, oracle } = deployResult
    const expiryDays = 7
    const oTokenParams = {
      collateralAssets: [USDC, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceReadable: 3800,
      expiry: createValidExpiry(expiryDays),
      isPut: true,
    } as const

    const initalAssetPricesReadable: OTokenPrices<typeof oTokenParams> = {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    }

    const expiryAssetPricesReadable: OTokenPrices<typeof oTokenParams> = {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 3500,
    }
    const usdRedeemFor1Otoken = Math.max(
      oTokenParams.strikePriceReadable - expiryAssetPricesReadable[oTokenParams.underlyingAsset],
      0
    )

    const collateralAmountsReadable: FixedSizeArray<typeof oTokenParams['collateralAssets']['length'], number> = [
      oTokenParams.strikePriceReadable,
      oTokenParams.strikePriceReadable,
    ]

    await setStablePrices(oracle, deployer, initalAssetPricesReadable)

    await whitelistAndCreateOtoken(
      {
        whitelist,
        oTokenFactory,
        protocolOwner: deployer,
        oTokenCreator: user,
      },
      oTokenParams
    )

    const oToken = await findOToken(user, oTokenFactory, oTokenParams)

    assert(oToken.address !== AddressZero, 'Otoken address is zero')

    const collateralAmounts = await Promise.all(
      collateralAmountsReadable.map(async (amount, i) =>
        addTokenDecimalsToAmount(oTokenParams.collateralAssets[i], amount, user)
      )
    )

    const amountOfOTokensToMintReadable = 1
    const amountOfOTokensToMint = parseUnits(amountOfOTokensToMintReadable.toString(), oTokenDecimals)

    // Transfer collateral tokens from whales to user
    await Promise.all(
      collateralAmounts.map((amount, i) => getAssetFromWhale(oTokenParams.collateralAssets[i], amount, user.address))
    )
    // Approve collateral tokens for spending by controller
    await Promise.all(
      collateralAmounts.map((amount, i) =>
        approveERC20(oTokenParams.collateralAssets[i], amount, user, marginPool.address)
      )
    )

    await getEthOrERC20BalanceFormatted(user, USDC)
    await getEthOrERC20BalanceFormatted(user, DAI)

    const vaultId = 1
    const mintActions: ActionArgsStruct[] = [
      getAction(ActionType.OpenVault, {
        owner: user.address,
        shortOtoken: oToken.address,
        vaultId,
      }),
      getAction(ActionType.DepositCollateral, {
        owner: user.address,
        amounts: collateralAmounts,
        assets: [...oTokenParams.collateralAssets],
        vaultId,
        from: user.address,
      }),
      getAction(ActionType.MintShortOption, {
        owner: user.address,
        amount: [amountOfOTokensToMint],
        vaultId,
        otoken: [oToken.address],
        to: user.address,
      }),
    ]

    await controller.connect(user).operate(mintActions)

    const mintedOTokenBalance = await oToken.balanceOf(user.address)
    assert(mintedOTokenBalance.eq(amountOfOTokensToMint))

    await oToken.connect(user).transfer(redeemer.address, amountOfOTokensToMint)

    assert((await oToken.balanceOf(redeemer.address)).eq(amountOfOTokensToMint))

    await waitNDays(expiryDays + 1, network.provider)
    await setStablePrices(oracle, deployer, expiryAssetPricesReadable)

    await oToken.connect(redeemer).approve(controller.address, amountOfOTokensToMint)

    const redeemActions: ActionArgsStruct[] = [
      getAction(ActionType.Redeem, {
        amount: [amountOfOTokensToMint],
        otoken: [oToken.address],
        receiver: redeemer.address,
      }),
    ]

    await controller.connect(redeemer).operate(redeemActions)

    const usdcRedeemerBalance = await getEthOrERC20BalanceFormatted(redeemer, USDC)
    const daiRedeemerBalance = await getEthOrERC20BalanceFormatted(redeemer, DAI)

    assert(usdcRedeemerBalance + daiRedeemerBalance === usdRedeemFor1Otoken * amountOfOTokensToMintReadable)

    const settleVaultActions: ActionArgsStruct[] = [
      getAction(ActionType.SettleVault, {
        owner: user.address,
        vaultId: vaultId,
        to: user.address,
      }),
    ]

    await controller.connect(user).operate(settleVaultActions)

    const usdcRedeemerBalanceBn = await getERC20BalanceOf(redeemer, USDC)
    const daiRedeemerBalanceBn = await getERC20BalanceOf(redeemer, DAI)

    const usdcUserBalance = await getERC20BalanceOf(user, USDC)
    const daiUserBalance = await getERC20BalanceOf(user, DAI)

    assert(usdcUserBalance.add(usdcRedeemerBalanceBn).eq(collateralAmounts[0]))
    assert(daiUserBalance.add(daiRedeemerBalanceBn).eq(collateralAmounts[1]))
  })

  it('OTM settle vault', async () => {
    const blockNumber = await ethers.provider.getBlockNumber()
    const { user } = await namedAccountsSigners(getNamedAccounts)
    await getEthOrERC20BalanceFormatted(user, USDC)
    await getEthOrERC20BalanceFormatted(user, DAI)
  })
})
