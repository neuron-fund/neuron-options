import path from 'path'
import { prettyObjectStringify } from '../../utils/log'
import { testDeploy } from '../helpers/fixtures'
import { generateFuzzyTestParams, getSeed, Seed } from '../helpers/fuzzy'
import { testMintRedeemSettleFactory } from '../helpers/e2e/testMintRedeemSettle'

//let testFuzzyNumbers
let numberOfTests = 0
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
  // const testFuzzyNumbers = [
  //   1, 4, 5, 6, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 25, 26, 27, 29, 30, 31, 32, 33, 34, 35, 38, 40, 41,
  //   42, 43, 47, 48, 49,
  // ]

  //testFuzzyNumbers = [1]
  for (let i = 0; i < numberOfTests; i++) {
    //  if (testFuzzyNumbers && !testFuzzyNumbers.includes(i)) {
    //    continue
    //  }
    const seed = process.env.SEEDS ? seedArray[i] : getSeed()
    //console.log(seedArray[i]);
    // it(`Fuzzy e2e test simplest No: ${i}:\n`, async () => {
    //   const testParams = await generateFuzzyTestParams(i)
    //   // console.log('\n', prettyObjectStringify(testParams), '\n')
    //   // await proceedTest({ ...testParams, vaults: [testParams.vaults[0]] })
    //   await proceedTest(testParams)
    // })
    it(`Fuzzy e2e tests with burn No: ${seed}:\n`, async () => {
      const testParams = await generateFuzzyTestParams(seed, true)
      // console.log('\n', prettyObjectStringify(testParams), '\n')
      // await proceedTest({ ...testParams, vaults: [testParams.vaults[0]] })
      await proceedTest(testParams)
    })
  }
})
