import { assert } from 'chai'
import { prettyObjectStringify } from '../../../utils/log'
import {
  addTokenDecimalsToAmount,
  approveERC20,
  getEthOrERC20BalanceFormatted as getTokenBalanceFormatted,
} from '../erc20'
import { findONToken, onTokenDecimals, ONTokenPrices } from '../onToken'
import { calculateMarginRequired } from './margin'
import { ONtokenInfo, calculateRedeemForONtokenAmount } from './onToken'
import {
  ONTokenParams,
  TestMintRedeemSettleParamsCheckpoints,
  TestMintRedeemSettleParamsVault,
  ONtokenCollateralsAmounts,
  TestMintRedeemSettleParams,
  TestMintRedeemSettleParamsVaultOwned,
} from './types'
import { isEqual as _isEqual } from 'lodash'
import { EXPECTED_DEVIATIONS } from './testMintRedeemSettle'
import { mapPlusArray } from '../../../utils/array'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { parseUnits } from 'ethers/lib/utils'
import { Controller, MarginPool, ONtoken, ONtokenFactory } from '../../../typechain-types'
import { ActionArgsStruct } from '../../../typechain-types/Controller'
import { createValidExpiry } from '../../../utils/time'
import { getAction, ActionType } from '../actions'
import { getFunds } from './getFunds'

