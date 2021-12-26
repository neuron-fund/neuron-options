import { USDT, DAI, WETH, USDC } from '../../constants/externalAddresses'
import { prettyObjectStringify } from '../../utils/log'
import { testDeploy } from '../helpers/fixtures'
import { testMintRedeemSettleFactory } from '../helpers/testMintRedeemSettle'

const testsParams = [
  {
    oTokenParams: {
      collateralAssets: [USDT, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initalPrices: {
      [USDT]: 1.4,
      [USDC]: 1,
      [DAI]: 1.5,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDT]: 1.1,
      [USDC]: 1,
      [DAI]: 1.5,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [3800, 3800],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: {
      collateralAssets: [USDT, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initalPrices: {
      [USDT]: 1,
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDT]: 1.6,
      [USDC]: 1,
      [DAI]: 1.8,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [3800, 0],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: {
      collateralAssets: [USDT, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initalPrices: {
      [USDT]: 1,
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDT]: 0.5,
      [USDC]: 1,
      [DAI]: 0.8,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [0, 5000],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: {
      collateralAssets: [USDT, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initalPrices: {
      [USDT]: 0.2,
      [USDC]: 1,
      [DAI]: 0.8,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDT]: 1,
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [2000, 7990],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: {
      collateralAssets: [USDT, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initalPrices: {
      [USDT]: 1.4,
      [USDC]: 1,
      [DAI]: 1.7,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDT]: 1,
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [2000, 4000],
        oTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [4000, 0],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: {
      collateralAssets: [USDT, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initalPrices: {
      [USDT]: 0.5,
      [USDC]: 1,
      [DAI]: 0.8,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDT]: 1,
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [2000, 4000],
        oTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [8000, 0],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: {
      collateralAssets: [USDT, DAI],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initalPrices: {
      [USDT]: 1,
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDT]: 0.9,
      [USDC]: 1,
      [DAI]: 0.9,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [2000, 4000],
        oTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [4000, 0],
        oTokenAmountFormatted: 1,
      },
      {
        collateralAmountsFormatted: [2000, 2000],
        oTokenAmountFormatted: 1,
      },
    ],
  },
] as const

describe('Mint, redeem, settle, tests ITM, collateral changing prices, strike not chaching price, using stablePrice in Oracle', function () {
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
