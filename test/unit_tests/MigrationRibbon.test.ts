import { ethers, network, upgrades } from 'hardhat';
import { BigNumber, Contract, Signer } from 'ethers';
import { expect } from 'chai';
import { expectRevert } from '@openzeppelin/test-helpers'


import {
    MockNeuronCollateralVault,
    LiquidityMigration,
    ILiquidityMigrationVault,
    ERC20,
    IUniswapRouterV2,
} from '../../typechain-types'
import { UNISWAP_ROUTER_V2, WETH } from '../../constants/externalAddresses';
import LiquidityMigrationVaultHelper from '../helpers/LiquidityMigrationVaultHelper';
import LiquidityMigrationNeuronCollateralVaultHelper from '../helpers/LiquidityMigrationNeuronCollateralVaultHelper';

// ----------------------------------------------------------
// ----------------------  CONFIG  --------------------------
// ----------------------------------------------------------

interface Config {
    name: string;
    liquidityMigrationVaultAddress: string;
    underlyingPricer: string;
    collateralPricer: string;
    asset: string;
}

// ----------------------------------------------------------
// ----------------------  PRESETS  -------------------------
// ----------------------------------------------------------

const presets: Config[] = [];

presets.push(
    {
        name: 'ThetaYearnVault',
        liquidityMigrationVaultAddress: '0xCc323557c71C0D1D20a1861Dc69c06C5f3cC9624',
        underlyingPricer: '0x128cE9B4D97A6550905dE7d9Abc2b8C747b0996C',
        collateralPricer: '0xf8e87f16d51879261A2b87F89AA1Bd2c418660B1',
        asset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    },
    // {
    //     name: 'ExampleVault',
    //     liquidityMigrationVaultAddress: '0xCc323557c71C0D1D20a1861Dc69c06C5f3cC9624',
    //     underlyingPricer: '0x128cE9B4D97A6550905dE7d9Abc2b8C747b0996C',
    //     collateralPricer: '0xf8e87f16d51879261A2b87F89AA1Bd2c418660B1',
    //     asset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    // }
);

presets.forEach(config => _runTests(config));

// ----------------------------------------------------------
// -------------  TEST LIQUIDITY MIGRATION  -----------------
// ----------------------------------------------------------

