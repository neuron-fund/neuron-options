import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '@ethersproject/wallet'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert } from 'chai'
import { parseUnits } from 'ethers/lib/utils'
import { ethers, getNamedAccounts, network, getUnnamedAccounts } from 'hardhat'
import { USDC, DAI, WETH } from '../../constants/externalAddresses'
import { Otoken } from '../../typechain-types'
import { ActionArgsStruct } from '../../typechain-types/Controller'
import { testVaultOwnersPrivateKeys } from '../../utils/accounts'
import { AddressZero } from '../../utils/ethers'
import { namedAccountsSigners } from '../../utils/hardhat'
import { createValidExpiry, waitNDays } from '../../utils/time'
import { FixedSizeArray } from '../../utils/types'
import { getAction, ActionType } from './actions'
import { addTokenDecimalsToAmount, approveERC20, getEthOrERC20BalanceFormatted, getERC20BalanceOf } from './erc20'
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
    const { expiryDays } = params.oTokenParams
    const oTokenParams = {
      ...params.oTokenParams,
      expiry: createValidExpiry(expiryDays),
    } as const

    const totalOtokenMintFormatted = params.vaults.reduce((a, b) => a + b.oTokenAmountFormatted, 0)
    const totalOtokenMint = parseUnits(totalOtokenMintFormatted.toString(), oTokenDecimals)
    console.log(`testMintRedeemSettleFactory ~ totalOtokenMint`, totalOtokenMint)

    await setStablePrices(oracle, deployer, params.initalPrices)
    console.log(`testMintRedeemSettleFactory ~ setStablePrices`)

    await whitelistAndCreateOtoken(
      {
        whitelist,
        oTokenFactory,
        protocolOwner: deployer,
        oTokenCreator: deployer,
      },
      oTokenParams
    )

    console.log(`testMintRedeemSettleFactory ~ whitelistAndCreateOtoken`)
    const oToken = await findOToken(user, oTokenFactory, oTokenParams)
    console.log(`testMintRedeemSettleFactory ~ findOToken`)
    assert(oToken.address !== AddressZero, 'Otoken address is zero')

    for (const vault of vaults) {
      const mintedAmount = await openVaultAndMint(testDeployResult, params.oTokenParams, oToken, vault)
      console.log(`testMintRedeemSettleFactory ~ openVaultAndMint`)
      await oToken.connect(vault.owner).transfer(redeemer.address, mintedAmount)
    }

    const redeemerBalanceAfterMint = await getERC20BalanceOf(redeemer, oToken.address)
    assert(
      redeemerBalanceAfterMint.eq(totalOtokenMint),
      `Redeemer balance is not correct\n Expected: ${totalOtokenMint}\n Got: ${redeemerBalanceAfterMint}`
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

    const redeem = await calculateRedeemForOtokenAmount(params, totalOtokenMintFormatted, redeemer)

    // Assert user gets right redeem
    for (const [i, collateralAmount] of redeem.collaterals.entries()) {
      const userCollateralBalance = await getERC20BalanceOf(redeemer, oTokenParams.collateralAssets[i])
      assert(
        userCollateralBalance.eq(collateralAmount),
        `Collateral ${i} redeem with wrong amount.\n
         Expected: ${collateralAmount}, got: ${userCollateralBalance}
        `
      )
    }

    for (const vault of vaults) {
      await settleVault(testDeployResult, vault)
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
  console.log(`collateralAmounts`, collateralAmounts)

  // Transfer collateral tokens from whales to user
  await Promise.all(collateralAmounts.map((amount, i) => getAssetFromWhale(collateralAssets[i], amount, owner.address)))
  // Approve collateral tokens for pending by controller
  await Promise.all(
    collateralAmounts.map((amount, i) => approveERC20(collateralAssets[i], amount, owner, marginPool.address))
  )
  console.log(`approveERC20`, approveERC20)

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

export async function calculateRedeemForOtokenAmount<T extends TestMintOTokenParams>(
  params: TestMintRedeemSettleParams<T>,
  oTokenAmountFormatted: number,
  signer: SignerWithAddress | Wallet
) {
  const { expiryPrices, vaults } = params
  const { collateralAssets, isPut, strikePriceFormatted, underlyingAsset } = params.oTokenParams

  const zero = {
    usd: 0,
    collaterals: collateralAssets.map(() => BigNumber.from(0)),
  }

  if (isPut) {
    const usdRedeemForOneOtoken = Math.max(strikePriceFormatted - expiryPrices[underlyingAsset], 0)

    if (usdRedeemForOneOtoken === 0) {
      return zero
    }

    const totalCollateralAmountsFormatted = collateralAssets.map((x, i) =>
      vaults.map(vault => vault.collateralAmountsFormatted[i]).reduce((a, b) => a + b, 0)
    )

    const totalCollateralAmounts = await Promise.all(
      collateralAssets.map((asset, i) => addTokenDecimalsToAmount(asset, totalCollateralAmountsFormatted[i], signer))
    )
    console.log(`totalCollateralAmounts`, totalCollateralAmounts)

    const totalCollateralValuesFormatted = collateralAssets.map(
      (asset, i) => totalCollateralAmountsFormatted[i] * expiryPrices[asset]
    )
    const totalCollateralValue = totalCollateralAmountsFormatted.reduce((a, b) => a + b, 0)
    const redeemCollateralRatios = totalCollateralValuesFormatted.map(x => x / totalCollateralValue)
    const redeemUsd = usdRedeemForOneOtoken * oTokenAmountFormatted
    const redeemCollateralValuesUsdc = redeemCollateralRatios.map(x => x * redeemUsd)
    const redeemCollateralAmountsFormatted = redeemCollateralValuesUsdc.map(
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
