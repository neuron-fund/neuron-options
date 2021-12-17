import { Signer } from '@ethersproject/abstract-signer'
import { parseUnits } from '@ethersproject/units'
import { ethers } from 'hardhat'
import { Whitelist, OtokenFactory, ERC20Interface__factory, Otoken } from '../../typechain-types'
import { addTokenDecimalsToAmount } from './erc20'
import { chainlinkUsdPriceFeedDecimals } from './oracle'

export const oTokenDecimals = 8
export type CreateOtokenParams = Parameters<OtokenFactory['createOtoken']>

export type CreateOtokenParamsObject = {
  underlyingAsset: CreateOtokenParams[0]
  strikeAsset: CreateOtokenParams[1]
  collateralAssets: Readonly<CreateOtokenParams[2]>
  strikePriceReadable: number
  expiry: CreateOtokenParams[4]
  isPut: CreateOtokenParams[5]
}

export type OTokenPrices<T extends CreateOtokenParamsObject = CreateOtokenParamsObject> = {
  [key in T['collateralAssets'][number] | T['strikeAsset'] | T['underlyingAsset']]: number
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

  const strikePrice = parseUnits(strikePriceReadable.toString(), chainlinkUsdPriceFeedDecimals)
  const collateralAssetsMutable = [...collateralAssets]

  const oTokenParams = [underlyingAsset, strikeAsset, collateralAssetsMutable, strikePrice, expiry, isPut] as const

  await whitelist.connect(protocolOwner).whitelistCollaterals(collateralAssetsMutable)
  await whitelist.connect(protocolOwner).whitelistProduct(underlyingAsset, strikeAsset, collateralAssetsMutable, isPut)

  return oTokenFactory.connect(oTokenCreator).createOtoken(...oTokenParams)
}

export const findOToken = async (signer: Signer, oTokenFactory: OtokenFactory, params: CreateOtokenParamsObject) => {
  const { underlyingAsset, strikeAsset, collateralAssets, strikePriceReadable, expiry, isPut } = params
  const strikePrice = parseUnits(strikePriceReadable.toString(), chainlinkUsdPriceFeedDecimals)
  const collateralAssetsMutable = [...collateralAssets]
  const oTokenParams = [underlyingAsset, strikeAsset, collateralAssetsMutable, strikePrice, expiry, isPut] as const
  const oTokenAddress = await oTokenFactory.connect(signer).getOtoken(...oTokenParams)
  const oToken = (await ethers.getContractAt('Otoken', oTokenAddress)) as Otoken
  return oToken
}