export function calculateVaultTotalMint<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  onTokenParams: T,
  initialPrices: ONTokenPrices<T>,
  vault: TestMintRedeemSettleParamsVault<T, C>,
  checkpoints?: C,
  longONtokenInfo?: ONtokenInfo
) {
  const initialMintAmount = vault.onTokenAmountFormatted || 0
  const mintOnCheckpointsAmount = Object.values(vault.mintOnCheckoints || {}).reduce(
    (x, c) => x + c.onTokenAmountFormatted,
    0
  )
  const vaultTotalMintAmount = initialMintAmount + mintOnCheckpointsAmount

  let longONTokenAmountLeftFormatted = vault.longToDepositAmountFormatted || 0
  const longONTokenParams = vault.longToDeposit
  let collateralsReservedAmounts: number[] = onTokenParams.collateralAssets.map(() => 0)
  // Initial mint calculations
  if (vault.onTokenAmountFormatted) {
    const used = calculateMintReservedCollaterals(
      onTokenParams,
      vault.onTokenAmountFormatted,
      vault.collateralAmountsFormatted,
      initialPrices,
      longONTokenParams,
      longONTokenAmountLeftFormatted
    )
    collateralsReservedAmounts = used.collateralsReservedAmounts
    longONTokenAmountLeftFormatted = longONTokenAmountLeftFormatted - used.longUsedAmount
  }

  const collateralsReservedValues = collateralsReservedAmounts.map(
    (x, i) => (x || 0) * initialPrices[onTokenParams.collateralAssets[i]]
  )
  for (const c of Object.keys(checkpoints || {})) {
    const checkpoint = Number(c)
    const vaultCheckpoint = vault.mintOnCheckoints?.[checkpoint]
    if (!vaultCheckpoint) {
      continue
    }

    const collateralAmountsLeft = vault.collateralAmountsFormatted.map(
      x => x - (collateralsReservedAmounts[x] || 0)
    ) as unknown as ONtokenCollateralsAmounts<T>

    const isValid = collateralAmountsLeft.some(x => x >= 0)
    assert(isValid, `Not enough collateral for checkpoint ${checkpoint} for vault ${prettyObjectStringify(vault)}`)

    const { collateralsReservedAmounts: amountForThisMint, longUsedAmount } = calculateMintReservedCollaterals(
      onTokenParams,
      vaultCheckpoint.onTokenAmountFormatted,
      collateralAmountsLeft,
      checkpoints[checkpoint].prices,
      longONTokenParams,
      longONTokenAmountLeftFormatted
    )

    longONTokenAmountLeftFormatted = longONTokenAmountLeftFormatted - longUsedAmount

    onTokenParams.collateralAssets.forEach((a, i) => {
      const collateral = onTokenParams.collateralAssets[i]
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

  const totalONTokenMintAfterBurn = vaultTotalMintAmount - (vault.burnAmountFormatted || 0)
  const longAmountUsed = vault.longToDepositAmountFormatted
    ? Math.min(vault.longToDepositAmountFormatted - longONTokenAmountLeftFormatted, totalONTokenMintAfterBurn)
    : 0

  const longUsedToTotalRatio = longONtokenInfo && longAmountUsed ? longAmountUsed / longONtokenInfo.mintedAmount : 0

  const longCollateralsUsedValues = longUsedToTotalRatio
    ? longONtokenInfo?.collateralsUsedValues.map(x => x * longUsedToTotalRatio)
    : onTokenParams.collateralAssets.map(() => 0)

  const longCollateralsUsedAmounts = longUsedToTotalRatio
    ? longONtokenInfo?.collateralsUsedAmounts.map(x => x * longUsedToTotalRatio)
    : onTokenParams.collateralAssets.map(() => 0)

  const collateralsUsedValues = mapPlusArray(collateralsReservedValuesAfterBurn, longCollateralsUsedValues)
  const collateralsUsedAmounts = mapPlusArray(collateralsReservedAmountsAfterBurn, longCollateralsUsedAmounts)

  return {
    totalONTokenMint: vaultTotalMintAmount,
    totalONTokenMintAfterBurn,
    collateralsReservedAmounts: collateralsReservedAmountsAfterBurn,
    collateralsReservedValues: collateralsReservedValuesAfterBurn,
    longCollateralsUsedValues,
    collateralsUsedValues,
    collateralsUsedAmounts,
    longAmountUsed,
  }
}

export function calculateMintReservedCollaterals<T extends ONTokenParams>(
  onTokenParams: T,
  mintAmount: number,
  collateralAmounts: ONtokenCollateralsAmounts<T>,
  prices: ONTokenPrices<T>,
  longONTokenParams?: ONTokenParams,
  longAmount?: number
) {
  const { collateralAssets } = onTokenParams

  const { marginRequiredUsd, longUsedAmount } = calculateMarginRequired(
    mintAmount,
    onTokenParams,
    prices,
    longONTokenParams,
    longAmount
  )

  const collateralValues = collateralAmounts.map((x, i) => prices[collateralAssets[i]] * x)
  const totalCollateralsValue = collateralValues.reduce((a, b) => a + b, 0)

  assert(
    totalCollateralsValue >= marginRequiredUsd,
    `
      Got total collateral value ${totalCollateralsValue} is less than required ${marginRequiredUsd}
      Not enough collateral for mint ${mintAmount} onToken, with prices: ${prettyObjectStringify(prices)}
      Provided collateral amounts ${collateralAmounts}
    `
  )
  const usedCollateralsRatios = collateralValues.map(x => x / totalCollateralsValue)
  return {
    collateralsReservedAmounts: usedCollateralsRatios.map(
      (x, i) => (x * marginRequiredUsd) / prices[collateralAssets[i]]
    ),
    longUsedAmount,
  }
}

export async function assertSettleVault<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  params: TestMintRedeemSettleParams<T, C>,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>,
  minterVaults: TestMintRedeemSettleParamsVaultOwned<T, C>[],
  shortONTokenParams: T,
  shortInfo: ONtokenInfo,
  longsInfo: ONtokenInfo[]
) {
  const { initialPrices, expiryPrices } = params
  const longONTokenParams = vault.longToDeposit

  const longONTokenInfo = vault.longToDeposit && longsInfo.find(x => _isEqual(x.onTokenParams, longONTokenParams))

  const { collateralsUsedValues } = calculateVaultTotalMint(
    shortONTokenParams,
    initialPrices,
    vault,
    params.checkpointsDays,
    longONTokenInfo
  )

  const shortONtokenCollateralsUsedValues = shortInfo.collateralsUsedValues
  const { collateralsFormatted: shortTotalRedeemCollateralsAmounts } = await calculateRedeemForONtokenAmount(
    params,
    shortONTokenParams,
    minterVaults,
    vault.owner,
    longsInfo,
    shortInfo.mintedAmount
  )

  const vaultCollateralsRedeemRatio = collateralsUsedValues.map((collateralValue, i) =>
    shortONtokenCollateralsUsedValues[i] === 0 ? 0 : collateralValue / shortONtokenCollateralsUsedValues[i]
  )

  const shortVaultRedeemableCollaterals = shortTotalRedeemCollateralsAmounts.map(
    (x, i) => x * vaultCollateralsRedeemRatio[i]
  )
  const longVaultRedeemCollateralsAmounts = longONTokenInfo
    ? (
        await calculateRedeemForONtokenAmount(
          params,
          longONTokenInfo.onTokenParams,
          params.longsOwners,
          vault.owner,
          [],
          vault.longToDepositAmountFormatted
        )
      ).collateralsFormatted
    : params.onTokenParams.collateralAssets.map(() => 0)

  const expectedCollateralsLeftFormatted = vault.collateralAmountsFormatted.map(
    (c, i) => c + longVaultRedeemCollateralsAmounts[i] - shortVaultRedeemableCollaterals[i]
  )
  const expectedCollateralsLeftValuesFormatted = expectedCollateralsLeftFormatted.map(
    (c, i) => c * expiryPrices[shortONTokenParams.collateralAssets[i]]
  )

  const collateralsLeftFormatted = await Promise.all(
    shortONTokenParams.collateralAssets.map(c => getTokenBalanceFormatted(vault.owner, c))
  )
  const collateralsLeftValuesFormatted = collateralsLeftFormatted.map(
    (c, i) => c * params.expiryPrices[shortONTokenParams.collateralAssets[i]]
  )
  for (const [i, collateralAsset] of shortONTokenParams.collateralAssets.entries()) {
    const deviationValue = Math.abs(collateralsLeftValuesFormatted[i] - expectedCollateralsLeftValuesFormatted[i])
    assert(
      deviationValue < EXPECTED_DEVIATIONS.settleCollateralUsdValue,
      `
        Collateral ${i}, ${collateralAsset} settled with wrong usd value.
        Expected: ${expectedCollateralsLeftValuesFormatted[i]}, got: ${collateralsLeftValuesFormatted[i]}
        Expected usd deviation: ${EXPECTED_DEVIATIONS.settleCollateralUsdValue}, got:  ${deviationValue}
        `
    )
  }
  const totalExpectedValue = expectedCollateralsLeftValuesFormatted.reduce((a, b) => a + b, 0)
  const totalValueRecieved = collateralsLeftValuesFormatted.reduce((a, b) => a + b, 0)
  const totalDeviation = Math.abs(totalValueRecieved - totalExpectedValue)
  assert(
    totalDeviation < EXPECTED_DEVIATIONS.redeemTotalUsdValue,
    `
      Collaterals settled with wrong usd value.
      Expected: ${totalExpectedValue}, got: ${totalValueRecieved}
      `
  )
}

export async function prepareDepositCollateralAction<T extends ONTokenParams>(
  vaultId: number,
  controller: Controller,
  marginPool: MarginPool,
  onTokenParamsRaw: T,
  vaultOwner: SignerWithAddress,
  collateralAmountsFormatted: ONtokenCollateralsAmounts<T>,
  mockERC20Owners?: { [key: string]: SignerWithAddress }
) {
  const { collateralAssets } = onTokenParamsRaw
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
  onTokenFactory: ONtokenFactory,
  longONtoken: ONTokenParams,
  longDepositAmountFormatted: number
) {
  const longAmount = longDepositAmountFormatted && parseUnits(longDepositAmountFormatted.toString(), onTokenDecimals)
  const longONTokenParams = {
    ...longONtoken,
    expiry: createValidExpiry(longONtoken.expiryDays),
  } as const
  const longONToken = await findONToken(vaultOwner, onTokenFactory, longONTokenParams)
  await approveERC20(longONToken.address, longAmount, vaultOwner, marginPoolAddress)
  return getAction(ActionType.DepositLongOption, {
    owner: vaultOwner.address,
    from: vaultOwner.address,
    longONtoken: [longONToken.address],
    amount: [longAmount],
    vaultId,
  })
}

export async function openVaultAndMint<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  controller: Controller,
  marginPool: MarginPool,
  onTokenParamsRaw: T,
  onToken: ONtoken,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>,
  onTokenAmountFormatted: number,
  onTokenFactory: ONtokenFactory,
  longONtoken?: ONTokenParams,
  longDepositAmountFormatted?: number,
  mockERC20Owners?: { [key: string]: SignerWithAddress }
) {
  const { collateralAmountsFormatted, owner } = vault
  const onTokenAmount = parseUnits(onTokenAmountFormatted.toString(), onTokenDecimals)
  const currentVault = (await controller.accountVaultCounter(owner.address)).toNumber()
  const vaultId = 1

  const openVaultAction =
    !currentVault &&
    getAction(ActionType.OpenVault, {
      owner: owner.address,
      shortONtoken: onToken.address,
      vaultId,
    })

  const depositCollateralAction = await prepareDepositCollateralAction(
    vaultId,
    controller,
    marginPool,
    onTokenParamsRaw,
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
      onTokenFactory,
      longONtoken,
      longDepositAmountFormatted
    ))

  const openAndDepositActions = [openVaultAction, depositCollateralAction, depositLongAction].filter(Boolean)

  const mintActions: ActionArgsStruct[] = [
    ...openAndDepositActions,
    getAction(ActionType.MintShortOption, {
      owner: owner.address,
      amount: [onTokenAmount],
      vaultId,
      to: owner.address,
    }),
  ].filter(Boolean)

  await controller.connect(owner).operate(mintActions)

  const mintedONTokenBalance = await onToken.balanceOf(owner.address)
  return mintedONTokenBalance
}
