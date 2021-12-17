import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from '@ethersproject/units'
import { assert, expect } from 'chai'
import { ethers, getNamedAccounts } from 'hardhat'
import { USDC, DAI, WETH } from '../constants/externalAddresses'
import { Otoken } from '../typechain-types'
import { ActionArgsStruct } from '../typechain-types/Controller'
import { namedAccountsSigners } from '../utils/hardhat'
import { createValidExpiry } from '../utils/time'
import { ActionType, getAction } from './helpers/actions'
import { addTokenDecimalsToAmount, approveERC20 } from './helpers/erc20'
import { deploy } from './helpers/fixtures'
import { getAssetFromWhale } from './helpers/funds'
import { CreateOtokenParamsObject, findOToken, whitelistAndCreateOtoken } from './helpers/otoken'

describe('Open Vault, Deposit collateral, Mint Otoken', function () {
  it('Open Vault, Deposit collateral, Mint Otoken', async () => {
    const { user, deployer } = await namedAccountsSigners(getNamedAccounts)
    const { controller, whitelist, oTokenFactory, marginPool } = await deploy()

    const oTokenParams: CreateOtokenParamsObject = {
      collateralAssets: [USDC, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceReadable: 3800,
      expiry: createValidExpiry(7),
      isPut: true,
    }

    await whitelistAndCreateOtoken(
      {
        whitelist,
        oTokenFactory,
        protocolOwner: deployer,
        oTokenCreator: user,
      },
      oTokenParams
    )

    const oToken = await findOToken(user, oTokenFactory, oTokenParams)
    const collateralAmountsNoDecimals = [3800, 3800]
    const collateralAmounts = await Promise.all(
      collateralAmountsNoDecimals.map(async (amount, i) =>
        addTokenDecimalsToAmount(oTokenParams.collateralAssets[i], amount, user)
      )
    )

    const amountOfOTokensToMint = parseUnits('1', BigNumber.from(8))

    // Transfer collateral tokens from whales to user
    await Promise.all(
      collateralAmounts.map((amount, i) => getAssetFromWhale(oTokenParams.collateralAssets[i], amount, user.address))
    )
    // Approve collateral tokens for spending by controller
    await Promise.all(
      collateralAmounts.map((amount, i) =>
        approveERC20(oTokenParams.collateralAssets[i], amount, user, marginPool.address)
      )
    )

    const vaultId = 1
    const actions: ActionArgsStruct[] = [
      getAction(ActionType.OpenVault, {
        owner: user.address,
        shortOtoken: oToken.address,
        vaultId,
      }),
      getAction(ActionType.DepositCollateral, {
        owner: user.address,
        amounts: collateralAmounts,
        assets: [...oTokenParams.collateralAssets],
        vaultId,
        from: user.address,
      }),
      getAction(ActionType.MintShortOption, {
        owner: user.address,
        amount: [amountOfOTokensToMint],
        vaultId,
        otoken: [oToken.address],
        to: user.address,
      }),
    ]

    await controller.connect(user).operate(actions)

    const mintedOTokenBalance = await oToken.balanceOf(user.address)
    assert(mintedOTokenBalance.eq(amountOfOTokensToMint))
  })
})
