import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { assert } from 'chai'
import { parseUnits, formatUnits } from 'ethers/lib/utils'
import { ethers, getNamedAccounts, network } from 'hardhat'
import { MarginPool, Oracle, ONtoken, ONtokenFactory, Whitelist } from '../../../typechain-types'
import { Controller } from '../../../typechain-types/Controller'
import { testVaultOwnersPrivateKeys } from '../../../utils/accounts'
import { AddressZero } from '../../../utils/ethers'
import { namedAccountsSigners } from '../../../utils/hardhat'
import { prettyObjectStringify } from '../../../utils/log'
import { waitNDays } from '../../../utils/time'
import { addDecimalsToAmount, getERC20BalanceOf, getERC20Decimals } from '../erc20'
import { TestDeployResult } from '../fixtures'
import { setStablePrices } from '../oracle'
import { CreateONtokenParamsObject, findONToken, onTokenDecimals, whitelistAndCreateONtoken } from '../onToken'
import { isEqual as _isEqual } from 'lodash'
import {
  ONTokenParams,
  TestMintRedeemSettleParamsCheckpoints,
  TestMintRedeemSettleParams,
  TestMintRedeemSettleParamsVaultOwned,
  TestMintRedeemSettleParamsVault,
  LongOwnerWithSigner,
} from './types'
import { addExpiryToONtokenParams, calculateONtokenInfo, calculateRedeemForONtokenAmount, ONtokenInfo } from './onToken'
import { burnVault, redeem, settleVault } from './controller'
import { assertSettleVault, openVaultAndMint } from './vaults'

// Maxiumum deviation of usd value of redeem and vault settle. Calculated from balances of redeemer and vault owner respectively
export const EXPECTED_DEVIATIONS = {
  redeemOneCollateralUsdValue: 2.5,
  redeemTotalUsdValue: 1,
  settleTotalUsdValue: 1,
  settleCollateralUsdValue: 2,
  redeemOneCollateralUsdPercentage: 1,
} as const

