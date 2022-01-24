import path from 'path'
import { USDC, DAI, WETH, CRV_CVX_ETH, LIDO_ST_ETH } from '../../constants/externalAddresses'
import { prettyObjectStringify } from '../../utils/log'
import { testDeploy } from '../helpers/fixtures'
import { testMintRedeemSettleFactory } from '../helpers/testMintRedeemSettle'

const testsParams = [
  {
    oTokenParams: {
      collateralAssets: [CRV_CVX_ETH, LIDO_ST_ETH],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: false,
    },
    initialPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3500,
      [LIDO_ST_ETH]: 3500,
      [WETH]: 3500,
    },
    expiryPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 4000,
      [LIDO_ST_ETH]: 4000,
      [WETH]: 4000,
    },
    vaults: [
      {
        collateralAmountsFormatted: [1, 0],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: {
      collateralAssets: [CRV_CVX_ETH, LIDO_ST_ETH],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: false,
    },
    initialPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3500,
      [LIDO_ST_ETH]: 3500,
      [WETH]: 3500,
    },
    expiryPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 4000,
      [LIDO_ST_ETH]: 4000,
      [WETH]: 4000,
    },
    vaults: [
      {
        collateralAmountsFormatted: [1, 0],
        oTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [0.7, 0],
        oTokenAmountFormatted: 0.5,
      },
    ],
  },
  {
    oTokenParams: {
      collateralAssets: [CRV_CVX_ETH, LIDO_ST_ETH],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: false,
    },
    initialPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3500,
      [LIDO_ST_ETH]: 3500,
      [WETH]: 3500,
    },
    expiryPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 4000,
      [LIDO_ST_ETH]: 4000,
      [WETH]: 4000,
    },
    checkpointsDays: {
      2: {
        prices: {
          [USDC]: 1,
          [CRV_CVX_ETH]: 3400,
          [LIDO_ST_ETH]: 3400,
          [WETH]: 3650,
        },
      },
      4: {
        prices: {
          [USDC]: 1,
          [CRV_CVX_ETH]: 3500,
          [LIDO_ST_ETH]: 3500,
          [WETH]: 3700,
        },
      },
    },
    vaults: [
      {
        collateralAmountsFormatted: [1.2, 2.3],
        mintOnCheckoints: {
          2: {
            oTokenAmountFormatted: 0.3,
          },
          4: {
            oTokenAmountFormatted: 0.7,
          },
        },
        burnAmountFormatted: 0.5,
      },
      {
        collateralAmountsFormatted: [1, 0],
        oTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [0.3, 0.7],
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
