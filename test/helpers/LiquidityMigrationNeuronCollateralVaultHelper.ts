import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat"
import { MockNeuronCollateralVault } from "../../typechain-types";

export default class LiquidityMigrationNeuronCollateralVaultHelper {

  constructor(public readonly assetToken: string) { }

  private readonly tokenName = 'Neuron ETH Theta Vault';
  private readonly tokenSymbol = 'rETH-THETA';
  private readonly managementFee = BigNumber.from('2000000');
  private readonly performanceFee = BigNumber.from('2000000');
  private readonly isPut = false;
  private readonly tokenDecimals = 18;
  // private readonly collateralUnwrappedAsset = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
  private readonly minimumSupply = BigNumber.from('10').pow('10').toString();

  public async deploy(): Promise<MockNeuronCollateralVault> {
    const [adminSigner, ownerSigner, keeperSigner, userSigner, feeRecipientSigner] = (await ethers.getSigners()).slice(10);
    const owner = ownerSigner.address;
    const keeper = keeperSigner.address;
    const user = userSigner.address;
    const feeRecipient = feeRecipientSigner.address;

    const MockNeuronPool = await ethers.getContractFactory('MockNeuronPool');
    const mockNeuronPool = await MockNeuronPool.deploy(this.assetToken);
    const mockNeuronPoolAddress = mockNeuronPool.address;
    const collateralVaultDeployArgs = ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'];
    const collateralVaultInitializeArgs = [
      owner,
      keeper,
      feeRecipient,
      this.managementFee,
      this.performanceFee,
      `COLLATERAL-${this.tokenName}`,
      `CV${this.tokenSymbol}`,
      [
        this.isPut,
        this.tokenDecimals,
        this.assetToken,
        mockNeuronPoolAddress,
        this.assetToken,
        this.minimumSupply,
        parseUnits('500', this.tokenDecimals > 18 ? this.tokenDecimals : 18),
      ],
    ];

    const MockCollateralVaultLifecycle = await ethers.getContractFactory('MockCollateralVaultLifecycle');
    const collateralVaultLifecycleLib = await MockCollateralVaultLifecycle.deploy();

    const MockNeuronPoolUtils = await ethers.getContractFactory('MockNeuronPoolUtils');
    const neuronPoolUtilsLib = await MockNeuronPoolUtils.deploy();

    const collateralVault = (
      await this.deployProxy(
        'MockNeuronCollateralVault',
        adminSigner,
        collateralVaultInitializeArgs,
        collateralVaultDeployArgs,
        {
          libraries: {
            MockCollateralVaultLifecycle: collateralVaultLifecycleLib.address,
            MockNeuronPoolUtils: neuronPoolUtilsLib.address,
          },
        }
      )
    )

    return collateralVault as MockNeuronCollateralVault;
  }

  private async deployProxy(
    logicContractName: string,
    adminSigner: SignerWithAddress,
    initializeArgs: any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    logicDeployParams = [],
    factoryOptions = {}
  ) {
    const AdminUpgradeabilityProxy = await ethers.getContractFactory('MockAdminUpgradeabilityProxy', adminSigner)
    const LogicContract = await ethers.getContractFactory(logicContractName, factoryOptions || {})
    const logic = await LogicContract.deploy(...logicDeployParams)

    const initBytes = LogicContract.interface.encodeFunctionData('initialize', initializeArgs)

    const proxy = await AdminUpgradeabilityProxy.deploy(logic.address, await adminSigner.getAddress(), initBytes)
    return await ethers.getContractAt(logicContractName, proxy.address)
  }
}