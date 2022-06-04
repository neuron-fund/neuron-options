import { expect, assert } from 'chai'

import { ethers, contract } from 'hardhat'
import { ActionTester as ActionTesterType } from '../../typechain-types'
import { ActionType, getAction } from '../helpers/actions'

let actionTester: ActionTesterType

const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

const arr2str = (arr: Array<any>) => JSON.stringify(arr.map(item => item.toString()))
contract('Actions', ([owner, random, random_user, random_user2, random_user3]) => {
  before(async () => {
    const ActionTester = await ethers.getContractFactory('ActionTester')
    actionTester = (await ActionTester.deploy()) as ActionTesterType
    await actionTester.deployed()
  })
  describe('Parse Deposit Arguments', function () {
    it('should not be able to parse a non Deposit action', async () => {
      //const {deployer: owner} = await getNamedAccounts();
      const data = {
        actionType: ActionType.OpenVault,
        owner: owner,
        secondAddress: owner,
        assets: [ZERO_ADDR, ZERO_ADDR],
        vaultId: '0',
        amounts: ['10', '10'],
        index: '0',
        data: ZERO_ADDR,
      }
      await expect(actionTester.testParseDespositCollateralAction(data)).to.be.revertedWith('A8')
    })
    it('should not be able to parse an invalid sender address', async () => {
      // const {deployer: owner} = await getNamedAccounts();
      const data = {
        actionType: ActionType.DepositCollateral,
        owner: ZERO_ADDR,
        secondAddress: owner,
        assets: [ZERO_ADDR, ZERO_ADDR],
        vaultId: '0',
        amounts: ['10', '10'],
        index: '0',
        data: ZERO_ADDR,
      }
      await expect(actionTester.testParseDespositCollateralAction(data)).to.be.revertedWith('A9')
    })
    it('should be able to parse arguments for a deposit long action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.DepositLongOption
      const assets = [ZERO_ADDR]
      const vaultId = '1'
      const amounts = ['10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: random,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await actionTester.testParseDespositLongAction(data)
      const depositArgs = await actionTester.getDepositLongArgs()

      assert.equal(depositArgs.owner, owner, 'owner error')
      assert.equal(depositArgs.amount.toString(), amounts[0], `amounts err`)
      // assert.equal(arr2str(depositArgs.assets), arr2str(assets), 'assets error')
      assert.equal(depositArgs.from, random)
      assert.equal(depositArgs.vaultId.toString(), vaultId)
    })
    it('should be able to parse arguments for a deposit collateral action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();

      const actionType = ActionType.DepositCollateral
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '3'
      const amounts = ['10', '0']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: random,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await actionTester.testParseDespositCollateralAction(data)

      const depositArgs = await actionTester.getDepositCollateralArgs()
      assert.equal(depositArgs.owner, random)
      assert.equal(arr2str(depositArgs.amounts), arr2str(amounts), `amounts err`)
      // assert.equal(arr2str(depositArgs.assets), arr2str(assets), 'assets error')
      assert.equal(depositArgs.from, owner)
      assert.equal(depositArgs.vaultId.toString(), vaultId)
    })
  })
  describe('Parse Open Vault Arguments', () => {
    it('should not be able to parse a non Open Vault action', async () => {
      // const {deployer: owner} = await getNamedAccounts();
      const data = {
        actionType: ActionType.DepositCollateral,
        owner: owner,
        secondAddress: owner,
        assets: [ZERO_ADDR, ZERO_ADDR],
        vaultId: '0',
        amounts: ['10', '10'],
        index: '0',
        data: ZERO_ADDR,
      }
      await expect(actionTester.testParseOpenVaultAction(data)).to.be.revertedWith('A1')
    })
    it('should not be able to parse an invalid owner address', async () => {
      // const {deployer: owner} = await getNamedAccounts();
      const actionType = ActionType.OpenVault
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '0'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: ZERO_ADDR,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }
      await expect(actionTester.testParseOpenVaultAction(data)).to.be.revertedWith('A2')
    })
    it('should be able to parse arguments for an open vault action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.OpenVault
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '1'
      const amounts = ['10', '10']
      const index = '0'
      //const bytesArgs = web3.eth.abi.encodeParameter('uint256', 0)
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: random,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await actionTester.testParseOpenVaultAction(data)

      const depositArgs = await actionTester.getOpenVaultArgs()

      assert.equal(depositArgs.owner, owner)
      // assert.equal(depositArgs.vaultTypes, new BigNumber(0))
      assert.equal(depositArgs.shortONtoken, random)
    })
  })
  describe('Parse Redeem Arguments', () => {
    it('should not be able to parse a non Redeem action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const data = {
        actionType: ActionType.OpenVault,
        owner: owner,
        secondAddress: owner,
        assets: [ZERO_ADDR],
        vaultId: '0',
        amounts: ['10'],
        index: '0',
        data: ZERO_ADDR,
      }

      await expect(actionTester.testParseRedeemAction(data)).to.be.revertedWith('A13')
    })
    it('should not be able to redeem more than one token', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const data = {
        actionType: ActionType.Redeem,
        owner: owner,
        secondAddress: owner,
        assets: [random, random],
        vaultId: '0',
        amounts: ['10'],
        index: '0',
        data: ZERO_ADDR,
      }
      await expect(actionTester.testParseRedeemAction(data)).to.be.revertedWith('A26')

      data['assets'] = [ZERO_ADDR]
      await expect(actionTester.testParseRedeemAction(data)).to.be.revertedWith('A27')

      data['assets'] = [random]
      data['amounts'] = ['10', '10']
      await expect(actionTester.testParseRedeemAction(data)).to.be.revertedWith('A28')

      data['amounts'] = ['0']
      await expect(actionTester.testParseRedeemAction(data)).to.be.revertedWith('A29')
    })
    it('should be able to parse arguments for an redeem action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.Redeem
      const assets = [random] // A26 err on ZERO_ADDR
      const vaultId = '1'
      const amounts = ['10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: random,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await actionTester.testParseRedeemAction(data)

      const depositArgs = await actionTester.getRedeemArgs()
      assert.equal(depositArgs.receiver, random)
      assert.equal(depositArgs.onToken, assets[0])
      assert.equal(depositArgs.amount.toString(), amounts[0])
    })
  })
  describe('Parse Settle Vault Arguments', () => {
    it('should not be able to parse a non Settle Vault action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.OpenVault
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '0'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await expect(actionTester.testParseSettleVaultAction(data)).to.be.revertedWith('A15')
    })
    it('should not be able to parse an invalid owner address', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.SettleVault
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '0'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: ZERO_ADDR,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await expect(actionTester.testParseSettleVaultAction(data)).to.be.revertedWith('A16')
    })
    it('should be able to parse arguments for a settle vault action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.SettleVault
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '1'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: random,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await actionTester.testParseSettleVaultAction(data)

      const depositArgs = await actionTester.getSettleVaultArgs()
      assert.equal(depositArgs.owner, owner)
      assert.equal(depositArgs.to, random)
      assert.equal(depositArgs.vaultId.toString(), vaultId)
    })
    it('should not be able to parse an invalid sender address', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.SettleVault
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '0'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: ZERO_ADDR,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await expect(actionTester.testParseSettleVaultAction(data)).to.be.revertedWith('A17')
    })
  })
  describe('Parse Withdraw Arguments', () => {
    it('should not be able to parse a non withdraw action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.OpenVault
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '0'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await expect(actionTester.testParseWithdrawAction(data)).to.be.revertedWith('A10')
    })
    it('should not be able to parse an invalid sender address', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.WithdrawCollateral
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '0'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: ZERO_ADDR,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await expect(actionTester.testParseWithdrawAction(data)).to.be.revertedWith('A12')
    })
    it('should not be able to parse an invalid owner address', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.WithdrawCollateral
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '0'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: ZERO_ADDR,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await expect(actionTester.testParseWithdrawAction(data)).to.be.revertedWith('A11')
    })
    it('should be able to parse arguments for a withdraw long action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.WithdrawLongOption
      const assets = [ZERO_ADDR]
      const vaultId = '1'
      const amounts = ['10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: random,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await actionTester.testParseWithdrawLong(data)

      const depositArgs = await actionTester.getWithdrawLong()
      assert.equal(depositArgs.owner, owner)
      assert.equal(depositArgs.to, random)
      assert.equal(depositArgs.vaultId.toString(), vaultId)
    })
    it('should be able to parse arguments for a withdraw collateral action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.WithdrawCollateral
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '3'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: random,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await actionTester.testParseWithdrawAction(data)

      const depositArgs = await actionTester.getWithdrawArgs()
      assert.equal(depositArgs.owner, random)
      assert.equal(depositArgs.amounts[0].toString(), amounts[0])
      // assert.equal(depositArgs.asset, assets[0])
      assert.equal(depositArgs.to, owner)
      assert.equal(depositArgs.vaultId.toString(), vaultId)
      // assert.equal(depositArgs.index.toString(), index)
    })
  })
  describe('Parse Mint Arguments', () => {
    it('should not be able to parse a non Mint action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const data = {
        actionType: ActionType.OpenVault,
        owner: ZERO_ADDR,
        secondAddress: owner,
        assets: [ZERO_ADDR, ZERO_ADDR],
        vaultId: '0',
        amounts: ['10', '10'],
        index: '0',
        data: ZERO_ADDR,
      }

      await expect(actionTester.testParseMintAction(data)).to.be.revertedWith('A4')
    })
    it('should not be able to parse an invalid sender address', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.MintShortOption
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '0'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: ZERO_ADDR,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await expect(actionTester.testParseMintAction(data)).to.be.revertedWith('A5')
    })

    it('should be able to parse arguments for a mint short action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.MintShortOption
      const assets = [ZERO_ADDR]
      const vaultId = '1'
      const amounts = ['10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: random,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await actionTester.testParseMintAction(data)

      const mintArgs = await actionTester.getMintArgs()
      assert.equal(mintArgs.owner, owner)
      assert.equal(mintArgs.amount.toString(), amounts[0])
      //assert.equal(mintArgs.onToken, assets[0])
      assert.equal(mintArgs.to, random)
      assert.equal(mintArgs.vaultId.toString(), vaultId)
      // assert.equal(mintArgs.index.toString(), index)
    })
    it('should be able to parse arguments for a mint short action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.MintShortOption
      const assets = [ZERO_ADDR]
      const vaultId = '3'
      const amounts = ['10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: random,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await actionTester.testParseMintAction(data)

      const mintArgs = await actionTester.getMintArgs()
      assert.equal(mintArgs.owner, random)
      assert.equal(mintArgs.amount.toString(), amounts[0])
      //assert.equal(mintArgs.onToken, assets[0])
      assert.equal(mintArgs.to, owner)
      assert.equal(mintArgs.vaultId.toString(), vaultId)
      // assert.equal(mintArgs.index.toString(), index)
    })
  })
  describe('Parse Burn Arguments', () => {
    it('should not be able to parse a non Burn action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.OpenVault
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '0'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await expect(actionTester.testParseBurnAction(data)).to.be.revertedWith('A6')
    })
    it('should not be able to parse an invalid sender address', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.BurnShortOption
      const assets = [ZERO_ADDR, ZERO_ADDR]
      const vaultId = '0'
      const amounts = ['10', '10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: ZERO_ADDR,
        secondAddress: owner,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await expect(actionTester.testParseBurnAction(data)).to.be.revertedWith('A7')
    })
    it('should be able to parse arguments for a burn short action', async () => {
      // const {deployer: owner, random_user: random} = await getNamedAccounts();
      const actionType = ActionType.BurnShortOption
      const assets = [ZERO_ADDR]
      const vaultId = '1'
      const amounts = ['10']
      const index = '0'
      const bytesArgs = ZERO_ADDR

      const data = {
        actionType: actionType,
        owner: owner,
        secondAddress: random,
        assets: assets,
        vaultId: vaultId,
        amounts: amounts,
        index: index,
        data: bytesArgs,
      }

      await actionTester.testParseBurnAction(data)

      const burnArgs = await actionTester.getBurnArgs()
      assert.equal(burnArgs.owner, owner)
      assert.equal(burnArgs.amount.toString(), amounts[0])
      assert.equal(burnArgs.vaultId.toString(), vaultId)
      //assert.equal(burnArgs.index.toString(), index)
    })
  })
})
