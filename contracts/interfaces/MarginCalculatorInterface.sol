// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

pragma experimental ABIEncoderV2;

import {MarginVault} from "../libs/MarginVault.sol";

interface MarginCalculatorInterface {
    event CollateralDustUpdated(address indexed collateral, uint256 dust);
    event MaxPriceAdded(bytes32 indexed productHash, uint256 timeToExpiry, uint256 value);
    event MaxPriceUpdated(bytes32 indexed productHash, uint256 timeToExpiry, uint256 oldValue, uint256 newValue);
    event OracleDeviationUpdated(uint256 oracleDeviation);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event SpotShockUpdated(bytes32 indexed product, uint256 spotShock);
    event TimeToExpiryAdded(bytes32 indexed productHash, uint256 timeToExpiry);

    function AUCTION_TIME() external view returns (uint256);

    function _getCollateralRequired(
        MarginVault.Vault memory _vault,
        address _otoken,
        uint256 _amount
    ) external view returns (uint256[] memory collateralsAmountsRequired, uint256[] memory collateralsValuesRequired);

    function _getCollateralizationRatio(address _otoken, address _collateralAsset)
        external
        view
        returns (FixedPointInt256.FixedPointInt memory);

    function getCollateralDust(address _collateral) external view returns (uint256);

    function getExcessCollateral(MarginVault.Vault memory _vault) external view returns (uint256[] memory, bool);

    function getExpiredPayoutRate(address _otoken) external view returns (uint256[] memory);

    // function getMarginRequired(MarginVault.Vault memory _vault)
    //     external
    //     view
    //     returns (
    //         bool,
    //         FixedPointInt256.FixedPointInt[] memory,
    //         FixedPointInt256.FixedPointInt[] memory
    //     );

    function getMaxPrice(
        address _underlying,
        address _strike,
        address[] memory _collaterals,
        bool _isPut,
        uint256 _timeToExpiry
    ) external view returns (uint256);

    // function getNakedMarginRequired(
    //     address _underlying,
    //     address _strike,
    //     address[] memory _collaterals,
    //     uint256 _shortAmount,
    //     uint256 _strikePrice,
    //     uint256 _underlyingPrice,
    //     uint256 _shortExpiryTimestamp,
    //     uint256 _collateralDecimals,
    //     bool _isPut
    // ) external view returns (uint256);

    function getOracleDeviation() external view returns (uint256);

    function getPayout(address _otoken, uint256 _amount) external view returns (uint256[] memory);

    function getSpotShock(
        address _underlying,
        address _strike,
        address[] memory _collaterals,
        bool _isPut
    ) external view returns (uint256);

    function getTimesToExpiry(
        address _underlying,
        address _strike,
        address[] memory _collaterals,
        bool _isPut
    ) external view returns (uint256[] memory);

    function oracle() external view returns (address);

    function owner() external view returns (address);

    function renounceOwnership() external;

    function setCollateralDust(address _collateral, uint256 _dust) external;

    function setOracleDeviation(uint256 _deviation) external;

    function setSpotShock(
        address _underlying,
        address _strike,
        address[] memory _collaterals,
        bool _isPut,
        uint256 _shockValue
    ) external;

    function setUpperBoundValues(
        address _underlying,
        address _strike,
        address[] memory _collaterals,
        bool _isPut,
        uint256[] memory _timesToExpiry,
        uint256[] memory _values
    ) external;

    function transferOwnership(address newOwner) external;

    function updateUpperBoundValue(
        address _underlying,
        address _strike,
        address[] memory _collaterals,
        bool _isPut,
        uint256 _timeToExpiry,
        uint256 _value
    ) external;
}

interface FixedPointInt256 {
    struct FixedPointInt {
        int256 value;
    }
}
