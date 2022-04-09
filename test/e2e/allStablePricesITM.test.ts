import path from 'path'
import { USDC, DAI, WETH } from '../../constants/externalAddresses'
import { prettyObjectStringify } from '../../utils/log'
import { testDeploy } from '../helpers/fixtures'
import { testMintRedeemSettleFactory } from '../helpers/e2e/testMintRedeemSettle'

const testsParams = [
  {
    oTokenParams: {
      collateralAssets: [USDC, DAI],
      collateralConstraints: [0, 0],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initialPrices: {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDC]: 1,
      [DAI]: 1,
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
      collateralAssets: [USDC, DAI],
      collateralConstraints: [0, 0],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initialPrices: {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDC]: 1,
      [DAI]: 1,
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
      collateralAssets: [USDC, DAI],
      collateralConstraints: [0, 0],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initialPrices: {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [0, 3800],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: {
      collateralAssets: [USDC, DAI],
      collateralConstraints: [0, 0],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initialPrices: {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 3500,
    },
    vaults: [
      {
        collateralAmountsFormatted: [2000, 4000],
        oTokenAmountFormatted: 1,
      },
    ],
  },
  {
    oTokenParams: {
      collateralAssets: [USDC, DAI],
      collateralConstraints: [0, 0],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initialPrices: {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
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
      collateralAssets: [USDC, DAI],
      collateralConstraints: [0, 0],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initialPrices: {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
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
      collateralAssets: [USDC, DAI],
      collateralConstraints: [0, 0],
      underlyingAsset: WETH,
      strikeAsset: USDC,
      strikePriceFormatted: 3800,
      expiryDays: 7,
      isPut: true,
    },
    initialPrices: {
      [USDC]: 1,
      [DAI]: 1,
      [WETH]: 4200,
    },
    expiryPrices: {
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
      {
        collateralAmountsFormatted: [2000, 2000],
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
