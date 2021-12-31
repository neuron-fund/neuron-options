import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '@ethersproject/wallet'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert } from 'chai'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import { ethers, getNamedAccounts, network } from 'hardhat'
import { Otoken } from '../../typechain-types'
import { ActionArgsStruct, Controller } from '../../typechain-types/Controller'
import { testVaultOwnersPrivateKeys } from '../../utils/accounts'
import { AddressZero } from '../../utils/ethers'
import { namedAccountsSigners } from '../../utils/hardhat'
import { prettyObjectStringify } from '../../utils/log'
import { createValidExpiry, waitNDays } from '../../utils/time'
import { FixedSizeArray } from '../../utils/types'
import { getAction, ActionType } from './actions'
import {
  addTokenDecimalsToAmount,
  approveERC20,
  getERC20BalanceOf,
  getERC20Decimals,
  getEthOrERC20BalanceFormatted,
} from './erc20'
import { TestDeployResult } from './fixtures'
import { getAssetFromWhale } from './funds'
import { setStablePrices } from './oracle'
import { findOToken, oTokenDecimals, OTokenPrices, whitelistAndCreateOtoken } from './otoken'

export type TestMintOTokenParams = {
  collateralAssets: readonly string[]
  underlyingAsset: string
  strikeAsset: string
  strikePriceFormatted: number
  expiryDays: number
  isPut: boolean
}

export type VaultCheckpointsMint<T extends TestMintOTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>> = {
  [key in keyof C]?: { oTokenAmountFormatted: number }
}

export type VaultDepositsAmounts<T extends TestMintOTokenParams> = FixedSizeArray<
  T['collateralAssets']['length'],
  number
>

export type TestMintRedeemSettleParamsVault<
  T extends TestMintOTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
> = {
  collateralAmountsFormatted: VaultDepositsAmounts<T>
  burnAmountFormatted?: number
} & (
  | { oTokenAmountFormatted: number; mintOnCheckoints?: VaultCheckpointsMint<T, C> }
  | { oTokenAmountFormatted?: number; mintOnCheckoints: VaultCheckpointsMint<T, C> }
)

export type TestMintRedeemSettleParamsVaultOwned<
  T extends TestMintOTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
> = TestMintRedeemSettleParamsVault<T, C> & {
  owner: SignerWithAddress | Wallet
}

export type TestMintRedeemSettleParamsCheckpoints<T extends TestMintOTokenParams> = {
  [key: number]: {
    prices: OTokenPrices<T>
  }
}

export type TestMintRedeemSettleParams<
  T extends TestMintOTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
> = {
  oTokenParams: T
  vaults: readonly TestMintRedeemSettleParamsVault<T, C>[]
  initialPrices: OTokenPrices<T>
  expiryPrices: OTokenPrices<T>
  checkpointsDays?: C
}

// Maxiumum deviation of usd value of redeem and vault settle. Calculated from balances of redeemer and vault owner respectively
const expectedRedeemUsdDeviation = 0.1
const expectedSettleCollateralUsdDeviation = 0.1

