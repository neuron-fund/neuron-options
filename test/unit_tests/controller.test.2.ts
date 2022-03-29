/*
should free long when burn short collaterated by this long
should free long and collaterals when burn short collaterated by this long and collateral tokens
*/

import { 
  MockERC20 as MockERC20Instance,
  CallTester as CallTesterInstance,
  MarginCalculator as MarginCalculatorInstance,
  MockOtoken as MockOtokenInstance,
  MockOracle as MockOracleInstance,
  MockWhitelistModule as MockWhitelistModuleInstance,
  MarginPool as MarginPoolInstance,
  Controller as ControllerInstance,
  AddressBook as AddressBookInstance,
  OwnedUpgradeabilityProxy as OwnedUpgradeabilityProxyInstance,
  OtokenImplV1 as OtokenImplV1Instance,
  ArrayAddressUtils as ArrayAddressUtilsInstance
} from '../../typechain-types'  

import { ActionArgsStruct } from '../../typechain-types/Controller'

import { createScaledNumber, createTokenAmount, underlyingPriceToCtokenPrice, resp2bn } from '../helpers/utils'
import { artifacts, contract, web3 } from 'hardhat'
import { expect, assert } from 'chai'

import { BigNumber } from 'ethers'

const { expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers')

const CallTester = artifacts.require('CallTester.sol')
const MockERC20 = artifacts.require('MockERC20.sol')
const OtokenImplV1 = artifacts.require('OtokenImplV1.sol')
const MockOtoken = artifacts.require('MockOtoken.sol')
const MockOracle = artifacts.require('MockOracle.sol')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy.sol')
const MarginCalculator = artifacts.require('MarginCalculator.sol')
const MockWhitelistModule = artifacts.require('MockWhitelistModule.sol')
const AddressBook = artifacts.require('AddressBook.sol')
const MarginPool = artifacts.require('MarginPool.sol')
const Controller = artifacts.require('Controller.sol')
const MarginVault = artifacts.require('MarginVault.sol')
// const ArrayAddressUtils = artifacts.require('ArrayAddressUtils.sol')

// address(0)
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

import { ActionType, getAction } from '../helpers/actions'

contract(
  'Controller',
  ([owner, user, seller, redeemer]) => {
    // ERC20 mock
    let usdc: MockERC20Instance
    let usdc2: MockERC20Instance
    let weth: MockERC20Instance
    let weth2: MockERC20Instance
    // Oracle module
    let oracle: MockOracleInstance
    // calculator module
    let calculator: MarginCalculatorInstance
    // margin pool module
    let marginPool: MarginPoolInstance
    // whitelist module mock
    let whitelist: MockWhitelistModuleInstance
    // addressbook module mock
    let addressBook: AddressBookInstance
    // controller module
    let controllerImplementation: ControllerInstance
    let controllerProxy: ControllerInstance

    // deployed and whitelisted otokens
    let shortOtoken: MockOtokenInstance

    let longCall: MockOtokenInstance
    let expiry: BigNumber

    const usdcDecimals = 6
    const wethDecimals = 18

    before('Deployment', async () => {
      // addressbook deployment
      addressBook = await AddressBook.new()
      // ERC20 deployment
      usdc = await MockERC20.new('USDC', 'USDC', usdcDecimals)
      usdc2 = await MockERC20.new('USDC2', 'USDC2', usdcDecimals)
      weth = await MockERC20.new('WETH', 'WETH', wethDecimals)
      weth2 = await MockERC20.new('WETH2', 'WETH2', wethDecimals)
      // deploy Oracle module
      oracle = await MockOracle.new(addressBook.address, { from: owner })
      
      
      const libMarginVault = await MarginVault.new()
      
      /*
      const libArrayAddressUtils  = await ArrayAddressUtils.new()
      await MarginCalculator.link(libArrayAddressUtils, libMarginVault)
      */
      
      //await MarginCalculator.link(libArrayAddressUtils)
      calculator = await MarginCalculator.new(oracle.address)
      // margin pool deployment
      marginPool = await MarginPool.new(addressBook.address)
      // whitelist module
      whitelist = await MockWhitelistModule.new()
      // set margin pool in addressbook
      await addressBook.setMarginPool(marginPool.address)
      // set calculator in addressbook
      await addressBook.setMarginCalculator(calculator.address)
      // set oracle in AddressBook
      await addressBook.setOracle(oracle.address)
      // set whitelist module address
      await addressBook.setWhitelist(whitelist.address)
      // deploy Controller module
      
      await Controller.link(libMarginVault)
      controllerImplementation = await Controller.new()

      // set controller address in AddressBook
      await addressBook.setController(controllerImplementation.address, { from: owner })

      // check controller deployment
      const controllerProxyAddress = await addressBook.getController()
      controllerProxy = await Controller.at(controllerProxyAddress)
      const proxy: OwnedUpgradeabilityProxyInstance = await OwnedUpgradeabilityProxy.at(controllerProxyAddress)

      assert.equal(await proxy.proxyOwner(), addressBook.address, 'Proxy owner address mismatch')
      assert.equal(await controllerProxy.owner(), owner, 'Controller owner address mismatch')
      assert.equal(await controllerProxy.systemPartiallyPaused(), false, 'system is partially paused')

      // make user rich
      await usdc.mint(user, createTokenAmount(100000, usdcDecimals))
      await weth.mint(user, createTokenAmount(100000, wethDecimals))
      await usdc2.mint(user, createTokenAmount(100000, usdcDecimals))
      await weth2.mint(user, createTokenAmount(100000, wethDecimals))

      // make seller rich
      await usdc.mint(seller, createTokenAmount(100000, usdcDecimals))
      await weth.mint(seller, createTokenAmount(100000, wethDecimals))
      await usdc2.mint(seller, createTokenAmount(100000, usdcDecimals))
      await weth2.mint(seller, createTokenAmount(100000, wethDecimals))

      //mint long oTokens
      const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day 

      longCall = await MockOtoken.new()
      const strike = createTokenAmount(100)

      const collaterals = [weth2.address,]
      await whitelist.whitelistCollaterals(collaterals)

      expiry = resp2bn(await time.latest()).add(expiryTime)

      await longCall.init(
        addressBook.address,
        weth.address,
        usdc.address,
        collaterals,
        strike,
        expiry,
        false,
      )        

      await whitelist.whitelistOtoken(longCall.address, { from: owner })
      assert.isTrue(await whitelist.isWhitelistedOtoken(longCall.address))
      
      const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(seller))
      const vaultId = vaultCounter.toNumber() + 1
      const collateralAmounts = [createTokenAmount(1000, wethDecimals)]
      const longsToMint = createTokenAmount(1000)

      await weth2.approve(marginPool.address, collateralAmounts[0], { from: seller })

      await oracle.setRealTimePrice(usdc.address, createTokenAmount(1))
      await oracle.setRealTimePrice(weth.address, strike)
      await oracle.setRealTimePrice(weth2.address, strike)

      const actionArgs = [
        getAction(ActionType.OpenVault, {
          owner: seller,
          shortOtoken: longCall.address,
          vaultId: vaultId,
        }),
        getAction(ActionType.DepositCollateral, {
          owner: seller, 
          vaultId: vaultId, 
          from: seller, 
          assets: collaterals, 
          amounts: collateralAmounts
        }),
        getAction(ActionType.MintShortOption, {
          owner: seller, 
          vaultId: vaultId,
          to: seller,
          amount: [longsToMint]
        })
      ]

      await controllerProxy.operate(actionArgs, { from: seller })
      // console.log('seller longs', (await longCall.balanceOf(seller)).toString())
      

    })

    describe('Long oToken', () => {     
      it('should revert if long and short has different underlyings', async () => {
        const shortCall: MockOtokenInstance = await MockOtoken.new()
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() + 1
        
        const strikeShort = createTokenAmount(120)

        const collaterals = [weth2.address,]
        await whitelist.whitelistCollaterals(collaterals)

        // init short call
        await shortCall.init(
          addressBook.address,
          weth2.address,
          usdc.address,
          collaterals,
          strikeShort,
          expiry,
          false,
        )

        await whitelist.whitelistOtoken(shortCall.address, { from: owner })
        assert.isTrue(await whitelist.isWhitelistedOtoken(shortCall.address))
        assert.isTrue(await whitelist.isWhitelistedOtoken(longCall.address))

        const shortsToMint = createTokenAmount(10)

        await longCall.transfer(user, shortsToMint, {'from': seller})
        await longCall.approve(marginPool.address, shortsToMint, { from: user })

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: user,
            shortOtoken: shortCall.address,
            vaultId: vaultId,
          }),
          getAction(ActionType.DepositLongOption, {
            owner: user,
            vaultId: vaultId,
            from: user,
            longOtoken: [longCall.address],
            amount: [shortsToMint],
          }),
          getAction(ActionType.MintShortOption, {
            owner: user, 
            vaultId: vaultId,
            to: user,
            amount: [0]
          })
        ]

        // await controllerProxy.operate(actionArgs, { from: user })

        await expectRevert(controllerProxy.operate(actionArgs, { from: user }), 'not marginable long')

        // const mintedShorts = await shortCall.balanceOf(user)

      })
      it('should revert if long and short token has different collateral', async () => {
        const shortCall: MockOtokenInstance = await MockOtoken.new()
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() + 1
        
        const strikeShort = createTokenAmount(120)

        const collaterals = [weth.address,]
        await whitelist.whitelistCollaterals(collaterals)

        // init short call
        await shortCall.init(
          addressBook.address,
          weth.address,
          usdc.address,
          collaterals,
          strikeShort,
          expiry,
          false,
        )

        await whitelist.whitelistOtoken(shortCall.address, { from: owner })
        assert.isTrue(await whitelist.isWhitelistedOtoken(shortCall.address))
        assert.isTrue(await whitelist.isWhitelistedOtoken(longCall.address))

        const shortsToMint = createTokenAmount(10)

        await longCall.transfer(user, shortsToMint, {'from': seller})
        await longCall.approve(marginPool.address, shortsToMint, { from: user })

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: user,
            shortOtoken: shortCall.address,
            vaultId: vaultId,
          }),
          getAction(ActionType.DepositLongOption, {
            owner: user,
            vaultId: vaultId,
            from: user,
            longOtoken: [longCall.address],
            amount: [shortsToMint],
          }),
          getAction(ActionType.MintShortOption, {
            owner: user, 
            vaultId: vaultId,
            to: user,
            amount: [0]
          })
        ]

        // await controllerProxy.operate(actionArgs, { from: user })

        await expectRevert(controllerProxy.operate(actionArgs, { from: user }), 'not marginable long')

        // const mintedShorts = await shortCall.balanceOf(user)

      })
      it('should revert if long and short token has different expiry', async () => {
        const shortCall: MockOtokenInstance = await MockOtoken.new()
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() + 1
        
        const strikeShort = createTokenAmount(120)

        const collaterals = [weth2.address,]
        await whitelist.whitelistCollaterals(collaterals)

        const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day 

        // init short call
        await shortCall.init(
          addressBook.address,
          weth.address,
          usdc.address,
          collaterals,
          strikeShort,
          resp2bn(await time.latest()).add(expiryTime),
          false,
        )

        await whitelist.whitelistOtoken(shortCall.address, { from: owner })
        assert.isTrue(await whitelist.isWhitelistedOtoken(shortCall.address))
        assert.isTrue(await whitelist.isWhitelistedOtoken(longCall.address))

        const shortsToMint = createTokenAmount(10)

        await longCall.transfer(user, shortsToMint, {'from': seller})
        await longCall.approve(marginPool.address, shortsToMint, { from: user })

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: user,
            shortOtoken: shortCall.address,
            vaultId: vaultId,
          }),
          getAction(ActionType.DepositLongOption, {
            owner: user,
            vaultId: vaultId,
            from: user,
            longOtoken: [longCall.address],
            amount: [shortsToMint],
          }),
          getAction(ActionType.MintShortOption, {
            owner: user, 
            vaultId: vaultId,
            to: user,
            amount: [0]
          })
        ]

        // await controllerProxy.operate(actionArgs, { from: user })

        await expectRevert(controllerProxy.operate(actionArgs, { from: user }), 'not marginable long')

        // const mintedShorts = await shortCall.balanceOf(user)

      })
      it('should make vertical spread on calls', async () => {
        const shortCall: MockOtokenInstance = await MockOtoken.new()
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() + 1
        
        const strikeShort = createTokenAmount(120)

        const collaterals = [weth2.address,]
        await whitelist.whitelistCollaterals(collaterals)

        //const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day 

        // init short call
        await shortCall.init(
          addressBook.address,
          weth.address,
          usdc.address,
          collaterals,
          strikeShort,
          expiry,
          false,
        )

        await whitelist.whitelistOtoken(shortCall.address, { from: owner })
        assert.isTrue(await whitelist.isWhitelistedOtoken(shortCall.address))
        assert.isTrue(await whitelist.isWhitelistedOtoken(longCall.address))

        const shortsToMint = createTokenAmount(10)

        await longCall.transfer(user, shortsToMint, {'from': seller})
        await longCall.approve(marginPool.address, shortsToMint, { from: user })

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: user,
            shortOtoken: shortCall.address,
            vaultId: vaultId,
          }),
          getAction(ActionType.DepositLongOption, {
            owner: user,
            vaultId: vaultId,
            from: user,
            longOtoken: [longCall.address],
            amount: [shortsToMint],
          }),
          getAction(ActionType.MintShortOption, {
            owner: user, 
            vaultId: vaultId,
            to: user,
            amount: [shortsToMint]
          })
        ]

        // await controllerProxy.operate(actionArgs, { from: user })

        await controllerProxy.operate(actionArgs, { from: user })

        const mintedShorts = await shortCall.balanceOf(user)

        assert.isTrue(mintedShorts.toString() == shortsToMint.toString());
      })
      it('should free long when burn short collaterated by this long', async () => {
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() // vault from previous step

        const currenVault = await controllerProxy.vaults(user, vaultCounter)

        const shortCall: MockOtokenInstance = await MockOtoken.at(currenVault.shortOtoken)
        const mintedShorts = await shortCall.balanceOf(user)
        const shortsToBurn = Number(mintedShorts.toString())/2

        const actionArgs = [
          getAction(ActionType.BurnShortOption, {
            owner: user,
            vaultId: vaultId,
            otoken: [shortCall.address],
            amount: [shortsToBurn],
          })
        ]


        //console.log((await longCall.balanceOf(user)).toString())

        await controllerProxy.operate(actionArgs, { from: user })
        const afterBurnVault = await controllerProxy.vaults(user, vaultCounter)


        //console.log(currenVault.longAmount.toString(), currenVault.usedLongAmount.toString())
        //console.log(afterBurnVault.longAmount.toString(), afterBurnVault.usedLongAmount.toString())
        //console.log((await longCall.balanceOf(user)).toString())

        const proportionLongs = Number(currenVault.usedLongAmount.toString())/Number(afterBurnVault.usedLongAmount.toString())
        const proportionShorts = Number(mintedShorts.toString())/Number(shortsToBurn.toString())

        assert.strictEqual(proportionLongs, proportionShorts)
      })
      it('should free long and collaterals when burn short collaterated by this long and collateral tokens', async () => {
        const shortCall: MockOtokenInstance = await MockOtoken.new()
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() + 1 // vault from previous step

        const strikeShort = createTokenAmount(120)

        const collaterals = [weth2.address,]
        
        // await whitelist.whitelistCollaterals(collaterals)

        const longsToDeposit = createTokenAmount(5)
        const shortsToMint = createTokenAmount(10)
        const shortsToBurn1 = createTokenAmount(5)
        const shortsToBurn2 = createTokenAmount(5)       


        const collateralAmounts = [createTokenAmount(1000, wethDecimals)]
        await weth2.approve(marginPool.address, collateralAmounts[0], { from: user })

        await whitelist.whitelistOtoken(shortCall.address, { from: owner })
        assert.isTrue(await whitelist.isWhitelistedOtoken(shortCall.address))
        await longCall.transfer(user, longsToDeposit, {'from': seller})
        await longCall.approve(marginPool.address, longsToDeposit, { from: user })


        // init short call
        await shortCall.init(
          addressBook.address,
          weth.address,
          usdc.address,
          collaterals,
          strikeShort,
          expiry,
          false,
        )

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: user,
            shortOtoken: shortCall.address,
            vaultId: vaultId,
          }),
          getAction(ActionType.DepositLongOption, {
            owner: user,
            vaultId: vaultId,
            from: user,
            longOtoken: [longCall.address],
            amount: [longsToDeposit],
          }),
          getAction(ActionType.DepositCollateral, {
            owner: user,
            vaultId: vaultId,
            from: user,
            assets: collaterals,
            amounts: collateralAmounts
          }),
          getAction(ActionType.MintShortOption, {
            owner: user, 
            vaultId: vaultId,
            to: user,
            amount: [shortsToMint]
          })
        ]
        await controllerProxy.operate(actionArgs, { from: user })
        const [beforeBurnVault,]  = await controllerProxy.getVaultWithDetails(user, vaultId)


        // first burn
        await controllerProxy.operate(
          [
            getAction(ActionType.BurnShortOption, {
              owner: user,
              vaultId: vaultId,
              otoken: [shortCall.address],
              amount: [shortsToBurn1],
            })
          ],
          { from: user }
        )
        const [afterFirstBurnVault,] = await controllerProxy.getVaultWithDetails(user, vaultId)

        // should free collateral first 
        assert.strictEqual(beforeBurnVault.usedLongAmount.toString(), afterFirstBurnVault.usedLongAmount.toString())
        assert.strictEqual(beforeBurnVault.reservedCollateralAmounts[0].toString(), createTokenAmount(5, wethDecimals))
        assert.isTrue(afterFirstBurnVault.reservedCollateralAmounts[0].toString() == '0')

        // second burn
        await controllerProxy.operate(
          [
            getAction(ActionType.BurnShortOption, {
              owner: user,
              vaultId: vaultId,
              otoken: [shortCall.address],
              amount: [shortsToBurn2],
            })
          ],
          { from: user }
        )
        const [afterSecondBurnVault,] = await controllerProxy.getVaultWithDetails(user, vaultId)
        

        // should free long if no collaterals
        assert.isTrue(afterSecondBurnVault.usedLongAmount.toString()=='0')
      })    
      it('should free long and collaterals when burn short if long strike < short strike', async () => {
        const shortCall: MockOtokenInstance = await MockOtoken.new()
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() + 1 // vault from previous step

        const strikeShort = createTokenAmount(90)

        const collaterals = [weth2.address,]
        
        // await whitelist.whitelistCollaterals(collaterals)

        const longsToDeposit = createTokenAmount(5)
        const shortsToMint = createTokenAmount(10)
        const shortsToBurn1 = createTokenAmount(5)
        const shortsToBurn2 = createTokenAmount(5)       


        const collateralAmounts = [createTokenAmount(1000, wethDecimals)]
        await weth2.approve(marginPool.address, collateralAmounts[0], { from: user })

        await whitelist.whitelistOtoken(shortCall.address, { from: owner })
        assert.isTrue(await whitelist.isWhitelistedOtoken(shortCall.address))
        await longCall.transfer(user, longsToDeposit, {'from': seller})
        await longCall.approve(marginPool.address, longsToDeposit, { from: user })


        // init short call
        await shortCall.init(
          addressBook.address,
          weth.address,
          usdc.address,
          collaterals,
          strikeShort,
          expiry,
          false,
        )

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: user,
            shortOtoken: shortCall.address,
            vaultId: vaultId,
          }),
          getAction(ActionType.DepositLongOption, {
            owner: user,
            vaultId: vaultId,
            from: user,
            longOtoken: [longCall.address],
            amount: [longsToDeposit],
          }),
          getAction(ActionType.DepositCollateral, {
            owner: user,
            vaultId: vaultId,
            from: user,
            assets: collaterals,
            amounts: collateralAmounts
          }),
          getAction(ActionType.MintShortOption, {
            owner: user, 
            vaultId: vaultId,
            to: user,
            amount: [shortsToMint]
          })
        ]
        await controllerProxy.operate(actionArgs, { from: user })
        const [beforeBurnVault,]  = await controllerProxy.getVaultWithDetails(user, vaultId)


        // first burn
        await controllerProxy.operate(
          [
            getAction(ActionType.BurnShortOption, {
              owner: user,
              vaultId: vaultId,
              otoken: [shortCall.address],
              amount: [shortsToBurn1],
            })
          ],
          { from: user }
        )
        const [afterFirstBurnVault,] = await controllerProxy.getVaultWithDetails(user, vaultId)

        // should free collateral first 
        assert.strictEqual(beforeBurnVault.usedLongAmount.toString(), afterFirstBurnVault.usedLongAmount.toString())
        assert.strictEqual(beforeBurnVault.reservedCollateralAmounts[0].toString(), createTokenAmount(5, wethDecimals))
        assert.strictEqual(afterFirstBurnVault.reservedCollateralAmounts[0].toString(), createTokenAmount(5, wethDecimals-1))
        assert.strictEqual(afterFirstBurnVault.usedLongAmount.toString(), createTokenAmount(5))
        //assert.strictEqual(afterFirstBurnVault.reservedCollateralAmounts[0].toString(), '0')

        // second burn
        await controllerProxy.operate(
          [
            getAction(ActionType.BurnShortOption, {
              owner: user,
              vaultId: vaultId,
              otoken: [shortCall.address],
              amount: [shortsToBurn2],
            })
          ],
          { from: user }
        )
        const [afterSecondBurnVault,] = await controllerProxy.getVaultWithDetails(user, vaultId)
        

        // should free long if no collaterals
        assert.isTrue(afterSecondBurnVault.usedLongAmount.toString()=='0')
        assert.isTrue(afterSecondBurnVault.reservedCollateralAmounts[0].toString()=='0')
      })    
    })    
    describe('Redeem', () => {
      const expiryTime = BigNumber.from(60 * 60 * 24) // after 1 day 
      it('should redeem from undercollaretized call', async () => {
        // Call
        // underlying price 100 -> 200
        // strike 100
        // collateral price 100 -> 10
        //

        const shortCall: MockOtokenInstance = await MockOtoken.new()
        const strike = createTokenAmount(100)
        const strike_x2 = createTokenAmount(200)
        const strike_div10 = createTokenAmount(10)

        const collaterals = [weth2.address,]
        await whitelist.whitelistCollaterals(collaterals)

        // init call
        await shortCall.init(
          addressBook.address,
          weth.address,
          usdc.address,
          collaterals,
          strike,
          resp2bn(await time.latest()).add(expiryTime),
          false,
        )        

        await whitelist.whitelistOtoken(shortCall.address, { from: owner })
        assert.isTrue(await whitelist.isWhitelistedOtoken(shortCall.address))
        
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() + 1
        const collateralAmounts = [createTokenAmount(10, wethDecimals)]
        const shortsToMint = createTokenAmount(10)
        const shortsToSell = createTokenAmount(2)

        await weth2.approve(marginPool.address, collateralAmounts[0], { from: user })

        await oracle.setRealTimePrice(usdc.address, createTokenAmount(1))
        await oracle.setRealTimePrice(weth.address, strike)
        await oracle.setRealTimePrice(weth2.address, strike)

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: user,
            shortOtoken: shortCall.address,
            vaultId: vaultId,
          }),
          getAction(ActionType.DepositCollateral, {
            owner: user, 
            vaultId: vaultId, 
            from: user, 
            assets: collaterals, 
            amounts: collateralAmounts
          }),
          getAction(ActionType.MintShortOption, {
            owner: user, 
            vaultId: vaultId,
            to: user,
            amount: [shortsToMint]
          })
        ]

        await controllerProxy.operate(actionArgs, { from: user })
        await time.increase(expiryTime.toNumber()) // increase time with one hour in seconds

        const expiryTimestamp = await shortCall.expiryTimestamp()
        const curTime = resp2bn(await time.latest())

        assert.isTrue(curTime > expiryTimestamp, "Short otoken hasn't expired")

        // shortCall.transfer(redeemer, createTokenAmount(2))

        console.log('user shorts', (await shortCall.balanceOf(user)).toString())

        await shortCall.transfer(redeemer, shortsToSell, { from: user })


        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiryTimestamp, createTokenAmount(1), true)        
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth2.address, expiryTimestamp, strike_div10, true)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiryTimestamp, strike_x2, true)

        const actionArgsRedeem = [
          getAction(ActionType.Redeem, {
            receiver: redeemer,
            otoken: [shortCall.address],
            amount: [shortsToSell],
          }),
        ]

        await controllerProxy.operate(actionArgsRedeem, { from: redeemer })

      })
      it('should redeem from undercollaretized put', async () => {
        // Put
        // underlying price 100 -> 50
        // strlke 100
        // collateral price 1 -> 0.01
        //

        const shortPut: MockOtokenInstance = await MockOtoken.new()
        const strike = createTokenAmount(100)
        const strike_div2 = createTokenAmount(50)
        const collateral_start_price = createTokenAmount(1)
        const collateral_expiry_price = createTokenAmount(0.01)

        const collaterals = [usdc2.address,]
        await whitelist.whitelistCollaterals(collaterals)

        // init put
        await shortPut.init(
          addressBook.address,
          weth.address,
          usdc.address,
          collaterals,
          strike,
          resp2bn(await time.latest()).add(expiryTime),
          true,
        )       

        await whitelist.whitelistOtoken(shortPut.address, { from: owner })
        assert.isTrue(await whitelist.isWhitelistedOtoken(shortPut.address))
        
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() + 1
        const collateralAmounts = [createTokenAmount(1000, usdcDecimals)]
        const shortsToMint = createTokenAmount(10)
        const shortsToSell = createTokenAmount(2)
         
        await usdc2.approve(marginPool.address, collateralAmounts[0], { from: user })

        await oracle.setRealTimePrice(weth.address, strike)        
        await oracle.setRealTimePrice(usdc.address, collateral_start_price)
        await oracle.setRealTimePrice(usdc2.address, collateral_start_price)

        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: user,
            shortOtoken: shortPut.address,
            vaultId: vaultId,
          }),
          getAction(ActionType.DepositCollateral, {
            owner: user, 
            vaultId: vaultId, 
            from: user, 
            assets: collaterals, 
            amounts: collateralAmounts
          }),
          getAction(ActionType.MintShortOption, {
            owner: user, 
            vaultId: vaultId,
            to: user,
            amount: [shortsToMint]
          })
        ]

        await controllerProxy.operate(actionArgs, { from: user })
        await time.increase(expiryTime.toNumber()) // increase time with one hour in seconds

        const expiryTimestamp = await shortPut.expiryTimestamp()
        const curTime = resp2bn(await time.latest())

        assert.isTrue(curTime > expiryTimestamp, "Short otoken hasn't expired")

        // shortCall.transfer(redeemer, createTokenAmount(2))

        console.log('user shorts', (await shortPut.balanceOf(user)).toString())

        await shortPut.transfer(redeemer, shortsToSell, { from: user })


        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc.address, expiryTimestamp, collateral_start_price, true)        
        await oracle.setExpiryPriceFinalizedAllPeiodOver(usdc2.address, expiryTimestamp, collateral_expiry_price, true)
        await oracle.setExpiryPriceFinalizedAllPeiodOver(weth.address, expiryTimestamp, strike_div2, true)

        const actionArgsRedeem = [
          getAction(ActionType.Redeem, {
            receiver: redeemer,
            otoken: [shortPut.address],
            amount: [shortsToSell],
          }),
        ]

        await controllerProxy.operate(actionArgsRedeem, { from: redeemer })


    
      })
      it('should mint on max collateral', async () => {
        const shortCall: MockOtokenInstance = await MockOtoken.new()
        const strike = createTokenAmount(100)

        const collaterals = [weth2.address,]
        await whitelist.whitelistCollaterals(collaterals)

        // init call
        await shortCall.init(
          addressBook.address,
          weth.address,
          usdc.address,
          collaterals,
          strike,
          resp2bn(await time.latest()).add(expiryTime),
          false,
        )        

        await whitelist.whitelistOtoken(shortCall.address, { from: owner })
        assert.isTrue(await whitelist.isWhitelistedOtoken(shortCall.address))
        
        const vaultCounter = resp2bn(await controllerProxy.accountVaultCounter(user))
        const vaultId = vaultCounter.toNumber() + 1
        const collateralAmounts = [createTokenAmount(123, wethDecimals)]
        const shortsToMint = createTokenAmount(0)

        await weth2.approve(marginPool.address, collateralAmounts[0], { from: user })

        await oracle.setRealTimePrice(usdc.address, createTokenAmount(1))
        await oracle.setRealTimePrice(weth.address, strike)
        await oracle.setRealTimePrice(weth2.address, strike)



        const actionArgs = [
          getAction(ActionType.OpenVault, {
            owner: user,
            shortOtoken: shortCall.address,
            vaultId: vaultId,
          }),
          getAction(ActionType.DepositCollateral, {
            owner: user, 
            vaultId: vaultId, 
            from: user, 
            assets: collaterals, 
            amounts: collateralAmounts
          }),
          getAction(ActionType.MintShortOption, {
            owner: user, 
            vaultId: vaultId,
            to: user,
            amount: [shortsToMint]
          })
        ]

        await controllerProxy.operate(actionArgs, { from: user })

        const mintedShorts = await shortCall.balanceOf(user)

        assert.strictEqual(mintedShorts.toString(),'12300000000')
      })
    })
  }



  
)
