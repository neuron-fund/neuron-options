import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '@ethersproject/wallet'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert } from 'chai'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import { ethers, getNamedAccounts, network } from 'hardhat'
import { Otoken } from '../../typechain-types'
import { ActionArgsStruct } from '../../typechain-types/Controller'
import { testVaultOwnersPrivateKeys } from '../../utils/accounts'
import { AddressZero } from '../../utils/ethers'
import { namedAccountsSigners } from '../../utils/hardhat'
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

export type TestMintRedeemSettleParamsVault<T extends TestMintOTokenParams> = {
  collateralAmountsFormatted: FixedSizeArray<T['collateralAssets']['length'], number>
  oTokenAmountFormatted: number
}

export type TestMintRedeemSettleParamsVaultOwned<T extends TestMintOTokenParams> =
  TestMintRedeemSettleParamsVault<T> & {
    owner: SignerWithAddress | Wallet
  }

export type TestMintRedeemSettleParams<T extends TestMintOTokenParams> = {
  oTokenParams: T
  vaults: readonly TestMintRedeemSettleParamsVault<T>[]
  initalPrices: OTokenPrices<T>
  expiryPrices: OTokenPrices<T>
}

// Maxiumum deviation of usd value of redeem and vault settle. Calculated from balances of redeemer and vault owner respectively
const expectedRedeemUsdDeviation = 0.1
const expectedSettleCollateralUsdDeviation = 0.1

