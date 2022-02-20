import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '@ethersproject/wallet'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert } from 'chai'
import { isEqual } from 'date-fns'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import { ethers, getNamedAccounts, network } from 'hardhat'
import { ERC20Interface__factory, MockERC20__factory, Otoken, OtokenFactory } from '../../typechain-types'
import { ActionArgsStruct, Controller } from '../../typechain-types/Controller'
import { testVaultOwnersPrivateKeys } from '../../utils/accounts'
import { AddressZero } from '../../utils/ethers'
import { namedAccountsSigners } from '../../utils/hardhat'
import { prettyObjectStringify } from '../../utils/log'
import { createValidExpiry, waitNDays } from '../../utils/time'
import { FixedSizeArray } from '../../utils/types'
import { getAction, ActionType } from './actions'
import {
  addDecimalsToAmount,
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
import { isEqual as _isEqual } from 'lodash'
import { mapPlusArray } from '../../utils/array'

export type OTokenParams = {
  collateralAssets: readonly string[]
  underlyingAsset: string
  strikeAsset: string
  strikePriceFormatted: number
  expiryDays: number
  isPut: boolean
}

export type VaultCheckpointsMint<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>> = {
  [key in keyof C]?: { oTokenAmountFormatted: number }
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

export type TestMintRedeemSettleParams<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>> = {
  oTokenParams: T
  vaults: readonly TestMintRedeemSettleParamsVault<T, C>[]
  longsOwners?: readonly LongOwner[]
  initialPrices: OTokenPrices<T>
  expiryPrices: OTokenPrices<T>
  checkpointsDays?: C
  mockERC20Owners?: { [key: string]: SignerWithAddress }
}

// Maxiumum deviation of usd value of redeem and vault settle. Calculated from balances of redeemer and vault owner respectively
const expectedRedeemOneCollateralUsdDeviation = 2.5
const expectedRedeemTotalUsdDeviation = 1
const expectedSettleCollateralUsdDeviation = 2

export const testMintRedeemSettleFactory = (getDeployResults: () => TestDeployResult) => {
  return async <T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
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

    const { initialPrices, expiryPrices, mockERC20Owners } = params
    const { expiryDays } = params.oTokenParams
    const oTokenParams = {
      ...params.oTokenParams,
      expiry: createValidExpiry(expiryDays),
    } as const

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

    const longsOwnersVaults: (LongOwner & { owner: SignerWithAddress })[] = params.longsOwners
      ? await Promise.all(
          params.longsOwners.map(async (v, i) => ({
            ...v,
            owner: await ethers.getSigner(new ethers.Wallet(testVaultOwnersPrivateKeys[i + vaults.length]).address),
          }))
        )
      : []

    const longsAmountsUsed = longsOwnersVaults.map(x => {
      const { collateralsUsedAmounts } = calculateMintUsedCollaterals(
        x.oTokenParams,
        x.oTokenAmountFormatted,
        x.collateralAmountsFormatted,
        initialPrices
      )
      const collateralsUsedValues = collateralsUsedAmounts.map(
        (a, i) => a * initialPrices[x.oTokenParams.collateralAssets[i]]
      )
      return {
        oTokenParams: x.oTokenParams,
        mintedAmount: x.oTokenAmountFormatted,
        collateralsUsedAmounts,
        collateralsUsedValues,
      }
    })
    for (const longVault of longsOwnersVaults) {
      const longOTokenParams = {
        ...longVault.oTokenParams,
        expiry: createValidExpiry(longVault.oTokenParams.expiryDays),
      } as const

      await whitelistAndCreateOtoken(
        {
          whitelist,
          oTokenFactory,
          protocolOwner: deployer,
          oTokenCreator: deployer,
        },
        longOTokenParams
      )
      const longOToken = await findOToken(user, oTokenFactory, longOTokenParams)
      assert(
        longOToken.address !== AddressZero,
        `Long Otoken with address is zero. Otoken params:
         ${prettyObjectStringify(longOTokenParams)}`
      )

      await openVaultAndMint(
        testDeployResult,
        longOTokenParams,
        longOToken,
        longVault,
        longVault.oTokenAmountFormatted,
        oTokenFactory,
        undefined,
        undefined,
        mockERC20Owners
      )

      const vaultsToGetLong = vaults.filter(
        x => x.longToDepositAmountFormatted && x.longToDeposit && _isEqual(longVault.oTokenParams, x.longToDeposit)
      )
      for (const vaultToGetLong of vaultsToGetLong) {
        await longOToken
          .connect(longVault.owner)
          .transfer(
            vaultToGetLong.owner.address,
            parseUnits(vaultToGetLong.longToDepositAmountFormatted.toString(), oTokenDecimals)
          )
      }
    }

    // Mint oTokens for vaults with oTokenAmountFormatted specified or 0 checkpoint
    const initalMintVaults = vaults.filter(x => x.oTokenAmountFormatted)
    for (const vault of initalMintVaults) {
      const mintedAmount = await openVaultAndMint(
        testDeployResult,
        params.oTokenParams,
        oToken,
        vault,
        vault.oTokenAmountFormatted,
        oTokenFactory,
        vault.longToDeposit,
        vault.longToDepositAmountFormatted,
        mockERC20Owners
      )
      await oToken.connect(vault.owner).transfer(redeemer.address, mintedAmount)
    }

    // Mint oTokens for checkpoints and wait time
    const checkpoints = Object.keys(params.checkpointsDays || [])
    for (const checkpoint of checkpoints) {
      await waitNDays(Number(checkpoint), network.provider)
      await setStablePrices(oracle, deployer, params.checkpointsDays[checkpoint].prices)
      const vaultsToMintOnCheckpoint = vaults.filter(x => x.mintOnCheckoints?.[checkpoint])
      for (const vault of vaultsToMintOnCheckpoint) {
        const amountToMint = vault.mintOnCheckoints[checkpoint].oTokenAmountFormatted
        const mintedAmount = await openVaultAndMint(
          testDeployResult,
          params.oTokenParams,
          oToken,
          vault,
          amountToMint,
          oTokenFactory,
          vault.longToDeposit,
          vault.longToDepositAmountFormatted,
          mockERC20Owners
        )
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

    // Check redeemer gets right amount of options
    const totalOtokenRedeemableFormatted = params.vaults.reduce((a, vault) => {
      const longOTokenInfo = longsAmountsUsed.find(x => _isEqual(x.oTokenParams, vault.longToDeposit))
      const { totalOTokenMint } = calculateVaultTotalMint(
        params.oTokenParams,
        initialPrices,
        vault,
        params.checkpointsDays,
        longOTokenInfo
      )
      return a + totalOTokenMint - (vault.burnAmountFormatted || 0)
    }, 0)

    const totalOtokenRedeemable = addDecimalsToAmount(totalOtokenRedeemableFormatted, oTokenDecimals)
    const redeemerBalanceAfterMint = await getERC20BalanceOf(redeemer, oToken.address)
    assert(
      redeemerBalanceAfterMint.eq(totalOtokenRedeemable),
      `Redeemer balance of oToken is not correct\n Expected: ${totalOtokenRedeemable}\n Got: ${redeemerBalanceAfterMint}`
    )

    // TODO it waits more days then needed when checkpoinDays provided in params
    await waitNDays(expiryDays + 1, network.provider)
    await setStablePrices(oracle, deployer, expiryPrices)

    await oToken.connect(redeemer).approve(controller.address, totalOtokenRedeemable)

    const redeemActions: ActionArgsStruct[] = [
      getAction(ActionType.Redeem, {
        amount: [totalOtokenRedeemable],
        otoken: [oToken.address],
        receiver: redeemer.address,
      }),
    ]
    const totalRedeem = await calculateRedeemForOtokenAmount(
      params,
      totalOtokenRedeemableFormatted,
      redeemer,
      longsAmountsUsed
    )
    await controller.connect(redeemer).operate(redeemActions)

    // Assert user gets right redeem
    let totalRedeemUsdRecieved = 0
    for (const [i, expectedCollateralAmount] of totalRedeem.collaterals.entries()) {
      const userCollateralBalance = await getERC20BalanceOf(redeemer, oTokenParams.collateralAssets[i])
      const collateralDecimals = await getERC20Decimals(redeemer, oTokenParams.collateralAssets[i])
      const expireCollateralPrice = expiryPrices[oTokenParams.collateralAssets[i]]
      totalRedeemUsdRecieved =
        totalRedeemUsdRecieved + Number(formatUnits(userCollateralBalance, collateralDecimals)) * expireCollateralPrice
      const deviationAmount = userCollateralBalance.sub(expectedCollateralAmount).abs()
      const deviationAmountFormatted = Number(formatUnits(deviationAmount, collateralDecimals))
      const deviationUsdValue = deviationAmountFormatted * expireCollateralPrice
      assert(
        deviationUsdValue < expectedRedeemOneCollateralUsdDeviation,
        `
         Collateral ${i} redeem with wrong amount.
         Expected: ${expectedCollateralAmount}, got: ${userCollateralBalance}
         Expected usd deviation: ${expectedRedeemOneCollateralUsdDeviation}, got:  ${deviationUsdValue}\n
        `
      )
    }

    // Check total redeem in usd is same as expected
    const totalRedeemUsdDeviation = Math.abs(totalRedeemUsdRecieved - totalRedeem.usd)
    assert(
      totalRedeemUsdDeviation < expectedRedeemTotalUsdDeviation,
      `
       Redeem with wrong total USD value.
       Expected: ${totalRedeem.usd}, got: ${totalRedeemUsdRecieved}
       Expected usd deviation: ${expectedRedeemTotalUsdDeviation}, got:  ${totalRedeemUsdDeviation}\n
      `
    )

    // Settle minter vaults and assert that returned collateral matches expected
    for (const vault of vaults) {
      console.log(`Settle vault № ${vaults.indexOf(vault)}`)
      await assertSettleVault(testDeployResult, params, vault, params.oTokenParams, longsAmountsUsed)
    }

    // Settle long owners vaults and assert that returned collateral matches expected
    for (const vault of longsOwnersVaults) {
      console.log(`Settle longsOwnersVaults vault № ${longsOwnersVaults.indexOf(vault)}`)
      await assertSettleVault(testDeployResult, params, vault, vault.oTokenParams, [])
    }
  }
}

export async function openVaultAndMint<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  testDeployResult: TestDeployResult,
  oTokenParamsRaw: T,
  oToken: Otoken,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>,
  oTokenAmountFormatted: number,
  oTokenFactory: OtokenFactory,
  longOtoken?: OTokenParams,
  longDepositAmountFormatted?: number,
  mockERC20Owners?: { [key: string]: SignerWithAddress }
) {
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
      getFunds(collateralAssets[i], amount, owner.address, mockERC20Owners)
      // Approve collateral tokens for pending by controller
      await approveERC20(collateralAssets[i], amount, owner, marginPool.address)
    }
  }

  const longOTokenParams =
    longOtoken &&
    ({
      ...longOtoken,
      expiry: createValidExpiry(longOtoken.expiryDays),
    } as const)
  const longOToken = longOTokenParams && (await findOToken(owner, oTokenFactory, longOTokenParams))
  const longToDeposit = longDepositAmountFormatted && parseUnits(longDepositAmountFormatted.toString(), oTokenDecimals)
  if (longOToken) {
    await approveERC20(longOToken.address, longToDeposit, owner, marginPool.address)
  }

  const openVaultAction = getAction(ActionType.OpenVault, {
    owner: owner.address,
    shortOtoken: oToken.address,
    vaultId,
  })

  const depositCollateralAction = getAction(ActionType.DepositCollateral, {
    owner: owner.address,
    amounts: collateralAmounts,
    assets: [...collateralAssets],
    vaultId,
    from: owner.address,
  })

  const depositLongAction =
    longOToken &&
    getAction(ActionType.DepositLongOption, {
      owner: owner.address,
      from: owner.address,
      longOtoken: [longOToken.address],
      amount: [longToDeposit],
      vaultId,
    })

  const openAndDepositActions = [openVaultAction, depositCollateralAction, depositLongAction].filter(Boolean)

  const mintActions: ActionArgsStruct[] = [
    ...(!isVaultAlreadyOpened && openAndDepositActions),
    getAction(ActionType.MintShortOption, {
      owner: owner.address,
      amount: [oTokenAmount],
      vaultId,
      otoken: [oToken.address],
      to: owner.address,
    }),
  ].filter(Boolean)

  await controller.connect(owner).operate(mintActions)

  const mintedOTokenBalance = await oToken.balanceOf(owner.address)
  assert(
    mintedOTokenBalance.eq(oTokenAmount),
    `Minted oToken balance is wrong.\n Expected ${oTokenAmount}, got ${mintedOTokenBalance}`
  )
  return mintedOTokenBalance
}

