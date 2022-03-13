import { assert } from 'chai'
import { prettyObjectStringify } from '../../../utils/log'
import { addTokenDecimalsToAmount, approveERC20, getEthOrERC20BalanceFormatted } from '../erc20'
import { findOToken, oTokenDecimals, OTokenPrices } from '../otoken'
import { calculateMarginRequired } from './margin'
import { OtokenInfo, calculateRedeemForOtokenAmount } from './otoken'
import {
  OTokenParams,
  TestMintRedeemSettleParamsCheckpoints,
  TestMintRedeemSettleParamsVault,
  OtokenCollateralsAmounts,
  TestMintRedeemSettleParams,
  TestMintRedeemSettleParamsVaultOwned,
} from './types'
import { isEqual as _isEqual } from 'lodash'
import { EXPECTED_DEVIATIONS } from './testMintRedeemSettle'
import { mapPlusArray } from '../../../utils/array'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { parseUnits } from 'ethers/lib/utils'
import { Controller, MarginPool, Otoken, OtokenFactory } from '../../../typechain-types'
import { ActionArgsStruct } from '../../../typechain-types/Controller'
import { createValidExpiry } from '../../../utils/time'
import { getAction, ActionType } from '../actions'
import { getFunds } from './getFunds'

export function calculateVaultTotalMint<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  oTokenParams: T,
  initialPrices: OTokenPrices<T>,
  vault: TestMintRedeemSettleParamsVault<T, C>,
  checkpoints?: C,
  longOtokenInfo?: OtokenInfo
) {
  const initialMintAmount = vault.oTokenAmountFormatted || 0
  const mintOnCheckpointsAmount = Object.values(vault.mintOnCheckoints || {}).reduce(
    (result, c) => result + c.oTokenAmountFormatted,
    0
  )
  const vaultTotalMintAmount = initialMintAmount + mintOnCheckpointsAmount

  let longOTokenAmountLeftFormatted = vault.longToDepositAmountFormatted || 0
  const longOTokenParams = vault.longToDeposit
  let collateralsReservedAmounts: number[] = oTokenParams.collateralAssets.map(() => 0)
  // Initial mint calculations
  if (vault.oTokenAmountFormatted) {
    const used = calculateMintReservedCollaterals(
      oTokenParams,
      vault.oTokenAmountFormatted,
      vault.collateralAmountsFormatted,
      initialPrices,
      longOTokenParams,
      longOTokenAmountLeftFormatted
    )
    collateralsReservedAmounts = used.collateralsReservedAmounts
    longOTokenAmountLeftFormatted = longOTokenAmountLeftFormatted - used.longUsedAmount
  }

  const collateralsReservedValues = collateralsReservedAmounts.map(
    (x, i) => (x || 0) * initialPrices[oTokenParams.collateralAssets[i]]
  )
  for (const c of Object.keys(checkpoints || {})) {
    const checkpoint = Number(c)
    const vaultCheckpoint = vault.mintOnCheckoints?.[checkpoint]
    if (!vaultCheckpoint) {
      continue
    }

    const collateralAmountsLeft = vault.collateralAmountsFormatted.map(
      (x, i) => x - (collateralsReservedAmounts[i] || 0) + (vaultCheckpoint?.depositCollateralsAmounts[i] || 0)
    ) as unknown as OtokenCollateralsAmounts<T>
    const collateralAmountsWithCheckpoint = collateralAmountsLeft
    //const isValid = collateralAmountsLeft.some(x => x >= 0)
    //assert(isValid, `Not enough collateral for checkpoint ${checkpoint} for vault ${prettyObjectStringify(vault)}`)

    const { collateralsReservedAmounts: amountForThisMint, longUsedAmount } = calculateMintReservedCollaterals(
      oTokenParams,
      vaultCheckpoint.oTokenAmountFormatted,
      collateralAmountsLeft,
      checkpoints[checkpoint].prices,
      longOTokenParams,
      longOTokenAmountLeftFormatted
    )

    longOTokenAmountLeftFormatted = longOTokenAmountLeftFormatted - longUsedAmount

    oTokenParams.collateralAssets.forEach((collateral, i) => {
      collateralsReservedAmounts[i] = (collateralsReservedAmounts[i] || 0) + amountForThisMint[i]
      collateralsReservedValues[i] =
        (collateralsReservedValues[i] || 0) + amountForThisMint[i] * checkpoints[checkpoint].prices[collateral]
    })
  }

  const burnedAmountRatio = (vault.burnAmountFormatted || 0) / vaultTotalMintAmount
  const burnedCollateralAmounts = collateralsReservedAmounts.map(x => x * burnedAmountRatio)
  const burnedCollateralValues = collateralsReservedValues.map(x => x * burnedAmountRatio)

  const collateralsReservedAmountsAfterBurn = collateralsReservedAmounts.map((x, i) => x - burnedCollateralAmounts[i])
  const collateralsReservedValuesAfterBurn = collateralsReservedValues.map((x, i) => x - burnedCollateralValues[i])

  const totalOTokenMintAfterBurn = vaultTotalMintAmount - (vault.burnAmountFormatted || 0)
  const longAmountUsed = vault.longToDepositAmountFormatted
    ? Math.min(vault.longToDepositAmountFormatted - longOTokenAmountLeftFormatted, totalOTokenMintAfterBurn)
    : 0

  const longUsedToTotalRatio = longOtokenInfo && longAmountUsed ? longAmountUsed / longOtokenInfo.mintedAmount : 0

  const longCollateralsUsedValues = longUsedToTotalRatio
    ? longOtokenInfo?.collateralsUsedValues.map(x => x * longUsedToTotalRatio)
    : oTokenParams.collateralAssets.map(() => 0)

  const longCollateralsUsedAmounts = longUsedToTotalRatio
    ? longOtokenInfo?.collateralsUsedAmounts.map(x => x * longUsedToTotalRatio)
    : oTokenParams.collateralAssets.map(() => 0)

  const collateralsUsedValues = mapPlusArray(collateralsReservedValuesAfterBurn, longCollateralsUsedValues)
  const collateralsUsedAmounts = mapPlusArray(collateralsReservedAmountsAfterBurn, longCollateralsUsedAmounts)

  return {
    totalOTokenMint: vaultTotalMintAmount,
    totalOTokenMintAfterBurn,
    collateralsReservedAmounts: collateralsReservedAmountsAfterBurn,
    collateralsReservedValues: collateralsReservedValuesAfterBurn,
    longCollateralsUsedValues,
    collateralsUsedValues,
    collateralsUsedAmounts,
    longAmountUsed,
  }
}

