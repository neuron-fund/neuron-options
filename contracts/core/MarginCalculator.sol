/**
 * SPDX-License-Identifier: UNLICENSED
 */
pragma solidity 0.8.9;
pragma experimental ABIEncoderV2;

import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OtokenInterface} from "../interfaces/OtokenInterface.sol";
import {OracleInterface} from "../interfaces/OracleInterface.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {FPI} from "../libs/FixedPointInt256.sol";
import {MarginVault} from "../libs/MarginVault.sol";
import {ArrayAddressUtils} from "../libs/ArrayAddressUtils.sol";
import {Constants} from "./Constants.sol";

import "hardhat/console.sol";

/**
 * @title MarginCalculator
 * @notice Calculator module that checks if a given vault is valid, calculates margin requirements, and settlement proceeds
 */
contract MarginCalculator is Ownable {
    using SafeMath for uint256;
    using FPI for FPI.FixedPointInt;
    using ArrayAddressUtils for address[];

    /// @dev decimals option upper bound value, spot shock and oracle deviation
    uint256 internal constant SCALING_FACTOR = 27;

    /// @dev decimals used by strike price and oracle price
    uint256 internal constant BASE = 8;

    /// @notice auction length
    uint256 public constant AUCTION_TIME = 3600;

    /// @dev struct to store all needed vault details
    struct VaultDetails {
        address shortOtoken;
        address shortUnderlyingAsset;
        address shortStrikeAsset;
        uint256 shortAmount;
        address[] shortCollateralAssets;
        address longUnderlyingAsset;
        address longStrikeAsset;
        address[] longCollateralAssets;
        uint256 shortStrikePrice;
        uint256 shortExpiryTimestamp;
        uint256 longStrikePrice;
        uint256 longExpiryTimestamp;
        uint256[] longCollateralsDecimals;
        uint256[] collateralAmounts;
        uint256[] collateralsDecimals;
        bool isShortPut;
        bool isLongPut;
        bool hasLong;
        bool hasShort;
        bool hasCollateral;
    }

    struct OTokenDetails {
        address[] collaterals; // yvUSDC
        uint256[] collateralsAmounts; // yvUSDC
        address underlying; // WETH
        address strikeAsset; // USDC
        uint256 strikePrice;
        uint256 expiry;
        bool isPut;
        uint256 totalMinted;
    }

    /// @dev oracle deviation value (1e27)
    uint256 internal oracleDeviation;

    /// @dev FixedPoint 0
    FPI.FixedPointInt internal ZERO = FPI.fromScaledUint(0, BASE);

    /// @dev mapping to store dust amount per option collateral asset (scaled by collateral asset decimals)
    mapping(address => uint256) internal dust;

    /// @dev mapping to store array of time to expiry for a given product
    mapping(bytes32 => uint256[]) internal timesToExpiryForProduct;

    /// @dev mapping to store option upper bound value at specific time to expiry for a given product (1e27)
    mapping(bytes32 => mapping(uint256 => uint256)) internal maxPriceAtTimeToExpiry;

    /// @dev mapping to store shock value for spot price of a given product (1e27)
    mapping(bytes32 => uint256) internal spotShock;

    /// @dev oracle module
    OracleInterface public oracle;

    /// @notice emits an event when collateral dust is updated
    event CollateralDustUpdated(address indexed collateral, uint256 dust);
    /// @notice emits an event when new time to expiry is added for a specific product
    event TimeToExpiryAdded(bytes32 indexed productHash, uint256 timeToExpiry);
    /// @notice emits an event when new upper bound value is added for a specific time to expiry timestamp
    event MaxPriceAdded(bytes32 indexed productHash, uint256 timeToExpiry, uint256 value);
    /// @notice emits an event when updating upper bound value at specific expiry timestamp
    event MaxPriceUpdated(bytes32 indexed productHash, uint256 timeToExpiry, uint256 oldValue, uint256 newValue);
    /// @notice emits an event when spot shock value is updated for a specific product
    event SpotShockUpdated(bytes32 indexed product, uint256 spotShock);
    /// @notice emits an event when oracle deviation value is updated
    event OracleDeviationUpdated(uint256 oracleDeviation);

    /**
     * @notice constructor
     * @param _oracle oracle module address
     */
    constructor(address _oracle) {
        require(_oracle != address(0), "MarginCalculator: invalid oracle address");

        oracle = OracleInterface(_oracle);
    }

    /**
     * @notice set dust amount for collateral asset
     * @dev can only be called by owner
     * @param _collateral collateral asset address
     * @param _dust dust amount, should be scaled by collateral asset decimals
     */
    function setCollateralDust(address _collateral, uint256 _dust) external onlyOwner {
        require(_dust > 0, "MarginCalculator: dust amount should be greater than zero");

        dust[_collateral] = _dust;

        emit CollateralDustUpdated(_collateral, _dust);
    }

    /**
     * @notice set product upper bound values
     * @dev can only be called by owner
     * @param _underlying otoken underlying asset
     * @param _strike otoken strike asset
     * @param _collaterals otoken collateral asset
     * @param _isPut otoken type
     * @param _timesToExpiry array of times to expiry timestamp
     * @param _values upper bound values array
     */
    function setUpperBoundValues(
        address _underlying,
        address _strike,
        address[] calldata _collaterals,
        bool _isPut,
        uint256[] calldata _timesToExpiry,
        uint256[] calldata _values
    ) external onlyOwner {
        require(_timesToExpiry.length > 0, "MarginCalculator: invalid times to expiry array");
        require(_timesToExpiry.length == _values.length, "MarginCalculator: invalid values array");

        // get product hash
        bytes32 productHash = _getProductHash(_underlying, _strike, _collaterals, _isPut);

        uint256[] storage expiryArray = timesToExpiryForProduct[productHash];

        // check that this is the first expiry to set
        // if not, the last expiry should be less than the new one to insert (to make sure the array stay in order)
        require(
            (expiryArray.length == 0) || (_timesToExpiry[0] > expiryArray[expiryArray.length.sub(1)]),
            "MarginCalculator: expiry array is not in order"
        );

        for (uint256 i = 0; i < _timesToExpiry.length; i++) {
            // check that new times array is in order
            if (i.add(1) < _timesToExpiry.length) {
                require(_timesToExpiry[i] < _timesToExpiry[i.add(1)], "MarginCalculator: time should be in order");
            }

            require(_values[i] > 0, "MarginCalculator: no expiry upper bound value found");

            // add new upper bound value for this product at specific time to expiry
            maxPriceAtTimeToExpiry[productHash][_timesToExpiry[i]] = _values[i];

            // add new time to expiry to array
            expiryArray.push(_timesToExpiry[i]);

            emit TimeToExpiryAdded(productHash, _timesToExpiry[i]);
            emit MaxPriceAdded(productHash, _timesToExpiry[i], _values[i]);
        }
    }

    /**
     * @notice set option upper bound value for specific time to expiry (1e27)
     * @dev can only be called by owner
     * @param _underlying otoken underlying asset
     * @param _strike otoken strike asset
     * @param _collaterals otoken collateral asset
     * @param _isPut otoken type
     * @param _timeToExpiry option time to expiry timestamp
     * @param _value upper bound value
     */
    function updateUpperBoundValue(
        address _underlying,
        address _strike,
        address[] calldata _collaterals,
        bool _isPut,
        uint256 _timeToExpiry,
        uint256 _value
    ) external onlyOwner {
        require(_value > 0, "MarginCalculator: invalid option upper bound value");

        bytes32 productHash = _getProductHash(_underlying, _strike, _collaterals, _isPut);
        uint256 oldMaxPrice = maxPriceAtTimeToExpiry[productHash][_timeToExpiry];

        require(oldMaxPrice != 0, "MarginCalculator: upper bound value not found");

        // update upper bound value for the time to expiry
        maxPriceAtTimeToExpiry[productHash][_timeToExpiry] = _value;

        emit MaxPriceUpdated(productHash, _timeToExpiry, oldMaxPrice, _value);
    }

    /**
     * @notice set spot shock value, scaled to 1e27
     * @dev can only be called by owner
     * @param _underlying otoken underlying asset
     * @param _strike otoken strike asset
     * @param _collaterals otoken collateral asset
     * @param _isPut otoken type
     * @param _shockValue spot shock value
     */
    //  TODO where spot shock used?
    function setSpotShock(
        address _underlying,
        address _strike,
        address[] calldata _collaterals,
        bool _isPut,
        uint256 _shockValue
    ) external onlyOwner {
        require(_shockValue > 0, "MarginCalculator: invalid spot shock value");

        bytes32 productHash = _getProductHash(_underlying, _strike, _collaterals, _isPut);

        spotShock[productHash] = _shockValue;

        emit SpotShockUpdated(productHash, _shockValue);
    }

    /**
     * @notice set oracle deviation (1e27)
     * @dev can only be called by owner
     * @param _deviation deviation value
     */
    function setOracleDeviation(uint256 _deviation) external onlyOwner {
        oracleDeviation = _deviation;

        emit OracleDeviationUpdated(_deviation);
    }

    /**
     * @notice get dust amount for collateral asset
     * @param _collateral collateral asset address
     * @return dust amount
     */
    function getCollateralDust(address _collateral) external view returns (uint256) {
        return dust[_collateral];
    }

    /**
     * @notice get times to expiry for a specific product
     * @param _underlying otoken underlying asset
     * @param _strike otoken strike asset
     * @param _collaterals otoken collateral asset
     * @param _isPut otoken type
     * @return array of times to expiry
     */
    function getTimesToExpiry(
        address _underlying,
        address _strike,
        address[] calldata _collaterals,
        bool _isPut
    ) external view returns (uint256[] memory) {
        bytes32 productHash = _getProductHash(_underlying, _strike, _collaterals, _isPut);
        return timesToExpiryForProduct[productHash];
    }

    /**
     * @notice get option upper bound value for specific time to expiry
     * @param _underlying otoken underlying asset
     * @param _strike otoken strike asset
     * @param _collaterals otoken collateral asset
     * @param _isPut otoken type
     * @param _timeToExpiry option time to expiry timestamp
     * @return option upper bound value (1e27)
     */
    function getMaxPrice(
        address _underlying,
        address _strike,
        address[] calldata _collaterals,
        bool _isPut,
        uint256 _timeToExpiry
    ) external view returns (uint256) {
        bytes32 productHash = _getProductHash(_underlying, _strike, _collaterals, _isPut);

        return maxPriceAtTimeToExpiry[productHash][_timeToExpiry];
    }

    /**
     * @notice get spot shock value
     * @param _underlying otoken underlying asset
     * @param _strike otoken strike asset
     * @param _collaterals otoken collateral asset
     * @param _isPut otoken type
     * @return _shockValue spot shock value (1e27)
     */
    function getSpotShock(
        address _underlying,
        address _strike,
        address[] calldata _collaterals,
        bool _isPut
    ) external view returns (uint256) {
        bytes32 productHash = _getProductHash(_underlying, _strike, _collaterals, _isPut);

        return spotShock[productHash];
    }

    /**
     * @notice get oracle deviation
     * @return oracle deviation value (1e27)
     */
    function getOracleDeviation() external view returns (uint256) {
        return oracleDeviation;
    }

    /**
     * @notice return the collateral required for naked margin vault, in collateral asset decimals
     * @dev _shortAmount, _strikePrice and _underlyingPrice should be scaled by 1e8
     * @param _underlying underlying asset address
     * @param _strike strike asset address
     * @param _collaterals collateral asset address
     * @param _shortAmount amount of short otoken
     * @param  _strikePrice otoken strike price
     * @param _underlyingPrice otoken underlying price
     * @param _shortExpiryTimestamp otoken expiry timestamp
     * @param _collateralDecimals otoken collateral asset decimals
     * @param _isPut otoken type
     * @return collateral required for a naked margin vault, in collateral asset decimals
     */
    // function getNakedMarginRequired(
    //     address _underlying,
    //     address _strike,
    //     address[] calldata _collaterals,
    //     uint256 _shortAmount,
    //     uint256 _strikePrice,
    //     uint256 _underlyingPrice,
    //     uint256 _shortExpiryTimestamp,
    //     uint256 _collateralDecimals,
    //     bool _isPut
    // ) external view returns (uint256) {
    //     bytes32 productHash = _getProductHash(_underlying, _strike, _collaterals, _isPut);

    //     // scale short amount from 1e8 to 1e27 (oToken is always in 1e8)
    //     FPI.FixedPointInt memory shortAmount = FPI.fromScaledUint(_shortAmount, BASE);
    //     // scale short strike from 1e8 to 1e27
    //     FPI.FixedPointInt memory shortStrike = FPI.fromScaledUint(_strikePrice, BASE);
    //     // scale short underlying price from 1e8 to 1e27
    //     FPI.FixedPointInt memory shortUnderlyingPrice = FPI.fromScaledUint(_underlyingPrice, BASE);

    //     // return required margin, scaled by collateral asset decimals, explicitly rounded up
    //     return
    //         FPI.toScaledUint(
    //             _getNakedMarginRequired(
    //                 productHash,
    //                 shortAmount,
    //                 shortUnderlyingPrice,
    //                 shortStrike,
    //                 _shortExpiryTimestamp,
    //                 _isPut
    //             ),
    //             _collateralDecimals,
    //             false
    //         );
    // }

    /**
     * @notice get an oToken's payout/cash value after expiry, in the collateral asset
     * @param _otoken oToken address
     * @param _amount amount of the oToken to calculate the payout for, always represented in 1e8
     * @return amount of collateral to pay out for provided amount rate
     */
    function getPayout(address _otoken, uint256 _amount) public view returns (uint256[] memory) {
        // payoutsRaw is amounts of each of collateral asset in collateral asset decimals to be paid out for 1e8 of the oToken
        uint256[] memory payoutsRaw = getExpiredPayoutRate(_otoken);
        uint256[] memory payouts = new uint256[](payoutsRaw.length);

        for (uint256 i = 0; i < payoutsRaw.length; i++) {
            // TODO is it possible to have significant precision loss here?
            // TODO can it overflow uint256 on multiplication?
            console.log("payoutsRaw[i]", payoutsRaw[i]);
            console.log("_amount", _amount);
            console.log("10**BASE", 10**BASE);
            payouts[i] = payoutsRaw[i].mul(_amount).div(10**BASE);
            console.log("payouts[i]", payouts[i]);
        }

        return payouts;
    }

    /**
     * @notice return the cash value of an expired oToken, denominated in collateral
     * @param _otoken oToken address
     * @return collateralsPayoutRate how much collateral can be taken out by 1 otoken unit, scaled by 1e8,
     * or how much collateral can be taken out for 1 (1e8) oToken
     */
    function getExpiredPayoutRate(address _otoken) public view returns (uint256[] memory collateralsPayoutRate) {
        require(_otoken != address(0), "MarginCalculator: Invalid token address");

        OTokenDetails memory oTokenDetails = OTokenDetails(
            new address[](0), // [yvUSDC, cUSDC, ...etc]
            new uint256[](0), // [0, 200, ...etc]
            address(0), // WETH
            address(0), // USDC
            0,
            0,
            false,
            0
        );

        (
            oTokenDetails.collaterals, // yvUSDC
            oTokenDetails.collateralsAmounts,
            oTokenDetails.underlying, // WETH
            oTokenDetails.strikeAsset, // USDC
            oTokenDetails.strikePrice,
            oTokenDetails.expiry,
            oTokenDetails.isPut,
            oTokenDetails.totalMinted
        ) = _getOtokenDetails(_otoken);

        require(block.timestamp >= oTokenDetails.expiry, "MarginCalculator: Otoken not expired yet");

        // Strike - current price USDC
        FPI.FixedPointInt memory cashValueInStrike = _getExpiredCashValue(
            oTokenDetails.underlying,
            oTokenDetails.strikeAsset,
            oTokenDetails.expiry,
            oTokenDetails.strikePrice,
            oTokenDetails.isPut
        );

        console.log("cashValueInStrike round down", cashValueInStrike.toScaledUint(BASE, true));
        console.log("cashValueInStrike round up", cashValueInStrike.toScaledUint(BASE, false));

        uint256[] memory otokenCollateralValues = OtokenInterface(_otoken).getCollateralsValues();

        FPI.FixedPointInt memory totalMintedFpi = FPI.fromScaledUint(oTokenDetails.totalMinted, BASE);
        FPI.FixedPointInt memory strikePriceFpi = FPI.fromScaledUint(oTokenDetails.strikePrice, BASE);

        // Amounts of collateral to transfer for 1 oToken
        collateralsPayoutRate = new uint256[](oTokenDetails.collaterals.length);
        // TODO this calculations should be done only once after oToken expiry but not on every redeem as its now. It will help save gas for redeemers
        for (uint256 i = 0; i < oTokenDetails.collaterals.length; i++) {
            // the exchangeRate was scaled by 1e8, if 1e8 otoken can take out 1 USDC, the exchangeRate is currently 1e8
            // we want to return: how much USDC units can be taken out by 1 (1e8 units) oToken
            uint256 collateralDecimals = uint256(IERC20Metadata(oTokenDetails.collaterals[i]).decimals());

            // TODO possible gas optimization, get rid of external call for each collateral and get values as array with "_getOtokenDetails"
            // Collateral value is calculated in strike asset, used BASE decimals only for convinience
            FPI.FixedPointInt memory collateralValue = FPI.fromScaledUint(otokenCollateralValues[i], BASE);

            FPI.FixedPointInt memory collateralPayoutValueInStrike = collateralValue
                .mul(cashValueInStrike)
                .div(totalMintedFpi)
                .div(strikePriceFpi);

            collateralsPayoutRate[i] = _convertAmountOnExpiryPrice(
                collateralPayoutValueInStrike,
                oTokenDetails.strikeAsset,
                oTokenDetails.collaterals[i],
                oTokenDetails.expiry
            ).toScaledUint(collateralDecimals, false);
        }
        return collateralsPayoutRate;
    }

    /**
     * @notice returns the cash value of provided amount of assets on expiry price, denominated in usd
     * @param _assets - array of addresses of assets
     * @param _assetsAmounts - amounts of assets, should be same length array as assets
     * @param _expiry - timestamp to get price at
     * @return totalValue - total value in usd of all provided assets
     */
    // function getAssetsTotalValueExpiry(
    //     address[] memory _assets,
    //     uint256[] memory _assetsAmounts,
    //     uint256 _expiry
    // ) internal view returns (FPI.FixedPointInt memory totalValue) {
    //     for (uint256 i = 0; i < _assets.length; i++) {
    //         uint256 assetDecimals = uint256(IERC20Metadata(_assets[i]).decimals());
    //         (uint256 price, bool priceFinalized) = oracle.getExpiryPrice(_assets[i], _expiry);
    //         require(priceFinalized, "MarginCalculator: price at expiry not finalized yet");
    //         totalValue = totalValue.add(
    //             FPI.fromScaledUint(price, BASE).mul(FPI.fromScaledUint(_assetsAmounts[i], assetDecimals))
    //         );
    //     }
    // }

    /**
      @notice return the amounts of collateral from the vault to use for minting amount of oToken
     */

    // structs to avoid stack too deep error
    // struct to store shortAmount, shortStrike and shortUnderlyingPrice scaled to 1e27
    struct ShortScaledDetails {
        FPI.FixedPointInt shortAmount;
        FPI.FixedPointInt shortStrike;
        FPI.FixedPointInt shortUnderlyingPrice;
    }

    /**
     * @notice calculate required collateral margin for a vault
     * @param _vault theoretical vault that needs to be checked
     * @return the vault collateral amount, and marginRequired the minimal amount of collateral needed in a vault, scaled to 1e27
     */
    // TODO this function is unused
    // function getMarginRequired(MarginVault.Vault memory _vault)
    //     external
    //     view
    //     returns (
    //         bool,
    //         FPI.FixedPointInt[] memory,
    //         FPI.FixedPointInt[] memory
    //     )
    // {
    //     VaultDetails memory vaultDetail = _getVaultDetails(_vault);
    //     return _getMarginRequired(_vault, vaultDetail);
    // }

    /**
     * @notice returns the amount of collateral that can be removed from an actual or a theoretical vault
     * @dev return amount is denominated in the collateral asset for the oToken in the vault, or the collateral asset in the vault
     * @param _vault theoretical vault that needs to be checked
     * @return excessCollateral the amount by which the margin is above or below the required amount
     * @return isExcess True if there is excess margin in the vault, False if there is a deficit of margin in the vault
    //  TODO return amounts which margin bellow the required amount
     * if True, collateral can be taken out from the vault, if False, additional collateral needs to be added to vault
     */
    function getExcessCollateral(MarginVault.Vault memory _vault) public view returns (uint256[] memory, bool) {
        // TODO should use usedCollateralAmounts or sub amounts from getPayout
        VaultDetails memory vaultDetails = _getVaultDetails(_vault);

        // include all the checks for to ensure the vault is valid
        _checkIsValidVault(_vault, vaultDetails);

        bool hasExpiredShort = vaultDetails.hasShort &&
            OtokenInterface(vaultDetails.shortOtoken).expiryTimestamp() <= block.timestamp;

        uint256[] memory excessCollateral = _vault.unusedCollateralAmounts;

        // if the vault contains no oTokens, return the amount of collateral
        if (!hasExpiredShort) {
            // TODO check hasCollateral everywhere used it or not
            return (excessCollateral, true);
        }

        uint256 oTokenTotalMinted = OtokenInterface(vaultDetails.shortOtoken).totalMinted();
        if (vaultDetails.hasShort) {
            // This payout represents how much redeemer will get for each 1e8 of oToken. But from the vault side we should also calculate ratio
            // of amounts of each collateral provided by vault to same total amount used for mint total number of oTokens
            // For example: one vault provided [200 USDC, 0 DAI], and another vault [0 USDC, 200 DAI] for the oToken mint
            // and get payout returns [100 USDC, 100 DAI] first vault pays all the 100 USDC and the second one all the 100 DAI
            uint256[] memory payoutsRaw = getExpiredPayoutRate(vaultDetails.shortOtoken);
            uint256[] memory oTokenCollateralsAmounts = OtokenInterface(vaultDetails.shortOtoken)
                .getCollateralsAmounts();

            for (uint256 i = 0; i < _vault.collateralAssets.length; i++) {
                uint256 collateralProvidedByVault = _vault.usedCollateralAmounts[i];
                console.log("oTokenCollateralsAmounts", i, oTokenCollateralsAmounts[i]);
                console.log("collateralProvidedByVault", i, collateralProvidedByVault);
                if (oTokenCollateralsAmounts[i] == 0 || collateralProvidedByVault == 0) {
                    continue;
                }

                uint256 collateralDecimals = IERC20Metadata(_vault.collateralAssets[i]).decimals();

                // This ratio represents for specific collateral what part does this vault cover total collaterization of oToken by this collateral
                FPI.FixedPointInt memory vaultCollateralRatio = FPI
                    .fromScaledUint(collateralProvidedByVault, collateralDecimals)
                    .div(FPI.fromScaledUint(oTokenCollateralsAmounts[i], collateralDecimals));

                // FPI.FixedPointInt memory payoutsFPI = FPI.fromScaledUint(payoutsRaw[i], collateralDecimals);
                // FPI.FixedPointInt memory oTokenTotalMintedFPI = FPI.fromScaledUint(oTokenTotalMinted, BASE);

                uint256 redeemableCollateral = FPI
                // TODO possible gas optimization getExpiredPayoutRate returns payoutsRaw and just before return transforms it to uint
                // Can add second return to prevent transform to FPI back here
                    .fromScaledUint(payoutsRaw[i], collateralDecimals)
                    .mul(FPI.fromScaledUint(oTokenTotalMinted, BASE))
                    .mul(vaultCollateralRatio)
                    .toScaledUint(collateralDecimals, false);

                excessCollateral[i] = excessCollateral[i].add(collateralProvidedByVault).sub(redeemableCollateral);
            }
            return (excessCollateral, true);
        } else {
            // TODO hasLong?
        }
    }

    /**
     * @notice return the cash value of an expired oToken, denominated in strike asset
     * @dev for a call, return Max (0, underlyingPriceInStrike - otoken.strikePrice)
     * @dev for a put, return Max(0, otoken.strikePrice - underlyingPriceInStrike)
     * @param _underlying otoken underlying asset
     * @param _strike otoken strike asset
     * @param _expiryTimestamp otoken expiry timestamp
     * @param _strikePrice otoken strike price
     * @param _strikePrice true if otoken is put otherwise false
     * @return cash value of an expired otoken, denominated in the strike asset
     */
    function _getExpiredCashValue(
        address _underlying, // WETH
        address _strike, // USDC
        uint256 _expiryTimestamp, // otoken expire
        uint256 _strikePrice, // 4000
        bool _isPut // true
    ) internal view returns (FPI.FixedPointInt memory) {
        // strike price is denominated in strike asset
        FPI.FixedPointInt memory strikePrice = FPI.fromScaledUint(_strikePrice, BASE);
        FPI.FixedPointInt memory one = FPI.fromScaledUint(1, 0);

        // calculate the value of the underlying asset in terms of the strike asset
        FPI.FixedPointInt memory underlyingPriceInStrike = _convertAmountOnExpiryPrice(
            one, // underlying price is 1 (1e27) in term of underlying
            _underlying,
            _strike,
            _expiryTimestamp
        );

        return _getCashValue(strikePrice, underlyingPriceInStrike, _isPut);
    }

    /// @dev added this struct to avoid stack-too-deep error
    struct OtokenDetails {
        address otokenUnderlyingAsset;
        address[] otokenShortCollateralAssets;
        address[] otokenLongCollateralAssets;
        address otokenStrikeAsset;
        uint256 otokenExpiry;
        bool isPut;
    }

    /**
     * @notice calculate the amount of collateral needed for a vault
     * @dev vault passed in has already passed the checkIsValidVault function
     * @param _vault theoretical vault that needs to be checked
     * @return the vault collateral amount, and marginRequired the minimal amount of collateral needed in a vault,
     * scaled to 1e27
     */
    // function _getMarginRequired(MarginVault.Vault memory _vault, VaultDetails memory _vaultDetails)
    //     internal
    //     view
    //     returns (
    //         bool,
    //         FPI.FixedPointInt[] memory,
    //         FPI.FixedPointInt[] memory
    //     )
    // {
    //     FPI.FixedPointInt memory shortAmount = _vaultDetails.hasShort
    //         ? FPI.fromScaledUint(_vault.shortAmount, BASE)
    //         : ZERO;
    //     FPI.FixedPointInt memory longAmount = _vaultDetails.hasLong
    //         ? FPI.fromScaledUint(_vault.longAmounts[0], BASE)
    //         : ZERO;
    //     FPI.FixedPointInt[] memory collateralsAmounts;
    //     for (uint256 i = 0; i < _vault.collateralAmounts.length; i++) {
    //         collateralsAmounts[i] = _vaultDetails.hasCollateral
    //             ? FPI.fromScaledUint(_vault.collateralAmounts[i], _vaultDetails.collateralsDecimals[i])
    //             : ZERO;
    //     }
    //     FPI.FixedPointInt memory shortStrike = _vaultDetails.hasShort // TODO is BASE right amount of decimals for strike price? strike price asset can have not 8 decimals
    //         ? FPI.fromScaledUint(_vaultDetails.shortStrikePrice, BASE)
    //         : ZERO;

    //     // struct to avoid stack too deep error
    //     OtokenDetails memory otokenDetails = OtokenDetails(
    //         _vaultDetails.hasShort ? _vaultDetails.shortUnderlyingAsset : _vaultDetails.longUnderlyingAsset,
    //         _vaultDetails.hasShort ? _vaultDetails.shortCollateralAssets : new address[](0),
    //         _vaultDetails.hasShort ? _vaultDetails.longCollateralAssets : new address[](0),
    //         _vaultDetails.hasShort ? _vaultDetails.shortStrikeAsset : _vaultDetails.longStrikeAsset,
    //         _vaultDetails.hasShort ? _vaultDetails.shortExpiryTimestamp : _vaultDetails.longExpiryTimestamp,
    //         _vaultDetails.hasShort ? _vaultDetails.isShortPut : _vaultDetails.isLongPut
    //     );

    //     if (block.timestamp < otokenDetails.otokenExpiry) {
    //         // it's not expired, return amount of margin required based on vault type
    //         // this is a fully collateralized vault
    //         FPI.FixedPointInt memory longStrike = _vaultDetails.hasLong
    //             ? FPI.fromScaledUint(_vaultDetails.longStrikePrice, BASE)
    //             : ZERO;
    //         if (otokenDetails.isPut) {
    //             FPI.FixedPointInt memory strikeNeeded = _getPutSpreadMarginRequired(
    //                 shortAmount,
    //                 longAmount,
    //                 shortStrike,
    //                 longStrike
    //             );
    //             // convert amount to be denominated in collateral

    //             (bool isEnoughCollaterized, FPI.FixedPointInt[] memory collateralsRequired) = _getEnoughToCover(
    //                 strikeNeeded,
    //                 otokenDetails.otokenStrikeAsset,
    //                 _vaultDetails.shortCollateralAssets,
    //                 collateralsAmounts
    //             );
    //             return (isEnoughCollaterized, collateralsAmounts, collateralsRequired);
    //         } else {
    //             FPI.FixedPointInt memory underlyingNeeded = _getCallSpreadMarginRequired(
    //                 shortAmount,
    //                 longAmount,
    //                 shortStrike,
    //                 longStrike
    //             );
    //             FPI.FixedPointInt[] memory requiredAmounts = new FPI.FixedPointInt[](1);
    //             requiredAmounts[0] = _convertAmountOnLivePrice(
    //                 underlyingNeeded,
    //                 otokenDetails.otokenUnderlyingAsset,
    //                 // TODO not use first value of array
    //                 otokenDetails.otokenLongCollateralAssets[0]
    //             );
    //             // convert amount to be denominated in collateral
    //             // TODO Call option
    //             return (false, collateralsAmounts, requiredAmounts);
    //         }
    //     } else {
    //         // TODO when expired
    //         // the vault has expired. calculate the cash value of all the minted short options
    //         FPI.FixedPointInt memory shortCashValue = _vaultDetails.hasShort
    //             ? _getExpiredCashValue(
    //                 _vaultDetails.shortUnderlyingAsset,
    //                 _vaultDetails.shortStrikeAsset,
    //                 _vaultDetails.shortExpiryTimestamp,
    //                 _vaultDetails.shortStrikePrice,
    //                 otokenDetails.isPut
    //             )
    //             : ZERO;
    //         FPI.FixedPointInt memory longCashValue = _vaultDetails.hasLong
    //             ? _getExpiredCashValue(
    //                 _vaultDetails.longUnderlyingAsset,
    //                 _vaultDetails.longStrikeAsset,
    //                 _vaultDetails.longExpiryTimestamp,
    //                 _vaultDetails.longStrikePrice,
    //                 otokenDetails.isPut
    //             )
    //             : ZERO;

    //         FPI.FixedPointInt memory valueInStrike = _getExpiredSpreadCashValue(
    //             shortAmount,
    //             longAmount,
    //             shortCashValue,
    //             longCashValue
    //         );

    //         FPI.FixedPointInt[] memory requiredAmounts = new FPI.FixedPointInt[](1);
    //         requiredAmounts[0] = _convertAmountOnExpiryPrice(
    //             valueInStrike,
    //             otokenDetails.otokenStrikeAsset,
    //             otokenDetails.otokenShortCollateralAssets[0],
    //             otokenDetails.otokenExpiry
    //         );
    //         // convert amount to be denominated in collateral
    //         return (false, collateralsAmounts, requiredAmounts);
    //     }
    // }

    /**
     * @notice calculates is total price of aseets in array B is greater or equal to total price of asset A amount, based on live price
     * returns array of amounts of assets in array B enough to cover amount of asset A
     * amounts in array B taken prororitanlly to it's total sum in array B
     * uses _convertAmountOnLivePrice to calcualte each asset sum in array B
     * @param _amountA amount in asset A
     * @param _assetA asset A
     * @param _assetsB assets array B
     * @param _amountsB amounts array B
     * @return is enough to cover value of asset A, array of amounts of assets in array B to cover value of asset A
     */
    function _getEnoughToCover(
        FPI.FixedPointInt memory _amountA,
        address _assetA,
        address[] memory _assetsB,
        FPI.FixedPointInt[] memory _amountsB
    ) internal view returns (bool, FPI.FixedPointInt[] memory) {
        FPI.FixedPointInt[] memory aseetsBPrices = new FPI.FixedPointInt[](_assetsB.length);
        FPI.FixedPointInt[] memory aseetsBPriceValue = new FPI.FixedPointInt[](_assetsB.length);
        FPI.FixedPointInt memory totalValueBAssets = ZERO;

        for (uint256 i = 0; i < _assetsB.length; i++) {
            FPI.FixedPointInt memory price = FPI.fromScaledUint(oracle.getPrice(_assetsB[i]), BASE);
            aseetsBPrices[i] = price;
            aseetsBPriceValue[i] = _amountsB[i].mul(price);
            totalValueBAssets = totalValueBAssets.add(aseetsBPriceValue[i]);
        }

        uint256 priceA = oracle.getPrice(_assetA);
        FPI.FixedPointInt memory assetAValue = _amountA.mul(FPI.fromScaledUint(priceA, BASE));

        // check if total price of assets in array B is greater or equal to total price of asset A
        bool isEnough = totalValueBAssets.isGreaterThanOrEqual(assetAValue);
        FPI.FixedPointInt memory fractionAmountsBToUse = isEnough ? assetAValue.div(totalValueBAssets) : ZERO;
        FPI.FixedPointInt[] memory aseetsBToCover = new FPI.FixedPointInt[](_assetsB.length);
        for (uint256 i = 0; i < _assetsB.length; i++) {
            aseetsBToCover[i] = _amountsB[i].mul(fractionAmountsBToUse);
        }

        return (isEnough, aseetsBToCover);
    }

    /**
     * @notice get required collateral for naked margin position
     * if put:
     * a = min(strike price, spot shock * underlying price)
     * b = max(strike price - spot shock * underlying price, 0)
     * marginRequired = ( option upper bound value * a + b) * short amount
     * if call:
     * a = min(1, strike price / (underlying price / spot shock value))
     * b = max(1- (strike price / (underlying price / spot shock value)), 0)
     * marginRequired = (option upper bound value * a + b) * short amount
     * @param _productHash product hash
     * @param _shortAmount short amount in vault, in FixedPointInt type
     * @param _strikePrice strike price of short otoken, in FixedPointInt type
     * @param _underlyingPrice underlying price of short otoken underlying asset, in FixedPointInt type
     * @param _shortExpiryTimestamp short otoken expiry timestamp
     * @param _isPut otoken type, true if put option, false for call option
     * @return required margin for this naked vault, in FixedPointInt type (scaled by 1e27)
     */
    function _getNakedMarginRequired(
        bytes32 _productHash,
        FPI.FixedPointInt memory _shortAmount,
        FPI.FixedPointInt memory _underlyingPrice,
        FPI.FixedPointInt memory _strikePrice,
        uint256 _shortExpiryTimestamp,
        bool _isPut
    ) internal view returns (FPI.FixedPointInt memory) {
        // find option upper bound value
        FPI.FixedPointInt memory optionUpperBoundValue = _findUpperBoundValue(_productHash, _shortExpiryTimestamp);
        // convert spot shock value of this product to FixedPointInt (already scaled by 1e27)
        FPI.FixedPointInt memory spotShockValue = FPI.FixedPointInt(int256(spotShock[_productHash]));

        FPI.FixedPointInt memory a;
        FPI.FixedPointInt memory b;
        FPI.FixedPointInt memory marginRequired;

        if (_isPut) {
            a = FPI.min(_strikePrice, spotShockValue.mul(_underlyingPrice));
            b = FPI.max(_strikePrice.sub(spotShockValue.mul(_underlyingPrice)), ZERO);
            marginRequired = optionUpperBoundValue.mul(a).add(b).mul(_shortAmount);
        } else {
            FPI.FixedPointInt memory one = FPI.fromScaledUint(1e27, SCALING_FACTOR);
            a = FPI.min(one, _strikePrice.mul(spotShockValue).div(_underlyingPrice));
            b = FPI.max(one.sub(_strikePrice.mul(spotShockValue).div(_underlyingPrice)), ZERO);
            marginRequired = optionUpperBoundValue.mul(a).add(b).mul(_shortAmount);
        }

        return marginRequired;
    }

    /**
     * @notice find upper bound value for product by specific expiry timestamp
     * @dev should return the upper bound value that correspond to option time to expiry, of if not found should return the next greater one, revert if no value found
     * @param _productHash product hash
     * @param _expiryTimestamp expiry timestamp
     * @return option upper bound value
     */
    function _findUpperBoundValue(bytes32 _productHash, uint256 _expiryTimestamp)
        internal
        view
        returns (FPI.FixedPointInt memory)
    {
        // get time to expiry array of this product hash
        uint256[] memory timesToExpiry = timesToExpiryForProduct[_productHash];

        // check that this product have upper bound values stored
        require(timesToExpiry.length != 0, "MarginCalculator: product have no expiry values");

        uint256 optionTimeToExpiry = _expiryTimestamp.sub(block.timestamp);

        // check that the option time to expiry is in the expiry array
        require(
            timesToExpiry[timesToExpiry.length.sub(1)] >= optionTimeToExpiry,
            "MarginCalculator: product have no upper bound value"
        );

        // loop through the array and return the upper bound value in FixedPointInt type (already scaled by 1e27)
        for (uint8 i = 0; i < timesToExpiry.length; i++) {
            if (timesToExpiry[i] >= optionTimeToExpiry)
                return FPI.fromScaledUint(maxPriceAtTimeToExpiry[_productHash][timesToExpiry[i]], SCALING_FACTOR);
        }
    }

    /**
     * @dev returns the strike asset amount of margin required for a put or put spread with the given short oTokens, long oTokens and amounts
     *
     * marginRequired = max( (short amount * short strike) - (long strike * min (short amount, long amount)) , 0 )
     *
     * @return margin requirement denominated in the strike asset
     */
    function _getPutSpreadMarginRequired(
        FPI.FixedPointInt memory _shortAmount,
        FPI.FixedPointInt memory _longAmount,
        FPI.FixedPointInt memory _shortStrike,
        FPI.FixedPointInt memory _longStrike
    ) internal view returns (FPI.FixedPointInt memory) {
        return FPI.max(_shortAmount.mul(_shortStrike).sub(_longStrike.mul(FPI.min(_shortAmount, _longAmount))), ZERO);
    }

    /**
     * @dev returns the underlying asset amount required for a call or call spread with the given short oTokens, long oTokens, and amounts
     *
     *                           (long strike - short strike) * short amount
     * marginRequired =  max( ------------------------------------------------- , max (short amount - long amount, 0) )
     *                                           long strike
     *
     * @dev if long strike = 0, return max( short amount - long amount, 0)
     * @return margin requirement denominated in the underlying asset
     */
    function _getCallSpreadMarginRequired(
        FPI.FixedPointInt memory _shortAmount,
        FPI.FixedPointInt memory _longAmount,
        FPI.FixedPointInt memory _shortStrike,
        FPI.FixedPointInt memory _longStrike
    ) internal view returns (FPI.FixedPointInt memory) {
        // max (short amount - long amount , 0)
        if (_longStrike.isEqual(ZERO)) {
            return FPI.max(_shortAmount.sub(_longAmount), ZERO);
        }

        /**
         *             (long strike - short strike) * short amount
         * calculate  ----------------------------------------------
         *                             long strike
         */
        FPI.FixedPointInt memory firstPart = _longStrike.sub(_shortStrike).mul(_shortAmount).div(_longStrike);

        /**
         * calculate max ( short amount - long amount , 0)
         */
        FPI.FixedPointInt memory secondPart = FPI.max(_shortAmount.sub(_longAmount), ZERO);

        return FPI.max(firstPart, secondPart);
    }

    /**
     * @notice convert an amount in asset A to equivalent amount of asset B, based on a live price
     * @dev function includes the amount and applies .mul() first to increase the accuracy
     * @param _amount amount in asset A
     * @param _assetA asset A
     * @param _assetB asset B
     * @return _amount in asset B
     */
    function _convertAmountOnLivePrice(
        FPI.FixedPointInt memory _amount,
        address _assetA,
        address _assetB
    ) internal view returns (FPI.FixedPointInt memory) {
        if (_assetA == _assetB) {
            return _amount;
        }
        uint256 priceA = oracle.getPrice(_assetA);
        uint256 priceB = oracle.getPrice(_assetB);
        // amount A * price A in USD = amount B * price B in USD
        // amount B = amount A * price A / price B
        return _amount.mul(FPI.fromScaledUint(priceA, BASE)).div(FPI.fromScaledUint(priceB, BASE));
    }

    /**
     * @notice convert an amount in asset A to equivalent amount of asset B, based on an expiry price
     * @dev function includes the amount and apply .mul() first to increase the accuracy
     * @param _amount amount in asset A
     * @param _assetA asset A
     * @param _assetB asset B
     * @return _amount in asset B
     */
    function _convertAmountOnExpiryPrice(
        FPI.FixedPointInt memory _amount, // Strike - current price USDC
        address _assetA, // strikeAsset USDC
        address _assetB, // yvUSDC
        uint256 _expiry // oToken expiry
    ) internal view returns (FPI.FixedPointInt memory) {
        if (_assetA == _assetB) {
            return _amount;
        }
        (uint256 priceA, bool priceAFinalized) = oracle.getExpiryPrice(_assetA, _expiry);
        (uint256 priceB, bool priceBFinalized) = oracle.getExpiryPrice(_assetB, _expiry);
        require(priceAFinalized && priceBFinalized, "MarginCalculator: price at expiry not finalized yet");
        // amount A * price A in USD = amount B * price B in USD
        // amount B = amount A * price A / price B
        return _amount.mul(FPI.fromScaledUint(priceA, BASE)).div(FPI.fromScaledUint(priceB, BASE));
    }

    /**
     * @notice return debt price, how much collateral asset per 1 otoken repaid in collateral decimal
     * ending price = vault collateral / vault debt
     * if auction ended, return ending price
     * else calculate starting price
     * for put option:
     * starting price = max(cash value - underlying price * oracle deviation, 0)
     * for call option:
     *                      max(cash value - underlying price * oracle deviation, 0)
     * starting price =  ---------------------------------------------------------------
     *                                          underlying price
     *
     *
     *                  starting price + (ending price - starting price) * auction elapsed time
     * then price = --------------------------------------------------------------------------
     *                                      auction time
     *
     *
     * @param _vaultCollateral vault collateral amount
     * @param _vaultDebt vault short amount
     * @param _cashValue option cash value
     * @param _spotPrice option underlying asset price (in USDC)
     * @param _auctionStartingTime auction starting timestamp (_spotPrice timestamp from chainlink)
     * @param _collateralDecimals collateral asset decimals
     * @param _isPut otoken type, true for put, false for call option
     * @return price of 1 debt otoken in collateral asset scaled by collateral decimals
     */
    function _getDebtPrice(
        FPI.FixedPointInt memory _vaultCollateral,
        FPI.FixedPointInt memory _vaultDebt,
        FPI.FixedPointInt memory _cashValue,
        FPI.FixedPointInt memory _spotPrice,
        uint256 _auctionStartingTime,
        uint256 _collateralDecimals,
        bool _isPut
    ) internal view returns (uint256) {
        // price of 1 repaid otoken in collateral asset, scaled to 1e27
        FPI.FixedPointInt memory price;
        // auction ending price
        FPI.FixedPointInt memory endingPrice = _vaultCollateral.div(_vaultDebt);

        // auction elapsed time
        uint256 auctionElapsedTime = block.timestamp.sub(_auctionStartingTime);

        // if auction ended, return ending price
        if (auctionElapsedTime >= AUCTION_TIME) {
            price = endingPrice;
        } else {
            // starting price
            FPI.FixedPointInt memory startingPrice;

            {
                // store oracle deviation in a FixedPointInt (already scaled by 1e27)
                FPI.FixedPointInt memory fixedOracleDeviation = FPI.fromScaledUint(oracleDeviation, SCALING_FACTOR);

                if (_isPut) {
                    startingPrice = FPI.max(_cashValue.sub(fixedOracleDeviation.mul(_spotPrice)), ZERO);
                } else {
                    startingPrice = FPI.max(_cashValue.sub(fixedOracleDeviation.mul(_spotPrice)), ZERO).div(_spotPrice);
                }
            }

            // store auctionElapsedTime in a FixedPointInt scaled by 1e27
            FPI.FixedPointInt memory auctionElapsedTimeFixedPoint = FPI.fromScaledUint(auctionElapsedTime, 18);
            // store AUCTION_TIME in a FixedPointInt (already scaled by 1e27)
            FPI.FixedPointInt memory auctionTime = FPI.fromScaledUint(AUCTION_TIME, 18);

            // calculate price of 1 repaid otoken, scaled by the collateral decimals, expilictly rounded down
            price = startingPrice.add(
                (endingPrice.sub(startingPrice)).mul(auctionElapsedTimeFixedPoint).div(auctionTime)
            );

            // cap liquidation price to ending price
            if (price.isGreaterThan(endingPrice)) price = endingPrice;
        }

        return price.toScaledUint(_collateralDecimals, true);
    }

    /**
     * @notice get vault details to save us from making multiple external calls
     * @param _vault vault struct
     * @return vault details in VaultDetails struct
     */
    function _getVaultDetails(MarginVault.Vault memory _vault) internal view returns (VaultDetails memory) {
        VaultDetails memory vaultDetails = VaultDetails(
            address(0), // address shortOtoken;
            address(0), // address shortUnderlyingAsset;
            address(0), // address shortStrikeAsset;
            0, // uint256[] shortAmount;
            new address[](0), // address[] shortCollateralAssets;
            address(0), // address longUnderlyingAsset;
            address(0), // address longStrikeAsset;
            new address[](0), // address longCollateralAsset;
            0, // uint256 shortStrikePrice;
            0, // uint256 shortExpiryTimestamp;
            0, // uint256 longStrikePrice;
            0, // uint256 longExpiryTimestamp;
            new uint256[](0), // uint256 longCollateralDecimals;
            new uint256[](0), // uint256[] collateralAmounts;
            new uint256[](0), // uint256[] collateralsDecimals;
            false, // bool isShortPut;
            false, // bool isLongPut;
            false, // bool hasLong;
            false, // bool hasShort;
            false // bool hasCollateral;
        );

        // check if vault has long, short otoken and collateral asset
        vaultDetails.hasLong = _isNotEmpty(_vault.longOtokens);
        vaultDetails.hasShort = _vault.shortOtoken != address(0);
        vaultDetails.hasCollateral = _isNotEmpty(_vault.collateralAssets);

        vaultDetails.shortOtoken = _vault.shortOtoken;
        vaultDetails.shortAmount = _vault.shortAmount;
        vaultDetails.collateralAmounts = _vault.collateralAmounts;

        // get vault long otoken if available
        if (vaultDetails.hasLong) {
            OtokenInterface long = OtokenInterface(_vault.longOtokens[0]);
            (
                vaultDetails.longCollateralAssets,
                ,
                vaultDetails.longUnderlyingAsset,
                vaultDetails.longStrikeAsset,
                vaultDetails.longStrikePrice,
                vaultDetails.longExpiryTimestamp,
                vaultDetails.isLongPut,

            ) = _getOtokenDetails(address(long));
            vaultDetails.longCollateralsDecimals = new uint256[](vaultDetails.longCollateralAssets.length);
            for (uint256 i = 0; i < vaultDetails.longCollateralAssets.length; i++) {
                vaultDetails.longCollateralsDecimals[i] = IERC20Metadata(vaultDetails.longCollateralAssets[i])
                    .decimals();
            }
        }

        // get vault short otoken if available
        if (vaultDetails.hasShort) {
            OtokenInterface short = OtokenInterface(_vault.shortOtoken);
            (
                vaultDetails.shortCollateralAssets,
                ,
                vaultDetails.shortUnderlyingAsset,
                vaultDetails.shortStrikeAsset,
                vaultDetails.shortStrikePrice,
                vaultDetails.shortExpiryTimestamp,
                vaultDetails.isShortPut,

            ) = _getOtokenDetails(address(short));
        }

        vaultDetails.collateralsDecimals = new uint256[](_vault.collateralAssets.length);
        for (uint256 i = 0; i < _vault.collateralAssets.length; i++) {
            vaultDetails.collateralsDecimals[i] = uint256(IERC20Metadata(_vault.collateralAssets[i]).decimals());
        }

        return vaultDetails;
    }

    /**
     * @dev calculate the cash value obligation for an expired vault, where a positive number is an obligation
     *
     * Formula: net = (short cash value * short amount) - ( long cash value * long Amount )
     *
     * @return cash value obligation denominated in the strike asset
     */
    function _getExpiredSpreadCashValue(
        FPI.FixedPointInt memory _shortAmount,
        FPI.FixedPointInt memory _longAmount,
        FPI.FixedPointInt memory _shortCashValue,
        FPI.FixedPointInt memory _longCashValue
    ) internal pure returns (FPI.FixedPointInt memory) {
        return _shortCashValue.mul(_shortAmount).sub(_longCashValue.mul(_longAmount));
    }

    /**
     * @dev check if asset array contain a token address
     * @return True if the array is not empty
     */
    function _isNotEmpty(address[] memory _assets) internal pure returns (bool) {
        return _assets.length > 0 && _assets[0] != address(0);
    }

    /**
     * @dev ensure that:
     * a) at most 1 asset type used as collateral
     * b) at most 1 series of option used as the long option
     * c) at most 1 series of option used as the short option
     * d) asset array lengths match for long, short and collateral
     * e) long option and collateral asset is acceptable for margin with short asset
     * @param _vault the vault to check
     * @param _vaultDetails vault details struct
     */
    function _checkIsValidVault(MarginVault.Vault memory _vault, VaultDetails memory _vaultDetails) internal pure {
        // ensure all the arrays in the vault are valid
        require(_vault.longOtokens.length <= 1, "MarginCalculator: Too many long otokens in the vault");
        require(
            _vault.collateralAssets.length <= Constants.MAX_COLLATERAL_ASSETS,
            "MarginCalculator: Too many collateral assets in the vault"
        );

        require(
            _vault.longOtokens.length == _vault.longAmounts.length,
            "MarginCalculator: Long asset and amount mismatch"
        );
        require(
            _vault.collateralAssets.length == _vault.collateralAmounts.length,
            "MarginCalculator: Collateral asset and amount mismatch"
        );

        // ensure the long asset is valid for the short asset
        require(
            _isMarginableLong(_vault, _vaultDetails),
            "MarginCalculator: long asset not marginable for short asset"
        );

        // ensure that the collateral asset is valid for the short asset
        require(
            _isMarginableCollateral(_vault, _vaultDetails),
            "MarginCalculator: collateral asset not marginable for short asset"
        );
    }

    /**
     * @dev if there is a short option and a long option in the vault, ensure that the long option is able to be used as collateral for the short option
     * @param _vault the vault to check
     * @param _vaultDetails vault details struct
     * @return true if long is marginable or false if not
     */
    function _isMarginableLong(MarginVault.Vault memory _vault, VaultDetails memory _vaultDetails)
        internal
        pure
        returns (bool)
    {
        // if vault is missing a long or a short, return True
        if (!_vaultDetails.hasLong || !_vaultDetails.hasShort) return true;

        bool isSameLengthLongShort = _vaultDetails.longCollateralAssets.length ==
            _vaultDetails.shortCollateralAssets.length;
        if (!isSameLengthLongShort) return false;

        // check if longCollateralAssets has same as shorCollateralAssets
        // TODO check if array equal is right here
        for (uint256 i = 0; i < _vaultDetails.longCollateralAssets.length; i++) {
            if (_vaultDetails.longCollateralAssets[i] != _vaultDetails.shortCollateralAssets[i]) return false;
        }

        return
            _vault.longOtokens[0] != _vault.shortOtoken &&
            _vaultDetails.longUnderlyingAsset == _vaultDetails.shortUnderlyingAsset &&
            _vaultDetails.longStrikeAsset == _vaultDetails.shortStrikeAsset &&
            _vaultDetails.longExpiryTimestamp == _vaultDetails.shortExpiryTimestamp &&
            _vaultDetails.isLongPut == _vaultDetails.isShortPut;
    }

    /**
     * @dev if there is short option and collateral asset in the vault, ensure that the collateral asset is valid for the short option
     * @param _vault the vault to check
     * @param _vaultDetails vault details struct
     * @return true if marginable or false
     */
    function _isMarginableCollateral(MarginVault.Vault memory _vault, VaultDetails memory _vaultDetails)
        internal
        pure
        returns (bool)
    {
        bool isMarginable = true;

        if (!_vaultDetails.hasCollateral) return isMarginable;

        if (_vaultDetails.hasShort) {
            // TODO wont work if order of assets is different
            isMarginable = _vaultDetails.shortCollateralAssets.isEqual(_vault.collateralAssets);
        } else if (_vaultDetails.hasLong) {
            isMarginable = _vaultDetails.longCollateralAssets.isEqual(_vault.collateralAssets);
        }

        return isMarginable;
    }

    /**
     * @notice get a product hash
     * @param _underlying option underlying asset
     * @param _strike option strike asset
     * @param _collaterals option collateral asset
     * @param _isPut option type
     * @return product hash
     */
    function _getProductHash(
        address _underlying,
        address _strike,
        address[] memory _collaterals,
        bool _isPut
    ) internal pure returns (bytes32) {
        // TODO product hash for same collateral with different order in array will be different which is wrong
        return keccak256(abi.encode(_underlying, _strike, _collaterals, _isPut));
    }

    /**
     * @notice get option cash value
     * @dev this assume that the underlying price is denominated in strike asset
     * cash value = max(underlying price - strike price, 0)
     * @param _strikePrice option strike price
     * @param _underlyingPrice option underlying price
     * @param _isPut option type, true for put and false for call option
     */
    function _getCashValue(
        FPI.FixedPointInt memory _strikePrice,
        FPI.FixedPointInt memory _underlyingPrice,
        bool _isPut
    ) internal view returns (FPI.FixedPointInt memory) {
        if (_isPut) return _strikePrice.isGreaterThan(_underlyingPrice) ? _strikePrice.sub(_underlyingPrice) : ZERO;

        return _underlyingPrice.isGreaterThan(_strikePrice) ? _underlyingPrice.sub(_strikePrice) : ZERO;
    }

    /**
     * @dev get otoken detail, from both otoken versions
     */
    function _getOtokenDetails(address _otoken)
        internal
        view
        returns (
            address[] memory,
            uint256[] memory,
            address,
            address,
            uint256,
            uint256,
            bool,
            uint256
        )
    {
        OtokenInterface otoken = OtokenInterface(_otoken);
        return otoken.getOtokenDetails();
    }

    /**
     * @notice ratio representing how much does is oToken collaterized by certain collateral asset
     * @param _otoken the oToken address
     * @param _collateralAsset the collateral asset
     * @return numerator - numerator of fraction of ratio, represents value of _collateralAsset for all minted _otoken's
     * @return denominator - denominator of fraction of ratio, represents totalValue of all collateral assets for all minted _otoken's
     */
    // function _getCollateralizationRatio(address _otoken, address _collateralAsset)
    //     public
    //     view
    //     returns (FPI.FixedPointInt memory numerator, FPI.FixedPointInt memory denominator)
    // {
    //     // TODO Possible gas optimization: totalCollateralValue related calculations are caled several times for each collateral when this function called
    //     require(_collateralAsset != address(0), "collateral asset address cannot be 0");
    //     OtokenInterface otoken = OtokenInterface(_otoken);
    //     address strikeAsset = otoken.strikeAsset();
    //     // TODO move total collateral to oToken as external function
    //     uint256 strikeAssetDecimals = IERC20Metadata(strikeAsset).decimals();
    //     uint256 oTokenTotalSupply = otoken.totalMinted();
    //     uint256 strikePrice = otoken.strikePrice();
    //     // TODO its put only calculation, add call
    //     // totalCollateralValue is valuated in strike asset
    //     FPI.FixedPointInt memory totalCollateralValue = oTokenTotalSupply != 0
    //         ? FPI.fromScaledUint(strikePrice, BASE).mul(FPI.fromScaledUint(oTokenTotalSupply, BASE))
    //         : FPI.fromScaledUint(1, 0);
    //     // This value is valuated in strike asset
    //     uint256 value = otoken.collateralsValues(_collateralAsset);
    //     // TODO Possible gas optimization: strikeAsset is called several times for each collateral when this function called
    //     if (value == 0) {
    //         return (ZERO, totalCollateralValue);
    //     }
    //     return (FPI.fromScaledUint(value, strikeAssetDecimals), totalCollateralValue);
    // }

    /**
     * @notice calculates collateral required to mint amount of oToken for a given vault
     */
    function _getCollateralRequired(
        MarginVault.Vault memory _vault,
        address _otoken,
        uint256 _amount
    ) public view returns (uint256[] memory, uint256[] memory) {
        require(_otoken != address(0), "otoken address cannot be 0");
        require(_amount > 0, "amount must be greater than 0");

        // TODO should be better to get all details at once with getOtokenDetails?
        OtokenInterface otoken = OtokenInterface(_otoken);
        address strikeAsset = otoken.strikeAsset();

        if (otoken.isPut()) {
            // availableCollateralsValues is how much worth available collateral in strike asset.
            FPI.FixedPointInt[] memory availableCollateralsValues = new FPI.FixedPointInt[](
                _vault.collateralAssets.length
            );
            FPI.FixedPointInt memory availableCollateralTotalValue;
            uint256[] memory collateralsDecimals = new uint256[](_vault.collateralAssets.length);
            FPI.FixedPointInt[] memory availableCollateralsAmountsFPI = new FPI.FixedPointInt[](
                _vault.collateralAssets.length
            );

            for (uint256 i = 0; i < _vault.collateralAssets.length; i++) {
                collateralsDecimals[i] = IERC20Metadata(_vault.collateralAssets[i]).decimals();
                if (_vault.unusedCollateralAmounts[i] == 0) {
                    availableCollateralsValues[i] = ZERO;
                    continue;
                }
                availableCollateralsAmountsFPI[i] = FPI.fromScaledUint(
                    _vault.unusedCollateralAmounts[i],
                    collateralsDecimals[i]
                );
                availableCollateralsValues[i] = _convertAmountOnLivePrice(
                    availableCollateralsAmountsFPI[i],
                    _vault.collateralAssets[i],
                    strikeAsset
                );
                availableCollateralTotalValue = availableCollateralTotalValue.add(availableCollateralsValues[i]);
            }

            require(
                availableCollateralTotalValue.isGreaterThan(ZERO),
                "Cant calculate collateral required for zero vault"
            );

            FPI.FixedPointInt memory strikeRequired = FPI.fromScaledUint(_amount, BASE).mul(
                FPI.fromScaledUint(otoken.strikePrice(), BASE)
            );

            require(
                availableCollateralTotalValue.isGreaterThanOrEqual(strikeRequired),
                "Vault value is not enough to collaterize the amount"
            );
            uint256[] memory collateralsValuesRequired = new uint256[](_vault.collateralAssets.length);
            uint256[] memory collateralsAmountsRequired = new uint256[](_vault.collateralAssets.length);
            // TODO can we avoid second loop?
            for (uint256 i = 0; i < _vault.collateralAssets.length; i++) {
                if (availableCollateralsValues[i].isGreaterThan(ZERO)) {
                    // TODO decide which rounding should we use down or up, now we use down (toScaledUint last argument true)
                    // TODO we use dynamic zero length array for collateralsValuesRequired and collateralsAmountsRequired
                    // initialized in function returns maybe save gas and value by initilizing inside
                    collateralsValuesRequired[i] = availableCollateralsValues[i]
                        .mul(strikeRequired)
                        .div(availableCollateralTotalValue)
                        .toScaledUint(BASE, false);

                    collateralsAmountsRequired[i] = availableCollateralsAmountsFPI[i]
                        .mul(strikeRequired)
                        .div(availableCollateralTotalValue)
                        .toScaledUint(collateralsDecimals[i], false);
                } else {
                    collateralsAmountsRequired[i] = 0;
                    collateralsValuesRequired[i] = 0;
                }
            }
            return (collateralsAmountsRequired, collateralsValuesRequired);
        } else {
            // TODO calc call option case
            return (new uint256[](_vault.collateralAssets.length), new uint256[](_vault.collateralAssets.length));
        }
    }
}
