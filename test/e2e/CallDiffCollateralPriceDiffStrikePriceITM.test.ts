import { CRV_CVX_ETH, WETH, USDC, LIDO_ST_ETH } from '../../constants/externalAddresses'
import { prettyObjectStringify } from '../../utils/log'
import { testDeploy } from '../helpers/fixtures'
import { testMintRedeemSettleFactory } from '../helpers/testMintRedeemSettle'

const oTokenParams = {
  collateralAssets: [CRV_CVX_ETH, LIDO_ST_ETH],
  underlyingAsset: WETH,
  strikeAsset: USDC,
  strikePriceFormatted: 3800,
  expiryDays: 7,
  isPut: false,
}

const testsParams = [
  {
    oTokenParams: oTokenParams,
    initialPrices: {
      [LIDO_ST_ETH]: 3500,
      [USDC]: 1.32,
      [CRV_CVX_ETH]: 3500,
      [WETH]: 3600,
    },
    expiryPrices: {
      [LIDO_ST_ETH]: 3500,
      [USDC]: 1,
      [CRV_CVX_ETH]: 3500,
      [WETH]: 4000,
    },
    vaults: [
      {
        collateralAmountsFormatted: [0.7, 0.7],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: oTokenParams,
    initialPrices: {
      [LIDO_ST_ETH]: 3600,
      [USDC]: 1.1,
      [CRV_CVX_ETH]: 3700,
      [WETH]: 3700,
    },
    expiryPrices: {
      [LIDO_ST_ETH]: 3500,
      [USDC]: 1.4,
      [CRV_CVX_ETH]: 3500,
      [WETH]: 4300,
    },
    vaults: [
      {
        collateralAmountsFormatted: [0.4, 0.9],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: oTokenParams,
    initialPrices: {
      [LIDO_ST_ETH]: 3500,
      [USDC]: 1.3,
      [CRV_CVX_ETH]: 3500,
      [WETH]: 3800,
    },
    expiryPrices: {
      [LIDO_ST_ETH]: 2300,
      [USDC]: 1,
      [CRV_CVX_ETH]: 3200,
      [WETH]: 4300,
    },
    vaults: [
      {
        collateralAmountsFormatted: [0, 2],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: oTokenParams,
    initialPrices: {
      [LIDO_ST_ETH]: 4000,
      [USDC]: 1,
      [CRV_CVX_ETH]: 3650,
      [WETH]: 3500,
    },
    expiryPrices: {
      [LIDO_ST_ETH]: 7000,
      [USDC]: 1.4,
      [CRV_CVX_ETH]: 5000,
      [WETH]: 4900,
    },
    vaults: [
      {
        collateralAmountsFormatted: [0.7, 2.2],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: oTokenParams,
    initialPrices: {
      [LIDO_ST_ETH]: 3500,
      [USDC]: 1.2,
      [CRV_CVX_ETH]: 3500,
      [WETH]: 3500,
    },
    expiryPrices: {
      [LIDO_ST_ETH]: 3300,
      [USDC]: 1,
      [CRV_CVX_ETH]: 3300,
      [WETH]: 4300,
    },
    vaults: [
      {
        collateralAmountsFormatted: [0.7, 1.8],
        oTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [1.5, 0],
        oTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [0.6, 0.8],
        oTokenAmountFormatted: 1,
      },
    ],
  },
] as const

describe('Mint, redeem, settle, tests ITM, collateral changing prices, strike changing prices, using stablePrice in Oracle', function () {
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
