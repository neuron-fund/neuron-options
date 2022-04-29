import { ONTokenPrices } from '../onToken'
import { ONTokenParams } from './types'

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

export function getPutSpreadMarginRequired(
  shortAmount: number,
  shortStrike: number,
  longAmount?: number,
  longStrike?: number
) {
  const longAmountUsed = longAmount && longStrike ? Math.min(shortAmount, longAmount) : 0

  return {
    marginRequired: Math.max(shortAmount * shortStrike - (longStrike || 0) * (longAmountUsed || 0), 0),
    longAmountUsed,
  }
}

export function getCallSpreadMarginRequired(
  shortAmount: number,
  shortStrike: number,
  longAmount?: number,
  longStrike?: number
) {
  // max (short amount - long amount , 0)
  if (!longStrike || !longAmount) {
    return {
      marginRequired: shortAmount,
      longAmountUsed: 0,
    }
  }

  /**
   *             (long strike - short strike) * short amount
   * calculate  ----------------------------------------------
   *                             long strike
   */
  const firstPart = ((longStrike - shortStrike) * shortAmount) / longStrike

  /**
   * calculate max ( short amount - long amount , 0)
   */
  const secondPart = Math.max(shortAmount - longAmount, 0)

  const longAmountUsed = longStrike === 0 ? 0 : Math.min(shortAmount, longAmount)

  return {
    marginRequired: Math.max(firstPart, secondPart),
    longAmountUsed,
  }
}
