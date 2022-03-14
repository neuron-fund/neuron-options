import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert } from 'chai'
import { BigNumber } from 'ethers'
import { createFilledArray, mapPlusArray } from '../../../utils/array'
import { prettyObjectStringify } from '../../../utils/log'
import { addTokenDecimalsToAmount } from '../erc20'
import { OTokenPrices } from '../otoken'
import {
  OtokenCollateralsAmounts,
  OTokenParams,
  TestMintRedeemSettleParams,
  TestMintRedeemSettleParamsCheckpoints,
  TestMintRedeemSettleParamsVault,
} from './types'
import { isEqual as _isEqual } from 'lodash'
import { getCallSpreadMarginRequired, getPutSpreadMarginRequired } from './margin'
import { createValidExpiry } from '../../../utils/time'
import { calculateVaultTotalMint } from './vaults'

export type CalculateOtokenInfoParams<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>> = {
  oTokenParams: T
  checkpoints: C
  initialPrices: OTokenPrices<T>
  vaults: readonly TestMintRedeemSettleParamsVault<T, C>[]
  longsOtokenInfo?: OtokenInfo[]
}

export type OtokenInfo = {
  oTokenParams: OTokenParams
  mintedAmount: number
  collateralsUsedAmounts: number[]
  collateralsUsedValues: number[]
  totalCollateralValuesUsed: number
}

export function calculateOtokenInfo<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  params: CalculateOtokenInfoParams<T, C>
): OtokenInfo {
  const { vaults, initialPrices, checkpoints, oTokenParams, longsOtokenInfo } = params
  const collateralsLength = oTokenParams.collateralAssets.length

  const vaultsMintedInfo = vaults.map(vault => {
    const longOTokenInfo =
      vault.longToDeposit && longsOtokenInfo.find(x => _isEqual(x.oTokenParams, vault.longToDeposit))
    const { collateralsUsedValues, totalOTokenMintAfterBurn, collateralsUsedAmounts } = calculateVaultTotalMint(
      params.oTokenParams,
      initialPrices,
      vault,
      checkpoints,
      longOTokenInfo
    )
    return { collateralsUsedValues, totalOTokenMintAfterBurn, collateralsUsedAmounts }
  })

  const { mintedAmount, collateralsUsedAmounts, collateralsUsedValues } = vaultsMintedInfo.reduce(
    (acc, b) => {
      acc.collateralsUsedValues = mapPlusArray(acc.collateralsUsedValues, b.collateralsUsedValues)
      acc.collateralsUsedAmounts = mapPlusArray(acc.collateralsUsedAmounts, b.collateralsUsedAmounts)
      acc.mintedAmount += b.totalOTokenMintAfterBurn
      return acc
    },
    {
      mintedAmount: 0,
      collateralsUsedAmounts: createFilledArray(collateralsLength, 0) as number[],
      collateralsUsedValues: createFilledArray(collateralsLength, 0) as number[],
    }
  )

  const totalCollateralValuesUsed = collateralsUsedValues.reduce((acc, b) => acc + b, 0)

  return {
    oTokenParams,
    mintedAmount,
    collateralsUsedAmounts,
    collateralsUsedValues,
    totalCollateralValuesUsed,
  }
}

export async function calculateRedeemForOneOtoken<
  T extends OTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
>(
  params: TestMintRedeemSettleParams<T, C>,
  oTokenParams: OTokenParams,
  vaults: readonly TestMintRedeemSettleParamsVault<T, C>[],
  signer: SignerWithAddress,
  longsInfo: OtokenInfo[]
) {
  const { expiryPrices, initialPrices, checkpointsDays } = params
  const { collateralAssets } = oTokenParams

  const zero = {
    usd: 0,
    collaterals: collateralAssets.map(() => BigNumber.from(0)),
    collateralsFormatted: collateralAssets.map(() => 0),
  }
  const usdRedeemForOneOtoken = getUsdRedeemForOneOtoken(oTokenParams, expiryPrices)
  const redeemUsd = usdRedeemForOneOtoken
  if (redeemUsd === 0) {
    return zero
  }

  const { collateralsUsedValues, totalCollateralValuesUsed } = calculateOtokenInfo({
    oTokenParams,
    checkpoints: checkpointsDays,
    initialPrices,
    vaults,
    longsOtokenInfo: longsInfo,
  })

  const redeemCollateralRatios = collateralsUsedValues.map(x => x / totalCollateralValuesUsed)
  const redeemCollateralValuesUsd = redeemCollateralRatios.map(x => x * redeemUsd)
  const redeemCollateralAmountsFormatted = redeemCollateralValuesUsd.map(
    (x, i) => x / expiryPrices[collateralAssets[i]]
  )
  const redeemCollateralAmounts = await Promise.all(
    collateralAssets.map((asset, i) => addTokenDecimalsToAmount(asset, redeemCollateralAmountsFormatted[i], signer))
  )
  return {
    usd: redeemUsd,
    collaterals: redeemCollateralAmounts,
    collateralsFormatted: redeemCollateralAmountsFormatted,
  }
}