export const testMintRedeemSettleFactory = (getDeployResults: () => TestDeployResult) => {
  // Contracts
  return async <T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
    params: TestMintRedeemSettleParams<T, C>
  ) => {
    const { controller, whitelist, onTokenFactory, oracle, marginPool } = getDeployResults()
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
      onTokenParams,
      expiryDays,
    } = await getInitParams(params)

    // Set initial prices
    await setStablePrices(oracle, deployer, params.initialPrices)

    const onToken = await createAndAssertONtoken(whitelist, onTokenFactory, deployer, onTokenParams, user)

    const longsInfo =
      longsVaults &&
      longsVaults.map(x =>
        calculateONtokenInfo({
          initialPrices,
          checkpoints: params.checkpointsDays,
          onTokenParams: x.onTokenParams,
          vaults: longsVaults,
        })
      )
    const shortInfo = calculateONtokenInfo({
      initialPrices,
      checkpoints: params.checkpointsDays,
      onTokenParams,
      vaults,
      longsONtokenInfo: longsInfo,
    })

    await initLongs(controller, marginPool, onTokenFactory, whitelist, longsVaults, vaults, deployer, mockERC20Owners)

    // Mint onTokens for vaults with onTokenAmountFormatted specified or 0 checkpoint
    const initalMintVaults = vaults.filter(x => x.onTokenAmountFormatted)
    for (const vault of initalMintVaults) {
      const mintedAmount = await openVaultAndMint(
        controller,
        marginPool,
        params.onTokenParams,
        onToken,
        vault,
        vault.onTokenAmountFormatted,
        onTokenFactory,
        vault.longToDeposit,
        vault.longToDepositAmountFormatted,
        mockERC20Owners
      )
      await onToken.connect(vault.owner).transfer(redeemer.address, mintedAmount)
    }

    // Mint onTokens for checkpoints and wait time
    await mintOnCheckpoints(
      controller,
      marginPool,
      onToken,
      oracle,
      onTokenFactory,
      params,
      vaults,
      deployer,
      redeemer,
      mockERC20Owners
    )

    // Get burn onTokens from redeemer
    for (const vault of vaults) {
      if (vault.burnAmountFormatted) {
        await onToken
          .connect(redeemer)
          .transfer(vault.owner.address, parseUnits(vault.burnAmountFormatted.toString(), onTokenDecimals))
      }
    }

    // Burn vaults
    const vaultsToBurn = vaults.filter(x => x.burnAmountFormatted)
    for (const vault of vaultsToBurn) {
      await burnVault(controller, onToken, vault)
    }

    // Check redeemer gets right amount of options
    const { mintedAmount: totalONtokenRedeemableFormatted } = shortInfo
    const totalONtokenRedeemable = addDecimalsToAmount(totalONtokenRedeemableFormatted, onTokenDecimals)
    const redeemerBalanceAfterMint = await getERC20BalanceOf(redeemer, onToken.address)
    assert(
      redeemerBalanceAfterMint.eq(totalONtokenRedeemable),
      `Redeemer balance of onToken is not correct\n Expected: ${totalONtokenRedeemable}\n Got: ${redeemerBalanceAfterMint}`
    )

    await waitNDays(expiryDays + 1, network.provider)
    await setStablePrices(oracle, deployer, expiryPrices)

    await redeem(onToken, controller, redeemer, addDecimalsToAmount(totalONtokenRedeemableFormatted, onTokenDecimals))
    await assertRedeem(params, vaults, redeemer, longsInfo, totalONtokenRedeemableFormatted)

    // Settle minter vaults and assert that returned collateral matches expected
    for (const vault of vaults) {
      console.log(`Settle vault № ${vaults.indexOf(vault)}`)
      await settleVault(controller, vault)
      await assertSettleVault(params, vault, vaults, params.onTokenParams, shortInfo, longsInfo)
    }

    // Settle long owners vaults and assert that returned collateral matches expected
    for (const vault of longsVaults) {
      console.log(`Settle longsOwnersVaults vault № ${longsVaults.indexOf(vault)}`)
      const longInfo = longsInfo.find(x => _isEqual(vault.onTokenParams, x.onTokenParams))
      await settleVault(controller, vault)
      await assertSettleVault(params, vault, [vault], vault.onTokenParams, longInfo, [])
    }
  }
}

async function getInitParams<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
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
  const onTokenParams = addExpiryToONtokenParams(params.onTokenParams)

  return {
    user,
    deployer,
    redeemer,
    vaults,
    longsVaults,
    initialPrices,
    expiryPrices,
    mockERC20Owners,
    onTokenParams,
    expiryDays: params.onTokenParams.expiryDays,
  }
}

async function createAndAssertONtoken(
  whitelist: Whitelist,
  onTokenFactory: ONtokenFactory,
  deployer: SignerWithAddress,
  onTokenParams: CreateONtokenParamsObject,
  connectTo: SignerWithAddress
) {
  await whitelistAndCreateONtoken(
    {
      whitelist,
      onTokenFactory,
      protocolOwner: deployer,
      onTokenCreator: deployer,
    },
    onTokenParams
  )
  const longONToken = await findONToken(connectTo, onTokenFactory, onTokenParams)
  assert(
    longONToken.address !== AddressZero,
    `Long ONtoken with address is zero. ONtoken params:
     ${prettyObjectStringify(onTokenParams)}`
  )

  return longONToken
}

