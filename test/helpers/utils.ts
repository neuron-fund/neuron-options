import { MockERC20 as MockERC20Instance } from '../../typechain-types'

import { VaultStruct } from '../../typechain-types/CalculatorTester'

//import util from '@0x/protocol-utils'
import { BigNumber } from 'ethers'
//import ethSigUtil from 'eth-sig-util'

/*export type vault = {
  shortAmounts: (BigNumber | string | number)[]
  longAmounts: (BigNumber | string | number)[]
  collateralAmounts: (BigNumber | string | number)[]
  shortONtokens: string[]
  longONtokens: string[]
  collateralAssets: string[]
}*/

const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

/**
 * Return a valid expiry timestamp that's today + # days, 0800 UTC.
 * @param now
 * @param days
 */
export const createValidExpiry = (now: number, days: number) => {
  const multiplier = (now - 28800) / 86400
  return (Number(multiplier.toFixed(0)) + 1) * 86400 + days * 86400 + 28800
}

export const resp2bn = (resp: any) => {
  return BigNumber.from(resp.toString())
}

/**
 * Create a vault for testing
 * @param shortONtoken
 * @param longONtoken
 * @param collateralAsset
 * @param shortAmount
 * @param longAmount
 * @param collateralAmount
 */

export const createVault = (
  shortONtoken: string | undefined,
  longONtoken: string | undefined,
  collateralAssets: Array<string>,
  shortAmount: string | BigNumber | number | undefined,
  longAmount: string | BigNumber | number | undefined,
  collateralAmounts: Array<string | BigNumber | number | undefined>
): VaultStruct => {
  return {
    shortONtoken: shortONtoken !== undefined ? shortONtoken : ZERO_ADDR,
    longONtoken: longONtoken !== undefined ? longONtoken : ZERO_ADDR,
    collateralAssets: collateralAssets ? collateralAssets : [],
    shortAmount: shortAmount !== undefined ? shortAmount : '0',
    longAmount: longAmount !== undefined ? longAmount : '0',
    usedLongAmount: 0,
    collateralAmounts: collateralAmounts ? collateralAmounts : [],
    reservedCollateralAmounts: [],
    usedCollateralValues: [],
    availableCollateralAmounts: [],
  }
}

export const createTokenAmount = (_num: number, _decimals = 8) => {
  let num = _num
  let decimals = _decimals

  while (decimals > 0) {
    if (num % 1 === 0) break
    decimals--
    num *= 10
  }

  const amount = BigNumber.from(num).mul(BigNumber.from(10).pow(decimals))
  return amount.toString()
}

/**
 * Create a number string that scales numbers to 1e18
 * @param num
 */
export const createScaledNumber = (num: number, decimals = 8): string => {
  return BigNumber.from(num).mul(BigNumber.from(10).pow(decimals)).toString()
}

/**
 * Create a number string that scales numbers to 1e18
 * @param num
 */
export const createScaledBigNumber = (num: number, decimals = 8): BigNumber => {
  return BigNumber.from(num).mul(BigNumber.from(10).pow(decimals))
}

export const underlyingPriceToCtokenPrice = async (
  underlyingPrice: BigNumber,
  exchangeRate: BigNumber,
  underlying: MockERC20Instance
) => {
  const decimals = (await underlying.decimals()).toString()
  const underlyingDecimals = BigNumber.from(decimals)
  const cTokenDecimals = BigNumber.from(8)

  /*
  const mul0 = exchangeRate.mul(underlyingPrice)
  const exp0 = BigNumber.from(10).pow(cTokenDecimals)
  const exp1 = BigNumber.from(10).pow(underlyingDecimals.add(BigNumber.from(18)))
  const res =  mul0.mul(exp0).div(exp1)
  return res
  console.log('underlyingPrice', underlyingPrice.toString())  
  console.log('underlyingDecimals', underlyingDecimals.toString())
  console.log('exchangeRate', exchangeRate.toString())
  */

  return exchangeRate
    .mul(underlyingPrice)
    .mul(BigNumber.from(10).pow(cTokenDecimals))
    .div(BigNumber.from(10).pow(underlyingDecimals.add(BigNumber.from(18))))
  //.integerValue(BigNumber.ROUND_DOWN)
}