export const testMintRedeemSettleFactory = (getDeployResults: () => TestDeployResult) => {
  return async <T extends TestMintOTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
    params: TestMintRedeemSettleParams<T, C>
  ) => {
    const { user, deployer, redeemer } = await namedAccountsSigners(getNamedAccounts)
    const testDeployResult = getDeployResults()
    const { controller, whitelist, oTokenFactory, oracle } = testDeployResult
    const vaults: TestMintRedeemSettleParamsVaultOwned<T, C>[] = await Promise.all(
      params.vaults.map(async (v, i) => ({
        ...v,
        owner: await ethers.getSigner(new ethers.Wallet(testVaultOwnersPrivateKeys[i]).address),
      }))
    )
    const { initialPrices, expiryPrices } = params
    const { expiryDays } = params.oTokenParams
    const oTokenParams = {
      ...params.oTokenParams,
      expiry: createValidExpiry(expiryDays),
    } as const

    const totalOtokenRedeemableFormatted = params.vaults.reduce((a, vault) => {
      const { totalOTokenMint } = calculateVaultTotalMint(
        params.oTokenParams,
        initialPrices,
        vault,
        params.checkpointsDays
      )
      return a + totalOTokenMint - (vault.burnAmountFormatted || 0)
    }, 0)

    const totalOtokenRedeemable = parseUnits(totalOtokenRedeemableFormatted.toString(), oTokenDecimals)

    await setStablePrices(oracle, deployer, params.initialPrices)

    await whitelistAndCreateOtoken(
      {
        whitelist,
        oTokenFactory,
        protocolOwner: deployer,
        oTokenCreator: deployer,
      },
      oTokenParams
    )

    const oToken = await findOToken(user, oTokenFactory, oTokenParams)
    assert(oToken.address !== AddressZero, 'Otoken address is zero')

    // Mint oTokens for vaults with oTokenAmountFormatted specified or 0 checkpoint
    const initalMintVaults = vaults.filter(x => x.oTokenAmountFormatted)
    for (const vault of initalMintVaults) {
      const mintedAmount = await openVaultAndMint(
        testDeployResult,
        params.oTokenParams,
        oToken,
        vault,
        vault.oTokenAmountFormatted
      )
      await oToken.connect(vault.owner).transfer(redeemer.address, mintedAmount)
    }

    const checkpoints = Object.keys(params.checkpointsDays || [])
    // Mint oTokens for checkpoints and wait time
    for (const checkpoint of checkpoints) {
      await waitNDays(Number(checkpoint), network.provider)
      await setStablePrices(oracle, deployer, params.checkpointsDays[checkpoint].prices)
      const vaultsToMintOnCheckpoint = vaults.filter(x => x.mintOnCheckoints?.[checkpoint])
      for (const vault of vaultsToMintOnCheckpoint) {
        const amountToMint = vault.mintOnCheckoints[checkpoint].oTokenAmountFormatted
        const mintedAmount = await openVaultAndMint(testDeployResult, params.oTokenParams, oToken, vault, amountToMint)
        await oToken.connect(vault.owner).transfer(redeemer.address, mintedAmount)
      }
    }

    // Get burn oTokens from redeemer
    for (const vault of vaults) {
      if (vault.burnAmountFormatted) {
        await oToken
          .connect(redeemer)
          .transfer(vault.owner.address, parseUnits(vault.burnAmountFormatted.toString(), oTokenDecimals))
      }
    }

    // Burn vaults
    const vaultsToBurn = vaults.filter(x => x.burnAmountFormatted)
    for (const vault of vaultsToBurn) {
      await burnVault(controller, oToken, vault)
    }

    const redeemerBalanceAfterMint = await getERC20BalanceOf(redeemer, oToken.address)
    assert(
      redeemerBalanceAfterMint.eq(totalOtokenRedeemable),
      `Redeemer balance of oToken is not correct\n Expected: ${totalOtokenRedeemable}\n Got: ${redeemerBalanceAfterMint}`
    )

    await waitNDays(expiryDays + 1, network.provider)
    await setStablePrices(oracle, deployer, params.expiryPrices)

    await oToken.connect(redeemer).approve(controller.address, totalOtokenRedeemable)

    const redeemActions: ActionArgsStruct[] = [
      getAction(ActionType.Redeem, {
        amount: [totalOtokenRedeemable],
        otoken: [oToken.address],
        receiver: redeemer.address,
      }),
    ]

    await controller.connect(redeemer).operate(redeemActions)

    const totalRedeem = await calculateRedeemForOtokenAmount(params, totalOtokenRedeemableFormatted, redeemer)

    // Assert user gets right redeem
    for (const [i, collateralAmount] of totalRedeem.collaterals.entries()) {
      const userCollateralBalance = await getERC20BalanceOf(redeemer, oTokenParams.collateralAssets[i])
      const collateralDecimals = await getERC20Decimals(redeemer, oTokenParams.collateralAssets[i])
      const deviationAmount = userCollateralBalance.sub(collateralAmount).abs()
      const deviationAmountFormatted = Number(formatUnits(deviationAmount, collateralDecimals))
      const deviationUsdValue = deviationAmountFormatted * params.expiryPrices[oTokenParams.collateralAssets[i]]
      assert(
        deviationUsdValue < expectedRedeemUsdDeviation,
        `Collateral ${i} redeem with wrong amount.\n
         Expected: ${collateralAmount}, got: ${userCollateralBalance}\n
         Expected deviation: ${expectedRedeemUsdDeviation}, got:  ${deviationUsdValue}\n
        `
      )
    }

    const usdRedeemForOneOtoken = getUsdRedeemForOneOtoken(params)

    for (const vault of vaults) {
      await settleVault(testDeployResult, vault)

      const { usedCollateralsValues, usedCollaterals, totalOTokenMint } = calculateVaultTotalMint(
        params.oTokenParams,
        initialPrices,
        vault,
        params.checkpointsDays
      )
      console.log(`testMintRedeemSettleFactory ~ usedCollaterals`, usedCollaterals)
      const redeemableAlternativeRatio = totalRedeem.collateralsFormatted.map((x, i) => usedCollaterals[i] / x)
      const redeeableAlternative = totalRedeem.collateralsFormatted
      console.log(`testMintRedeemSettleFactory ~ redeemableAlternative`, redeemableAlternativeRatio)
      const totalOTokenMintAfterBurn = totalOTokenMint - (vault.burnAmountFormatted || 0)
      console.log(`testMintRedeemSettleFactory ~ totalOTokenMintAfterBurn`, totalOTokenMintAfterBurn)
      const totalUsedCollateralsValue = usedCollateralsValues.reduce((acc, b, i) => (acc += b), 0)
      console.log(`testMintRedeemSettleFactory ~ vaultTotalCollateralValueOnDeposit`, totalUsedCollateralsValue)
      const vaultCollateralsRedeemRatio = usedCollateralsValues.map((collateralValue, i) =>
        totalUsedCollateralsValue === 0 ? 1 : collateralValue / totalUsedCollateralsValue
      )

      const vaultCollateralsRedeemValues = vaultCollateralsRedeemRatio.map(
        x => x * usdRedeemForOneOtoken * totalOTokenMintAfterBurn
      )

      const vaultRedeemCollateralsFormatted = vaultCollateralsRedeemValues.map(
        (val, i) => val / expiryPrices[oTokenParams.collateralAssets[i]]
      )

      const expectedCollateralsLeftFormatted = vault.collateralAmountsFormatted.map(
        (c, i) => c - vaultRedeemCollateralsFormatted[i]
      )
      const expectedCollateralsLeftValuesFormatted = expectedCollateralsLeftFormatted.map(
        (c, i) => c * expiryPrices[oTokenParams.collateralAssets[i]]
      )

      const collateralsLeftFormatted = await Promise.all(
        oTokenParams.collateralAssets.map((c, i) => getEthOrERC20BalanceFormatted(vault.owner, c))
      )
      const collateralsLeftValuesFormatted = collateralsLeftFormatted.map(
        (c, i) => c * params.expiryPrices[oTokenParams.collateralAssets[i]]
      )
      for (const [i, collateralAsset] of oTokenParams.collateralAssets.entries()) {
        const deviationValue = Math.abs(collateralsLeftValuesFormatted[i] - expectedCollateralsLeftValuesFormatted[i])
        assert(
          deviationValue < expectedSettleCollateralUsdDeviation,
          `
           Settle vault № ${vaults.indexOf(vault)}
           Collateral ${i}, ${collateralAsset} settled with wrong usd value.
           Expected: ${expectedCollateralsLeftValuesFormatted[i]}, got: ${collateralsLeftValuesFormatted[i]}
           Expected deviation: ${expectedSettleCollateralUsdDeviation}, got:  ${deviationValue}
          `
        )
      }
    }
  }
}