export async function calculateRedeemForOtokenAmount<
  T extends OTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
>(
  params: TestMintRedeemSettleParams<T, C>,
  oTokenParams: OTokenParams,
  vaults: readonly TestMintRedeemSettleParamsVault<T, C>[],
  signer: SignerWithAddress,
  longsInfo: OtokenInfo[],
  amount: number
) {
  const infoForOneOtoken = await calculateRedeemForOneOtoken(params, oTokenParams, vaults, signer, longsInfo)
  return {
    usd: infoForOneOtoken.usd * amount,
    collateralsFormatted: infoForOneOtoken.collateralsFormatted.map(x => x * amount),
  }
}

export function calculateMintReservedCollaterals<T extends OTokenParams>(
  oTokenParams: T,
  mintAmount: number,
  collateralAmounts: OtokenCollateralsAmounts<T>,
  prices: OTokenPrices<T>,
  longOTokenParams?: OTokenParams,
  longAmount?: number
) {
  const { collateralAssets } = oTokenParams

  const { marginRequiredUsd, longUsedAmount } = calculateMarginRequired(
    mintAmount,
    oTokenParams,
    prices,
    longOTokenParams,
    longAmount
  )

  const collateralValues = collateralAmounts.map((x, i) => prices[collateralAssets[i]] * x)
  const totalCollateralsValue = collateralValues.reduce((a, b) => a + b, 0)

  assert(
    totalCollateralsValue >= marginRequiredUsd,
    `
      Got total collateral value ${totalCollateralsValue} is less than required ${marginRequiredUsd}
      Not enough collateral for mint ${mintAmount} oToken, with prices: ${prettyObjectStringify(prices)}
      Provided collateral amounts ${collateralAmounts}
    `
  )
  const usedCollateralsRatios = collateralValues.map(x => x / totalCollateralsValue)
  return {
    collateralsReservedAmounts: usedCollateralsRatios.map(
      (x, i) => (x * marginRequiredUsd) / prices[collateralAssets[i]]
    ),
    longUsedAmount,
  }
}

export function getStrikeRedeemForOneOtoken<T extends OTokenParams>(oTokenParams: T, prices: OTokenPrices<T>) {
  const { strikePriceFormatted, underlyingAsset, strikeAsset, isPut } = oTokenParams
  const expiryPriceInStrike = prices[underlyingAsset] / prices[strikeAsset]
  return isPut
    ? Math.max(strikePriceFormatted - expiryPriceInStrike, 0)
    : Math.max(expiryPriceInStrike - strikePriceFormatted, 0)
}

export function getUsdRedeemForOneOtoken<T extends OTokenParams>(oTokenParams: T, prices: OTokenPrices<T>) {
  const { strikeAsset } = oTokenParams
  return getStrikeRedeemForOneOtoken(oTokenParams, prices) * prices[strikeAsset]
}

export function getExpiredSpreadCashValue(
  shortAmount: number,
  longAmount: number,
  shortCashValue: number,
  longCashValue: number
) {
  const result = shortCashValue * shortAmount - longCashValue * longAmount
  return result > 0 ? result : 0
}

export function calculateMarginRequired<T extends OTokenParams>(
  mintAmount: number,
  shortOtokenParams: T,
  prices: OTokenPrices<T>,
  longOtokenParams?: OTokenParams,
  longAmount?: number
) {
  const { strikePriceFormatted: shortStrikePriceFormatted, strikeAsset, underlyingAsset, isPut } = shortOtokenParams

  let marginRequired: number
  let longUsedAmount = 0
  if (longOtokenParams && longAmount) {
    const spreadMargin = isPut
      ? getPutSpreadMarginRequired(
          mintAmount,
          shortStrikePriceFormatted,
          longAmount,
          longOtokenParams?.strikePriceFormatted
        )
      : getCallSpreadMarginRequired(
          mintAmount,
          shortStrikePriceFormatted,
          longAmount,
          longOtokenParams?.strikePriceFormatted
        )
    marginRequired = spreadMargin.marginRequired
    longUsedAmount = spreadMargin.longAmountUsed
  } else {
    marginRequired = isPut ? shortStrikePriceFormatted * mintAmount : mintAmount
  }

  const marginRequiredUsd = isPut ? marginRequired * prices[strikeAsset] : marginRequired * prices[underlyingAsset]

  return {
    marginRequired,
    marginRequiredUsd,
    longUsedAmount,
  }
}

export function addExpiryToOtokenParams<T extends OTokenParams>(oTokenParams: T) {
  return {
    ...oTokenParams,
    expiry: createValidExpiry(oTokenParams.expiryDays),
  } as const
}
