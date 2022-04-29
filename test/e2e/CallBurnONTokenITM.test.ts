import path from 'path'
import { CRV_CVX_ETH, LIDO_ST_ETH, WETH, USDC } from '../../constants/externalAddresses'
import { prettyObjectStringify } from '../../utils/log'
import { testDeploy } from '../helpers/fixtures'
import { testMintRedeemSettleFactory } from '../helpers/e2e/testMintRedeemSettle'

const onTokenParams = {
  collateralAssets: [CRV_CVX_ETH, LIDO_ST_ETH],
  collateralConstraints: [0, 0],
  underlyingAsset: WETH,
  strikeAsset: USDC,
  strikePriceFormatted: 3800,
  expiryDays: 7,
  isPut: false,
}

const testsParams = [
  {
    onTokenParams: onTokenParams,
    initialPrices: {
      [CRV_CVX_ETH]: 3500,
      [USDC]: 1,
      [LIDO_ST_ETH]: 3500,
      [WETH]: 3500,
    },
    expiryPrices: {
      [CRV_CVX_ETH]: 3300,
      [USDC]: 1,
      [LIDO_ST_ETH]: 3300,
      [WETH]: 4100,
    },
    vaults: [
      {
        collateralAmountsFormatted: [0.8, 1.4],
        onTokenAmountFormatted: 1,
        burnAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [1.7, 0],
        onTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [0.5, 0.8],
        onTokenAmountFormatted: 1,
      },
    ],
  },
  {
    onTokenParams: onTokenParams,
    initialPrices: {
      [CRV_CVX_ETH]: 3500,
      [USDC]: 1,
      [LIDO_ST_ETH]: 3500,
      [WETH]: 3500,
    },
    expiryPrices: {
      [CRV_CVX_ETH]: 3300,
      [USDC]: 1,
      [LIDO_ST_ETH]: 3300,
      [WETH]: 4100,
    },
    vaults: [
      {
        collateralAmountsFormatted: [0.6, 1.4],
        onTokenAmountFormatted: 1,
        burnAmountFormatted: 0.5,
      },
      {
        collateralAmountsFormatted: [1.8, 0],
        onTokenAmountFormatted: 0.2,
      },
      {
        collateralAmountsFormatted: [0.6, 0.8],
        onTokenAmountFormatted: 1.2,
      },
    ],
  },
  {
    onTokenParams: onTokenParams,
    initialPrices: {
      [CRV_CVX_ETH]: 3500,
      [USDC]: 1,
      [LIDO_ST_ETH]: 3500,
      [WETH]: 3500,
    },
    expiryPrices: {
      [CRV_CVX_ETH]: 3300,
      [USDC]: 1,
      [LIDO_ST_ETH]: 3300,
      [WETH]: 4100,
    },
    checkpointsDays: {
      2: {
        prices: {
          [CRV_CVX_ETH]: 3700,
          [USDC]: 1,
          [LIDO_ST_ETH]: 3700,
          [WETH]: 3600,
        },
      },
      4: {
        prices: {
          [CRV_CVX_ETH]: 3800,
          [USDC]: 1,
          [LIDO_ST_ETH]: 4000,
          [WETH]: 3700,
        },
      },
    },
    vaults: [
      {
        collateralAmountsFormatted: [0.6, 1.4],
        mintOnCheckoints: {
          2: {
            onTokenAmountFormatted: 0.3,
          },
          4: {
            onTokenAmountFormatted: 0.7,
          },
        },
        burnAmountFormatted: 0.5,
      },
      {
        collateralAmountsFormatted: [1.8, 0],
        onTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [0.6, 0.8],
        onTokenAmountFormatted: 1,
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
