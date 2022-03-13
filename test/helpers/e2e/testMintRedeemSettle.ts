import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert } from 'chai'
import { OtokenCollateralsAmounts } from './types'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import { ethers, getNamedAccounts, network } from 'hardhat'
import { MarginPool, Oracle, Otoken, OtokenFactory, Whitelist } from '../../../typechain-types'
import { Controller } from '../../../typechain-types/Controller'
import { testVaultOwnersPrivateKeys } from '../../../utils/accounts'
import { AddressZero } from '../../../utils/ethers'
import { namedAccountsSigners } from '../../../utils/hardhat'
import { prettyObjectStringify } from '../../../utils/log'
import { waitNDays } from '../../../utils/time'
import { addDecimalsToAmount, getERC20BalanceOf, getERC20Decimals } from '../erc20'
import { TestDeployResult } from '../fixtures'
import { setStablePrices } from '../oracle'
import { CreateOtokenParamsObject, findOToken, oTokenDecimals, whitelistAndCreateOtoken } from '../otoken'
import { isEqual as _isEqual } from 'lodash'
import {
  OTokenParams,
  TestMintRedeemSettleParamsCheckpoints,
  TestMintRedeemSettleParams,
  TestMintRedeemSettleParamsVaultOwned,
  LongOwner,
  TestMintRedeemSettleParamsVault,
  LongOwnerWithSigner,
} from './types'
import { addExpiryToOtokenParams, calculateOtokenInfo, calculateRedeemForOtokenAmount, OtokenInfo } from './otoken'
import { burnVault, redeem, settleVault } from './controller'
import { assertSettleVault, depositMintInVault, openVaultAndMint } from './vaults'

// Maxiumum deviation of usd value of redeem and vault settle. Calculated from balances of redeemer and vault owner respectively
export const EXPECTED_DEVIATIONS = {
  redeemOneCollateralUsdValue: 2.5,
  redeemTotalUsdValue: 1,
  settleCollateralUsd: 3,
  redeemOneCollateralUsdPercentage: 0.7,
} as const

export const testMintRedeemSettleFactory = (getDeployResults: () => TestDeployResult) => {
  // Contracts
  return async <T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
    params: TestMintRedeemSettleParams<T, C>
  ) => {
    const { controller, whitelist, oTokenFactory, oracle, marginPool } = getDeployResults()
    // Init arguments
    const {
      user,
      deployer,
      redeemer,
      vaults,
      longsVaults,
      initialPrices,
      expiryPrices,
      mockERC20Owners,
      oTokenParams,
      expiryDays,
    } = await getInitParams(params)

    // Set initial prices
    await setStablePrices(oracle, deployer, params.initialPrices)

    const oToken = await createAndAssertOtoken(whitelist, oTokenFactory, deployer, oTokenParams, user)

    const longsInfo =
      longsVaults &&
      longsVaults.map(x =>
        calculateOtokenInfo({
          initialPrices,
          checkpoints: params.checkpointsDays,
          oTokenParams: x.oTokenParams,
          vaults: longsVaults,
        })
      )
    const shortInfo = calculateOtokenInfo({
      initialPrices,
      checkpoints: params.checkpointsDays,
      oTokenParams,
      vaults,
      longsOtokenInfo: longsInfo,
    })

    await initLongs(controller, marginPool, oTokenFactory, whitelist, longsVaults, vaults, deployer, mockERC20Owners)

    // Mint oTokens for vaults with oTokenAmountFormatted specified or 0 checkpoint
    //const initalMintVaults = vaults.filter(x => x.oTokenAmountFormatted)
    for (const vault of vaults) {
      const mintedAmount = await openVaultAndMint(
        controller,
        marginPool,
        vault,
        oToken,
        oTokenFactory,
        params.oTokenParams,
        vault.oTokenAmountFormatted,
        vault.longToDeposit,
        vault.longToDepositAmountFormatted,
        mockERC20Owners
      )
      await oToken.connect(vault.owner).transfer(redeemer.address, mintedAmount)
    }

    // Mint oTokens for checkpoints and wait time
    await mintOnCheckpoints(controller, marginPool, oToken, oracle, params, vaults, deployer, redeemer, mockERC20Owners)

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
    const { mintedAmount: totalOtokenRedeemableFormatted } = shortInfo
    const totalOtokenRedeemable = addDecimalsToAmount(totalOtokenRedeemableFormatted, oTokenDecimals)
    const redeemerBalanceAfterMint = await getERC20BalanceOf(redeemer, oToken.address)
    assert(
      redeemerBalanceAfterMint.eq(totalOtokenRedeemable),
      `Redeemer balance of oToken is not correct\n Expected: ${totalOtokenRedeemable}\n Got: ${redeemerBalanceAfterMint}`
    )

    // TODO it waits more days than needed when checkpoinDays provided in params
    await waitNDays(expiryDays + 1, network.provider)
    await setStablePrices(oracle, deployer, expiryPrices)

    await redeem(oToken, controller, redeemer, addDecimalsToAmount(totalOtokenRedeemableFormatted, oTokenDecimals))
    await assertRedeem(params, vaults, redeemer, longsInfo, totalOtokenRedeemableFormatted)

    // Settle minter vaults and assert that returned collateral matches expected
    for (const vault of vaults) {
      console.log(`Settle vault № ${vaults.indexOf(vault)}`)
      await settleVault(controller, vault)
      await assertSettleVault(params, vault, vaults, params.oTokenParams, shortInfo, longsInfo)
    }

    // Settle long owners vaults and assert that returned collateral matches expected
    for (const vault of longsVaults) {
      console.log(`Settle longsOwnersVaults vault № ${longsVaults.indexOf(vault)}`)
      const longInfo = longsInfo.find(x => _isEqual(vault.oTokenParams, x.oTokenParams))
      await settleVault(controller, vault)
      await assertSettleVault(params, vault, [vault], vault.oTokenParams, longInfo, [])
    }
  }
}

