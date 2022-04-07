// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import {NeuronCollateralVaultInterface} from "../interfaces/NeuronCollateralVaultInterface.sol";

contract MockNeuronCollateralVault is NeuronCollateralVaultInterface {
    function depositFor(uint256 amount, address creditor) external {
        
    }
}