export const underlyingPriceToYTokenPrice = async (
  underlyingPrice: BigNumber,
  pricePerShare: BigNumber,
  underlying: MockERC20Instance
) => {
  const underlyingDecimals = BigNumber.from((await underlying.decimals()).toString())

  return pricePerShare.mul(underlyingPrice).div(BigNumber.from('10').pow(underlyingDecimals))
  //.integerValue(BigNumber.ROUND_DOWN)
}

/**
 * @param {number} num number to scale
 * @param {number} fromDecimal the decimals the original number has
 * @param {number} toDecimal the decimals the target number has
 * @return {BigNumber}
 */
export const changeAmountScaled = (num: number | string, fromDecimal: number, toDecimal: number) => {
  const numBN = BigNumber.from(num)
  if (toDecimal === fromDecimal) {
    return numBN
  } else if (toDecimal >= fromDecimal) {
    return numBN.mul(BigNumber.from(10).pow(toDecimal - fromDecimal))
  } else {
    //return numBN.div(BigNumber.from(10).pow(fromDecimal - toDecimal)).integerValue()
    return numBN.div(BigNumber.from(10).pow(fromDecimal - toDecimal))
  }
}

/*
export const createOrder = (
  maker: string,
  makerToken: string,
  takerToken: string,
  makerAmount: BigNumber,
  takerAmount: BigNumber,
  chainId: number,
) => {
  const expiry = (Date.now() / 1000 + 240).toFixed(0)
  const salt = (Math.random() * 1000000000000000000).toFixed(0)
  const order = new util.LimitOrder({
    makerToken: makerToken,
    takerToken: takerToken,
    makerAmount: makerAmount.toString(),
    takerAmount: takerAmount.toString(),
    takerTokenFeeAmount: '0',
    maker: maker,
    taker: '0x0000000000000000000000000000000000000000',
    sender: '0x0000000000000000000000000000000000000000',
    feeRecipient: '0x1000000000000000000000000000000000000011',
    pool: '0x0000000000000000000000000000000000000000000000000000000000000000',
    expiry: expiry.toString(),
    salt: salt,
    chainId: chainId,
  })
  return order
}


export const signOrder = async (signer: any, order: any, key: any) => {
  const signature = await order.getSignatureWithKey(key, util.SignatureType.EIP712)
  // eslint-disable-next-line no-param-reassign
  order.signature = signature
  return order
}
*/

export const expectedLiqudidationPrice = (
  collateral: number | string,
  debt: number,
  cashValue: number,
  spotPrice: number,
  oracleDeviation: number,
  auctionStartingTime: number,
  currentBlockTime: number,
  isPut: boolean,
  collateralDecimals: number
) => {
  const endingPrice = BigNumber.from(collateral).div(debt)
  const auctionElapsedTime = currentBlockTime - auctionStartingTime

  if (auctionElapsedTime > 3600) {
    // return Math.floor(endingPrice)
    return endingPrice.mul(10 ** collateralDecimals).toNumber()
  }

  let startingPrice

  if (isPut) {
    startingPrice = BigNumber.from(cashValue).sub(BigNumber.from(spotPrice).mul(oracleDeviation))
    if (startingPrice < BigNumber.from(0)) startingPrice = BigNumber.from(0)
  } else {
    startingPrice = BigNumber.from(cashValue).sub(BigNumber.from(spotPrice).mul(oracleDeviation)).div(spotPrice)
    if (startingPrice < BigNumber.from(0)) startingPrice = BigNumber.from(0)
  }

  const price = startingPrice
    .add(endingPrice.sub(startingPrice).mul(auctionElapsedTime).div(3600))
    .mul(10 ** collateralDecimals)

  if (price.isGreaterThan(endingPrice.mul(10 ** collateralDecimals)))
    return endingPrice.mul(10 ** collateralDecimals).toNumber()

  return price.toNumber()
}

export const calcRelativeDiff = (expected: BigNumber, actual: BigNumber): BigNumber => {
  return actual.sub(expected).abs()
}