async function getInitParams<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  params: TestMintRedeemSettleParams<T, C>
) {
  const { user, deployer, redeemer } = await namedAccountsSigners(getNamedAccounts)
  const vaults: TestMintRedeemSettleParamsVaultOwned<T, C>[] = await Promise.all(
    params.vaults.map(async (v, i) => ({
      ...v,
      owner: await ethers.getSigner(new ethers.Wallet(testVaultOwnersPrivateKeys[i]).address),
    }))
  )
  const longsVaults: LongOwnerWithSigner = params.longsOwners
    ? await Promise.all(
        params.longsOwners.map(async (v, i) => ({
          ...v,
          owner: await ethers.getSigner(new ethers.Wallet(testVaultOwnersPrivateKeys[i + vaults.length]).address),
        }))
      )
    : []

  const { initialPrices, expiryPrices, mockERC20Owners } = params
  const oTokenParams = addExpiryToOtokenParams(params.oTokenParams)

  return {
    user,
    deployer,
    redeemer,
    vaults,
    longsVaults,
    initialPrices,
    expiryPrices,
    mockERC20Owners,
    oTokenParams,
    expiryDays: params.oTokenParams.expiryDays,
  }
}

async function createAndAssertOtoken(
  whitelist: Whitelist,
  oTokenFactory: OtokenFactory,
  deployer: SignerWithAddress,
  oTokenParams: CreateOtokenParamsObject,
  connectTo: SignerWithAddress
) {
  await whitelistAndCreateOtoken(
    {
      whitelist,
      oTokenFactory,
      protocolOwner: deployer,
      oTokenCreator: deployer,
    },
    oTokenParams
  )
  const otoken = await findOToken(connectTo, oTokenFactory, oTokenParams)
  assert(
    otoken.address !== AddressZero,
    `Long Otoken with address is zero. Otoken params:
     ${prettyObjectStringify(oTokenParams)}`
  )

  return otoken
}

async function assertRedeem<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  params: TestMintRedeemSettleParams<T, C>,
  vaults: TestMintRedeemSettleParamsVault<T, C>[],
  redeemer: SignerWithAddress,
  longsInfo: OtokenInfo[],
  redeemAmount: number
) {
  const { oTokenParams, expiryPrices } = params

  const totalRedeem = await calculateRedeemForOtokenAmount(
    params,
    params.oTokenParams,
    vaults,
    redeemer,
    longsInfo,
    redeemAmount
  )

  // Assert user gets right redeem
  let totalRedeemUsdRecieved = 0
  for (const [i, expectedCollateralAmountFormatted] of totalRedeem.collateralsFormatted.entries()) {
    const userCollateralBalance = await getERC20BalanceOf(redeemer, oTokenParams.collateralAssets[i])
    const collateralDecimals = await getERC20Decimals(redeemer, oTokenParams.collateralAssets[i])
    const userCollateralBalanceFormatted = Number(formatUnits(userCollateralBalance, collateralDecimals))

    const expireCollateralPrice = expiryPrices[oTokenParams.collateralAssets[i]]
    const userCollateralBalanceValue = userCollateralBalanceFormatted * expireCollateralPrice

    totalRedeemUsdRecieved += userCollateralBalanceValue

    const expectedCollateralValue = expectedCollateralAmountFormatted * expireCollateralPrice

    const deviationAmountFormatted = Math.abs(userCollateralBalanceFormatted - expectedCollateralAmountFormatted)

    const deviationUsdValue = deviationAmountFormatted * expireCollateralPrice
    const deviationUsdPercentage =
      userCollateralBalanceFormatted == 0
        ? deviationUsdValue === 0
          ? 0
          : 100
        : (deviationUsdValue / expectedCollateralValue) * 100

    assert(
      deviationUsdPercentage < EXPECTED_DEVIATIONS.redeemOneCollateralUsdPercentage,
      `
       Collateral ${i} redeem with wrong amount.
       Deviation USD value expected: < ${EXPECTED_DEVIATIONS.redeemOneCollateralUsdValue}, got:  ${deviationUsdValue}
       Deviation USD percentage expected:  < ${EXPECTED_DEVIATIONS.redeemOneCollateralUsdPercentage}%, got: ${deviationUsdPercentage}%
       Collateral amount expected: ${expectedCollateralAmountFormatted}, got: ${userCollateralBalanceFormatted}
      `
    )
  }

  // Check total redeem in usd is same as expected
  const totalRedeemUsdDeviation = Math.abs(totalRedeemUsdRecieved - totalRedeem.usd)
  assert(
    totalRedeemUsdDeviation < EXPECTED_DEVIATIONS.redeemTotalUsdValue,
    `
      Redeem with wrong total USD value.
      Expected: ${totalRedeem.usd}, got: ${totalRedeemUsdRecieved}
      Expected usd deviation: ${EXPECTED_DEVIATIONS.redeemTotalUsdValue}, got:  ${totalRedeemUsdDeviation}\n
    `
  )
}

