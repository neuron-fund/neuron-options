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
import LiquidityMigrationHelper from '../helpers/LiquidityMigrationHelper';

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
        let liquidityMigrationHelper: LiquidityMigrationHelper;

        // Other
        let liquidityMigrationVaultTokensBalance: BigNumber;
        let currentRound: number;
        let initialBlockNumber;

        // ----------------------------------------------------------
        // --------------------  BEFORE EACH  -----------------------
        // ----------------------------------------------------------

        beforeEach(async () => {
            liquidityMigrationHelper = new LiquidityMigrationHelper({
                liquidityMigrationVaultAddress: config.liquidityMigrationVaultAddress,
                underlyingPricer: config.underlyingPricer,
                collateralPricer: config.collateralPricer,
                asset: config.asset,
            });
            currentRound = await liquidityMigrationHelper.nextRound();

            // Get accounts
            const accounts = await ethers.getSigners();
            owner = accounts[0];
            ownerAddress = await owner.getAddress();
            user = accounts[1];
            userAddress = await user.getAddress();
            donor = accounts[2];
            donorAddress = await donor.getAddress();

            // Deploy
            mockNeuronCollateralVault = await _deployContract('MockNeuronCollateralVault');
            liquidityMigrationVault = await _getContract('ILiquidityMigrationVault', config.liquidityMigrationVaultAddress);
            liquidityMigration = await _deployProxy('LiquidityMigration', [config.liquidityMigrationVaultAddress, [mockNeuronCollateralVault.address]]);

            // Create asset tokens
            const { asset } = await liquidityMigrationVault.vaultParams();
            assetToken = await _getContract('ERC20', asset);
            await _createTokens(asset, user);
            const assetBalance = await assetToken.balanceOf(userAddress);

            expect(assetBalance).to.gt(0, 'Asset tokens not received');

            // Get vault tokens
            await assetToken.connect(user).approve(liquidityMigrationVault.address, assetBalance);
            await liquidityMigrationVault.connect(user).deposit(assetBalance);


            currentRound = await liquidityMigrationHelper.nextRound();

            await liquidityMigrationVault.connect(user).maxRedeem();
            liquidityMigrationVaultTokensBalance = await liquidityMigrationVault.balanceOf(userAddress);

            expect(liquidityMigrationVaultTokensBalance).to.gt(0, 'Vault tokens not received');
        });

        // ----------------------------------------------------------
        // -----------------------  TESTS  --------------------------
        // ----------------------------------------------------------

        it('Deposit', async () => {
            const initialUserVaultBalance = await liquidityMigrationVault.balanceOf(await user.getAddress());

            await liquidityMigrationVault.connect(user).approve(liquidityMigration.address, liquidityMigrationVaultTokensBalance);
            await liquidityMigration.connect(user).deposit(liquidityMigrationVaultTokensBalance, mockNeuronCollateralVault.address);

            const depositReceipt = await liquidityMigration.depositReceipts(currentRound, 0);

            const resultUserVaultBalance = await liquidityMigrationVault.balanceOf(await user.getAddress());

            expect(resultUserVaultBalance).to.eq(
                initialUserVaultBalance.sub(liquidityMigrationVaultTokensBalance),
                'Vault tokens have not received',
            );
            expect(depositReceipt.amount).to.eq(
                liquidityMigrationVaultTokensBalance,
                'Not all sent vault tokens are received',
            );
        });

        it('Zero deposit', async () => {
            await liquidityMigrationVault.connect(user).approve(liquidityMigration.address, 0);
            await expectRevert(liquidityMigration.connect(user).deposit(0, mockNeuronCollateralVault.address), 'ZeroDepositAmount()');
        });

        it('Deposit with not witdhrawn last round', async () => {
            await liquidityMigrationVault.connect(user).approve(liquidityMigration.address, liquidityMigrationVaultTokensBalance);
            await liquidityMigration.connect(user).deposit(liquidityMigrationVaultTokensBalance.div(2), mockNeuronCollateralVault.address);
            await liquidityMigrationHelper.nextRound();

            await expectRevert(
                liquidityMigration.connect(user).deposit(liquidityMigrationVaultTokensBalance.div(2), mockNeuronCollateralVault.address),
                'FundsLastRoundNotWithdrawn()',
            );
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
            value: ethers.utils.parseEther("5"),
        },
    )
}