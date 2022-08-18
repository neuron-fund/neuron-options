import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { assert, expect } from 'chai'
import { ethers, getNamedAccounts } from 'hardhat'
import { USDC, DAI, WETH } from '../constants/externalAddresses'
import { ONtoken } from '../typechain-types'
import { ActionArgsStruct } from '../typechain-types/Controller'
import { namedAccountsSigners } from '../utils/hardhat'
import { createValidExpiry } from '../utils/time'
import { ActionType, getAction } from './helpers/actions'
import { addTokenDecimalsToAmount, approveERC20 } from './helpers/erc20'
import { testDeploy } from './helpers/fixtures'
import { getAssetFromWhale } from './helpers/funds'
import { CreateONtokenParamsObject, findONToken, whitelistAndCreateONtoken } from './helpers/onToken'

describe('Open Vault, Deposit collateral, Mint ONtoken', function() {
  it('Open Vault, Deposit collateral, Mint ONtoken', async () => {
    const { user, deployer } = await namedAccountsSigners(getNamedAccounts)
    const { controller, whitelist, onTokenFactory, marginPool } = await testDeploy()

    const onTokenParams: CreateONtokenParamsObject = {
      collateralAssets: [USDC, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiry: createValidExpiry(7),
      collateralConstraints: [0, 0],
      isPut: true,
    }

    await whitelistAndCreateONtoken(
      {
        whitelist,
        onTokenFactory,
        protocolOwner: deployer,
        onTokenCreator: user,
      },
      onTokenParams,
    )

    const onToken = await findONToken(user, onTokenFactory, onTokenParams)
    const collateralAmountsNoDecimals = [3800, 3800]
    const collateralAmounts = await Promise.all(
      collateralAmountsNoDecimals.map(async (amount, i) =>
        addTokenDecimalsToAmount(onTokenParams.collateralAssets[i], amount, user),
      ),
    )

    const amountOfONTokensToMint = parseUnits('1', BigNumber.from(8))

    // Transfer collateral tokens from whales to user
    await Promise.all(
      collateralAmounts.map((amount, i) => getAssetFromWhale(onTokenParams.collateralAssets[i], amount, user.address)),
    )
    // Approve collateral tokens for spending by controller
    await Promise.all(
      collateralAmounts.map((amount, i) =>
        approveERC20(onTokenParams.collateralAssets[i], amount, user, marginPool.address),
      ),
    )

    const vaultId = 1
    const actions: ActionArgsStruct[] = [
      getAction(ActionType.OpenVault, {
        owner: user.address,
        shortONtoken: onToken.address,
        vaultId,
      }),
      getAction(ActionType.DepositCollateral, {
        owner: user.address,
        amounts: collateralAmounts,
        assets: [...onTokenParams.collateralAssets],
        vaultId,
        from: user.address,
      }),
      getAction(ActionType.MintShortOption, {
        owner: user.address,
        amount: [amountOfONTokensToMint],
        vaultId,
        to: user.address,
      }),
    ]

    await controller.connect(user).operate(actions)

    const mintedONTokenBalance = await onToken.balanceOf(user.address)
    assert(mintedONTokenBalance.eq(amountOfONTokensToMint))
  })
})
