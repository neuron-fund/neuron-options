import path from 'path'
import { testDeploy } from '../helpers/fixtures'
import { generateFuzzyTestParams, getSeed, Seed } from '../helpers/fuzzy'
import { testMintRedeemSettleFactory } from '../helpers/e2e/testMintRedeemSettle'

//let testFuzzyNumbers
let numberOfTests = 50
let seedArray: Seed[] = []

if (process.env.CHANCE_SEED) numberOfTests = 1
else if (process.env.ITER) numberOfTests = Number(process.env.ITER)
else if (process.env.SEEDS) {
  var fs = require('fs')
  seedArray = fs.readFileSync(process.env.SEEDS).toString().split('\n')
  numberOfTests = seedArray.length - 1
}

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

  for (let i = 0; i < numberOfTests; i++) {
    const seed = process.env.SEEDS ? seedArray[i] : getSeed()
    it(`Fuzzy e2e tests with burn No: ${seed}:\n`, async () => {
      const testParams = await generateFuzzyTestParams(seed, true)
      await proceedTest(testParams)
    })
  }
})