export async function openVaultAndMint<
  T extends TestMintOTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
>(
  testDeployResult: TestDeployResult,
  oTokenParamsRaw: T,
  oToken: Otoken,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>,
  oTokenAmountFormatted: number
) {
  console.log('openVaultAndMint')
  const { controller, marginPool } = testDeployResult
  const { collateralAmountsFormatted, owner } = vault
  const { collateralAssets } = oTokenParamsRaw

  const oTokenAmount = parseUnits(oTokenAmountFormatted.toString(), oTokenDecimals)

  const collateralAmounts = await Promise.all(
    collateralAmountsFormatted.map(async (amount, i) => addTokenDecimalsToAmount(collateralAssets[i], amount, owner))
  )
  const vaultId = 1
  const isVaultAlreadyOpened = (await controller.accountVaultCounter(owner.address)).toNumber() === vaultId

  if (!isVaultAlreadyOpened) {
    for (const [i, amount] of collateralAmounts.entries()) {
      // Transfer collateral tokens from whales to user
      console.log(`getAssetFromWhale`)
      await getAssetFromWhale(collateralAssets[i], amount, owner.address)
      // Approve collateral tokens for pending by controller
      console.log(`approveERC20`, amount.toString())
      await approveERC20(collateralAssets[i], amount, owner, marginPool.address)
    }
  }

  const mintActions: ActionArgsStruct[] = [
    ...(isVaultAlreadyOpened
      ? []
      : [
          getAction(ActionType.OpenVault, {
            owner: owner.address,
            shortOtoken: oToken.address,
            vaultId,
          }),
          getAction(ActionType.DepositCollateral, {
            owner: owner.address,
            amounts: collateralAmounts,
            assets: [...collateralAssets],
            vaultId,
            from: owner.address,
          }),
        ]),
    getAction(ActionType.MintShortOption, {
      owner: owner.address,
      amount: [oTokenAmount],
      vaultId,
      otoken: [oToken.address],
      to: owner.address,
    }),
  ]

  await controller.connect(owner).operate(mintActions)

  const mintedOTokenBalance = await oToken.balanceOf(owner.address)
  assert(
    mintedOTokenBalance.eq(oTokenAmount),
    `Minted oToken balance is wrong.\n Expected ${oTokenAmount}, got ${mintedOTokenBalance}`
  )
  return mintedOTokenBalance
}

