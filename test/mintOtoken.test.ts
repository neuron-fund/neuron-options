import { parseUnits } from '@ethersproject/units'
import { expect } from 'chai'
import { deployments, ethers, getNamedAccounts } from 'hardhat'
import { DAI, USDC, WETH } from '../constants/externalAddresses'
import { ERC20Interface__factory } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'
import { createValidExpiry } from '../utils/time'
import { testDeploy } from './helpers/fixtures'
import { CreateOtokenParamsObject, whitelistAndCreateOtoken } from './helpers/otoken'

describe('Mint Otoken', function () {
  it('Whitelist and create oToken', async () => {
    const { user, deployer } = await namedAccountsSigners(getNamedAccounts)
    const { oTokenFactory, whitelist } = await testDeploy()

    const oTokenParams: CreateOtokenParamsObject = {
      collateralAssets: [USDC, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiry: createValidExpiry(7),
      isPut: true,
    }

    await expect(
      whitelistAndCreateOtoken(
        {
          whitelist,
          oTokenFactory,
          protocolOwner: deployer,
          oTokenCreator: user,
        },
        oTokenParams
      )
    ).to.emit(oTokenFactory, 'OtokenCreated')
  })
})
