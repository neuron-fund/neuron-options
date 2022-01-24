/**
 * SPDX-License-Identifier: UNLICENSED
 */
pragma solidity 0.8.9;
pragma experimental ABIEncoderV2;

import {MarginCalculator} from "../core/MarginCalculator.sol";
import {FPI} from "../libs/FixedPointInt256.sol";

contract CalculatorTester is MarginCalculator {
    constructor(address _addressBook) MarginCalculator(_addressBook) {}

    function getExpiredCashValue(
        address _underlying,
        address _strike,
        uint256 _expiryTimestamp,
        uint256 _strikePrice,
        bool _isPut
    ) external view returns (uint256) {
        return
            FPI.toScaledUint(
                _getExpiredCashValue(_underlying, _strike, _expiryTimestamp, _strikePrice, _isPut),
                BASE,
                true
            );
    }

    /*  
    function price(
        uint256 _vaultCollateral,
        uint256 _vaultDebt,
        uint256 _cv,
        uint256 _spotPrice,
        uint256 _auctionStartingTime,
        uint256 _collateralDecimals,
        bool _isPut
    ) external view returns (uint256) {
        FPI.FixedPointInt memory vaultCollateral = FPI.fromScaledUint(
            _vaultCollateral,
            _collateralDecimals
        );
        FPI.FixedPointInt memory vaultDebt = FPI.fromScaledUint(_vaultDebt, BASE);
        FPI.FixedPointInt memory cv = FPI.fromScaledUint(_cv, BASE);
        FPI.FixedPointInt memory spotPrice = FPI.fromScaledUint(_spotPrice, BASE);

        return
            _getDebtPrice(vaultCollateral, vaultDebt, cv, spotPrice, _auctionStartingTime, _collateralDecimals, _isPut);
    }
*/
}
