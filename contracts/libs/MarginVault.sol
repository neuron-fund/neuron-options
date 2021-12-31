/**
 * SPDX-License-Identifier: UNLICENSED
 */
pragma solidity 0.8.9;

pragma experimental ABIEncoderV2;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {FPI} from "../libs/FixedPointInt256.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "hardhat/console.sol";

/**
 * MarginVault Error Codes
 * V1: invalid short otoken amount
 * V2: invalid short otoken index
 * V3: short otoken address mismatch
 * V4: invalid long otoken amount
 * V5: invalid long otoken index
 * V6: long otoken address mismatch
 * V7: invalid collateral amount
 * V8: invalid collateral token index
 * V9: collateral token address mismatch
 * v10: shortOtoken should be empty when performing addShort or the same as vault already have
 * V11: _collateralAssets and _amounts length mismatch
 * V12: _collateralAssets and vault.collateralAssets length mismatch
 */

/**
 * @title MarginVault
 * @notice A library that provides the Controller with a Vault struct and the functions that manipulate vaults.
 * Vaults describe discrete position combinations of long options, short options, and collateral assets that a user can have.
 */
library MarginVault {
    using SafeMath for uint256;
    using FPI for FPI.FixedPointInt;

    uint256 internal constant BASE = 8;

    // vault is a struct of 6 arrays that describe a position a user has, a user can have multiple vaults.
    struct Vault {
        address shortOtoken;
        // addresses of oTokens a user has shorted (i.e. written) against this vault
        // addresses of oTokens a user has bought and deposited in this vault
        // user can be long oTokens without opening a vault (e.g. by buying on a DEX)
        // generally, long oTokens will be 'deposited' in vaults to act as collateral in order to write oTokens against (i.e. in spreads)
        // TODO get rid of longOTokens since we dont use it anymore?
        address[] longOtokens;
        // addresses of other ERC-20s a user has deposited as collateral in this vault
        address[] collateralAssets;
        // quantity of oTokens minted/written for each oToken address in oTokenAddress
        // TODO replace with just uint256 cause we have only one oToken for each vault
        uint256 shortAmount;
        // quantity of oTokens owned and held in the vault for each oToken address in longOtokens
        uint256[] longAmounts;
        // quantity of ERC-20 deposited as collateral in the vault for each ERC-20 address in collateralAssets
        uint256[] collateralAmounts;
        // Collateral which is currently used for minting oTokens and can't be used until expiry
        // TODO on expiry of oTokenAddress update this variable
        // TODO should we use this new variable or maybe sub from collaeralAmounts when using collateral?
        uint256[] usedCollateralAmounts;
        uint256[] usedCollateralValues;
        uint256[] unusedCollateralAmounts;
    }

    /**
     * @dev increase the short oToken balance in a vault when a new oToken is minted
     * @param _vault vault to add or increase the short position in
     * @param _shortOtoken address of the _shortOtoken being minted from the user's vault
     * @param _amount number of _shortOtoken being minted from the user's vault
     */
    function addShort(
        Vault storage _vault,
        address _shortOtoken,
        uint256 _amount
    ) external {
        require(_amount > 0, "V1");
        require(_vault.shortOtoken == address(0) || _vault.shortOtoken == _shortOtoken, "V10");

        if (_vault.shortOtoken == _shortOtoken) {
            _vault.shortAmount = _vault.shortAmount.add(_amount);
        } else {
            _vault.shortOtoken = _shortOtoken;
            _vault.shortAmount = _amount;
        }
    }

    /**
     * @dev decrease the short oToken balance in a vault when an oToken is burned
     * @param _vault vault to decrease short position in
     * @param _shortOtoken address of the _shortOtoken being reduced in the user's vault
     * @param _amount number of _shortOtoken being reduced in the user's vault
     */
    function removeShort(
        // TODO Will using memory here will save gas since we have a lot of reading from _vault opearations?
        Vault storage _vault,
        address _shortOtoken,
        uint256 _amount
    ) external returns (uint256[] memory freedCollateralAmounts, uint256[] memory freedCollateralValues) {
        // check that the removed short oToken exists in the vault at the specified index
        require(_vault.shortOtoken == _shortOtoken, "V3");

        uint256 newShortAmount = _vault.shortAmount.sub(_amount);

        uint256[] memory newUsedCollateralAmounts = new uint256[](_vault.collateralAssets.length);
        uint256[] memory newUsedCollateralValues = new uint256[](_vault.collateralAssets.length);
        freedCollateralAmounts = new uint256[](_vault.collateralAssets.length);
        freedCollateralValues = new uint256[](_vault.collateralAssets.length);
        uint256[] memory newUnusedCollateralAmounts = _vault.unusedCollateralAmounts;
        if (newShortAmount == 0) {
            newUnusedCollateralAmounts = _vault.collateralAmounts;
            for (uint256 i = 0; i < _vault.collateralAssets.length; i++) {
                newUsedCollateralAmounts[i] = 0;
                newUsedCollateralValues[i] = 0;
                freedCollateralAmounts[i] = _vault.usedCollateralAmounts[i];
                freedCollateralValues[i] = _vault.usedCollateralValues[i];
            }
        } else {
            // usedLeftRatio is multiplier which is used to calculate the new used collateral values and used amounts
            FPI.FixedPointInt memory usedLeftRatio = FPI.fromScaledUint(1, 0).sub(
                FPI.fromScaledUint(newShortAmount, BASE).div(FPI.fromScaledUint(_vault.shortAmount, BASE))
            );
            for (uint256 i = 0; i < _vault.collateralAssets.length; i++) {
                uint256 collateralDecimals = uint256(IERC20Metadata(_vault.collateralAssets[i]).decimals());
                newUsedCollateralAmounts[i] = toFPImulAndBack(
                    _vault.usedCollateralAmounts[i],
                    collateralDecimals,
                    usedLeftRatio,
                    false
                );

                newUsedCollateralValues[i] = toFPImulAndBack(
                    _vault.usedCollateralValues[i],
                    BASE,
                    usedLeftRatio,
                    false
                );
                freedCollateralAmounts[i] = _vault.usedCollateralAmounts[i].sub(newUsedCollateralAmounts[i]);
                freedCollateralValues[i] = _vault.usedCollateralValues[i].sub(newUsedCollateralValues[i]);
                newUnusedCollateralAmounts[i] = newUnusedCollateralAmounts[i].add(freedCollateralAmounts[i]);
                console.log("------------------", i);
                console.log("Old used collateral values", _vault.usedCollateralValues[i]);
                console.log("New used collateral values", newUsedCollateralValues[i]);
                console.log("Freed colllateral values", freedCollateralValues[i]);

                console.log("Vault total collateral amounts", _vault.collateralAmounts[i]);
                console.log("Old used collateral amounts", _vault.usedCollateralAmounts[i]);
                console.log("New used collateral amounts", newUsedCollateralAmounts[i]);
                console.log("Freed collateral amounts", freedCollateralAmounts[i]);

                console.log("Old unused collateral amounts", _vault.unusedCollateralAmounts[i]);
                console.log("New unused collateral amounts", newUnusedCollateralAmounts[i]);
            }
        }
        _vault.shortAmount = newShortAmount;
        _vault.usedCollateralAmounts = newUsedCollateralAmounts;
        _vault.unusedCollateralAmounts = newUnusedCollateralAmounts;
        _vault.usedCollateralValues = newUsedCollateralValues;
        console.log("----------END OF removeShort---------");
    }

    function toFPImulAndBack(
        uint256 _value,
        uint256 _decimals,
        FPI.FixedPointInt memory _multiplicator,
        bool roundDown
    ) internal pure returns (uint256) {
        return FPI.fromScaledUint(_value, _decimals).mul(_multiplicator).toScaledUint(_decimals, roundDown);
    }

    /**
     * @dev increase the long oToken balance in a vault when an oToken is deposited
     * @param _vault vault to add a long position to
     * @param _longOtoken address of the _longOtoken being added to the user's vault
     * @param _amount number of _longOtoken the protocol is adding to the user's vault
     * @param _index index of _longOtoken in the user's vault.longOtokens array
     */
    function addLong(
        Vault storage _vault,
        address _longOtoken,
        uint256 _amount,
        uint256 _index
    ) external {
        require(_amount > 0, "V4");

        // valid indexes in any array are between 0 and array.length - 1.
        // if adding an amount to an preexisting short oToken, check that _index is in the range of 0->length-1
        if ((_index == _vault.longOtokens.length) && (_index == _vault.longAmounts.length)) {
            _vault.longOtokens.push(_longOtoken);
            _vault.longAmounts.push(_amount);
        } else {
            require((_index < _vault.longOtokens.length) && (_index < _vault.longAmounts.length), "V5");
            address existingLong = _vault.longOtokens[_index];
            require((existingLong == _longOtoken) || (existingLong == address(0)), "V6");

            _vault.longAmounts[_index] = _vault.longAmounts[_index].add(_amount);
            _vault.longOtokens[_index] = _longOtoken;
        }
    }

    /**
     * @dev decrease the long oToken balance in a vault when an oToken is withdrawn
     * @param _vault vault to remove a long position from
     * @param _longOtoken address of the _longOtoken being removed from the user's vault
     * @param _amount number of _longOtoken the protocol is removing from the user's vault
     * @param _index index of _longOtoken in the user's vault.longOtokens array
     */
    function removeLong(
        Vault storage _vault,
        address _longOtoken,
        uint256 _amount,
        uint256 _index
    ) external {
        // check that the removed long oToken exists in the vault at the specified index
        require(_index < _vault.longOtokens.length, "V5");
        require(_vault.longOtokens[_index] == _longOtoken, "V6");

        uint256 newLongAmount = _vault.longAmounts[_index].sub(_amount);

        if (newLongAmount == 0) {
            delete _vault.longOtokens[_index];
        }
        _vault.longAmounts[_index] = newLongAmount;
    }

    /**
     * @dev increase the collaterals balances in a vault
     * @param _vault vault to add collateral to
     * @param _collateralAssets addresses of the _collateralAssets being added to the user's vault
     * @param _amounts number of _collateralAssets being added to the user's vault
     */
    function addCollaterals(
        Vault storage _vault,
        address[] calldata _collateralAssets,
        uint256[] calldata _amounts
    ) external {
        require(_collateralAssets.length == _amounts.length, "V11");
        require(_collateralAssets.length == _vault.collateralAssets.length, "V12");
        for (uint256 i = 0; i < _collateralAssets.length; i++) {
            _vault.collateralAmounts[i] = _vault.collateralAmounts[i].add(_amounts[i]);
            _vault.unusedCollateralAmounts[i] = _vault.unusedCollateralAmounts[i].add(_amounts[i]);
        }
    }

    /**
     * @dev decrease the collateral balance in a vault
     * @param _vault vault to remove collateral from
     * @param _collateralAsset address of the _collateralAsset being removed from the user's vault
     * @param _amount number of _collateralAssets being removed from the user's vault
     * @param _index index of _collateralAssets in the user's vault.collateralAssets array
     */
    function removeCollateral(
        Vault storage _vault,
        address _collateralAsset,
        uint256 _amount,
        uint256 _index
    ) external {
        // check that the removed collateral exists in the vault at the specified index
        require(_index < _vault.collateralAssets.length, "V8");
        require(_vault.collateralAssets[_index] == _collateralAsset, "V9");

        uint256 newCollateralAmount = _vault.collateralAmounts[_index].sub(_amount);

        _vault.collateralAmounts[_index] = newCollateralAmount;
    }

    function useCollateralBulk(
        Vault storage _vault,
        uint256[] memory _amounts,
        uint256[] memory _values
    ) external {
        require(
            _amounts.length == _vault.collateralAssets.length,
            "Amounts for collateral is not same length as collateral assets"
        );

        console.log("values.length", _values.length);
        console.log("_amounts.length", _amounts.length);
        console.log("_vault.usedCollateralAmounts.length", _vault.usedCollateralAmounts.length);
        for (uint256 i = 0; i < _amounts.length; i++) {
            console.log("i", i);
            console.log("_vault.usedCollateralAmounts[i]", _vault.usedCollateralAmounts[i]);
            console.log("_vault.usedCollateralValues[i]", _vault.usedCollateralValues[i]);
            uint256 newUsedCollateralAmount = _vault.usedCollateralAmounts[i].add(_amounts[i]);

            uint256 newUsedCollateralValue = _vault.usedCollateralValues[i].add(_values[i]);

            _vault.usedCollateralAmounts[i] = newUsedCollateralAmount;
            _vault.usedCollateralValues[i] = newUsedCollateralValue;
            require(
                _vault.usedCollateralAmounts[i] <= _vault.collateralAmounts[i],
                "Trying to use collateral which exceeds vault's balance"
            );
            _vault.unusedCollateralAmounts[i] = _vault.collateralAmounts[i].sub(newUsedCollateralAmount);
        }
    }
}
