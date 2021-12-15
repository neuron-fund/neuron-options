import { Signer } from '@ethersproject/abstract-signer'
import { parseUnits } from '@ethersproject/units'
import { Whitelist, OtokenFactory, ERC20Interface__factory } from '../../typechain-types'
import { addTokenDecimalsToAmount } from './erc20'

export type CreateOtokenParams = Parameters<OtokenFactory['createOtoken']>

export type CreateOtokenParamsObject = {
  underlyingAsset: CreateOtokenParams[0]
  strikeAsset: CreateOtokenParams[1]
  collateralAssets: CreateOtokenParams[2]
  strikePriceReadable: number
  expiry: CreateOtokenParams[4]
  isPut: CreateOtokenParams[5]
}

export const whitelistAndCreateOtoken = async (
  {
    whitelist,
    oTokenFactory,
    protocolOwner,
    oTokenCreator,
  }: {
    oTokenFactory: OtokenFactory
    whitelist: Whitelist
    protocolOwner: Signer
    oTokenCreator: Signer
  },
  params: CreateOtokenParamsObject
) => {
  const { underlyingAsset, strikeAsset, collateralAssets, strikePriceReadable, expiry, isPut } = params

  const strikePrice = await addTokenDecimalsToAmount(strikeAsset, strikePriceReadable, oTokenCreator)

  const oTokenParams = [underlyingAsset, strikeAsset, collateralAssets, strikePrice, expiry, isPut] as const

  await whitelist.connect(protocolOwner).whitelistCollaterals(collateralAssets)
  await whitelist.connect(protocolOwner).whitelistProduct(underlyingAsset, strikeAsset, collateralAssets, isPut)

  return oTokenFactory.connect(oTokenCreator).createOtoken(...oTokenParams)
}

export const findOToken = async (signer: Signer, oTokenFactory: OtokenFactory, params: CreateOtokenParamsObject) => {
  const { underlyingAsset, strikeAsset, collateralAssets, strikePriceReadable, expiry, isPut } = params
  const strikePrice = await addTokenDecimalsToAmount(strikeAsset, strikePriceReadable, signer)
  const oTokenParams = [underlyingAsset, strikeAsset, collateralAssets, strikePrice, expiry, isPut] as const
  return oTokenFactory.connect(signer).getOtoken(...oTokenParams)
}
