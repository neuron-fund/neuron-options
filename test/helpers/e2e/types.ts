import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { FixedSizeArray } from '../../../utils/types'
import { OTokenPrices } from '../otoken'

export type OTokenParams = {
  collateralAssets: readonly string[]
  collateralConstraints: readonly number[]
  underlyingAsset: string
  strikeAsset: string
  strikePriceFormatted: number
  expiryDays: number
  isPut: boolean
}

export type VaultCheckpointsMint<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>> = {
  [key in keyof C]: { oTokenAmountFormatted: number }
}

export type OtokenCollateralsAmounts<T extends OTokenParams> = FixedSizeArray<T['collateralAssets']['length'], number>

export type TestMintRedeemSettleParamsVault<
  T extends OTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
> = {
  collateralAmountsFormatted: OtokenCollateralsAmounts<T>
  longToDeposit?: OTokenParams
  longToDepositAmountFormatted?: number
  burnAmountFormatted?: number
} & (
  | { oTokenAmountFormatted: number; mintOnCheckoints?: VaultCheckpointsMint<T, C> }
  | { oTokenAmountFormatted?: number; mintOnCheckoints: VaultCheckpointsMint<T, C> }
)

export type TestMintRedeemSettleParamsVaultOwned<
  T extends OTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
> = TestMintRedeemSettleParamsVault<T, C> & {
  owner: SignerWithAddress
}

export type TestMintRedeemSettleParamsCheckpoints<T extends OTokenParams> = {
  [key: number]: {
    prices: OTokenPrices<T>
  }
}

export type LongOwner = {
  oTokenParams: OTokenParams
  oTokenAmountFormatted: number
  collateralAmountsFormatted: OtokenCollateralsAmounts<OTokenParams>
}

export type LongOwnerWithSigner = (LongOwner & { owner: SignerWithAddress })[]
export type TestMintRedeemSettleParams<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>> = {
  oTokenParams: T
  vaults: readonly TestMintRedeemSettleParamsVault<T, C>[]
  longsOwners?: readonly LongOwner[]
  initialPrices: OTokenPrices<T>
  expiryPrices: OTokenPrices<T>
  checkpointsDays?: C
  mockERC20Owners?: { [key: string]: SignerWithAddress }
}
