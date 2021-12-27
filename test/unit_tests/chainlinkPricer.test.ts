import { expect, assert } from 'chai'
import {  ethers, getNamedAccounts, web3 } from 'hardhat'
import BigNumber from 'bignumber.js'
import { time } from '@openzeppelin/test-helpers'
// import { namedAccountsSigners } from '../../utils/hardhat'

import { 
    MockERC20 as MockERC20Instance,
    ChainLinkPricer as ChainLinkPricerInstance,
    MockChainlinkAggregator as MockChainlinkAggregatorInstance,
    MockOracle as MockOracleInstance
  } from '../../typechain-types'  
  

  // address(0)
  const ZERO_ADDR = '0x0000000000000000000000000000000000000000'
  let owner: string, bot: string, random: string
  let ChainlinkPricer

  const createTokenAmount = (num: number | BigNumber, decimals = 8) => {
    const amount = new BigNumber(num).times(new BigNumber(10).pow(decimals))
    return amount.integerValue().toString()
  } 

  describe('ChainlinkPricer', () => {
    let wethAggregator: MockChainlinkAggregatorInstance
    let oracle: MockOracleInstance
    let weth: MockERC20Instance
    // otoken
    let pricer: ChainLinkPricerInstance
  
    before('Deployment', async () => {
      const {deployer, random_user, pricerBot} = await getNamedAccounts();
      
      owner = deployer
      bot = pricerBot
      random = random_user

      // deploy mock contracts
      oracle = await (await ethers.getContractFactory("MockOracle")).deploy() as MockOracleInstance
      await oracle.deployed()
 
      wethAggregator = await (await ethers.getContractFactory("MockChainlinkAggregator")).deploy() as MockChainlinkAggregatorInstance
      await wethAggregator.deployed()

      weth = await (await ethers.getContractFactory("MockERC20")).deploy('WETH', 'WETH', 18) as MockERC20Instance
      await weth.deployed()

      // deploy pricer
      ChainlinkPricer = await ethers.getContractFactory("ChainLinkPricer")
      pricer = await ChainlinkPricer.deploy(bot, weth.address, wethAggregator.address, oracle.address) as ChainLinkPricerInstance
      await pricer.deployed()
    })
  
    describe('constructor', () => {
      it('should set the config correctly', async () => {
        const asset = await pricer.asset()
        assert.equal(asset, weth.address)
        const bot = await pricer.bot()
        assert.equal(bot, bot)
        const aggregator = await pricer.aggregator()
        assert.equal(aggregator, wethAggregator.address)
        const oracleModule = await pricer.oracle()
        assert.equal(oracleModule, oracle.address)
      })
      it('should revert if initializing aggregator with 0 address', async () => {
        await expect(
          ChainlinkPricer.deploy(bot, weth.address, ZERO_ADDR, wethAggregator.address)).to.be.revertedWith(
          'ChainLinkPricer: Cannot set 0 address as aggregator'
        )
      })
      it('should revert if initializing oracle with 0 address', async () => {
        await expect(
          ChainlinkPricer.deploy(bot, weth.address, oracle.address, ZERO_ADDR)).to.be.revertedWith(
          'ChainLinkPricer: Cannot set 0 address as oracle'
        )
      })
      it('should revert if initializing bot with 0 address', async () => {
        await expect(
          ChainlinkPricer.deploy(ZERO_ADDR, weth.address, oracle.address, wethAggregator.address)).to.be.revertedWith(
          'ChainLinkPricer: Cannot set 0 address as bot'
        )
      })
    })
  
    describe('getPrice', () => {
      // aggregator have price in 1e8
      const ethPrice = createTokenAmount(300, 8)
      before('mock data in weth aggregator', async () => {
        await wethAggregator.setLatestAnswer(ethPrice)
      })
      it('should return the price in 1e8', async () => {
        const price = await pricer.getPrice()
        const expectedResult = createTokenAmount(300, 8)
        assert.equal(price.toString(), expectedResult.toString())
      })
      it('should return the new price after resetting answer in aggregator', async () => {
        const newPrice = createTokenAmount(400, 8)
        await wethAggregator.setLatestAnswer(newPrice)
        const price = await pricer.getPrice()
        const expectedResult = createTokenAmount(400, 8)
        assert.equal(price.toString(), expectedResult.toString())
      })
      it('should revert if price is lower than 0', async () => {
        await wethAggregator.setLatestAnswer(-1)
        await expect(pricer.getPrice()).to.be.revertedWith('ChainLinkPricer: price is lower than 0')
      })
    })
  
    describe('setExpiryPrice', () => {
      // time order: t0, t1, t2, t3, t4
      let t0: number, t1: number, t2: number, t3: number, t4: number
      // p0 = price at t0 ... etc
      const p0 = createTokenAmount(100, 8)
      const p1 = createTokenAmount(150.333, 8)
      const p2 = createTokenAmount(180, 8)
      const p3 = createTokenAmount(200, 8)
      const p4 = createTokenAmount(140, 8)
  
      before('setup history in aggregator', async () => {
        // set t0, t1, t2, expiry, t3, t4
        t0 = (await time.latest()).toNumber()
        // set round answers
        await wethAggregator.setRoundAnswer(0, p0)
        await wethAggregator.setRoundAnswer(1, p1)
        await wethAggregator.setRoundAnswer(2, p2)
        await wethAggregator.setRoundAnswer(3, p3)
        await wethAggregator.setRoundAnswer(4, p4)
  
        // set round timestamps
        await wethAggregator.setRoundTimestamp(0, t0)
        t1 = t0 + 60 * 1
        await wethAggregator.setRoundTimestamp(1, t1)
        t2 = t0 + 60 * 2
        await wethAggregator.setRoundTimestamp(2, t2)
        t3 = t0 + 60 * 3
        await wethAggregator.setRoundTimestamp(3, t3)
        t4 = t0 + 60 * 4
        await wethAggregator.setRoundTimestamp(4, t4)
      })
  
      it('should set the correct price to the oracle', async () => {
        const expiryTimestamp = (t0 + t1) / 2 // between t0 and t1
        const roundId = 1

        await pricer.connect(bot).setExpiryPriceInOracle(expiryTimestamp, roundId, { from: bot })
        const priceFromOracle = await oracle.getExpiryPrice(weth.address, expiryTimestamp)
        assert.equal(p1.toString(), priceFromOracle[0].toString())
      })
  
      it('should revert if sender is not bot address', async () => {
        const expiryTimestamp = (t1 + t2) / 2 // between t0 and t1
        const roundId = 1
        await expect(
          pricer.connect(random).setExpiryPriceInOracle(expiryTimestamp, roundId, { from: random })).to.be.revertedWith(
          'ChainLinkPricer: unauthorized sender',
        )
      })
  
      it('should revert if round ID is incorrect: price[roundId].timestamp < expiry', async () => {
        const expiryTimestamp = (t1 + t2) / 2 // between t0 and t1
        const roundId = 1
        await expect(
          pricer.connect(bot).setExpiryPriceInOracle(expiryTimestamp, roundId, { from: bot })).to.be.revertedWith(
          'ChainLinkPricer: invalid roundId',
        )
      })
    })
  
    describe('get historical price', async () => {
      let t0: number
      // p0 = price at t0 ... etc
      const p0 = createTokenAmount(100, 8)
  
      before('setup history in aggregator', async () => {
        t0 = (await time.latest()).toNumber()
        // set round answers
        await wethAggregator.setRoundAnswer(0, p0)
  
        // set round timestamps
        await wethAggregator.setRoundTimestamp(0, t0)
      })
  
      it('should return historical price with timestamp', async () => {
        const roundData = await pricer.getHistoricalPrice(0)
  
        assert.equal(roundData[0].toString(), p0, 'Historical round price mismatch')
  
        assert.equal(roundData[1].toNumber(), t0, 'Historical round timestamp mismatch')
      })
  
      it('should revert when no data round available', async () => {
        const invalidRoundId = 1050
  
        await expect(pricer.getHistoricalPrice(invalidRoundId)).to.be.revertedWith('No data present')
      })
    })
  })
  