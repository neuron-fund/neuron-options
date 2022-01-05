pragma solidity 0.8.9;

// SPDX-License-Identifier: UNLICENSED
pragma experimental ABIEncoderV2;

import {MarginVault} from "../libs/MarginVault.sol";
import "hardhat/console.sol";

contract MarginVaultTester {
    using MarginVault for MarginVault.Vault;

    mapping(address => mapping(uint256 => MarginVault.Vault)) private vault;

    function getVault(uint256 _vaultIndex) external view returns (MarginVault.Vault memory) {
        return vault[msg.sender][_vaultIndex];
    }

    function initCollaterals(uint256 _vaultIndex, address[] calldata _collateralAssets) external{
        require(vault[msg.sender][_vaultIndex].collateralAmounts.length == 0);

        vault[msg.sender][_vaultIndex].collateralAssets = _collateralAssets;
         
        //vault[msg.sender][_vaultIndex].collateralAmounts
        for (uint i = 0; i < _collateralAssets.length; i++) {
            vault[msg.sender][_vaultIndex].collateralAmounts.push(0);
            vault[msg.sender][_vaultIndex].unusedCollateralAmounts.push(0);
        }
    }

    function testAddShort(
        uint256 _vaultIndex,
        address _shortOtoken,
        uint256 _amount
    ) external {
        vault[msg.sender][_vaultIndex].addShort(_shortOtoken, _amount);
    }

    function testRemoveShort(
        uint256 _vaultIndex,
        address _shortOtoken,
        uint256 _amount
    ) external {
        vault[msg.sender][_vaultIndex].removeShort(_shortOtoken, _amount);
    }

    function testAddLong(
        uint256 _vaultIndex,
        address _longOtoken,
        uint256 _amount,
        uint256 _index
    ) external {
        vault[msg.sender][_vaultIndex].addLong(_longOtoken, _amount, _index);
    }

    function testRemoveLong(
        uint256 _vaultIndex,
        address _longOtoken,
        uint256 _amount,
        uint256 _index
    ) external {
        vault[msg.sender][_vaultIndex].removeLong(_longOtoken, _amount, _index);
    }

    function testAddCollaterals(
        uint256 _vaultIndex,
        address[] calldata _collateralAssets,
        uint256[] calldata _amounts
    ) external {
        // console.log(_vaultIndex, _collateralAssets, _amounts);
        console.log(_vaultIndex, _collateralAssets[0], _amounts[0]);
        console.log(vault[msg.sender][_vaultIndex].collateralAssets[0]);

        vault[msg.sender][_vaultIndex].addCollaterals(_collateralAssets, _amounts);
    }

    function testRemoveCollateral(
        uint256 _vaultIndex,
        address _collateralAsset,
        uint256 _amount,
        uint256 _index
    ) external {
        vault[msg.sender][_vaultIndex].removeCollateral(_collateralAsset, _amount, _index);
    }
}
