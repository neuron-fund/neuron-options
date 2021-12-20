import { expect } from 'chai'
import { deployments, ethers, getNamedAccounts } from 'hardhat'
import { ActionArgsStruct } from '../typechain-types/Controller'
import { namedAccountsSigners } from '../utils/hardhat'
import { ActionType, getAction } from './helpers/actions'
import { testDeploy } from './helpers/fixtures'

describe('Open Vault', function () {
  it('open vault without non whitelisted oToken', async () => {
    const { user } = await namedAccountsSigners(getNamedAccounts)
    const { controller } = await testDeploy()

    const actions: ActionArgsStruct[] = [
      getAction(ActionType.OpenVault, {
        owner: user.address,
        shortOtoken: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
        vaultId: 1,
      }),
    ]
    await expect(controller.connect(user).operate(actions)).to.be.revertedWith('C23')
  })
  it('open vault with wrong vaultId', async () => {
    const { user } = await namedAccountsSigners(getNamedAccounts)
    const { controller } = await testDeploy()
    const actions: ActionArgsStruct[] = [
      getAction(ActionType.OpenVault, {
        owner: user.address,
        shortOtoken: '0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8',
        vaultId: 0,
      }),
    ]
    await expect(controller.connect(user).operate(actions)).to.be.revertedWith('C15')
  })
})
