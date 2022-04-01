/* SPDX-License-Identifier: UNLICENSED */
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
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
        address neuronCollateralVault;
    }

    // ----------------------------------------------------------
    // ----------------------  CONSTANTS  -----------------------
    // ----------------------------------------------------------

    IERC20 internal constant WETH = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    address internal constant ZERO_ADDRESS = address(0);

    // ----------------------------------------------------------
    // -----------------------  STORAGE  ------------------------
    // ----------------------------------------------------------

    RibbonVaultInterface public ribbonVault;

    IERC20 public ribbonAssetToken;

    mapping(address => bool) public authorizedNeuronCollateralVaults;

    mapping(uint16 => DepositReceipt[]) public depositReceipts;

    uint16 public lastRound;

    mapping(uint16 => uint256) internal pendingWithdrawsAmounts;

    // ----------------------------------------------------------
    // -----------------------  EVENTS  -------------------------
    // ----------------------------------------------------------

    event Deposit(address indexed recipient, uint256 amount);

    event Withdraw(uint16 indexed round);

    // ----------------------------------------------------------
    // -----------------------  ERRORS  -------------------------
    // ----------------------------------------------------------

    error ZeroDepositAmount();

    error RoundNotCompleted();

    error FundsLastRoundNotWithdrawn();

    error ZeroAddress();

    error NotAuthorizedNeuronCollateralVault();

    // ----------------------------------------------------------
    // -----------------------  GETTERS  ------------------------
    // ----------------------------------------------------------

    function getCurrentRound() public view returns (uint16) {
        return ribbonVault.vaultState().round;
    }

    // ----------------------------------------------------------
    // -----------------------  SETTERS  ------------------------
    // ----------------------------------------------------------

    function setNeuronCollateralVault(address _neuronCollateralVault, bool _value) external onlyOwner {
        authorizedNeuronCollateralVaults[_neuronCollateralVault] = _value;
    }

    // ----------------------------------------------------------
    // ---------------------  INITIALIZE  -----------------------
    // ----------------------------------------------------------

    function initialize(address _ribbonVault, address[] calldata _neuronCollateralVaults) public initializer {
        if (_ribbonVault == ZERO_ADDRESS) revert ZeroAddress();

        // Inherited
        __UUPSUpgradeable_init();
        __Ownable_init();

        // Ribbon
        ribbonVault = RibbonVaultInterface(_ribbonVault);
        ribbonAssetToken = IERC20(ribbonVault.vaultParams().asset);
        lastRound = getCurrentRound();

        // Neuron
        uint256 neuronCollateralVaultsLength = _neuronCollateralVaults.length;
        for (uint256 i; i < neuronCollateralVaultsLength; i++) {
            address neuronCollateralVault = _neuronCollateralVaults[i];

            if (neuronCollateralVault == ZERO_ADDRESS) revert ZeroAddress();

            authorizedNeuronCollateralVaults[neuronCollateralVault] = true;
        }
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
    function deposit(uint256 _amount, address _neuronCollateralVault) external {
        uint16 currentRound = getCurrentRound();

        // Validation
        if (_amount == 0) revert ZeroDepositAmount();
        if (currentRound > lastRound) revert FundsLastRoundNotWithdrawn();
        if (!authorizedNeuronCollateralVaults[_neuronCollateralVault]) revert NotAuthorizedNeuronCollateralVault();

        // Initial ribbon withdraw
        ribbonVault.transferFrom(msg.sender, address(this), _amount);
        ribbonVault.initiateWithdraw(_amount);

        // Save deposit to storage
        depositReceipts[currentRound].push(
            DepositReceipt({recipient: msg.sender, amount: _amount, neuronCollateralVault: _neuronCollateralVault})
        );
        pendingWithdrawsAmounts[currentRound] += _amount;

        emit Deposit(msg.sender, _amount);
    }

    // Need call every week, after new round, this will allow withdraw funds faster
    function withdraw() external {
        uint16 currentRound = getCurrentRound();

        // Can call once per round
        if (currentRound <= lastRound) revert RoundNotCompleted();

        uint256 amount = pendingWithdrawsAmounts[lastRound];

        // Complete withdraw
        if (amount > 0) {
            // Withdraw ribbon deposit (asset tokens)
            ribbonVault.completeWithdraw();

            DepositReceipt[] memory deposits = depositReceipts[lastRound];
            uint256 depositsLength = deposits.length;

            // ETH
            if (ribbonAssetToken == WETH) {
                uint256 balance = address(this).balance;

                for (uint256 i; i < depositsLength; i++) {
                    /* [! Need eth deposit function] */
                }
            }
            // Other TOKENS
            else {
                uint256 balance = ribbonAssetToken.balanceOf(address(this));

                for (uint256 i; i < depositsLength; i++) {
                    NeuronCollateralVaultInterface(deposits[i].neuronCollateralVault).depositFor(
                        (deposits[i].amount * balance) / amount,
                        deposits[i].recipient
                    );
                }
            }
        }

        emit Withdraw(lastRound);

        // Update round to storage
        lastRound = currentRound;
    }
}
