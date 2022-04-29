import { parseUnits } from '@ethersproject/units'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { ethers } from 'hardhat'
import { Whitelist, ONtokenFactory, ONtoken } from '../../typechain-types'
import { chainlinkUsdPriceFeedDecimals } from './oracle'

export const onTokenDecimals = 8
export type CreateONtokenParams = Parameters<ONtokenFactory['createONtoken']>

export type CreateONtokenParamsObject = {
  underlyingAsset: CreateONtokenParams[0]
  strikeAsset: CreateONtokenParams[1]
  collateralAssets: Readonly<CreateONtokenParams[2]>
  collateralConstraints: Readonly<CreateONtokenParams[3]>
  strikePriceFormatted: number
  expiry: CreateONtokenParams[5]
  isPut: CreateONtokenParams[6]
}

export type CreateONtokenAssetsParams = Pick<
  CreateONtokenParamsObject,
  'collateralAssets' | 'strikeAsset' | 'underlyingAsset'
>

export type ONTokenPrices<T extends CreateONtokenAssetsParams = CreateONtokenAssetsParams> = {
  [key in T['collateralAssets'][number] | T['strikeAsset'] | T['underlyingAsset']]: number
}

export const whitelistAndCreateONtoken = async (
  {
    whitelist,
    onTokenFactory,
    protocolOwner,
    onTokenCreator,
  }: {
    onTokenFactory: ONtokenFactory
    whitelist: Whitelist
    protocolOwner: SignerWithAddress
    onTokenCreator: SignerWithAddress
  },
  params: CreateONtokenParamsObject
) => {
  const { underlyingAsset, strikeAsset, collateralAssets, collateralConstraints, strikePriceFormatted, expiry, isPut } =
    params

  const strikePrice = parseUnits(strikePriceFormatted.toString(), chainlinkUsdPriceFeedDecimals)
  const collateralAssetsMutable = [...collateralAssets]
  const collateralConstraintsMutable = [...collateralConstraints]

  const onTokenParams = [
    underlyingAsset,
    strikeAsset,
    collateralAssetsMutable,
    collateralConstraintsMutable,
    strikePrice,
    expiry,
    isPut,
  ] as const

  await whitelist.connect(protocolOwner).whitelistCollaterals(collateralAssetsMutable)
  await whitelist.connect(protocolOwner).whitelistProduct(underlyingAsset, strikeAsset, collateralAssetsMutable, isPut)

  return onTokenFactory.connect(onTokenCreator).createONtoken(...onTokenParams)
}

export const findONToken = async (
  signer: SignerWithAddress,
  onTokenFactory: ONtokenFactory,
  params: CreateONtokenParamsObject
) => {
  const { underlyingAsset, strikeAsset, collateralAssets, collateralConstraints, strikePriceFormatted, expiry, isPut } =
    params
  const strikePrice = parseUnits(strikePriceFormatted.toString(), chainlinkUsdPriceFeedDecimals)
  const collateralAssetsMutable = [...collateralAssets]
  const collateralConstraintsMutable = [...collateralConstraints]
  const onTokenParams = [
    underlyingAsset,
    strikeAsset,
    collateralAssetsMutable,
    collateralConstraintsMutable,
    strikePrice,
    expiry,
    isPut,
  ] as const
  const onTokenAddress = await onTokenFactory.connect(signer).getONtoken(...onTokenParams)
  const onToken = (await ethers.getContractAt('ONtoken', onTokenAddress)) as ONtoken
  return onToken
}
