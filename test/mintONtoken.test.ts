import { parseUnits } from '@ethersproject/units'
import { expect } from 'chai'
import { deployments, ethers, getNamedAccounts } from 'hardhat'
import { DAI, USDC, WETH } from '../constants/externalAddresses'
import { ERC20Interface__factory } from '../typechain-types'
import { namedAccountsSigners } from '../utils/hardhat'
import { createValidExpiry } from '../utils/time'
import { testDeploy } from './helpers/fixtures'
import { CreateONtokenParamsObject, whitelistAndCreateONtoken } from './helpers/onToken'

describe('Mint ONtoken', function () {
  it('Whitelist and create onToken', async () => {
    const { user, deployer } = await namedAccountsSigners(getNamedAccounts)
    const { onTokenFactory, whitelist } = await testDeploy()

    const onTokenParams: CreateONtokenParamsObject = {
      collateralAssets: [USDC, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiry: createValidExpiry(7),
      isPut: true,
    }

    await expect(
      whitelistAndCreateONtoken(
        {
          whitelist,
          onTokenFactory,
          protocolOwner: deployer,
          onTokenCreator: user,
        },
        onTokenParams
      )
    ).to.emit(onTokenFactory, 'ONtokenCreated')
  })
})