export async function settleVault<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
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

  const isVaultAlreadyOpened = (await controller.accountVaultCounter(owner.address)).toNumber()
  console.log(`isVaultAlreadyOpened`, isVaultAlreadyOpened)

  await controller.connect(owner).operate(settleVaultActions)
}

export function getStrikeRedeemForOneOtoken<T extends OTokenParams>(oTokenParams: T, prices: OTokenPrices<T>) {
  const { strikePriceFormatted, underlyingAsset, strikeAsset, isPut } = oTokenParams
  const expiryPriceInStrike = prices[underlyingAsset] / prices[strikeAsset]
  return isPut
    ? Math.max(strikePriceFormatted - expiryPriceInStrike, 0)
    : Math.max(expiryPriceInStrike - strikePriceFormatted, 0)
}

export function getUsdRedeemForOneOtoken<T extends OTokenParams>(oTokenParams: T, prices: OTokenPrices<T>) {
  const { strikeAsset } = oTokenParams
  return getStrikeRedeemForOneOtoken(oTokenParams, prices) * prices[strikeAsset]
}

export async function calculateRedeemForOtokenAmount<
  T extends OTokenParams,
  C extends TestMintRedeemSettleParamsCheckpoints<T>
>(
  params: TestMintRedeemSettleParams<T, C>,
  oTokenAmountFormatted: number,
  signer: SignerWithAddress | Wallet,
  longsAmountsUsed: {
    oTokenParams: OTokenParams
    mintedAmount: number
    collateralsUsedAmounts: number[]
    collateralsUsedValues: number[]
  }[]
) {
  const { expiryPrices, vaults, initialPrices, checkpointsDays } = params
  const { collateralAssets } = params.oTokenParams

  const zero = {
    usd: 0,
    collaterals: collateralAssets.map(() => BigNumber.from(0)),
    collateralsFormatted: collateralAssets.map(() => 0),
  }
  const usdRedeemForOneOtoken = getUsdRedeemForOneOtoken(params.oTokenParams, expiryPrices)
  const redeemUsd = usdRedeemForOneOtoken * oTokenAmountFormatted
  if (redeemUsd === 0) {
    return zero
  }

  const collateralValuesFormatted = vaults
    .map(vault => {
      const longOTokenInfo = longsAmountsUsed.find(x => _isEqual(x.oTokenParams, vault.longToDeposit))
      const { usedCollateralsValues, longCollateralsValuesUsed } = calculateVaultTotalMint(
        params.oTokenParams,
        initialPrices,
        vault,
        checkpointsDays,
        longOTokenInfo
      )
      return mapPlusArray(usedCollateralsValues, longCollateralsValuesUsed)
    })
    .reduce((acc, b) => {
      b.forEach((amount, i) => (acc[i] = (acc[i] || 0) + amount))
      return acc
    }, [])

  const totalReservedCollateralValue = collateralValuesFormatted.reduce((acc, b) => acc + b, 0)

  const redeemCollateralRatios = collateralValuesFormatted.map(x => x / totalReservedCollateralValue)
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
}