export const testMintRedeemSettleFactory = (getDeployResults: () => TestDeployResult) => {
  return async <T extends TestMintOTokenParams>(params: TestMintRedeemSettleParams<T>) => {
    const { user, deployer, redeemer } = await namedAccountsSigners(getNamedAccounts)
    const testDeployResult = getDeployResults()
    const { controller, whitelist, oTokenFactory, oracle } = testDeployResult
    const vaults: TestMintRedeemSettleParamsVaultOwned<T>[] = await Promise.all(
      params.vaults.map(async (v, i) => ({
        ...v,
        owner: await ethers.getSigner(new ethers.Wallet(testVaultOwnersPrivateKeys[i]).address),
      }))
    )
    const { initalPrices, expiryPrices } = params
    const { expiryDays, strikePriceFormatted } = params.oTokenParams
    const oTokenParams = {
      ...params.oTokenParams,
      expiry: createValidExpiry(expiryDays),
    } as const

    const totalOtokenMintFormatted = params.vaults.reduce((a, b) => a + b.oTokenAmountFormatted, 0)
    const totalOtokenMint = parseUnits(totalOtokenMintFormatted.toString(), oTokenDecimals)

    await setStablePrices(oracle, deployer, params.initalPrices)

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

    for (const vault of vaults) {
      const mintedAmount = await openVaultAndMint(testDeployResult, params.oTokenParams, oToken, vault)
      await oToken.connect(vault.owner).transfer(redeemer.address, mintedAmount)
    }

    const redeemerBalanceAfterMint = await getERC20BalanceOf(redeemer, oToken.address)
    assert(
      redeemerBalanceAfterMint.eq(totalOtokenMint),
      `Redeemer balance of oToken is not correct\n Expected: ${totalOtokenMint}\n Got: ${redeemerBalanceAfterMint}`
    )

    await waitNDays(expiryDays + 1, network.provider)
    await setStablePrices(oracle, deployer, params.expiryPrices)

    await oToken.connect(redeemer).approve(controller.address, totalOtokenMint)

    const redeemActions: ActionArgsStruct[] = [
      getAction(ActionType.Redeem, {
        amount: [totalOtokenMint],
        otoken: [oToken.address],
        receiver: redeemer.address,
      }),
    ]

    await controller.connect(redeemer).operate(redeemActions)

    const totalRedeem = await calculateRedeemForOtokenAmount(params, totalOtokenMintFormatted, redeemer)

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
      const vaultCollateralsValuesOnDeposit = vault.collateralAmountsFormatted.map(
        (collateralAmount, i) => collateralAmount * initalPrices[oTokenParams.collateralAssets[i]]
      )
      const vaultTotalCollateralValueOnDeposit = vault.collateralAmountsFormatted.reduce(
        (acc, b, i) => (acc += b * initalPrices[oTokenParams.collateralAssets[i]]),
        0
      )

      const vaultCollateralsRedeemRatio = vaultCollateralsValuesOnDeposit.map(
        (collateralValue, i) => collateralValue / vaultTotalCollateralValueOnDeposit
      )

      const vaultCollateralsRedeemValues = vaultCollateralsRedeemRatio.map(
        x => x * usdRedeemForOneOtoken * vault.oTokenAmountFormatted
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

export async function openVaultAndMint<T extends TestMintOTokenParams>(
  testDeployResult: TestDeployResult,
  oTokenParamsRaw: T,
  oToken: Otoken,
  vault: TestMintRedeemSettleParamsVaultOwned<T>
) {
  const { controller, marginPool } = testDeployResult
  const { oTokenAmountFormatted, collateralAmountsFormatted, owner } = vault
  const { collateralAssets } = oTokenParamsRaw

  const oTokenAmount = parseUnits(oTokenAmountFormatted.toString(), oTokenDecimals)

  const collateralAmounts = await Promise.all(
    collateralAmountsFormatted.map(async (amount, i) => addTokenDecimalsToAmount(collateralAssets[i], amount, owner))
  )

  // Transfer collateral tokens from whales to user
  await Promise.all(collateralAmounts.map((amount, i) => getAssetFromWhale(collateralAssets[i], amount, owner.address)))
  // Approve collateral tokens for pending by controller
  await Promise.all(
    collateralAmounts.map((amount, i) => approveERC20(collateralAssets[i], amount, owner, marginPool.address))
  )

  const vaultId = 1
  const mintActions: ActionArgsStruct[] = [
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

export async function settleVault<T extends TestMintOTokenParams>(
  testDeployResult: TestDeployResult,
  vault: TestMintRedeemSettleParamsVaultOwned<T>
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

export function getStrikeRedeemForOneOtoken<T extends TestMintOTokenParams>(params: TestMintRedeemSettleParams<T>) {
  const { expiryPrices } = params
  const { strikePriceFormatted, underlyingAsset, strikeAsset } = params.oTokenParams
  const expiryPriceInStrike = expiryPrices[underlyingAsset] / expiryPrices[strikeAsset]
  return Math.max(strikePriceFormatted - expiryPriceInStrike, 0)
}

export function getUsdRedeemForOneOtoken<T extends TestMintOTokenParams>(params: TestMintRedeemSettleParams<T>) {
  const { expiryPrices } = params
  const { strikeAsset } = params.oTokenParams
  return getStrikeRedeemForOneOtoken(params) * expiryPrices[strikeAsset]
}

export async function calculateRedeemForOtokenAmount<T extends TestMintOTokenParams>(
  params: TestMintRedeemSettleParams<T>,
  oTokenAmountFormatted: number,
  signer: SignerWithAddress | Wallet
) {
  const { expiryPrices, vaults, initalPrices: initialPrices } = params
  const { collateralAssets, isPut, strikePriceFormatted, strikeAsset } = params.oTokenParams
  const totalOTokensMinted = vaults.reduce((acc, vault) => acc + vault.oTokenAmountFormatted, 0)

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

    const vaultsUsedCollateralsAmounts = vaults.map(vault => {
      const mintAmount = vault.oTokenAmountFormatted
      const strikeRequiredUsd = strikePriceFormatted * mintAmount * initialPrices[strikeAsset]
      const collateralValues = vault.collateralAmountsFormatted.map((x, i) => initialPrices[collateralAssets[i]] * x)
      const totalCollateralsValue = collateralValues.reduce((a, b) => a + b, 0)
      const usedCollateralsRatios = collateralValues.map(x => x / totalCollateralsValue)
      return usedCollateralsRatios.map((x, i) => (x * strikeRequiredUsd) / initialPrices[collateralAssets[i]])
    })

    const totalUsedCollateralAmountsFormatted = vaultsUsedCollateralsAmounts.reduce((acc, b) => {
      b.forEach((amount, i) => (acc[i] = (acc[i] || 0) + amount))
      return acc
    }, [])

    const totalCollateralValuesFormatted = collateralAssets.map(
      (asset, i) => totalUsedCollateralAmountsFormatted[i] * initialPrices[asset]
    )

    const redeemCollateralRatios = totalCollateralValuesFormatted.map(
      x => x / (totalOTokensMinted * strikePriceFormatted * initialPrices[strikeAsset])
    )
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
