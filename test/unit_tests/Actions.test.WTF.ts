import { deployments, ethers, getNamedAccounts} from 'hardhat'
import {ActionTester} from '../../typechain-types'
import { ActionType, getAction } from '../helpers/actions'
import { expect } from 'chai'

const { get } = deployments

let actionTester: ActionTester;
const ZERO_ADDR = '0x0000000000000000000000000000000000000000'

describe('Parse Deposit Arguments', function () {
    before(async () => {
        await deployments.fixture(['ActionTester'])
        const ActionTester = await get('ActionTester')
        actionTester = (await ethers.getContractAt('AddressBook', ActionTester.address)) as ActionTester
    });
    it('should not be able to parse a non Deposit action', async () => {
        const {deployer} = await getNamedAccounts();
        const data = {
          actionType: ActionType.OpenVault,
          owner: deployer,
          secondAddress: deployer,
          assets: [ZERO_ADDR, ZERO_ADDR],
          vaultId: '0',
          amounts: ['10', '10'],
          index: '0',
          data: ZERO_ADDR,
        }
        await expect(actionTester.testParseDespositAction(data)).to.be.revertedWith("A8");
      }) 
    }
)