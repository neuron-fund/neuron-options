import { BigNumber } from '@ethersproject/bignumber'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { parseUnits } from 'ethers/lib/utils'
import { Controller, ONtoken } from '../../../typechain-types'
import { ActionArgsStruct } from '../../../typechain-types/Controller'
import { getAction, ActionType } from '../actions'
import { onTokenDecimals } from '../onToken'
import { ONTokenParams, TestMintRedeemSettleParamsCheckpoints, TestMintRedeemSettleParamsVaultOwned } from './types'

export async function burnVault<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  controller: Controller,
  onToken: ONtoken,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>
) {
  const burnAction: ActionArgsStruct[] = [
    getAction(ActionType.BurnShortOption, {
      amount: [parseUnits(vault.burnAmountFormatted.toString(), onTokenDecimals)],
      owner: vault.owner.address,
      vaultId: 1,
    }),
  ]

  await controller.connect(vault.owner).operate(burnAction)
}

export async function settleVault<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  controller: Controller,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>
) {
  const { owner } = vault
  const vaultId = 1
  const settleVaultActions: ActionArgsStruct[] = [
    getAction(ActionType.SettleVault, {
      owner: owner.address,
      vaultId: vaultId,
      to: owner.address,
    }),
  ]

  await controller.connect(owner).operate(settleVaultActions)
}

export async function redeem(onToken: ONtoken, controller: Controller, redeemer: SignerWithAddress, amount: BigNumber) {
  await onToken.connect(redeemer).approve(controller.address, amount)

  const redeemActions: ActionArgsStruct[] = [
    getAction(ActionType.Redeem, {
      amount: [amount],
      onToken: [onToken.address],
      receiver: redeemer.address,
    }),
  ]
  await controller.connect(redeemer).operate(redeemActions)
}