async function assertRedeem<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  params: TestMintRedeemSettleParams<T, C>,
  vaults: TestMintRedeemSettleParamsVault<T, C>[],
  redeemer: SignerWithAddress,
  longsInfo: ONtokenInfo[],
  redeemAmount: number
) {
  const { onTokenParams, expiryPrices } = params

  const totalRedeem = await calculateRedeemForONtokenAmount(
    params,
    params.onTokenParams,
    vaults,
    redeemer,
    longsInfo,
    redeemAmount
  )

  // Assert user gets right redeem
  let totalRedeemUsdRecieved = 0
  for (const [i, expectedCollateralAmountFormatted] of totalRedeem.collateralsFormatted.entries()) {
    const userCollateralBalance = await getERC20BalanceOf(redeemer, onTokenParams.collateralAssets[i])
    const collateralDecimals = await getERC20Decimals(redeemer, onTokenParams.collateralAssets[i])
    const userCollateralBalanceFormatted = Number(formatUnits(userCollateralBalance, collateralDecimals))

    const expireCollateralPrice = expiryPrices[onTokenParams.collateralAssets[i]]
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

async function mintOnCheckpoints<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  controller: Controller,
  marginPool: MarginPool,
  onToken: ONtoken,
  oracle: Oracle,
  onTokenFactory: ONtokenFactory,
  params: TestMintRedeemSettleParams<T, C>,
  vaults: TestMintRedeemSettleParamsVaultOwned<T, C>[],
  deployer: SignerWithAddress,
  redeemer: SignerWithAddress,
  mockERC20Owners: { [key: string]: SignerWithAddress }
) {
  const checkpoints = Object.keys(params.checkpointsDays || [])
  let last_checkpont = 0
  for (const cumul_checkpoint of checkpoints) {
    let checkpoint = Number(cumul_checkpoint) - last_checkpont
    last_checkpont = Number(cumul_checkpoint)
    await waitNDays(Number(checkpoint), network.provider)
    await setStablePrices(oracle, deployer, params.checkpointsDays[cumul_checkpoint].prices)
    const vaultsToMintOnCheckpoint = vaults.filter(x => x.mintOnCheckoints?.[cumul_checkpoint])

    for (const vault of vaultsToMintOnCheckpoint) {
      const amountToMint = vault.mintOnCheckoints[cumul_checkpoint].onTokenAmountFormatted
      const mintedAmount = await openVaultAndMint(
        controller,
        marginPool,
        params.onTokenParams,
        onToken,
        vault,
        amountToMint,
        onTokenFactory,
        vault.longToDeposit,
        vault.longToDepositAmountFormatted,
        mockERC20Owners
      )
      await onToken.connect(vault.owner).transfer(redeemer.address, mintedAmount)
    }
  }
}

async function initLongs<T extends ONTokenParams, C extends TestMintRedeemSettleParamsCheckpoints<T>>(
  controller: Controller,
  marginPool: MarginPool,
  onTokenFactory: ONtokenFactory,
  whitelist: Whitelist,
  longsVaults: LongOwnerWithSigner,
  shortVaults: TestMintRedeemSettleParamsVaultOwned<T, C>[],
  deployer: SignerWithAddress,
  mockERC20Owners: { [key: string]: SignerWithAddress }
) {
  for (const longVault of longsVaults) {
    const longONTokenParams = addExpiryToONtokenParams(longVault.onTokenParams)
    const onTokenAmount = parseUnits(longVault.onTokenAmountFormatted.toString(), onTokenDecimals)

    const longONtoken = await createAndAssertONtoken(whitelist, onTokenFactory, deployer, longONTokenParams, deployer)
    const mintedONTokenBalance = await openVaultAndMint(
      controller,
      marginPool,
      longONTokenParams,
      longONtoken,
      longVault,
      longVault.onTokenAmountFormatted,
      onTokenFactory,
      undefined,
      undefined,
      mockERC20Owners
    )
    assert(
      mintedONTokenBalance.eq(onTokenAmount),
      `Minted onToken balance is wrong.\n Expected ${onTokenAmount}, got ${mintedONTokenBalance}`
    )

    const vaultsToGetLong = shortVaults.filter(
      x => x.longToDepositAmountFormatted && x.longToDeposit && _isEqual(longVault.onTokenParams, x.longToDeposit)
    )
    for (const vaultToGetLong of vaultsToGetLong) {
      await longONtoken
        .connect(longVault.owner)
        .transfer(
          vaultToGetLong.owner.address,
          parseUnits(vaultToGetLong.longToDepositAmountFormatted.toString(), onTokenDecimals)
        )
    }
  }
}
