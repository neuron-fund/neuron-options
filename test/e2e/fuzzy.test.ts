import path from 'path'
import { prettyObjectStringify } from '../../utils/log'
import { testDeploy } from '../helpers/fixtures'
import { generateFuzzyTestParams } from '../helpers/fuzzy'
import { testMintRedeemSettleFactory } from '../helpers/testMintRedeemSettle'

let testFuzzyNumbers
const numberOfTests = 10

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

  testFuzzyNumbers = [1]
  for (let i = 0; i < numberOfTests; i++) {
    if (testFuzzyNumbers && !testFuzzyNumbers.includes(i)) {
      continue
    }
    // it(`Fuzzy e2e test simplest No: ${i}:\n`, async () => {
    //   const testParams = await generateFuzzyTestParams(i)
    //   // console.log('\n', prettyObjectStringify(testParams), '\n')
    //   // await proceedTest({ ...testParams, vaults: [testParams.vaults[0]] })
    //   await proceedTest(testParams)
    // })
    it(`Fuzzy e2e tests with burn No: ${i}:\n`, async () => {
      const testParams = await generateFuzzyTestParams(i, true)
      console.log('\n', prettyObjectStringify(testParams), '\n')
      // await proceedTest({ ...testParams, vaults: [testParams.vaults[0]] })
      await proceedTest(testParams)
    })
  }
})