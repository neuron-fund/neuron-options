// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface RibbonVaultInterface {
    // ----------------------------------------------------------
    // -----------------------  ERC20  --------------------------
    // ----------------------------------------------------------

    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount) external returns (bool);

    function allowance(address owner, address spender) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    event Transfer(address indexed from, address indexed to, uint256 value);

    event Approval(address indexed owner, address indexed spender, uint256 value);

    // ----------------------------------------------------------
    // -------------------  RIBBON VAULT  -----------------------
    // ----------------------------------------------------------

    struct VaultParams {
        // Option type the vault is selling
        bool isPut;
        // Token decimals for vault shares
        uint8 decimals;
        // Asset used in Theta / Delta Vault
        address asset;
        // Underlying asset of the options sold by vault
        address underlying;
        // Minimum supply of the vault shares issued, for ETH it's 10**10
        uint56 minimumSupply;
        // Vault cap
        uint104 cap;
    }

    struct VaultState {
        // 32 byte slot 1
        //  Current round number. `round` represents the number of `period`s elapsed.
        uint16 round;
        // Amount that is currently locked for selling options
        uint104 lockedAmount;
        // Amount that was locked for selling options in the previous round
        // used for calculating performance fee deduction
        uint104 lastLockedAmount;
        // 32 byte slot 2
        // Stores the total tally of how much of `asset` there is
        // to be used to mint rTHETA tokens
        uint128 totalPending;
        // Amount locked for scheduled withdrawals;
        uint128 queuedWithdrawShares;
    }

    function vaultParams() external view returns(VaultParams calldata);

    function vaultState() external view returns(VaultState calldata);

    function initiateWithdraw(uint256 numShares) external ;

    function completeWithdraw() external;
}