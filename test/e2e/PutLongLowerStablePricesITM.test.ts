import path from 'path'
import { USDC, WETH, CRV_CVX_ETH, LIDO_ST_ETH } from '../../constants/externalAddresses'
import { prettyObjectStringify } from '../../utils/log'
import { testDeploy } from '../helpers/fixtures'
import { testMintRedeemSettleFactory } from '../helpers/e2e/testMintRedeemSettle'

const oTokenParams = {
  collateralAssets: [CRV_CVX_ETH, LIDO_ST_ETH],
  underlyingAsset: WETH,
  strikeAsset: USDC,
  strikePriceFormatted: 3300,
  expiryDays: 7,
  isPut: true,
}

const longOTokenParams = {
  collateralAssets: [CRV_CVX_ETH, LIDO_ST_ETH],
  underlyingAsset: WETH,
  strikeAsset: USDC,
  strikePriceFormatted: 3100,
  expiryDays: 7,
  isPut: true,
}

const testsParams = [
  {
    oTokenParams,
    initialPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3800,
      [LIDO_ST_ETH]: 3800,
      [WETH]: 3800,
    },
    expiryPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3200,
      [LIDO_ST_ETH]: 3200,
      [WETH]: 3200,
    },
    longsOwners: [
      {
        oTokenParams: longOTokenParams,
        oTokenAmountFormatted: 1,
        collateralAmountsFormatted: [1, 1],
      },
    ],
    vaults: [
      {
        collateralAmountsFormatted: [0.1, 0.1],
        longToDeposit: longOTokenParams,
        longToDepositAmountFormatted: 1,
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams,
    initialPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3800,
      [LIDO_ST_ETH]: 3800,
      [WETH]: 3800,
    },
    expiryPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3100,
      [LIDO_ST_ETH]: 3100,
      [WETH]: 3100,
    },
    longsOwners: [
      {
        oTokenParams: longOTokenParams,
        oTokenAmountFormatted: 1,
        collateralAmountsFormatted: [1, 1],
      },
    ],
    vaults: [
      {
        collateralAmountsFormatted: [0.1, 0.1],
        longToDeposit: longOTokenParams,
        longToDepositAmountFormatted: 1,
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams,
    initialPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3800,
      [LIDO_ST_ETH]: 3800,
      [WETH]: 3800,
    },
    expiryPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3000,
      [LIDO_ST_ETH]: 3000,
      [WETH]: 3000,
    },
    longsOwners: [
      {
        oTokenParams: longOTokenParams,
        oTokenAmountFormatted: 1,
        collateralAmountsFormatted: [1, 1],
      },
    ],
    vaults: [
      {
        collateralAmountsFormatted: [0.1, 0.1],
        longToDeposit: longOTokenParams,
        longToDepositAmountFormatted: 1,
        oTokenAmountFormatted: 1,
      },
    ],
  },
] as const

describe(path.basename(__filename), function () {
  let deployResult: Awaited<ReturnType<typeof testDeploy>>

  before(async () => {
    deployResult = await testDeploy()
  })

  afterEach(async () => {
    deployResult = await testDeploy()
  })

  const getDeployResults = () => deployResult
  const proceedTest = testMintRedeemSettleFactory(getDeployResults)

  for (const testParam of testsParams) {
    it(`Test mint redeem settle with following params:\n ${prettyObjectStringify(testParam)}`, () =>
      proceedTest(testParam))
  }
})