export function calculateMintReservedCollaterals<T extends OTokenParams>(
  oTokenParams: T,
  mintAmount: number,
  collateralAmounts: OtokenCollateralsAmounts<T>,
  prices: OTokenPrices<T>,
  longOTokenParams?: OTokenParams,
  longAmount?: number
) {
  const { collateralAssets } = oTokenParams

  const { marginRequiredUsd, longUsedAmount } = calculateMarginRequired(
    mintAmount,
    oTokenParams,
    prices,
    longOTokenParams,
    longAmount
  )

  const collateralValues = collateralAmounts.map((x, i) => prices[collateralAssets[i]] * x)
  const totalCollateralsValue = collateralValues.reduce((a, b) => a + b, 0)

  assert(
    totalCollateralsValue >= marginRequiredUsd,
    `
      Got total collateral value ${totalCollateralsValue} is less than required ${marginRequiredUsd}
      Not enough collateral for mint ${mintAmount} oToken, with prices: ${prettyObjectStringify(prices)}
      Provided collateral amounts ${collateralAmounts}
    `
  )
  const usedCollateralsRatios = collateralValues.map(x => x / totalCollateralsValue)
  const collateralsReservedAmounts = usedCollateralsRatios.map(
    (ratio, i) => (ratio * marginRequiredUsd) / prices[collateralAssets[i]]
  )
  const collateralsReservedValues = collateralsReservedAmounts.map((x, i) => x * prices[collateralAssets[i]])

  return {
    collateralsReservedAmounts,
    collateralsReservedValues,
    longUsedAmount,
  }
}