export function calculateVaultTotalMint<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  oTokenParams: T,
  initialPrices: OTokenPrices<T>,
  vault: TestMintRedeemSettleParamsVault<T, C>,
  checkpoints?: C,
  longOtokenInfo?: {
    oTokenParams: OTokenParams
    mintedAmount: number
    collateralsUsedAmounts: number[]
    collateralsUsedValues: number[]
  }
) {
  const initialMintAmount = vault.oTokenAmountFormatted || 0
  const mintOnCheckpointsAmount = Object.values(vault.mintOnCheckoints || {}).reduce(
    (x, c) => x + c.oTokenAmountFormatted,
    0
  )
  const vaultTotalMintAmount = initialMintAmount + mintOnCheckpointsAmount

  let longOTokenAmountLeftFormatted = vault.longToDepositAmountFormatted || 0
  const longOTokenParams = vault.longToDeposit
  let usedCollateralAmounts: number[] = oTokenParams.collateralAssets.map(() => 0)
  // Initial mint calculations
  if (vault.oTokenAmountFormatted) {
    const used = calculateMintUsedCollaterals(
      oTokenParams,
      vault.oTokenAmountFormatted,
      vault.collateralAmountsFormatted,
      initialPrices,
      longOTokenParams,
      longOTokenAmountLeftFormatted
    )
    usedCollateralAmounts = used.collateralsUsedAmounts
    longOTokenAmountLeftFormatted = longOTokenAmountLeftFormatted - used.longUsedAmount
  }

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
    ) as unknown as OtokenCollateralsAmounts<T>
    const isValid = collateralAmountsLeft.some(x => x >= 0)
    assert(isValid, `Not enough collateral for checkpoint ${checkpoint} for vault ${prettyObjectStringify(vault)}`)

    const { collateralsUsedAmounts: amountForThisMint, longUsedAmount } = calculateMintUsedCollaterals(
      oTokenParams,
      vaultCheckpoint.oTokenAmountFormatted,
      collateralAmountsLeft,
      checkpoints[checkpoint].prices,
      longOTokenParams,
      longOTokenAmountLeftFormatted
    )

    longOTokenAmountLeftFormatted = longOTokenAmountLeftFormatted - longUsedAmount

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

  const usedCollateralsAfterBurn = usedCollateralAmounts.map((x, i) => x - burnedCollateralAmounts[i])
  const usedCollateralsValuesAfterBurn = usedCollateralsValues.map((x, i) => x - burnedCollateralValues[i])

  const totalOTokenMintAfterBurn = vaultTotalMintAmount - (vault.burnAmountFormatted || 0)
  const longAmountUsed = vault.longToDepositAmountFormatted
    ? Math.min(vault.longToDepositAmountFormatted - longOTokenAmountLeftFormatted, totalOTokenMintAfterBurn)
    : 0

  const longUsedToTotalRatio = longOtokenInfo && longAmountUsed ? longAmountUsed / longOtokenInfo.mintedAmount : 0

  const longCollateralsValuesUsed = longUsedToTotalRatio
    ? longOtokenInfo?.collateralsUsedValues.map((x, i) => x * longUsedToTotalRatio)
    : oTokenParams.collateralAssets.map(() => 0)

  return {
    totalOTokenMint: vaultTotalMintAmount,
    totalOTokenMintAfterBurn,
    usedCollaterals: usedCollateralsAfterBurn,
    usedCollateralsValues: usedCollateralsValuesAfterBurn,
    longAmountUsed,
    longCollateralsValuesUsed,
  }
}

