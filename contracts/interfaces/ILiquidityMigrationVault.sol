// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

interface ILiquidityMigrationVault {
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
    // ----------------------   VAULT  --------------------------
    // ----------------------------------------------------------

    struct VaultParams {
        bool isPut;
        uint8 decimals;
        address asset;
        address underlying;
        uint56 minimumSupply;
        uint104 cap;
    }

    struct VaultState {
        uint16 round;
        uint104 lockedAmount;
        uint104 lastLockedAmount;
        uint128 totalPending;
        uint128 queuedWithdrawShares;
    }

    function vaultParams() external view returns (VaultParams calldata);

    function vaultState() external view returns (VaultState calldata);

    function keeper() external view returns (address);

    function strikeSelection() external view returns (address);

    function initiateWithdraw(uint256 numShares) external;

    function completeWithdraw() external;

    function deposit(uint256 amount) external;

    function maxRedeem() external;

    function rollToNextOption() external;

    function commitAndClose() external;

    function currentOption() external view returns (address);

    function owner() external view returns (address);

    function auctionDuration() external view returns(uint256);

    function setAuctionDuration(uint256 newAuctionDuration) external;

    function nextOptionReadyAt() external view returns (uint256);
}