export async function assertSettleVault<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  params: TestMintRedeemSettleParams<T, C>,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>,
  minterVaults: TestMintRedeemSettleParamsVaultOwned<T, C>[],
  shortOTokenParams: T,
  shortInfo: OtokenInfo,
  longsInfo: OtokenInfo[]
) {
  const { initialPrices, expiryPrices } = params
  const longOTokenParams = vault.longToDeposit

  const longOTokenInfo = vault.longToDeposit && longsInfo.find(x => _isEqual(x.oTokenParams, longOTokenParams))

  const { collateralsUsedValues } = calculateVaultTotalMint(
    shortOTokenParams,
    initialPrices,
    vault,
    params.checkpointsDays,
    longOTokenInfo
  )

  const shortOtokenCollateralsUsedValues = shortInfo.collateralsUsedValues
  const { collateralsFormatted: shortTotalRedeemCollateralsAmounts } = await calculateRedeemForOtokenAmount(
    params,
    shortOTokenParams,
    minterVaults,
    vault.owner,
    longsInfo,
    shortInfo.mintedAmount
  )

  const vaultCollateralsRedeemRatio = collateralsUsedValues.map((collateralValue, i) =>
    shortOtokenCollateralsUsedValues[i] === 0 ? 0 : collateralValue / shortOtokenCollateralsUsedValues[i]
  )

  const shortVaultRedeemableCollaterals = shortTotalRedeemCollateralsAmounts.map(
    (x, i) => x * vaultCollateralsRedeemRatio[i]
  )
  const longVaultRedeemCollateralsAmounts = longOTokenInfo
    ? (
        await calculateRedeemForOtokenAmount(
          params,
          longOTokenInfo.oTokenParams,
          params.longsOwners,
          vault.owner,
          [],
          vault.longToDepositAmountFormatted
        )
      ).collateralsFormatted
    : params.oTokenParams.collateralAssets.map(() => 0)

  const expectedCollateralsLeftFormatted = vault.collateralAmountsFormatted.map(
    (c, i) => c + longVaultRedeemCollateralsAmounts[i] - shortVaultRedeemableCollaterals[i]
  )
  const expectedCollateralsLeftValuesFormatted = expectedCollateralsLeftFormatted.map(
    (c, i) => c * expiryPrices[shortOTokenParams.collateralAssets[i]]
  )

  const collateralsLeftFormatted = await Promise.all(
    shortOTokenParams.collateralAssets.map(c => getEthOrERC20BalanceFormatted(vault.owner, c))
  )
  const collateralsLeftValuesFormatted = collateralsLeftFormatted.map(
    (c, i) => c * params.expiryPrices[shortOTokenParams.collateralAssets[i]]
  )
  for (const [i, collateralAsset] of shortOTokenParams.collateralAssets.entries()) {
    const deviationValue = Math.abs(collateralsLeftValuesFormatted[i] - expectedCollateralsLeftValuesFormatted[i])
    assert(
      deviationValue < EXPECTED_DEVIATIONS.settleCollateralUsd,
      `
        Collateral ${i}, ${collateralAsset} settled with wrong usd value.
        Expected: ${expectedCollateralsLeftValuesFormatted[i]}, got: ${collateralsLeftValuesFormatted[i]}
        Expected usd deviation: ${EXPECTED_DEVIATIONS.settleCollateralUsd}, got:  ${deviationValue}
      `
    )
  }
}

export async function prepareDepositCollateralAction<T extends OTokenParams>(
  vaultId: number,
  controller: Controller,
  marginPool: MarginPool,
  oTokenParamsRaw: T,
  vaultOwner: SignerWithAddress,
  collateralAmountsFormatted: OtokenCollateralsAmounts<T>,
  mockERC20Owners?: { [key: string]: SignerWithAddress }
) {
  const { collateralAssets } = oTokenParamsRaw
  const collateralAmounts = await Promise.all(
    collateralAmountsFormatted.map(async (amount, i) =>
      addTokenDecimalsToAmount(collateralAssets[i], amount, vaultOwner)
    )
  )
  const isVaultAlreadyOpened = (await controller.accountVaultCounter(vaultOwner.address)).toNumber() === vaultId

  if (!isVaultAlreadyOpened) {
    for (const [i, amount] of collateralAmounts.entries()) {
      // Transfer collateral tokens from whales to user
      await getFunds(collateralAssets[i], amount, vaultOwner.address, mockERC20Owners)
      // Approve collateral tokens for pending by controller
      await approveERC20(collateralAssets[i], amount, vaultOwner, marginPool.address)
    }
    return getAction(ActionType.DepositCollateral, {
      owner: vaultOwner.address,
      amounts: collateralAmounts,
      assets: [...collateralAssets],
      vaultId,
      from: vaultOwner.address,
    })
  }
}

