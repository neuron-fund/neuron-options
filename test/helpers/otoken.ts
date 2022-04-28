import { parseUnits } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { Whitelist, OtokenFactory, Otoken } from '../../typechain-types'
import { chainlinkUsdPriceFeedDecimals } from './oracle'

export const oTokenDecimals = 8
export type CreateOtokenParams = Parameters<OtokenFactory['createOtoken']>

export type CreateOtokenParamsObject = {
  underlyingAsset: CreateOtokenParams[0]
  strikeAsset: CreateOtokenParams[1]
  collateralAssets: Readonly<CreateOtokenParams[2]>
  collateralConstraints: Readonly<CreateOtokenParams[3]>
  strikePriceFormatted: number
  expiry: CreateOtokenParams[5]
  isPut: CreateOtokenParams[6]
}

export type CreateOtokenAssetsParams = Pick<
  CreateOtokenParamsObject,
  'collateralAssets' | 'strikeAsset' | 'underlyingAsset'
>

export type OTokenPrices<T extends CreateOtokenAssetsParams = CreateOtokenAssetsParams> = {
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
    protocolOwner: SignerWithAddress
    oTokenCreator: SignerWithAddress
  },
  params: CreateOtokenParamsObject
) => {
  const { underlyingAsset, strikeAsset, collateralAssets, collateralConstraints, strikePriceFormatted, expiry, isPut } = params

  const strikePrice = parseUnits(strikePriceFormatted.toString(), chainlinkUsdPriceFeedDecimals)
  const collateralAssetsMutable = [...collateralAssets]
  const collateralConstraintsMutable = [...collateralConstraints]

  const oTokenParams = [underlyingAsset, strikeAsset, collateralAssetsMutable, collateralConstraintsMutable, strikePrice, expiry, isPut] as const

  await whitelist.connect(protocolOwner).whitelistCollaterals(collateralAssetsMutable)
  await whitelist.connect(protocolOwner).whitelistProduct(underlyingAsset, strikeAsset, collateralAssetsMutable, isPut)

  return oTokenFactory.connect(oTokenCreator).createOtoken(...oTokenParams)
}

export const findOToken = async (
  signer: SignerWithAddress,
  oTokenFactory: OtokenFactory,
  params: CreateOtokenParamsObject
) => {
  const { underlyingAsset, strikeAsset, collateralAssets, collateralConstraints, strikePriceFormatted, expiry, isPut } = params
  const strikePrice = parseUnits(strikePriceFormatted.toString(), chainlinkUsdPriceFeedDecimals)
  const collateralAssetsMutable = [...collateralAssets]
  const collateralConstraintsMutable = [...collateralConstraints]
  const oTokenParams = [underlyingAsset, strikeAsset, collateralAssetsMutable, collateralConstraintsMutable, strikePrice, expiry, isPut] as const
  const oTokenAddress = await oTokenFactory.connect(signer).getOtoken(...oTokenParams)
  const oToken = (await ethers.getContractAt('Otoken', oTokenAddress)) as Otoken
  return oToken
}
