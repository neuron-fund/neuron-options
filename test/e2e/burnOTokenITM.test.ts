import path from 'path'
import { USDT, DAI, WETH, USDC } from '../../constants/externalAddresses'
import { prettyObjectStringify } from '../../utils/log'
import { testDeploy } from '../helpers/fixtures'
import { testMintRedeemSettleFactory } from '../helpers/e2e/testMintRedeemSettle'

const oTokenParams = {
  collateralAssets: [USDT, DAI],
  collateralConstraints: [0, 0],
  underlyingAsset: WETH,
  strikeAsset: USDC,
  strikePriceFormatted: 3800,
  expiryDays: 7,
  isPut: true,
}

const testsParams = [
  {
    oTokenParams: oTokenParams,
    initialPrices: {
      [USDT]: 1,
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDT]: 0.8,
      [USDC]: 1,
      [DAI]: 0.8,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [2000, 4000],
        oTokenAmountFormatted: 1,
        burnAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [4900, 0],
        oTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [2000, 2700],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: oTokenParams,
    initialPrices: {
      [USDT]: 1,
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDT]: 0.8,
      [USDC]: 1,
      [DAI]: 0.8,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [2000, 4000],
        oTokenAmountFormatted: 1,
        burnAmountFormatted: 0.5,
      },
      {
        collateralAmountsFormatted: [4900, 0],
        oTokenAmountFormatted: 0.2,
      },
      {
        collateralAmountsFormatted: [2000, 2700],
        oTokenAmountFormatted: 1.2,
      },
    ],
  },
  {
    oTokenParams: oTokenParams,
    initialPrices: {
      [USDT]: 1,
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDT]: 0.8,
      [USDC]: 1,
      [DAI]: 0.8,
      [WETH]: 3500,
    },
    checkpointsDays: {
      2: {
        prices: {
          [USDT]: 1.2,
          [USDC]: 1,
          [DAI]: 1.3,
          [WETH]: 4200,
        },
      },
      4: {
        prices: {
          [USDT]: 1.3,
          [USDC]: 1,
          [DAI]: 1.4,
          [WETH]: 4200,
        },
      },
    },
    vaults: [
      {
        collateralAmountsFormatted: [2000, 4000],
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
        collateralAmountsFormatted: [4900, 0],
        oTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [2000, 2700],
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