export async function settleVault<T extends TestMintOTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  testDeployResult: TestDeployResult,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>
) {
  const { controller } = testDeployResult
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

export function getStrikeRedeemForOneOtoken<
  T extends TestMintOTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
>(params: TestMintRedeemSettleParams<T, C>) {
  const { expiryPrices } = params
  const { strikePriceFormatted, underlyingAsset, strikeAsset } = params.oTokenParams
  const expiryPriceInStrike = expiryPrices[underlyingAsset] / expiryPrices[strikeAsset]
  return Math.max(strikePriceFormatted - expiryPriceInStrike, 0)
}

export function getUsdRedeemForOneOtoken<
  T extends TestMintOTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
>(params: TestMintRedeemSettleParams<T, C>) {
  const { expiryPrices } = params
  const { strikeAsset } = params.oTokenParams
  return getStrikeRedeemForOneOtoken(params) * expiryPrices[strikeAsset]
}

export async function calculateRedeemForOtokenAmount<
  T extends TestMintOTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
>(params: TestMintRedeemSettleParams<T, C>, oTokenAmountFormatted: number, signer: SignerWithAddress | Wallet) {
  const { expiryPrices, vaults, initialPrices, checkpointsDays } = params
  const { collateralAssets, isPut } = params.oTokenParams

  const zero = {
    usd: 0,
    collaterals: collateralAssets.map(() => BigNumber.from(0)),
    collateralsFormatted: collateralAssets.map(() => 0),
  }
  if (isPut) {
    const usdRedeemForOneOtoken = getUsdRedeemForOneOtoken(params)

    if (usdRedeemForOneOtoken === 0) {
      return zero
    }

    const collateralValuesFormatted = vaults
      .map(vault => {
        const { usedCollateralsValues } = calculateVaultTotalMint(
          params.oTokenParams,
          initialPrices,
          vault,
          checkpointsDays
        )
        return usedCollateralsValues
      })
      .reduce((acc, b) => {
        b.forEach((amount, i) => (acc[i] = (acc[i] || 0) + amount))
        return acc
      }, [])

    const totalReservedCollateralValue = collateralValuesFormatted.reduce((acc, b) => acc + b, 0)

    const redeemCollateralRatios = collateralValuesFormatted.map(x => x / totalReservedCollateralValue)
    const redeemUsd = usdRedeemForOneOtoken * oTokenAmountFormatted
    const redeemCollateralValuesUsd = redeemCollateralRatios.map(x => x * redeemUsd)
    const redeemCollateralAmountsFormatted = redeemCollateralValuesUsd.map(
      (x, i) => x / expiryPrices[collateralAssets[i]]
    )
    const redeemCollateralAmounts = await Promise.all(
      collateralAssets.map((asset, i) => addTokenDecimalsToAmount(asset, redeemCollateralAmountsFormatted[i], signer))
    )
    return {
      usd: redeemUsd,
      collaterals: redeemCollateralAmounts,
      collateralsFormatted: redeemCollateralAmountsFormatted,
    }
  } else {
    // TODO call
    return zero
  }
}

export function calculateVaultTotalMint<
  T extends TestMintOTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
>(oTokenParams: T, initialPrices: OTokenPrices<T>, vault: TestMintRedeemSettleParamsVault<T, C>, checkpoints?: C) {
  const vaultTotalMintAmount =
    (vault.oTokenAmountFormatted || 0) +
    Object.values(vault.mintOnCheckoints || {}).reduce((x, c) => x + c.oTokenAmountFormatted, 0)

  const usedCollateralAmounts = vault.oTokenAmountFormatted
    ? calculateMintUsedCollaterals(
        oTokenParams,
        vault.oTokenAmountFormatted,
        vault.collateralAmountsFormatted,
        initialPrices
      )
    : []

  const usedCollateralsValues = usedCollateralAmounts.map(
    (x, i) => (x || 0) * initialPrices[oTokenParams.collateralAssets[i]]
  )

  for (const c of Object.keys(checkpoints || {})) {
    const checkpoint = Number(c)
    const vaultCheckpoint = vault.mintOnCheckoints?.[checkpoint]
    if (!vaultCheckpoint) {
      continue
    }

    const collateralAmountsLeft = vault.collateralAmountsFormatted.map(
      x => x - (usedCollateralAmounts[x] || 0)
    ) as unknown as VaultDepositsAmounts<T>
    const isValid = collateralAmountsLeft.some(x => x >= 0)
    assert(isValid, `Not enough collateral for checkpoint ${checkpoint} for vault ${prettyObjectStringify(vault)}`)

    const amountForThisMint = calculateMintUsedCollaterals(
      oTokenParams,
      vaultCheckpoint.oTokenAmountFormatted,
      collateralAmountsLeft,
      checkpoints[checkpoint].prices
    )

    oTokenParams.collateralAssets.forEach((a, i) => {
      const collateral = oTokenParams.collateralAssets[i]
      usedCollateralAmounts[i] = (usedCollateralAmounts[i] || 0) + amountForThisMint[i]
      usedCollateralsValues[i] =
        (usedCollateralsValues[i] || 0) + amountForThisMint[i] * checkpoints[checkpoint].prices[collateral]
    })
  }

  const burnedAmountRatio = (vault.burnAmountFormatted || 0) / vaultTotalMintAmount
  const burnedCollateralAmounts = usedCollateralAmounts.map(x => x * burnedAmountRatio)
  const burnedCollateralValues = usedCollateralsValues.map((x, i) => x * burnedAmountRatio)
  console.log(`burnedCollateralValues`, burnedCollateralValues)

  const usedCollateralsAfterBurn = usedCollateralAmounts.map((x, i) => x - burnedCollateralAmounts[i])
  const usedCollateralsValuesAfterBurn = usedCollateralsValues.map((x, i) => x - burnedCollateralValues[i])
  console.log(`usedCollateralsAfterBurn`, usedCollateralsAfterBurn)
  console.log(`usedCollateralsValuesAfterBurn`, usedCollateralsValuesAfterBurn)

  return {
    totalOTokenMint: vaultTotalMintAmount,
    usedCollaterals: usedCollateralsAfterBurn,
    usedCollateralsValues: usedCollateralsValuesAfterBurn,
  }
}

export function calculateMintUsedCollaterals<T extends TestMintOTokenParams>(
  oTokenParams: T,
  mintAmount: number,
  collateralAmounts: VaultDepositsAmounts<T>,
  prices: OTokenPrices<T>
) {
  const { strikePriceFormatted, collateralAssets, strikeAsset } = oTokenParams
  const strikeRequiredUsd = strikePriceFormatted * mintAmount * prices[strikeAsset]
  const collateralValues = collateralAmounts.map((x, i) => prices[collateralAssets[i]] * x)
  const totalCollateralsValue = collateralValues.reduce((a, b) => a + b, 0)
  assert(
    totalCollateralsValue >= strikeRequiredUsd,
    `Not enough collateral for mint ${mintAmount}, with prices: ${prettyObjectStringify(prices)}`
  )
  const usedCollateralsRatios = collateralValues.map(x => x / totalCollateralsValue)
  return usedCollateralsRatios.map((x, i) => (x * strikeRequiredUsd) / prices[collateralAssets[i]])
}

export async function burnVault<T extends TestMintOTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  controller: Controller,
  oToken: Otoken,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>
) {
  const burnAction: ActionArgsStruct[] = [
    getAction(ActionType.BurnShortOption, {
      amount: [parseUnits(vault.burnAmountFormatted.toString(), oTokenDecimals)],
      from: vault.owner.address,
      otoken: [oToken.address],
      owner: vault.owner.address,
      vaultId: 1,
    }),
  ]

  await controller.connect(vault.owner).operate(burnAction)
}
