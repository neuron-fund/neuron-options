import path from 'path'
import { USDC, DAI, WETH, CRV_CVX_ETH, LIDO_ST_ETH } from '../../constants/externalAddresses'
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

const longONTokenParams = {
  collateralAssets: [CRV_CVX_ETH, LIDO_ST_ETH],
  collateralConstraints: [0, 0],
  underlyingAsset: WETH,
  strikeAsset: USDC,
  strikePriceFormatted: 3500,
  expiryDays: 7,
  isPut: false,
}

const testsParams = [
  {
    onTokenParams,
    initialPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3400,
      [LIDO_ST_ETH]: 3400,
      [WETH]: 3500,
    },
    expiryPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 4000,
      [LIDO_ST_ETH]: 4000,
      [WETH]: 4000,
    },
    longsOwners: [
      {
        onTokenParams: longONTokenParams,
        onTokenAmountFormatted: 1,
        collateralAmountsFormatted: [1, 1],
      },
    ],
    vaults: [
      {
        collateralAmountsFormatted: [0.05, 0.05],
        longToDeposit: longONTokenParams,
        longToDepositAmountFormatted: 1,
        onTokenAmountFormatted: 1,
      },
    ],
  },
  {
    onTokenParams,
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
    longsOwners: [
      {
        onTokenParams: longONTokenParams,
        onTokenAmountFormatted: 1,
        collateralAmountsFormatted: [1, 1],
      },
    ],
    vaults: [
      {
        collateralAmountsFormatted: [0.5, 0.5],
        longToDeposit: longONTokenParams,
        longToDepositAmountFormatted: 1,
        onTokenAmountFormatted: 1,
      },
    ],
  },
  {
    onTokenParams,
    initialPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3500,
      [LIDO_ST_ETH]: 3500,
      [WETH]: 3500,
    },
    expiryPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3900,
      [LIDO_ST_ETH]: 3900,
      [WETH]: 3900,
    },
    longsOwners: [
      {
        onTokenParams: longONTokenParams,
        onTokenAmountFormatted: 1,
        collateralAmountsFormatted: [1, 1],
      },
    ],
    vaults: [
      {
        collateralAmountsFormatted: [0.05, 0.05],
        longToDeposit: longONTokenParams,
        longToDepositAmountFormatted: 1,
        onTokenAmountFormatted: 1,
      },
    ],
  },
  {
    onTokenParams,
    initialPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 3500,
      [LIDO_ST_ETH]: 3500,
      [WETH]: 3500,
    },
    expiryPrices: {
      [USDC]: 1,
      [CRV_CVX_ETH]: 4300,
      [LIDO_ST_ETH]: 4300,
      [WETH]: 4300,
    },
    longsOwners: [
      {
        onTokenParams: longONTokenParams,
        onTokenAmountFormatted: 1,
        collateralAmountsFormatted: [1, 1],
      },
    ],
    vaults: [
      {
        collateralAmountsFormatted: [0.5, 0.5],
        longToDeposit: longONTokenParams,
        longToDepositAmountFormatted: 1,
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
