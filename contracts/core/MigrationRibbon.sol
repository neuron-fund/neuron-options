/* SPDX-License-Identifier: UNLICENSED */
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import {NeuronCollateralVaultInterface} from "../interfaces/NeuronCollateralVaultInterface.sol";
import {RibbonVaultInterface} from "../interfaces/RibbonVaultInterface.sol";

contract MigrationRibbon is UUPSUpgradeable, OwnableUpgradeable {
    // ----------------------------------------------------------
    // ---------------------  STRUCTURES  -----------------------
    // ----------------------------------------------------------

    struct DepositReceipt {
        address recipient;
        uint256 amount;
    }

    // ----------------------------------------------------------
    // ----------------------  CONSTANTS  -----------------------
    // ----------------------------------------------------------

    address internal constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    // ----------------------------------------------------------
    // -----------------------  STORAGE  ------------------------
    // ----------------------------------------------------------

    RibbonVaultInterface public ribbonVault;

    IERC20 public ribbonAssetToken;

    NeuronCollateralVaultInterface public neuronCollateralVault;

    mapping(uint16 => DepositReceipt[]) public depositReceipts;

    uint16 public lastRound;

    mapping(uint16 => uint256) internal amounts;

    // ----------------------------------------------------------
    // -----------------------  EVENTS  -------------------------
    // ----------------------------------------------------------

    event Deposit(address indexed recipient, uint256 amount);

    event Withdraw(uint16 indexed round);

    // ----------------------------------------------------------
    // -----------------------  ERRORS  -------------------------
    // ----------------------------------------------------------

    error NotEnoughFunds();

    error RoundNotCompleted();

    // ----------------------------------------------------------
    // -----------------------  GETTERS  ------------------------
    // ----------------------------------------------------------

    function getCurrentRound() public view returns (uint16) {
        return ribbonVault.vaultState().round;
    }

    // ----------------------------------------------------------
    // -----------------------  SETTERS  ------------------------
    // ----------------------------------------------------------

    function setNeuronCollateralVault(address _neuronCollateralVault) external {
        neuronCollateralVault = NeuronCollateralVaultInterface(_neuronCollateralVault);
    }

    // ----------------------------------------------------------
    // ---------------------  INITIALIZE  -----------------------
    // ----------------------------------------------------------

    function initialize(address _ribbonVault, address _neuronCollateralVault) public initializer {
        // ??? need zero-address validation?

        // Inherited
        __UUPSUpgradeable_init();
        __Ownable_init();

        // Ribbon
        ribbonVault = RibbonVaultInterface(_ribbonVault);
        ribbonAssetToken = IERC20(ribbonVault.vaultParams().asset);
        lastRound = getCurrentRound();

        // Neuron
        neuronCollateralVault = NeuronCollateralVaultInterface(_neuronCollateralVault);
    }

    // ----------------------------------------------------------
    // -----------------------  PROXY  --------------------------
    // ----------------------------------------------------------

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {
        // Proxy upgrade callback that uses validating modifier [onlyOwner]. See implementation [UUPSUpgradeable]
    }

    // ----------------------------------------------------------
    // ----------------------  ACTIONS  -------------------------
    // ----------------------------------------------------------

    // Before call approve [_amount] ribbonVault(ERC20) token
    function deposit(uint256 _amount) external {
        if (_amount == 0) revert NotEnoughFunds();

        ribbonVault.transferFrom(msg.sender, address(this), _amount);
        ribbonVault.initiateWithdraw(_amount);

        // Save deposit to storage
        uint16 currentRound = getCurrentRound();
        depositReceipts[currentRound].push(DepositReceipt({recipient: msg.sender, amount: _amount}));
        amounts[currentRound] += _amount;

        emit Deposit(msg.sender, _amount);
    }

    // Need call every week, after new round, this will allow withdraw funds faster
    function withdraw() external {
        uint16 currentRound = getCurrentRound();

        // Can call once per round
        if (currentRound <= lastRound) revert RoundNotCompleted();

        // Get all last rounds
        for (uint16 r = lastRound; r < currentRound; r++) {
            uint256 amount = amounts[r];

            // Complete withdraw
            if (amount > 0) {
                // Withdraw ribbon deposit (asset tokens)
                ribbonVault.completeWithdraw();

                DepositReceipt[] memory deposits = depositReceipts[r];
                uint256 depositsLength = deposits.length;

                // ETH
                if (address(ribbonAssetToken) == WETH) {
                    uint256 balance = address(this).balance;

                    for (uint256 i; i < depositsLength; i++) {
                        /* [! Need eth deposit function] */
                    }
                }
                // Other TOKENS
                else {
                    uint256 balance = ribbonAssetToken.balanceOf(address(this));

                    for (uint256 i; i < depositsLength; i++) {
                        neuronCollateralVault.depositFor(
                            (deposits[i].amount * balance) / amount,
                            deposits[i].recipient
                        );
                    }
                }
            }

            emit Withdraw(r);
        }

        // Update round to storage
        lastRound = currentRound;
    }
}
