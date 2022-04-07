import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract, Signer } from "ethers";
import { ethers, network } from "hardhat";

import ORACLE_ABI from "../../constants/abis/OpynOracle.json";
import SAVAX_PRICER_ABI from "../../constants/abis/SAvaxPricer.json";
import CHAINLINK_PRICER_ABI from "../../constants/abis/ChainLinkPricer.json";
import {
    ILiquidityMigrationVault,
    ILiquidityMigrationVault__factory,
    IStrikeSelection,
    IStrikeSelection__factory,
    IYearnPricer__factory,
    LiquidityMigrationForceSend__factory
} from "../../typechain-types";
import moment from "moment-timezone";
import * as time from "./time";

moment.tz.setDefault("UTC");


// Constants
const GAMMA_ORACLE = '0x789cD7AB3742e23Ce0952F6Bc3Eb3A73A0E08833';
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const ORACLE_OWNER = '0x2FCb2fc8dD68c48F406825255B4446EDFbD3e140';
const SAVAX_PRICER = '0x0A59f35F00A482bB04d95428e1ec051cBac216C9';
const ORACLE_LOCKING_PERIOD = 300;
const YEARN_PRICER_OWNER = "0xfacb407914655562d6619b0048a612B1795dF783";
const ORACLE_DISPUTE_PERIOD = 7200;

interface Config {
    liquidityMigrationVaultAddress: string;
    underlyingPricer: string;
    collateralPricer: string;
    asset: string;
}

export default class LiquidityMigrationHelper {

    constructor(public readonly config: Config) { }

    // Closures
    private ownerSigner: SignerWithAddress;
    private donorSigner: SignerWithAddress;
    private liquidityMigrationVault: ILiquidityMigrationVault;

    public async nextRound(): Promise<number> {
        this.donorSigner = (await ethers.getSigners())[10];
        this.liquidityMigrationVault = await this._getContract('ILiquidityMigrationVault', this.config.liquidityMigrationVaultAddress);

        const liquidityMigrationVaultOwnerAddress = await this.liquidityMigrationVault.owner();

        await this.donorSigner.sendTransaction({
            to: liquidityMigrationVaultOwnerAddress,
            value: ethers.utils.parseEther("10.0")
        });

        this.ownerSigner = await this.impersonateAccount(liquidityMigrationVaultOwnerAddress);

        const stikeSelectionAddress = await this.liquidityMigrationVault.strikeSelection();
        let strikeSelection: IStrikeSelection = await this._getContract('IStrikeSelection', stikeSelectionAddress);

        const strikeSelectionOwner = await this.impersonateAccount(await strikeSelection.owner());
        strikeSelection = IStrikeSelection__factory.connect(strikeSelection.address, strikeSelectionOwner);
        const latestTimestamp = (await ethers.provider.getBlock("latest")).timestamp;
        const firstOptionExpiry = moment(latestTimestamp * 1000)
            .startOf("isoWeek")
            .add(1, "weeks")
            .day("friday")
            .hours(8)
            .minutes(0)
            .seconds(0)
            .unix();

        const [firstOptionStrike] = await strikeSelection.getStrikePrice(
            firstOptionExpiry,
            (await this.liquidityMigrationVault.vaultParams()).isPut
        );

        const collateralPricerSigner = await this.getAssetPricer(
            this.config.collateralPricer,
            this.ownerSigner
        );
        await this.rollToSecondOption(firstOptionStrike, collateralPricerSigner, strikeSelection);
        return (await this.liquidityMigrationVault.vaultState()).round;
    }

    private async _getContract<T extends Contract>(contract: string, address: string, deployer?: Signer): Promise<T> {
        return await ethers.getContractAt(contract, address) as T;
    }

    private async rollToSecondOption(settlementPrice: BigNumber, collateralPricerSigner, strikeSelection) {
        const getCurrentOptionExpiry = async () => {
            const currentOption = await this.liquidityMigrationVault.currentOption();
            const otoken = await ethers.getContractAt("IOtoken", currentOption);
            return otoken.expiryTimestamp();
        };

        const oracle = await this.setupOracle(this.config.underlyingPricer, this.ownerSigner);
        await this.setOpynOracleExpiryPriceYearn(
            this.config.asset,
            oracle,
            settlementPrice,
            collateralPricerSigner,
            await getCurrentOptionExpiry()
        );
        await strikeSelection.setDelta(BigNumber.from("1000"));

        const ownedLiquidityMigrationVault = ILiquidityMigrationVault__factory.connect(this.liquidityMigrationVault.address, this.ownerSigner);
        await ownedLiquidityMigrationVault.commitAndClose();
        await time.increaseTo((await this.liquidityMigrationVault.nextOptionReadyAt()).toNumber() + 1);

        const keeperSigner = await this.impersonateAccount(await this.liquidityMigrationVault.keeper());
        const keeperedLiquidityMigrationVault = ILiquidityMigrationVault__factory.connect(this.liquidityMigrationVault.address, keeperSigner);
        await keeperedLiquidityMigrationVault.rollToNextOption();
    };

