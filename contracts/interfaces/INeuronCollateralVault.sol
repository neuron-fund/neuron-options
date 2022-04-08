// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

interface INeuronCollateralVault {
    function depositFor(uint256 amount, address creditor) external;
}