export function calculateMintUsedCollaterals<T extends OTokenParams>(
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
  return {
    collateralsUsedAmounts: usedCollateralsRatios.map((x, i) => (x * marginRequiredUsd) / prices[collateralAssets[i]]),
    longUsedAmount,
  }
}

export async function burnVault<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
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

export function getPutSpreadMarginRequired(
  shortAmount: number,
  shortStrike: number,
  longAmount?: number,
  longStrike?: number
) {
  const longAmountUsed = longAmount && longStrike ? Math.min(shortAmount, longAmount) : 0

  return {
    marginRequired: Math.max(shortAmount * shortStrike - (longStrike || 0) * (longAmountUsed || 0), 0),
    longAmountUsed,
  }
}

export function getCallSpreadMarginRequired(
  shortAmount: number,
  shortStrike: number,
  longAmount?: number,
  longStrike?: number
) {
  // max (short amount - long amount , 0)
  if (!longStrike || !longAmount) {
    return {
      marginRequired: shortAmount,
      longAmountUsed: 0,
    }
  }

  /**
   *             (long strike - short strike) * short amount
   * calculate  ----------------------------------------------
   *                             long strike
   */
  const firstPart = ((longStrike - shortStrike) * shortAmount) / longStrike

  /**
   * calculate max ( short amount - long amount , 0)
   */
  const secondPart = Math.max(shortAmount - longAmount, 0)

  const longAmountUsed = longStrike === 0 ? 0 : Math.min(shortAmount, longAmount)

  return {
    marginRequired: Math.max(firstPart, secondPart),
    longAmountUsed,
  }
}

