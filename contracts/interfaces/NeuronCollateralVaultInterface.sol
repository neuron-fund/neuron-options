
// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

interface NeuronCollateralVaultInterface {
    function depositFor(uint256 amount, address creditor) external;
}