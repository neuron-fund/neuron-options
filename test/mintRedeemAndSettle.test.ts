import { USDC, DAI, WETH } from '../constants/externalAddresses'
import { prettyObjectStringify } from '../utils/log'
import { testDeploy } from './helpers/fixtures'
import { testMintRedeemSettleFactory } from './helpers/testMintRedeemSettle'

describe('Redeems tests using stablePrice in Oracle', function () {
  let deployResult: Awaited<ReturnType<typeof testDeploy>>

  before(async () => {
    deployResult = await testDeploy()
  })

  afterEach(async () => {
    deployResult = await testDeploy()
  })
  const getDeployResults = () => deployResult
  const proceedTest = testMintRedeemSettleFactory(getDeployResults)

  const testsParams = [
    {
      oTokenParams: {
        collateralAssets: [USDC, DAI],
        underlyingAsset: WETH,
        strikeAsset: USDC,
        strikePriceFormatted: 3800,
        expiryDays: 7,
        isPut: true,
      },
      expiryPrices: {
        [USDC]: 1,
        [DAI]: 1,
        [WETH]: 3500,
      },
      initalPrices: {
        [USDC]: 1,
        [DAI]: 1,
        [WETH]: 4200,
      },
      vaults: [
        {
          collateralAmountsFormatted: [3800, 3800],
          oTokenAmountFormatted: 1,
        },
      ],
    },
  ] as const

  for (const testParam of testsParams) {
    it(`Test mint redeem settle with following params:\n ${prettyObjectStringify(testParam)}`, () =>
      proceedTest(testParam))
  }
})