async function mintOnCheckpoints<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  controller: Controller,
  marginPool: MarginPool,
  oToken: Otoken,
  oracle: Oracle,
  params: TestMintRedeemSettleParams<T, C>,
  vaults: TestMintRedeemSettleParamsVaultOwned<T, C>[],
  deployer: SignerWithAddress,
  redeemer: SignerWithAddress,
  mockERC20Owners: { [key: string]: SignerWithAddress }
) {
  const checkpoints = Object.keys(params.checkpointsDays || []).map(Number)
  for (const checkpoint of checkpoints) {
    await waitNDays(checkpoint, network.provider)
    await setStablePrices(oracle, deployer, params.checkpointsDays[checkpoint].prices)
    const vaultsToMintOnCheckpoint = vaults.filter(x => x.mintOnCheckoints?.[checkpoint])
    for (const vault of vaultsToMintOnCheckpoint) {
      const amountToMint = vault.mintOnCheckoints[checkpoint].oTokenAmountFormatted
      const collateralsAmount = vault.mintOnCheckoints[checkpoint]?.depositCollateralsAmounts
      const mintedAmount = await depositMintInVault(
        controller,
        marginPool,
        params.oTokenParams,
        vault,
        oToken,
        amountToMint,
        collateralsAmount,
        mockERC20Owners
      )
      await oToken.connect(vault.owner).transfer(redeemer.address, mintedAmount)
    }
  }
}

async function initLongs<T extends OTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  controller: Controller,
  marginPool: MarginPool,
  oTokenFactory: OtokenFactory,
  whitelist: Whitelist,
  longsVaults: LongOwnerWithSigner,
  shortVaults: TestMintRedeemSettleParamsVaultOwned<T, C>[],
  deployer: SignerWithAddress,
  mockERC20Owners: { [key: string]: SignerWithAddress }
) {
  for (const longVault of longsVaults) {
    const longOTokenParams = addExpiryToOtokenParams(longVault.oTokenParams)
    const oTokenAmount = parseUnits(longVault.oTokenAmountFormatted.toString(), oTokenDecimals)

    const longOtoken = await createAndAssertOtoken(whitelist, oTokenFactory, deployer, longOTokenParams, deployer)
    const mintedOTokenBalance = await openVaultAndMint(
      controller,
      marginPool,
      longVault,
      longOtoken,
      oTokenFactory,
      longOTokenParams,
      longVault.oTokenAmountFormatted,
      undefined,
      undefined,
      mockERC20Owners
    )
    assert(
      mintedOTokenBalance.eq(oTokenAmount),
      `Minted oToken balance is wrong.\n Expected ${oTokenAmount}, got ${mintedOTokenBalance}`
    )

    const vaultsToGetLong = shortVaults.filter(
      x => x.longToDepositAmountFormatted && x.longToDeposit && _isEqual(longVault.oTokenParams, x.longToDeposit)
    )
    for (const vaultToGetLong of vaultsToGetLong) {
      await longOtoken
        .connect(longVault.owner)
        .transfer(
          vaultToGetLong.owner.address,
          parseUnits(vaultToGetLong.longToDepositAmountFormatted.toString(), oTokenDecimals)
        )
    }
  }
}