export function getExpiredSpreadCashValue(
  shortAmount: number,
  longAmount: number,
  shortCashValue: number,
  longCashValue: number
) {
  const result = shortCashValue * shortAmount - longCashValue * longAmount
  return result > 0 ? result : 0
}

export async function assertSettleVault<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  testDeployResult: TestDeployResult,
  params: TestMintRedeemSettleParams<T, C>,
  vault: TestMintRedeemSettleParamsVaultOwned<T, C>,
  shortOTokenParams: T,
  longsAmountsUsed: {
    oTokenParams: OTokenParams
    mintedAmount: number
    collateralsUsedAmounts: number[]
    collateralsUsedValues: number[]
  }[]
) {
  await settleVault(testDeployResult, vault)
  const { initialPrices, expiryPrices } = params
  const longOTokenParams = vault.longToDeposit

  const strikeRedeemForOneShortOtoken = getStrikeRedeemForOneOtoken(shortOTokenParams, expiryPrices)

  const longOTokenInfo = longsAmountsUsed.find(x => _isEqual(x.oTokenParams, longOTokenParams))
  const {
    usedCollateralsValues,
    totalOTokenMintAfterBurn: totalOTokenRedeemable,
    longAmountUsed,
  } = calculateVaultTotalMint(params.oTokenParams, initialPrices, vault, params.checkpointsDays, longOTokenInfo)
  const strikeRedeemForOneLongOtoken = longOTokenParams
    ? getStrikeRedeemForOneOtoken(longOTokenParams, expiryPrices)
    : 0
  const spreadStrikeRedeemAmount = getExpiredSpreadCashValue(
    totalOTokenRedeemable,
    longAmountUsed,
    strikeRedeemForOneShortOtoken,
    strikeRedeemForOneLongOtoken
  )
  const totalUsedCollateralsValue = usedCollateralsValues.reduce((acc, b, i) => (acc += b), 0)

  const vaultCollateralsRedeemRatio = usedCollateralsValues.map((collateralValue, i) =>
    totalUsedCollateralsValue === 0 ? 1 : collateralValue / totalUsedCollateralsValue
  )
  const vaultCollateralsRedeemStrikeValues = vaultCollateralsRedeemRatio.map(ratio => ratio * spreadStrikeRedeemAmount)
  const vaultCollateralsRedeemAmountsFormatted = vaultCollateralsRedeemStrikeValues.map(
    (strikeValue, i) =>
      (strikeValue * expiryPrices[shortOTokenParams.strikeAsset]) / expiryPrices[shortOTokenParams.collateralAssets[i]]
  )

  const expectedCollateralsLeftFormatted = vault.collateralAmountsFormatted.map(
    (c, i) => c - vaultCollateralsRedeemAmountsFormatted[i]
  )
  const expectedCollateralsLeftValuesFormatted = expectedCollateralsLeftFormatted.map(
    (c, i) => c * expiryPrices[shortOTokenParams.collateralAssets[i]]
  )

  const collateralsLeftFormatted = await Promise.all(
    shortOTokenParams.collateralAssets.map((c, i) => getEthOrERC20BalanceFormatted(vault.owner, c))
  )
  const collateralsLeftValuesFormatted = collateralsLeftFormatted.map(
    (c, i) => c * params.expiryPrices[shortOTokenParams.collateralAssets[i]]
  )
  for (const [i, collateralAsset] of shortOTokenParams.collateralAssets.entries()) {
    const deviationValue = Math.abs(collateralsLeftValuesFormatted[i] - expectedCollateralsLeftValuesFormatted[i])
    assert(
      deviationValue < expectedSettleCollateralUsdDeviation,
      `
        Collateral ${i}, ${collateralAsset} settled with wrong usd value.
        Expected: ${expectedCollateralsLeftValuesFormatted[i]}, got: ${collateralsLeftValuesFormatted[i]}
        Expected usd deviation: ${expectedSettleCollateralUsdDeviation}, got:  ${deviationValue}
      `
    )
  }
}

