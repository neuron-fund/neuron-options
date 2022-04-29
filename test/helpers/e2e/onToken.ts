import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert } from 'chai'
import { BigNumber } from 'ethers'
import { createFilledArray, mapPlusArray } from '../../../utils/array'
import { prettyObjectStringify } from '../../../utils/log'
import { addTokenDecimalsToAmount } from '../erc20'
import { ONTokenPrices } from '../onToken'
import {
  ONtokenCollateralsAmounts,
  ONTokenParams,
  TestMintRedeemSettleParams,
  TestMintRedeemSettleParamsCheckpoints,
  TestMintRedeemSettleParamsVault,
} from './types'
import { isEqual as _isEqual } from 'lodash'
import { getCallSpreadMarginRequired, getPutSpreadMarginRequired } from './margin'
import { createValidExpiry } from '../../../utils/time'
import { calculateVaultTotalMint } from './vaults'

export type CalculateONtokenInfoParams<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>> = {
  onTokenParams: T
  checkpoints: C
  initialPrices: ONTokenPrices<T>
  vaults: readonly TestMintRedeemSettleParamsVault<T, C>[]
  longsONtokenInfo?: ONtokenInfo[]
}

export type ONtokenInfo = {
  onTokenParams: ONTokenParams
  mintedAmount: number
  collateralsUsedAmounts: number[]
  collateralsUsedValues: number[]
  totalCollateralValuesUsed: number
}

export function calculateONtokenInfo<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  params: CalculateONtokenInfoParams<T, C>
): ONtokenInfo {
  const { vaults, initialPrices, checkpoints, onTokenParams, longsONtokenInfo } = params
  const collateralsLength = onTokenParams.collateralAssets.length

  const vaultsMintedInfo = vaults.map(vault => {
    const longONTokenInfo =
      vault.longToDeposit && longsONtokenInfo.find(x => _isEqual(x.onTokenParams, vault.longToDeposit))
    const { collateralsUsedValues, totalONTokenMintAfterBurn, collateralsUsedAmounts } = calculateVaultTotalMint(
      params.onTokenParams,
      initialPrices,
      vault,
      checkpoints,
      longONTokenInfo
    )
    return { collateralsUsedValues, totalONTokenMintAfterBurn, collateralsUsedAmounts }
  })

  const { mintedAmount, collateralsUsedAmounts, collateralsUsedValues } = vaultsMintedInfo.reduce(
    (acc, b) => {
      acc.collateralsUsedValues = mapPlusArray(acc.collateralsUsedValues, b.collateralsUsedValues)
      acc.collateralsUsedAmounts = mapPlusArray(acc.collateralsUsedAmounts, b.collateralsUsedAmounts)
      acc.mintedAmount += b.totalONTokenMintAfterBurn
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
    onTokenParams,
    mintedAmount,
    collateralsUsedAmounts,
    collateralsUsedValues,
    totalCollateralValuesUsed,
  }
}

export async function calculateRedeemForOneONtoken<
  T extends ONTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
>(
  params: TestMintRedeemSettleParams<T, C>,
  onTokenParams: ONTokenParams,
  vaults: readonly TestMintRedeemSettleParamsVault<T, C>[],
  signer: SignerWithAddress,
  longsInfo: ONtokenInfo[]
) {
  const { expiryPrices, initialPrices, checkpointsDays } = params
  const { collateralAssets } = onTokenParams

  const zero = {
    usd: 0,
    collaterals: collateralAssets.map(() => BigNumber.from(0)),
    collateralsFormatted: collateralAssets.map(() => 0),
  }
  const usdRedeemForOneONtoken = getUsdRedeemForOneONtoken(onTokenParams, expiryPrices)
  const redeemUsd = usdRedeemForOneONtoken
  if (redeemUsd === 0) {
    return zero
  }

  const { collateralsUsedValues, totalCollateralValuesUsed } = calculateONtokenInfo({
    onTokenParams,
    checkpoints: checkpointsDays,
    initialPrices,
    vaults,
    longsONtokenInfo: longsInfo,
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

export async function calculateRedeemForONtokenAmount<
  T extends ONTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
>(
  params: TestMintRedeemSettleParams<T, C>,
  onTokenParams: ONTokenParams,
  vaults: readonly TestMintRedeemSettleParamsVault<T, C>[],
  signer: SignerWithAddress,
  longsInfo: ONtokenInfo[],
  amount: number
) {
  const infoForOneONtoken = await calculateRedeemForOneONtoken(params, onTokenParams, vaults, signer, longsInfo)
  return {
    usd: infoForOneONtoken.usd * amount,
    collateralsFormatted: infoForOneONtoken.collateralsFormatted.map(x => x * amount),
  }
}

export function calculateMintReservedCollaterals<T extends ONTokenParams>(
  onTokenParams: T,
  mintAmount: number,
  collateralAmounts: ONtokenCollateralsAmounts<T>,
  prices: ONTokenPrices<T>,
  longONTokenParams?: ONTokenParams,
  longAmount?: number
) {
  const { collateralAssets } = onTokenParams

  const { marginRequiredUsd, longUsedAmount } = calculateMarginRequired(
    mintAmount,
    onTokenParams,
    prices,
    longONTokenParams,
    longAmount
  )

  const collateralValues = collateralAmounts.map((x, i) => prices[collateralAssets[i]] * x)
  const totalCollateralsValue = collateralValues.reduce((a, b) => a + b, 0)

  assert(
    totalCollateralsValue >= marginRequiredUsd,
    `
      Got total collateral value ${totalCollateralsValue} is less than required ${marginRequiredUsd}
      Not enough collateral for mint ${mintAmount} onToken, with prices: ${prettyObjectStringify(prices)}
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

export function getStrikeRedeemForOneONtoken<T extends ONTokenParams>(onTokenParams: T, prices: ONTokenPrices<T>) {
  const { strikePriceFormatted, underlyingAsset, strikeAsset, isPut } = onTokenParams
  const expiryPriceInStrike = prices[underlyingAsset] / prices[strikeAsset]
  return isPut
    ? Math.max(strikePriceFormatted - expiryPriceInStrike, 0)
    : Math.max(expiryPriceInStrike - strikePriceFormatted, 0)
}

export function getUsdRedeemForOneONtoken<T extends ONTokenParams>(onTokenParams: T, prices: ONTokenPrices<T>) {
  const { strikeAsset } = onTokenParams
  return getStrikeRedeemForOneONtoken(onTokenParams, prices) * prices[strikeAsset]
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

export function calculateMarginRequired<T extends ONTokenParams>(
  mintAmount: number,
  shortONtokenParams: T,
  prices: ONTokenPrices<T>,
  longONtokenParams?: ONTokenParams,
  longAmount?: number
) {
  const { strikePriceFormatted: shortStrikePriceFormatted, strikeAsset, underlyingAsset, isPut } = shortONtokenParams

  let marginRequired: number
  let longUsedAmount = 0
  if (longONtokenParams && longAmount) {
    const spreadMargin = isPut
      ? getPutSpreadMarginRequired(
          mintAmount,
          shortStrikePriceFormatted,
          longAmount,
          longONtokenParams?.strikePriceFormatted
        )
      : getCallSpreadMarginRequired(
          mintAmount,
          shortStrikePriceFormatted,
          longAmount,
          longONtokenParams?.strikePriceFormatted
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

export function addExpiryToONtokenParams<T extends ONTokenParams>(onTokenParams: T) {
  return {
    ...onTokenParams,
    expiry: createValidExpiry(onTokenParams.expiryDays),
  } as const
}