function _runTests(config: Config) {
    describe(`LiquidityMigration.sol - ${config.name}`, () => {
        // ----------------------------------------------------------
        // --------------------  COMMON DATA  -----------------------
        // ----------------------------------------------------------

        // Signers
        let owner: Signer;
        let ownerAddress: string;
        let user: Signer;
        let userAddress: string;
        let donor: Signer;
        let donorAddress: string;

        // Contracts
        let liquidityMigration: LiquidityMigration;
        let mockNeuronCollateralVault: MockNeuronCollateralVault;
        let liquidityMigrationVault: ILiquidityMigrationVault;
        let assetToken: ERC20;

        // Helpers
        let liquidityMigrationVaultHelper: LiquidityMigrationVaultHelper;
        let liquidityMigrationNeuronCollateralVaultHelper: LiquidityMigrationNeuronCollateralVaultHelper;

        // Other
        let liquidityMigrationVaultTokensBalance: BigNumber;
        let currentRound: number;
        let initialBlockNumber;

        // ----------------------------------------------------------
        // --------------------  BEFORE EACH  -----------------------
        // ----------------------------------------------------------

        beforeEach(async () => {
            liquidityMigrationVaultHelper = new LiquidityMigrationVaultHelper({
                liquidityMigrationVaultAddress: config.liquidityMigrationVaultAddress,
                underlyingPricer: config.underlyingPricer,
                collateralPricer: config.collateralPricer,
                asset: config.asset,
            });
            currentRound = await liquidityMigrationVaultHelper.nextRound();

            // Get accounts
            const accounts = await ethers.getSigners();
            owner = accounts[0];
            ownerAddress = await owner.getAddress();
            user = accounts[1];
            userAddress = await user.getAddress();
            donor = accounts[2];
            donorAddress = await donor.getAddress();

            // Deploy 
            liquidityMigrationVault = await _getContract('ILiquidityMigrationVault', config.liquidityMigrationVaultAddress);

            // Create asset tokens
            const { asset } = await liquidityMigrationVault.vaultParams();
            assetToken = await _getContract('ERC20', asset);
            await _createTokens(asset, user);
            const assetBalance = await assetToken.balanceOf(userAddress);

            expect(assetBalance).to.gt(0, 'Asset tokens not received');

            // Deploy
            console.log(`YYS ${asset}`);
            liquidityMigrationNeuronCollateralVaultHelper = new LiquidityMigrationNeuronCollateralVaultHelper(asset);
            mockNeuronCollateralVault = await liquidityMigrationNeuronCollateralVaultHelper.deploy();

            liquidityMigration = await _deployProxy('LiquidityMigration', [config.liquidityMigrationVaultAddress, [mockNeuronCollateralVault.address]]);


            // Get vault tokens
            await assetToken.connect(user).approve(liquidityMigrationVault.address, assetBalance);
            await liquidityMigrationVault.connect(user).deposit(assetBalance);


            currentRound = await liquidityMigrationVaultHelper.nextRound();

            await liquidityMigrationVault.connect(user).maxRedeem();
            liquidityMigrationVaultTokensBalance = await liquidityMigrationVault.balanceOf(userAddress);

            expect(liquidityMigrationVaultTokensBalance).to.gt(0, 'Vault tokens not received');
        });

        // ----------------------------------------------------------
        // ------------------  TESTS DEPOSITS  ----------------------
        // ----------------------------------------------------------

        // it('Single deposit', async () => {
        //     const initialUserVaultBalance = await liquidityMigrationVault.balanceOf(await user.getAddress());

        //     await liquidityMigrationVault.connect(user).approve(liquidityMigration.address, liquidityMigrationVaultTokensBalance);
        //     await liquidityMigration.connect(user).deposit(liquidityMigrationVaultTokensBalance, mockNeuronCollateralVault.address);

        //     const depositReceipt = await liquidityMigration.depositReceipts(currentRound, 0);

        //     const resultUserVaultBalance = await liquidityMigrationVault.balanceOf(await user.getAddress());

        //     expect(resultUserVaultBalance).to.eq(
        //         initialUserVaultBalance.sub(liquidityMigrationVaultTokensBalance),
        //         'Vault tokens have not received',
        //     );
        //     expect(depositReceipt.amount).to.eq(
        //         liquidityMigrationVaultTokensBalance,
        //         'Not all sent vault tokens are received',
        //     );
        // });

        // it('Zero deposit', async () => {
        //     await liquidityMigrationVault.connect(user).approve(liquidityMigration.address, 0);
        //     await expectRevert(liquidityMigration.connect(user).deposit(0, mockNeuronCollateralVault.address), 'ZeroDepositAmount()');
        // });

        // it('Deposit with not witdhrawn last round', async () => {
        //     await liquidityMigrationVault.connect(user).approve(liquidityMigration.address, liquidityMigrationVaultTokensBalance);
        //     await liquidityMigration.connect(user).deposit(liquidityMigrationVaultTokensBalance.div(2), mockNeuronCollateralVault.address);
        //     await liquidityMigrationVaultHelper.nextRound();

        //     await expectRevert(
        //         liquidityMigration.connect(user).deposit(liquidityMigrationVaultTokensBalance.div(2), mockNeuronCollateralVault.address),
        //         'FundsLastRoundNotWithdrawn()',
        //     );
        // });

        // it('Multi deposits', async () => {
        //     const count = 100;
        //     const depositAmount = liquidityMigrationVaultTokensBalance.div(count);
        //     for(let i = 0; i < count; i++) {
        //         await liquidityMigrationVault.connect(user).approve(liquidityMigration.address, depositAmount);
        //         await liquidityMigration.connect(user).deposit(depositAmount, mockNeuronCollateralVault.address);
        //     }
            
        //     const lastDepositReceipt = await liquidityMigration.depositReceipts(currentRound, count - 1);

        //     expect(lastDepositReceipt.amount).to.eq(
        //         depositAmount,
        //         'Last deposit not found',
        //     );
        // });

        
        // ----------------------------------------------------------
        // ------------------  TESTS WITHDRAW  ----------------------
        // ----------------------------------------------------------

        // it('Single withdraw', async () => {
        //     await liquidityMigrationVault.connect(user).approve(liquidityMigration.address, liquidityMigrationVaultTokensBalance);
        //     await liquidityMigration.connect(user).deposit(liquidityMigrationVaultTokensBalance, mockNeuronCollateralVault.address);

        //     await liquidityMigrationVaultHelper.nextRound();

        //     const initialNeuronVaultBalance = await assetToken.balanceOf(mockNeuronCollateralVault.address);

        //     await liquidityMigration.connect(user).withdraw();

        //     console.log(`TYT ${await assetToken.balanceOf(liquidityMigration.address)}`);

        //     const resultNeuronVaultBalance = await assetToken.balanceOf(mockNeuronCollateralVault.address);

        //     console.log(`resultNeuronVaultBalance ${resultNeuronVaultBalance}`);

        //     expect(resultNeuronVaultBalance).to.gt(initialNeuronVaultBalance, 'Funds not received in NeuronVault');
        // });

        it('Multi withdraw', async () => {
            const count = 30;
            const amount = liquidityMigrationVaultTokensBalance.div(count);
            for(let i = 0; i < count; i++) {
                await liquidityMigrationVault.connect(user).approve(liquidityMigration.address, amount);
                await liquidityMigration.connect(user).deposit(amount, mockNeuronCollateralVault.address);
            }
            

            await liquidityMigrationVaultHelper.nextRound();

            const initialNeuronVaultBalance = await assetToken.balanceOf(mockNeuronCollateralVault.address);

            console.log(`userBalanceBefore ${await user.getBalance()}`)
            await liquidityMigration.connect(user).withdraw();

            console.log(`userBalanceAfter ${await user.getBalance()}`)
            console.log(`TYT ${await assetToken.balanceOf(liquidityMigration.address)}`);

            const resultNeuronVaultBalance = await assetToken.balanceOf(mockNeuronCollateralVault.address);

            console.log(`resultNeuronVaultBalance ${resultNeuronVaultBalance}`);
            
            expect(resultNeuronVaultBalance).to.gt(initialNeuronVaultBalance, 'Funds not received in NeuronVault');
        });

    });
}

// ----------------------------------------------------------
// -----------------  GLOBAL HELPERS  -----------------------
// ----------------------------------------------------------

async function _deployContract<T extends Contract>(contract: string, deployer?: Signer): Promise<T> {
    return await (await ethers.getContractFactory(contract, deployer)).deploy() as T;
}

async function _getContract<T extends Contract>(contract: string, address: string, deployer?: Signer): Promise<T> {
    return await ethers.getContractAt(contract, address) as T;
}

async function _deployProxy<T extends Contract>(contract: string, args: any[]): Promise<T> {
    const realization = await upgrades.deployProxy(
        await ethers.getContractFactory(contract),
        args,
        { kind: 'uups' }
    ) as T;
    await realization.deployed();
    return realization;
}

async function _createTokens(token: string, recipient: Signer) {
    const uniswapRouter: IUniswapRouterV2 = await _getContract('IUniswapRouterV2', UNISWAP_ROUTER_V2);

    await uniswapRouter.swapExactETHForTokens(
        '0',
        [WETH, token],
        await recipient.getAddress(),
        Date.now() + 30000,
        {
            gasLimit: 4000000,
            value: ethers.utils.parseEther("5000"),
        },
    )
}