export function calculateMarginRequired<T extends OTokenParams>(
  mintAmount: number,
  shortOtokenParams: T,
  prices: OTokenPrices<T>,
  longOtokenParams?: OTokenParams,
  longAmount?: number
) {
  const { strikePriceFormatted: shortStrikePriceFormatted, strikeAsset, underlyingAsset, isPut } = shortOtokenParams

  let marginRequired: number
  let longUsedAmount = 0
  if (longOtokenParams && longAmount) {
    const spreadMargin = isPut
      ? getPutSpreadMarginRequired(
          mintAmount,
          shortStrikePriceFormatted,
          longAmount,
          longOtokenParams?.strikePriceFormatted
        )
      : getCallSpreadMarginRequired(
          mintAmount,
          shortStrikePriceFormatted,
          longAmount,
          longOtokenParams?.strikePriceFormatted
        )
    marginRequired = spreadMargin.marginRequired
    longUsedAmount = spreadMargin.longAmountUsed
  } else {
    marginRequired = isPut ? shortStrikePriceFormatted * mintAmount : mintAmount
  }

  const marginRequiredUsd = isPut ? marginRequired * prices[strikeAsset] : marginRequired * prices[underlyingAsset]

  return {
    marginRequired,
    marginRequiredUsd,
    longUsedAmount,
  }
}

export async function getFunds(
  asset: string,
  amount: BigNumber,
  reciever: string,
  mockERC20Owners?: { [key: string]: SignerWithAddress }
) {
  if (mockERC20Owners?.[asset]) {
    const mockERC20Owner = mockERC20Owners[asset]
    await MockERC20__factory.connect(asset, mockERC20Owner).mint(reciever, amount)
  } else {
    await getAssetFromWhale(asset, amount, reciever)
  }
}
