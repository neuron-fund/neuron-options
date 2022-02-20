// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

pragma experimental ABIEncoderV2;

import {MarginVault} from "../libs/MarginVault.sol";
import {FPI} from "../libs/FixedPointInt256.sol";

interface MarginCalculatorInterface {
    /// @notice emits an event when collateral dust is updated
    event CollateralDustUpdated(address indexed collateral, uint256 dust);
    /// @notice emits an event when new time to expiry is added for a specific product
    event TimeToExpiryAdded(bytes32 indexed productHash, uint256 timeToExpiry);
    /// @notice emits an event when new upper bound value is added for a specific time to expiry timestamp
    event MaxPriceAdded(bytes32 indexed productHash, uint256 timeToExpiry, uint256 value);
    /// @notice emits an event when updating upper bound value at specific expiry timestamp
    event MaxPriceUpdated(bytes32 indexed productHash, uint256 timeToExpiry, uint256 oldValue, uint256 newValue);


    function AUCTION_TIME() external view returns (uint256);

    function getAfterBurnCollateralRatio(MarginVault.Vault memory _vault, uint256 _shortBurnAmount)
        external
        view
        returns (FPI.FixedPointInt memory, uint256);

    function getCollateralRequired(MarginVault.Vault memory _vault, uint256 _amount)
        external
        view
        returns (
            uint256[] memory collateralsAmountsRequired,
            uint256[] memory collateralsAmountsUsed,
            uint256[] memory collateralsValuesUsed,
            uint256 usedLongAmount
        );

    function _getCollateralizationRatio(address _otoken, address _collateralAsset)
        external
        view
        returns (FPI.FixedPointInt memory);

    function getCollateralDust(address _collateral) external view returns (uint256);

    function isMarginableLong(address longOtokenAddress, MarginVault.Vault memory _vault) external view returns (bool);

    function getExcessCollateral(MarginVault.Vault memory _vault) external view returns (uint256[] memory);

    function getExpiredPayoutRate(address _otoken) external view returns (uint256[] memory);

    function getMaxShortAmount(MarginVault.Vault memory _vault) external view returns (uint256);

    // function getMarginRequired(MarginVault.Vault memory _vault)  
    //     external
    //     view
    //     returns (
    //         bool,
    //         FPI.FixedPointInt[] memory,
    //         FPI.FixedPointInt[] memory
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

    function getPayout(address _otoken, uint256 _amount) external view returns (uint256[] memory);

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
