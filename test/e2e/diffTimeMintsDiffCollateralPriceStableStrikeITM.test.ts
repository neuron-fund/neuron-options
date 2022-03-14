import path from 'path'
import { USDT, DAI, WETH, USDC } from '../../constants/externalAddresses'
import { prettyObjectStringify } from '../../utils/log'
import { testDeploy } from '../helpers/fixtures'
import { testMintRedeemSettleFactory } from '../helpers/e2e/testMintRedeemSettle'

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
    initialPrices: {
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
        collateralAmountsFormatted: [3800, 3800],
        oTokenAmountFormatted: 0.2,
        mintOnCheckoints: {
          2: {
            oTokenAmountFormatted: 0.3,
          },
          4: {
            oTokenAmountFormatted: 0.2,
          },
        },
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
