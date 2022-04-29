import {
  ONtoken as ONtokenInstance,
  MockERC20 as MockERC20Instance,
  MockAddressBook as MockAddressBookInstance,
} from '../../typechain-types'

import { artifacts, contract, web3 } from 'hardhat'
import { assert } from 'chai'

const ONtoken = artifacts.require('ONtoken.sol')
const MockERC20 = artifacts.require('MockERC20.sol')
const MockAddressBook = artifacts.require('MockAddressBook')

import { createTokenAmount } from '../helpers/utils'
import { expectRevert, expectEvent, time } from '@openzeppelin/test-helpers'
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber'

contract('ONtoken', ([deployer, controller, user1, user2, random]) => {
  let addressBook: MockAddressBookInstance
  let onToken: ONtokenInstance
  let usdc: MockERC20Instance
  let weth: MockERC20Instance
  let addressBookAddr: string

  // let expiry: number;
  const strikePrice = createTokenAmount(200)
  const expiry = 1601020800 // 2020/09/25 0800 UTC
  const isPut = true

  before('Deployment', async () => {
    // Need another mock contract for addressbook when we add ERC20 operations.
    addressBook = await MockAddressBook.new()
    addressBookAddr = addressBook.address
    await addressBook.setController(controller)

    // deploy onToken with addressbook
    onToken = await ONtoken.new()

    usdc = await MockERC20.new('USDC', 'USDC', 6)
    weth = await MockERC20.new('WETH', 'WETH', 18)
  })

  describe('ONtoken Initialization', () => {
    it('should be able to initialize with put parameter correctly', async () => {
      /* init
      address _addressBook,
      address _underlyingAsset,
      address _strikeAsset,
      address[] calldata _collateralAssets,
      uint256 _strikePrice,
      uint256 _expiryTimestamp,
      bool _isPut
      */
      await onToken.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        expiry,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await onToken.underlyingAsset(), weth.address)
      assert.equal(await onToken.strikeAsset(), usdc.address)
      assert.equal(await onToken.collateralAssets(0), usdc.address)
      assert.equal((await onToken.strikePrice()).toString(), strikePrice.toString())
      assert.equal(await onToken.isPut(), isPut)
      assert.equal((await onToken.expiryTimestamp()).toNumber(), expiry)
    })

    it('should initilized the put option with valid name / symbol', async () => {
      assert.equal(await onToken.name(), `WETHUSDC 25-September-2020 200Put USDC Collateral`)
      assert.equal(await onToken.symbol(), `oWETHUSDC/USDC-25SEP20-200P`)
      assert.equal(await onToken.decimals(), 8)
    })

    it('should get correct onToken details', async () => {
      /* getONtokenDetails
            collateralAssets,
            collateralsAmounts,
            collateralsValues,
            collateralsDecimals,
            underlyingAsset,
            strikeAsset,
            strikePrice,
            expiryTimestamp,
            isPut,
            collaterizedTotalAmount
      */
      const onTokenDetails = await onToken.getONtokenDetails()
      assert.equal(onTokenDetails[0][0], usdc.address, 'getONtokenDetails collateralAssets mismatch')
      assert.equal(onTokenDetails[1][0].toString(), '0', 'getONtokenDetails collateralsAmounts must be zero')
      assert.equal(onTokenDetails[2][0].toString(), '0', 'getONtokenDetails collateralsValues must be zero')
      assert.equal(onTokenDetails[3][0].toString(), '6', 'getONtokenDetails collateralsDecimals must be zero')
      assert.equal(onTokenDetails[4].toString(), weth.address, 'getONtokenDetails underlyingAsset mismatch')
      assert.equal(onTokenDetails[5].toString(), usdc.address, 'getONtokenDetails strike asset mismatch')
      assert.equal(onTokenDetails[6].toString(), strikePrice.toString(), 'getONtokenDetails strike price mismatch')
      assert.equal(onTokenDetails[7].toString(), expiry.toString(), 'getONtokenDetails expiry mismatch')
      assert.equal(onTokenDetails[8], isPut, 'getONtokenDetails isPut mismatch')
      assert.equal(onTokenDetails[9].toString(), '0', 'getONtokenDetails collaterizedTotalAmount must be zero')
    })

    it('should revert when init is called again with the same parameters', async () => {
      await expectRevert(
        onToken.init(addressBookAddr, weth.address, usdc.address, [usdc.address], ['0'], strikePrice, expiry, isPut),
        'Initializable: contract is already initialized'
      )
    })

    it('should revert when init is called again with different parameters', async () => {
      await expectRevert(
        onToken.init(addressBookAddr, usdc.address, weth.address, [weth.address], ['0'], strikePrice, expiry, false),
        'Initializable: contract is already initialized'
      )
    })

    it('should set the right name for calls', async () => {
      const callOption = await ONtoken.new()
      await callOption.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [weth.address],
        ['0'],
        strikePrice,
        expiry,
        false,
        {
          from: deployer,
        }
      )
      assert.equal(await callOption.name(), `WETHUSDC 25-September-2020 200Call WETH Collateral`)
      assert.equal(await callOption.symbol(), `oWETHUSDC/WETH-25SEP20-200C`)
    })

    it('should set the right name for multicollateral onTokens', async () => {
      const callOption = await ONtoken.new()
      await callOption.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [weth.address, usdc.address],
        ['0', '0'],
        strikePrice,
        expiry,
        false,
        {
          from: deployer,
        }
      )
      assert.equal(await callOption.name(), `WETHUSDC 25-September-2020 200Call MULTI02 Collateral`)
      assert.equal(await callOption.symbol(), `oWETHUSDC/MULTI02-25SEP20-200C`)
    })

    it('should set the right name and symbol for option with strikePrice < 1', async () => {
      // strike price with lots of ending zeros
      const strikePrice = createTokenAmount(5, 7)
      const o1 = await ONtoken.new()
      await o1.init(addressBookAddr, weth.address, usdc.address, [usdc.address], ['0'], strikePrice, expiry, true, {
        from: deployer,
      })
      assert.equal(await o1.name(), `WETHUSDC 25-September-2020 0.5Put USDC Collateral`)
      assert.equal(await o1.symbol(), `oWETHUSDC/USDC-25SEP20-0.5P`)
    })

    it('should set the right name and symbol for option with strikePrice < 1, with 8 decimals', async () => {
      // strike price with 8 decimals
      const strikePrice2 = createTokenAmount(10052, 0)
      const o2 = await ONtoken.new()
      await o2.init(addressBookAddr, weth.address, usdc.address, [usdc.address], ['0'], strikePrice2, expiry, true, {
        from: deployer,
      })
      assert.equal(await o2.name(), `WETHUSDC 25-September-2020 0.00010052Put USDC Collateral`)
      assert.equal(await o2.symbol(), `oWETHUSDC/USDC-25SEP20-0.00010052P`)
    })

    it('should set the right name and symbol for option with strikePrice < 1, with starting and trailing zeroes.', async () => {
      const strikePrice3 = createTokenAmount(729, 4)
      const o3 = await ONtoken.new()
      await o3.init(addressBookAddr, weth.address, usdc.address, [usdc.address], ['0'], strikePrice3, expiry, true, {
        from: deployer,
      })
      assert.equal(await o3.name(), `WETHUSDC 25-September-2020 0.0729Put USDC Collateral`)
      assert.equal(await o3.symbol(), `oWETHUSDC/USDC-25SEP20-0.0729P`)
    })

    it('should set the right name for option with strikePrice 0', async () => {
      const strikePrice = '0'
      const onToken = await ONtoken.new()
      await onToken.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        expiry,
        true,
        {
          from: deployer,
        }
      )
      assert.equal(await onToken.name(), `WETHUSDC 25-September-2020 0Put USDC Collateral`)
      assert.equal(await onToken.symbol(), `oWETHUSDC/USDC-25SEP20-0P`)
    })

    it('should set the right name for non-eth options', async () => {
      const weth = await MockERC20.new('WETH', 'WETH', 18)
      const putOption = await ONtoken.new()
      await putOption.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        expiry,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await putOption.name(), `WETHUSDC 25-September-2020 200Put USDC Collateral`)
      assert.equal(await putOption.symbol(), `oWETHUSDC/USDC-25SEP20-200P`)
    })

    it('should revert when init asset with non-erc20 address', async () => {
      /* This behavior should've been banned by factory) */
      const put = await ONtoken.new()
      await expectRevert(
        put.init(addressBookAddr, random, usdc.address, [usdc.address], ['0'], strikePrice, expiry, isPut, {
          from: deployer,
        }),
        'revert'
      )
    })

    it('should set the right name for options with 0 expiry (should be banned by factory)', async () => {
      /* This behavior should've been banned by factory) */
      const onToken = await ONtoken.new()
      await onToken.init(addressBookAddr, weth.address, usdc.address, [usdc.address], ['0'], strikePrice, 0, isPut, {
        from: deployer,
      })
      assert.equal(await onToken.name(), `WETHUSDC 01-January-1970 200Put USDC Collateral`)
      assert.equal(await onToken.symbol(), `oWETHUSDC/USDC-01JAN70-200P`)
    })

    it('should set the right name for options expiry on 2345/12/31', async () => {
      /** This is the largest timestamp that the factoy will allow (the largest bokkypoobah covers) **/
      const onToken = await ONtoken.new()
      const _expiry = '11865394800' // Mon, 31 Dec 2345
      await onToken.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        _expiry,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await onToken.name(), `WETHUSDC 31-December-2345 200Put USDC Collateral`)
      assert.equal(await onToken.symbol(), `oWETHUSDC/USDC-31DEC45-200P`)
    })

    it('should set the right symbol for year 220x ', async () => {
      const expiry = 7560230400 // 2209-07-29
      const onToken = await ONtoken.new()
      await onToken.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        expiry,
        true,
        {
          from: deployer,
        }
      )
      assert.equal(await onToken.symbol(), 'oWETHUSDC/USDC-29JUL09-200P')
      assert.equal(await onToken.name(), 'WETHUSDC 29-July-2209 200Put USDC Collateral')
    })

    it('should set the right name and symbol for expiry on each month', async () => {
      // We need to go through all decision branches in _getMonth() to make a 100% test coverage.
      const January = await ONtoken.new()
      await January.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1893456000,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await January.name(), 'WETHUSDC 01-January-2030 200Put USDC Collateral')
      assert.equal(await January.symbol(), 'oWETHUSDC/USDC-01JAN30-200P')

      const February = await ONtoken.new()
      await February.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1896134400,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await February.name(), 'WETHUSDC 01-February-2030 200Put USDC Collateral')
      assert.equal(await February.symbol(), 'oWETHUSDC/USDC-01FEB30-200P')

      const March = await ONtoken.new()
      await March.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1898553600,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await March.name(), 'WETHUSDC 01-March-2030 200Put USDC Collateral')
      assert.equal(await March.symbol(), 'oWETHUSDC/USDC-01MAR30-200P')

      const April = await ONtoken.new()
      await April.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1901232000,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await April.name(), 'WETHUSDC 01-April-2030 200Put USDC Collateral')
      assert.equal(await April.symbol(), 'oWETHUSDC/USDC-01APR30-200P')

      const May = await ONtoken.new()
      await May.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1903824000,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await May.name(), 'WETHUSDC 01-May-2030 200Put USDC Collateral')
      assert.equal(await May.symbol(), 'oWETHUSDC/USDC-01MAY30-200P')

      const June = await ONtoken.new()
      await June.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1906502400,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await June.name(), 'WETHUSDC 01-June-2030 200Put USDC Collateral')
      assert.equal(await June.symbol(), 'oWETHUSDC/USDC-01JUN30-200P')

      const July = await ONtoken.new()
      await July.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1909094400,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await July.name(), 'WETHUSDC 01-July-2030 200Put USDC Collateral')
      assert.equal(await July.symbol(), 'oWETHUSDC/USDC-01JUL30-200P')

      const August = await ONtoken.new()
      await August.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1911772800,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await August.name(), 'WETHUSDC 01-August-2030 200Put USDC Collateral')
      assert.equal(await August.symbol(), 'oWETHUSDC/USDC-01AUG30-200P')

      const September = await ONtoken.new()
      await September.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1914451200,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await September.name(), 'WETHUSDC 01-September-2030 200Put USDC Collateral')
      assert.equal(await September.symbol(), 'oWETHUSDC/USDC-01SEP30-200P')

      const October = await ONtoken.new()
      await October.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1917043200,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await October.name(), 'WETHUSDC 01-October-2030 200Put USDC Collateral')
      assert.equal(await October.symbol(), 'oWETHUSDC/USDC-01OCT30-200P')

      const November = await ONtoken.new()
      await November.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1919721600,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await November.name(), 'WETHUSDC 01-November-2030 200Put USDC Collateral')
      assert.equal(await November.symbol(), 'oWETHUSDC/USDC-01NOV30-200P')

      const December = await ONtoken.new()
      await December.init(
        addressBookAddr,
        weth.address,
        usdc.address,
        [usdc.address],
        ['0'],
        strikePrice,
        1922313600,
        isPut,
        {
          from: deployer,
        }
      )
      assert.equal(await December.name(), 'WETHUSDC 01-December-2030 200Put USDC Collateral')
      assert.equal(await December.symbol(), 'oWETHUSDC/USDC-01DEC30-200P')
    })

    it('should display strikePrice as $0 in name and symbol when strikePrice < 10^18', async () => {
      const testONtoken = await ONtoken.new()
      await testONtoken.init(addressBookAddr, weth.address, usdc.address, [usdc.address], ['0'], 0, expiry, isPut, {
        from: deployer,
      })
      assert.equal(await testONtoken.name(), `WETHUSDC 25-September-2020 0Put USDC Collateral`)
      assert.equal(await testONtoken.symbol(), `oWETHUSDC/USDC-25SEP20-0P`)
    })
  })

  describe('Token operations: Mint', () => {
    const amountToMint = createTokenAmount(10)
    const collateralAmount = 10
    const collateralValue = 5

    it('should be able to mint tokens from controller address', async () => {
      /* 
        address account,
        uint256 amount,
        uint256[] calldata collateralsAmountsForMint,
        uint256[] calldata collateralsValuesForMint
      
      */
      await onToken.mintONtoken(user1, amountToMint, [collateralAmount], [collateralValue], { from: controller })
      const balance = await onToken.balanceOf(user1)
      assert.equal(balance.toString(), amountToMint.toString())
      assert.equal((await onToken.getCollateralsAmounts())[0].toString(), collateralAmount.toString())
      assert.equal((await onToken.getCollateralsValues())[0].toString(), collateralValue.toString())

      const collateralAmount2 = 5
      const collateralValue2 = 5
      await onToken.mintONtoken(user1, amountToMint, [collateralAmount2], [collateralValue2], { from: controller })
      assert.equal(
        (await onToken.getCollateralsAmounts())[0].toString(),
        (collateralAmount + collateralAmount2).toString()
      )
      assert.equal(
        (await onToken.getCollateralsValues())[0].toString(),
        (collateralValue + collateralValue2).toString()
      )
    })

    it('should revert when minting from random address', async () => {
      await expectRevert(
        onToken.mintONtoken(user1, amountToMint, [collateralAmount], [collateralValue], { from: random }),
        'ONtoken: Only Controller can mint ONtokens'
      )
    })

    it('should revert when someone try to mint for himself.', async () => {
      await expectRevert(
        onToken.mintONtoken(user1, amountToMint, [collateralAmount], [collateralValue], { from: user1 }),
        'ONtoken: Only Controller can mint ONtokens'
      )
    })
  })

  describe('Token operations: Transfer', () => {
    const amountToMint = createTokenAmount(10)
    it('should be able to transfer tokens from user 1 to user 2', async () => {
      await onToken.transfer(user2, amountToMint, { from: user1 })
      const balance = await onToken.balanceOf(user2)
      assert.equal(balance.toString(), amountToMint.toString())
    })

    it('should revert when calling transferFrom with no allownace', async () => {
      await expectRevert(
        onToken.transferFrom(user2, user1, amountToMint, { from: random }),
        'ERC20: transfer amount exceeds allowance'
      )
    })

    it('should revert when controller call transferFrom with no allownace', async () => {
      await expectRevert(
        onToken.transferFrom(user2, user1, amountToMint, { from: controller }),
        'ERC20: transfer amount exceeds allowance'
      )
    })

    it('should be able to use transferFrom to transfer token from user2 to user1.', async () => {
      await onToken.approve(random, amountToMint, { from: user2 })
      await onToken.transferFrom(user2, user1, amountToMint, { from: random })
      const user2Remaining = await onToken.balanceOf(user2)
      assert.equal(user2Remaining.toString(), '0')
    })
  })

  describe('Token operations: Burn', () => {
    const amountToMint = createTokenAmount(10)
    it('should revert when burning from random address', async () => {
      await expectRevert(
        onToken.burnONtoken(user1, amountToMint, { from: random }),
        'ONtoken: Only Controller can burn ONtokens'
      )
    })

    it('should revert when someone trys to burn for himeself', async () => {
      await expectRevert(
        onToken.burnONtoken(user1, amountToMint, { from: user1 }),
        'ONtoken: Only Controller can burn ONtokens'
      )
    })

    it('should be able to burn tokens from controller address', async () => {
      const balanceBeforeBurn = await onToken.balanceOf(user1)
      assert.equal(balanceBeforeBurn.toString(), BigNumber.from(amountToMint).mul(2).toString())
      await onToken.burnONtoken(user1, balanceBeforeBurn, { from: controller })
      const balance = await onToken.balanceOf(user1)
      assert.equal(balance.toString(), '0')
    })
  })
})