export async function prepareDepositLongAction(
  vaultId: number,
  vaultOwner: SignerWithAddress,
  marginPoolAddress: string,
  oTokenFactory: OtokenFactory,
  longOtoken: OTokenParams,
  longDepositAmountFormatted: number
) {
  const longAmount = longDepositAmountFormatted && parseUnits(longDepositAmountFormatted.toString(), oTokenDecimals)
  const longOTokenParams = {
    ...longOtoken,
    expiry: createValidExpiry(longOtoken.expiryDays),
  } as const
  const longOToken = await findOToken(vaultOwner, oTokenFactory, longOTokenParams)
  await approveERC20(longOToken.address, longAmount, vaultOwner, marginPoolAddress)
  return getAction(ActionType.DepositLongOption, {
    owner: vaultOwner.address,
    from: vaultOwner.address,
    longOtoken: [longOToken.address],
    amount: [longAmount],
    vaultId,
  })
}

export async function depositMintInVault<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  controller: Controller,
  marginPool: MarginPool,
  oTokenParamsRaw: T,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>,
  oToken: Otoken,
  oTokenAmountFormatted: number,
  depositCollateralsAmounts?: [number],
  mockERC20Owners?: { [key: string]: SignerWithAddress }
) {
  const { owner } = vault
  const oTokenAmount = parseUnits(oTokenAmountFormatted.toString(), oTokenDecimals)
  const vaultId = (await controller.accountVaultCounter(owner.address)).toNumber() + 1

  const depositCollateralAction =
    depositCollateralsAmounts &&
    (await prepareDepositCollateralAction(
      vaultId,
      controller,
      marginPool,
      oTokenParamsRaw,
      owner,
      depositCollateralsAmounts,
      mockERC20Owners
    ))

  const mintActions: ActionArgsStruct[] = [
    depositCollateralAction,
    getAction(ActionType.MintShortOption, {
      owner: owner.address,
      amount: [oTokenAmount],
      vaultId,
      to: owner.address,
    }),
  ].filter(Boolean)

  await controller.connect(owner).operate(mintActions)

  const mintedOTokenBalance = await oToken.balanceOf(owner.address)
  return mintedOTokenBalance
}

export async function openVaultAndMint<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  controller: Controller,
  marginPool: MarginPool,
  oTokenParamsRaw: T,
  oToken: Otoken,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>,
  oTokenAmountFormatted: number,
  oTokenFactory: OtokenFactory,
  longOtoken?: OTokenParams,
  longDepositAmountFormatted?: number,
  mockERC20Owners?: { [key: string]: SignerWithAddress }
) {
  const { collateralAmountsFormatted, owner } = vault
  const oTokenAmount = parseUnits(oTokenAmountFormatted.toString(), oTokenDecimals)
  const vaultId = (await controller.accountVaultCounter(owner.address)).toNumber() + 1

  const openVaultAction = getAction(ActionType.OpenVault, {
    owner: owner.address,
    shortOtoken: oToken.address,
    vaultId,
  })

  const depositCollateralAction = await prepareDepositCollateralAction(
    vaultId,
    controller,
    marginPool,
    oTokenParamsRaw,
    owner,
    collateralAmountsFormatted,
    mockERC20Owners
  )

  const depositLongAction =
    vault.longToDeposit &&
    (await prepareDepositLongAction(
      vaultId,
      owner,
      marginPool.address,
      oTokenFactory,
      longOtoken,
      longDepositAmountFormatted
    ))

  const openAndDepositActions = [openVaultAction, depositCollateralAction, depositLongAction].filter(Boolean)

  const mintActions: ActionArgsStruct[] = [
    ...openAndDepositActions,
    getAction(ActionType.MintShortOption, {
      owner: owner.address,
      amount: [oTokenAmount],
      vaultId,
      to: owner.address,
    }),
  ].filter(Boolean)

  await controller.connect(owner).operate(mintActions)

  const mintedOTokenBalance = await oToken.balanceOf(owner.address)
  return mintedOTokenBalance
}