    private async setupOracle(
        chainlinkPricer: string,
        signer: SignerWithAddress
    ) {
        const pricerSigner = await this.impersonateAccount(chainlinkPricer);

        const forceSendContract = await ethers.getContractFactory("LiquidityMigrationForceSend");
        const forceSend = await forceSendContract.deploy();
        await forceSend
            .connect(this.donorSigner)
            .go(chainlinkPricer, { value: ethers.utils.parseEther("1") });

        const oracle = new ethers.Contract(
            GAMMA_ORACLE,
            ORACLE_ABI,
            pricerSigner
        );

        const oracleOwnerSigner = await this.impersonateAccount(ORACLE_OWNER);

        await signer.sendTransaction({
            to: ORACLE_OWNER,
            value: ethers.utils.parseEther("1"),
        });

        await oracle
            .connect(oracleOwnerSigner)
            .setStablePrice(USDC_ADDRESS, "100000000");

        const pricer = new ethers.Contract(
            chainlinkPricer,
            this.getPricerABI(chainlinkPricer),
            oracleOwnerSigner
        );

        await oracle
            .connect(oracleOwnerSigner)
            .setAssetPricer(await this.getPricerAsset(pricer), chainlinkPricer);

        return oracle;
    }

    private getPricerABI = (pricer: string) => {
        switch (pricer) {
            case SAVAX_PRICER:
                return SAVAX_PRICER_ABI;
            default:
                return CHAINLINK_PRICER_ABI;
        }
    };

    private getPricerAsset = async (pricer: Contract) => {
        switch (pricer.address) {
            case SAVAX_PRICER:
                return await pricer.sAVAX();
            default:
                return await pricer.asset();
        }
    };

    private async setOpynOracleExpiryPriceYearn(
        underlyingAsset: string,
        underlyingOracle: Contract,
        underlyingSettlePrice: BigNumber,
        collateralPricer: Contract,
        expiry: BigNumber
    ) {
        await this.increaseTo(expiry.toNumber() + ORACLE_LOCKING_PERIOD + 1);

        const res = await underlyingOracle.setExpiryPrice(
            underlyingAsset,
            expiry,
            underlyingSettlePrice
        );
        await res.wait();

        const oracleOwnerSigner = await this.impersonateAccount(YEARN_PRICER_OWNER);

        const res2 = await collateralPricer
            .connect(oracleOwnerSigner)
            .setExpiryPriceInOracle(expiry);
        const receipt = await res2.wait();

        const timestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;
        await this.increaseTo(timestamp + ORACLE_DISPUTE_PERIOD + 1);
    }

    private async increaseTo(target: number | BigNumber) {
        if (!BigNumber.isBigNumber(target)) {
            target = BigNumber.from(target);
        }

        const now = BigNumber.from(
            (await ethers.provider.getBlock("latest")).timestamp
        );

        if (target.lt(now))
            throw Error(
                `Cannot increase current time (${now}) to a moment in the past (${target})`
            );

        const diff = target.sub(now);
        return this.increase(diff);
    }

    private async increase(duration: number | BigNumber) {
        if (!BigNumber.isBigNumber(duration)) {
            duration = BigNumber.from(duration);
        }

        if (duration.lt(BigNumber.from("0")))
            throw Error(`Cannot increase time by a negative amount (${duration})`);

        await ethers.provider.send("evm_increaseTime", [duration.toNumber()]);

        await ethers.provider.send("evm_mine", []);
    }

    private async getAssetPricer(
        pricer: string,
        signer: SignerWithAddress
    ) {
        const ownerSigner = await this.impersonateAccount(pricer);

        const forceSendContract = await ethers.getContractFactory("LiquidityMigrationForceSend");
        let forceSend = await forceSendContract.deploy();
        forceSend = LiquidityMigrationForceSend__factory.connect(forceSend.address, signer);
        await forceSend.go(pricer, { value: ethers.utils.parseEther("0.5"), });

        return IYearnPricer__factory.connect(pricer, ownerSigner);
    }

    private async impersonateAccount(acctAddress) {
        await network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [acctAddress],
        });
        return await ethers.getSigner(acctAddress);
    }
}

