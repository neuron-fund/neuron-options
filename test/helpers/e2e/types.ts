import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { FixedSizeArray } from '../../../utils/types'
import { ONTokenPrices } from '../onToken'

export type ONTokenParams = {
  collateralAssets: readonly string[]
  collateralConstraints: readonly number[]
  underlyingAsset: string
  strikeAsset: string
  strikePriceFormatted: number
  expiryDays: number
  isPut: boolean
}

export type VaultCheckpointsMint<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>> = {
  [key in keyof C]: { onTokenAmountFormatted: number }
}

export type ONtokenCollateralsAmounts<T extends ONTokenParams> = FixedSizeArray<T['collateralAssets']['length'], number>

export type TestMintRedeemSettleParamsVault<
  T extends ONTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
> = {
  collateralAmountsFormatted: ONtokenCollateralsAmounts<T>
  longToDeposit?: ONTokenParams
  longToDepositAmountFormatted?: number
  burnAmountFormatted?: number
} & (
  | { onTokenAmountFormatted: number; mintOnCheckoints?: VaultCheckpointsMint<T, C> }
  | { onTokenAmountFormatted?: number; mintOnCheckoints: VaultCheckpointsMint<T, C> }
)

export type TestMintRedeemSettleParamsVaultOwned<
  T extends ONTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
> = TestMintRedeemSettleParamsVault<T, C> & {
  owner: SignerWithAddress
}

export type TestMintRedeemSettleParamsCheckpoints<T extends ONTokenParams> = {
  [key: number]: {
    prices: ONTokenPrices<T>
  }
}

export type LongOwner = {
  onTokenParams: ONTokenParams
  onTokenAmountFormatted: number
  collateralAmountsFormatted: ONtokenCollateralsAmounts<ONTokenParams>
}

export type LongOwnerWithSigner = (LongOwner & { owner: SignerWithAddress })[]
export type TestMintRedeemSettleParams<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>> = {
  onTokenParams: T
  vaults: readonly TestMintRedeemSettleParamsVault<T, C>[]
  longsOwners?: readonly LongOwner[]
  initialPrices: ONTokenPrices<T>
  expiryPrices: ONTokenPrices<T>
  checkpointsDays?: C
  mockERC20Owners?: { [key: string]: SignerWithAddress }
}
