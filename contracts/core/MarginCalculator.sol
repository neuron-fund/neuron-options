/**
 * SPDX-License-Identifier: UNLICENSED
 */
pragma solidity 0.8.9;
pragma experimental ABIEncoderV2;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";

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
    //uint256 internal constant SCALING_FACTOR = 27;

    /// @dev decimals used by strike price and oracle price
    uint256 internal constant BASE = 8;

    /// @notice auction length
    uint256 public constant AUCTION_TIME = 3600;

    /// @dev struct to store all needed vault details
    struct VaultDetails {
        uint256 shortAmount;
        uint256 longAmount;
        uint256 usedLongAmount;
        uint256 shortStrikePrice;
        uint256 longStrikePrice;
        uint256 expiryTimestamp;
        address shortOtoken;
        bool isPut;
        bool hasLong;
        address longOtoken;
        address underlyingAsset;
        address strikeAsset;
        address[] collateralAssets;
        uint256[] collateralAmounts;
        uint256[] usedCollateralAmounts;
        uint256[] unusedCollateralAmounts;
        uint256[] collateralsDecimals;
        uint256[] reservedCollateralValues;
    }

    struct OTokenDetails {
        address[] collaterals; // yvUSDC
        uint256[] collateralsAmounts; // yvUSDC
        uint256[] collateralsValues; // yvUSDC
        address underlying; // WETH
        address strikeAsset; // USDC
        uint256 strikePrice;
        uint256 expiry;
        bool isPut;
        uint256 collaterizedTotalAmount;
    }

    /// @dev oracle deviation value (1e27)
    //uint256 internal oracleDeviation;

    /// @dev FixedPoint 0
    FPI.FixedPointInt internal ZERO = FPI.fromScaledUint(0, BASE);

    /// @dev mapping to store dust amount per option collateral asset (scaled by collateral asset decimals)
    mapping(address => uint256) internal dust;

    /// @dev mapping to store array of time to expiry for a given product
    mapping(bytes32 => uint256[]) internal timesToExpiryForProduct;

    /// @dev mapping to store option upper bound value at specific time to expiry for a given product (1e27)
    mapping(bytes32 => mapping(uint256 => uint256)) internal maxPriceAtTimeToExpiry;

    /// @dev mapping to store shock value for spot price of a given product (1e27)
    //mapping(bytes32 => uint256) internal spotShock;

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
    // event SpotShockUpdated(bytes32 indexed product, uint256 spotShock);
    /// @notice emits an event when oracle deviation value is updated
    //event OracleDeviationUpdated(uint256 oracleDeviation);

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
     * @notice set oracle deviation (1e27)
     * @dev can only be called by owner
     * @param _deviation deviation value
     */
    /*function setOracleDeviation(uint256 _deviation) external onlyOwner {
        oracleDeviation = _deviation;

        emit OracleDeviationUpdated(_deviation);
    }
    */
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
     * @notice get oracle deviation
     * @return oracle deviation value (1e27)
     */
    /*
    function getOracleDeviation() external view returns (uint256) {
        return oracleDeviation;
    }
    */

    /**
     * @notice get an oToken's payout/cash value after expiry, in the collateral asset
     * @param _otoken oToken address
     * @param _amount amount of the oToken to calculate the payout for, always represented in 1e8
     * @return amount of collateral to pay out for provided amount rate
     */
    function getPayout(address _otoken, uint256 _amount) external view returns (uint256[] memory) {
        // payoutsRaw is amounts of each of collateral asset in collateral asset decimals to be paid out for 1e8 of the oToken
        uint256[] memory payoutsRaw = getExpiredPayoutRate(_otoken);
        uint256[] memory payouts = new uint256[](payoutsRaw.length);

        for (uint256 i = 0; i < payoutsRaw.length; i++) {
            payouts[i] = payoutsRaw[i].mul(_amount).div(10**BASE);
            console.log("_amount", _amount);
            console.log("GET PAYOUT payoutsRaw[i]", payoutsRaw[i]);
            console.log("GET PAYOUT payouts[i]", payouts[i]);
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

        OTokenDetails memory oTokenDetails = _getOtokenDetailsFull(_otoken);

        require(block.timestamp >= oTokenDetails.expiry, "MarginCalculator: Otoken not expired yet");

        // Strike - current price USDC
        FPI.FixedPointInt memory cashValueInStrike = _getExpiredCashValue(
            oTokenDetails.underlying,
            oTokenDetails.strikeAsset,
            oTokenDetails.expiry,
            oTokenDetails.strikePrice,
            oTokenDetails.isPut
        );
        console.log("cashValueInStrike round down   ", cashValueInStrike.toScaledUint(7, true));
        console.log("cashValueInStrike round up     ", cashValueInStrike.toScaledUint(7, true));
        console.log("oToken.collateralsValues[0]    ", oTokenDetails.collateralsValues[0]);
        console.log("oToken.collaterizedTotalAmount ", oTokenDetails.collaterizedTotalAmount);
        {
            (uint256 strikePrice, ) = oracle.getExpiryPrice(oTokenDetails.strikeAsset, oTokenDetails.expiry);
            console.log(
                "cashValueInUsd                 ",
                cashValueInStrike.mul(FPI.fromScaledUint(strikePrice, BASE)).toScaledUint(7, true)
            );
        }

        uint256 oTokenTotalCollateralValue = uint256ArraySum(oTokenDetails.collateralsValues);
        console.log("oTokenTotalCollateralValue     ", oTokenTotalCollateralValue);

        // FPI.FixedPointInt memory strikePriceFpi = FPI.fromScaledUint(oToenDetails.strikePrice, BASE);
        // Amounts of collateral to transfer for 1 oToken
        collateralsPayoutRate = new uint256[](oTokenDetails.collaterals.length);
        for (uint256 i = 0; i < oTokenDetails.collaterals.length; i++) {
            console.log("O TOKEN COLLATERAL VALUE       ", oTokenDetails.collateralsValues[i]);
            // the exchangeRate was scaled by 1e8, if 1e8 otoken can take out 1 USDC, the exchangeRate is currently 1e8
            // we want to return: how much USDC units can be taken out by 1 (1e8 units) oToken

            // TODO possible gas optimization, get rid of external call for each collateral decimals everywhere (search by "decimals()")
            // and get values as array with "_getOtokenDetails"
            // store collateral decimals in otoken on moment of its creation and get in oTokenDetails
            uint256 collateralDecimals = uint256(IERC20Metadata(oTokenDetails.collaterals[i]).decimals());

            // Collateral value is calculated in strike asset, used BASE decimals only for convinience
            FPI.FixedPointInt memory collateralValue = FPI.fromScaledUint(oTokenDetails.collateralsValues[i], BASE);
            FPI.FixedPointInt memory collateralPayoutValueInStrike = collateralValue.mul(cashValueInStrike).div(
                FPI.fromScaledUint(oTokenTotalCollateralValue, BASE)
            );

            //Compute maximal collateral payout rate as oToken.collateralsAmounts[i] / collaterizedTotalAmount
            FPI.FixedPointInt memory maxCollateralPayoutRate = FPI
                .fromScaledUint(oTokenDetails.collateralsAmounts[i], collateralDecimals)
                .div(FPI.fromScaledUint(oTokenDetails.collaterizedTotalAmount, BASE));
            //Compute collateralPayoutRate for normal conditions
            FPI.FixedPointInt memory collateralPayoutRate = _convertAmountOnExpiryPrice(
                collateralPayoutValueInStrike,
                oTokenDetails.strikeAsset,
                oTokenDetails.collaterals[i],
                oTokenDetails.expiry
            );

            collateralsPayoutRate[i] = FPI.min(maxCollateralPayoutRate, collateralPayoutRate).toScaledUint(
                collateralDecimals,
                true
            );
            console.log("collateralPayoutRate[i]         ", collateralsPayoutRate[i]);
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
     * @notice returns the amount of collateral that can be removed from an actual or a theoretical vault
     * @dev return amount is denominated in the collateral asset for the oToken in the vault, or the collateral asset in the vault
     * @param _vault theoretical vault that needs to be checked
     * @return excessCollateral the amount by which the margin is above or below the required amount
     */
    function getExcessCollateral(MarginVault.Vault memory _vault) public view returns (uint256[] memory) {
        console.log("_vault.shortOtoken", _vault.shortOtoken);

        bool hasExpiredShort = OtokenInterface(_vault.shortOtoken).expiryTimestamp() <= block.timestamp;

        uint256[] memory excessCollaterals = _vault.unusedCollateralAmounts;

        // if the vault contains no oTokens, return the amount of collateral
        if (!hasExpiredShort) {
            return excessCollaterals;
        }

        VaultDetails memory vaultDetails = _getVaultDetails(_vault);
        FPI.FixedPointInt memory spreadPayoutRatio;
        {
            FPI.FixedPointInt memory longAmount = vaultDetails.hasLong
                ? FPI.fromScaledUint(vaultDetails.usedLongAmount, BASE)
                : ZERO;

            FPI.FixedPointInt memory shortAmount = FPI.fromScaledUint(vaultDetails.shortAmount, BASE);

            // the vault has expired. calculate the cash value of all the minted short options
            FPI.FixedPointInt memory shortCashValue = _getExpiredCashValue(
                vaultDetails.underlyingAsset,
                vaultDetails.strikeAsset,
                vaultDetails.expiryTimestamp,
                vaultDetails.shortStrikePrice,
                vaultDetails.isPut
            );
            FPI.FixedPointInt memory longCashValue = vaultDetails.hasLong
                ? _getExpiredCashValue(
                    vaultDetails.underlyingAsset,
                    vaultDetails.strikeAsset,
                    vaultDetails.expiryTimestamp,
                    vaultDetails.longStrikePrice,
                    vaultDetails.isPut
                )
                : ZERO;

            FPI.FixedPointInt memory spreadCashValue = _getExpiredSpreadCashValue(
                shortAmount,
                longAmount,
                shortCashValue,
                longCashValue
            );

            if (spreadCashValue.isEqual(ZERO) || spreadCashValue.isLessThan(ZERO)) {
                return uint256ArraysAdd(excessCollaterals, _vault.usedCollateralAmounts);
            }

            console.log(
                "getExcessCollateral ~ spreadCashValue.isEqual(shortCashValue)",
                spreadCashValue.isEqual(shortCashValue)
            );
            FPI.FixedPointInt memory shortMintedCashValue = shortAmount.mul(shortCashValue);
            spreadPayoutRatio = spreadCashValue.isEqual(shortMintedCashValue)
                ? FPI.fromScaledUint(1, 0)
                : spreadCashValue.div(shortMintedCashValue);
        }

        // This payout represents how much redeemer will get for each 1e8 of oToken. But from the vault side we should also calculate ratio
        // of amounts of each collateral provided by vault to same total amount used for mint total number of oTokens
        // For example: one vault provided [200 USDC, 0 DAI], and another vault [0 USDC, 200 DAI] for the oToken mint
        // and get payout returns [100 USDC, 100 DAI] first vault pays all the 100 USDC and the second one all the 100 DAI
        // uint256[] memory payoutsRaw = getExpiredPayoutRate(vaultDetails.shortOtoken);
        uint256[] memory oTokenCollateralsValues = OtokenInterface(vaultDetails.shortOtoken).getCollateralsValues();
        uint256 oTokenCollaterizedTotalAmount = OtokenInterface(vaultDetails.shortOtoken).collaterizedTotalAmount();
        uint256[] memory payoutsRaw = getExpiredPayoutRate(vaultDetails.shortOtoken);

        for (uint256 i = 0; i < vaultDetails.collateralAssets.length; i++) {
            uint256 collateralAmountProvidedByVault = vaultDetails.usedCollateralAmounts[i];
            uint256 collateralValueProvidedByVault = vaultDetails.reservedCollateralValues[i];
            if (collateralValueProvidedByVault == 0) {
                continue;
            }

            uint256 collateralDecimals = IERC20Metadata(vaultDetails.collateralAssets[i]).decimals();

            // This ratio represents for specific collateral what part does this vault cover total collaterization of oToken by this collateral
            FPI.FixedPointInt memory vaultCollateralRatio = FPI
                .fromScaledUint(collateralValueProvidedByVault, BASE)
                .div(FPI.fromScaledUint(oTokenCollateralsValues[i], BASE))
                .mul(spreadPayoutRatio);

            uint256 redeemableCollateral = FPI
                .fromScaledUint(payoutsRaw[i], collateralDecimals)
                .mul(FPI.fromScaledUint(oTokenCollaterizedTotalAmount, BASE))
                .mul(vaultCollateralRatio)
                .toScaledUint(collateralDecimals, false);

            excessCollaterals[i] = excessCollaterals[i].add(collateralAmountProvidedByVault).sub(redeemableCollateral);
        }

        return excessCollaterals;
    }

    /**
     * @notice calculates sum of uint256 array
     * @param _array uint256[] memory
     * @return uint256 sum of all elements in _array
     */
    function uint256ArraySum(uint256[] memory _array) internal pure returns (uint256) {
        uint256 sum = 0;
        for (uint256 i = 0; i < _array.length; i++) {
            sum = sum.add(_array[i]);
        }
        return sum;
    }

    /**
     * @notice calculates sum of uint256 array with corresponing elemnt of second array
     * @param _array uint256[] memory
     * @param _array2 uint256[] memory
     * @return uint256[] memory array with elements sum of input arrays
     */
    function uint256ArraysAdd(uint256[] memory _array, uint256[] memory _array2)
        internal
        pure
        returns (uint256[] memory)
    {
        uint256[] memory result = new uint256[](_array.length);
        for (uint256 i = 0; i < _array.length; i++) {
            result[i] = _array[i].add(_array2[i]);
        }
        return result;
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
        address[] collateralAssets;
        uint256[] collateralsAmounts;
        uint256[] collateralsValues;
        address underlyingAsset;
        address strikeAsset;
        uint256 strikePrice;
        uint256 expiryTimestamp;
        bool isPut;
        uint256 collaterizedTotalAmount;
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
        console.log("priceA, priceBFinalized", priceA, _assetA, priceAFinalized);
        console.log("priceB, priceBFinalized", priceB, _assetB, priceBFinalized);
        require(priceAFinalized && priceBFinalized, "MarginCalculator: price at expiry not finalized yet");
        // amount A * price A in USD = amount B * price B in USD
        // amount B = amount A * price A / price B
        return _amount.mul(FPI.fromScaledUint(priceA, BASE)).div(FPI.fromScaledUint(priceB, BASE));
    }

    /**
     * @notice get vault details to save us from making multiple external calls
     * @param _vault vault struct
     * @return vault details in VaultDetails struct
     */
    function _getVaultDetails(MarginVault.Vault memory _vault) internal view returns (VaultDetails memory) {
        VaultDetails memory vaultDetails = VaultDetails(
            0, // uint256 shortAmount;
            0, // uint256 longAmount;
            0, // uint256 usedLongAmount;
            0, // uint256 shortStrikePrice;
            0, // uint256 longStrikePrice;
            0, // uint256 expiryTimestamp;
            address(0), // address shortOtoken
            false, // bool isPut;
            false, // bool hasLong;
            address(0), // address longOtoken;
            address(0), // address underlyingAsset;
            address(0), // address strikeAsset;
            new address[](0), // address[] collateralAssets;
            new uint256[](0), // uint256[] collateralAmounts;
            new uint256[](0), // uint256[] usedCollateralAmounts;
            new uint256[](0), // uint256[] unusedCollateralAmounts;
            new uint256[](0), // uint256[] collateralsDecimals;
            new uint256[](0) // uint256[] reservedCollateralValues;
        );

        // check if vault has long, short otoken and collateral asset
        vaultDetails.longOtoken = _vault.longOtoken;
        vaultDetails.hasLong = _vault.longOtoken != address(0) && _vault.longAmount != 0;
        vaultDetails.shortOtoken = _vault.shortOtoken;
        vaultDetails.shortAmount = _vault.shortAmount;
        vaultDetails.longAmount = _vault.longAmount;
        vaultDetails.usedLongAmount = _vault.usedLongAmount;
        vaultDetails.collateralAmounts = _vault.collateralAmounts;
        vaultDetails.usedCollateralAmounts = _vault.usedCollateralAmounts;
        vaultDetails.unusedCollateralAmounts = _vault.unusedCollateralAmounts;
        vaultDetails.reservedCollateralValues = _vault.reservedCollateralValues;

        // get vault long otoken if available
        if (vaultDetails.hasLong) {
            OtokenInterface long = OtokenInterface(_vault.longOtoken);
            vaultDetails.longStrikePrice = long.strikePrice();
        }

        // get vault short otoken if available
        OtokenInterface short = OtokenInterface(_vault.shortOtoken);
        (
            vaultDetails.collateralAssets,
            ,
            ,
            vaultDetails.underlyingAsset,
            vaultDetails.strikeAsset,
            vaultDetails.shortStrikePrice,
            vaultDetails.expiryTimestamp,
            vaultDetails.isPut,

        ) = _getOtokenDetails(address(short));

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
        require(
            _vault.collateralAssets.length <= Constants.MAX_COLLATERAL_ASSETS,
            "MarginCalculator: Too many collateral assets in the vault"
        );

        require(
            _vault.collateralAssets.length == _vault.collateralAmounts.length,
            "MarginCalculator: Collateral asset and amount mismatch"
        );

        // ensure the long asset is valid for the short asset
        // require(
        //     _isMarginableLong(_vault, _vaultDetails),
        //     "MarginCalculator: long asset not marginable for short asset"
        // );
    }

    /**
     * @dev if there is a short option and a long option in the vault, ensure that the long option is able to be used as collateral for the short option
     * @param _vault the vault to check
     * @return true if long is marginable or false if not
     */
    function isMarginableLong(address longOtokenAddress, MarginVault.Vault memory _vault) external view returns (bool) {
        // if vault is missing a long or a short, return True
        if (_vault.longOtoken != address(0)) return true;

        // check if longCollateralAssets is same as shortCollateralAssets
        OTokenDetails memory long = _getOtokenDetailsFull(longOtokenAddress);
        OTokenDetails memory short = _getOtokenDetailsFull(_vault.shortOtoken);
        //_getOtokenDetailsFull(address)

        bool isSameLongCollaterals = keccak256(abi.encode(long.collaterals)) ==
            keccak256(abi.encode(short.collaterals));

        return
            _vault.longOtoken != _vault.shortOtoken &&
            isSameLongCollaterals &&
            long.underlying == short.underlying &&
            long.strikeAsset == short.strikeAsset &&
            long.expiry == short.expiry &&
            long.strikePrice != short.strikePrice &&
            long.isPut == short.isPut;
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

    // TODO can this be simplified?
    function _getOtokenDetailsFull(address _otoken) internal view returns (OTokenDetails memory) {
        OTokenDetails memory oTokenDetails;
        (
            address[] memory collaterals, // yvUSDC
            uint256[] memory collateralsAmounts,
            uint256[] memory collateralsValues,
            address underlying, // WETH
            address strikeAsset, // USDC
            uint256 strikePrice,
            uint256 expiry,
            bool isPut,
            uint256 collaterizedTotalAmount
        ) = _getOtokenDetails(_otoken);

        oTokenDetails.collaterals = collaterals;
        oTokenDetails.collateralsAmounts = collateralsAmounts;
        oTokenDetails.collateralsValues = collateralsValues;
        oTokenDetails.underlying = underlying;
        oTokenDetails.strikeAsset = strikeAsset;
        oTokenDetails.strikePrice = strikePrice;
        oTokenDetails.expiry = expiry;
        oTokenDetails.isPut = isPut;
        oTokenDetails.collaterizedTotalAmount = collaterizedTotalAmount;

        return oTokenDetails;
    }

    function getAfterBurnCollateralRatio(MarginVault.Vault memory _vault, uint256 _shortBurnAmount)
        external
        view
        returns (FPI.FixedPointInt memory, uint256)
    {
        VaultDetails memory vaultDetails = _getVaultDetails(_vault);

        return _getAfterBurnCollateralRatio(vaultDetails, _shortBurnAmount);
    }

    function _getAfterBurnCollateralRatio(VaultDetails memory _vaultDetails, uint256 _shortBurnAmount)
        internal
        view
        returns (FPI.FixedPointInt memory, uint256)
    {
        uint256 newShortAmount = _vaultDetails.shortAmount.sub(_shortBurnAmount);

        (FPI.FixedPointInt memory prevValueRequired, ) = _getValueRequired(
            _vaultDetails,
            _vaultDetails.shortAmount,
            _vaultDetails.longAmount
        );

        (FPI.FixedPointInt memory newValueRequired, FPI.FixedPointInt memory newToUseLongAmount) = _getValueRequired(
            _vaultDetails,
            newShortAmount,
            _vaultDetails.longAmount
        );

        return (
            prevValueRequired.isEqual(ZERO) ? ZERO : newValueRequired.div(prevValueRequired),
            newToUseLongAmount.toScaledUint(BASE, true)
        );
    }

    /**
     * @notice calculates maximal short amount can be minted for collateral in a given vault
     */
    function getMaxShortAmount(MarginVault.Vault memory _vault) external view returns (uint256) {
        VaultDetails memory vaultDetails = _getVaultDetails(_vault);
        uint256 unusedLongAmount = vaultDetails.longAmount.sub(vaultDetails.usedLongAmount);
        uint256 one = 10**BASE;
        (FPI.FixedPointInt memory valueRequiredRate, ) = _getValueRequired(vaultDetails, one, unusedLongAmount);

        (, , FPI.FixedPointInt memory availableCollateralTotalValue) = _calculateVaultAvailableCollateralsValues(
            vaultDetails
        );
        return availableCollateralTotalValue.div(valueRequiredRate).toScaledUint(BASE, true);
    }

    /**
     * @notice calculates collateral required to mint amount of oToken for a given vault
     */
    function getCollateralRequired(MarginVault.Vault memory _vault, uint256 _shortAmount)
        external
        view
        returns (
            uint256[] memory,
            uint256[] memory,
            uint256[] memory,
            uint256[] memory,
            uint256
        )
    {
        VaultDetails memory vaultDetails = _getVaultDetails(_vault);

        return _getCollateralRequired(vaultDetails, _shortAmount);
    }

    function _getValueRequired(
        VaultDetails memory _vaultDetails,
        uint256 _shortAmount,
        uint256 _longAmount
    ) internal view returns (FPI.FixedPointInt memory, FPI.FixedPointInt memory) {
        (FPI.FixedPointInt memory valueRequired, FPI.FixedPointInt memory toUseLongAmount) = _vaultDetails.isPut
            ? _getPutSpreadMarginRequired(
                _shortAmount,
                _longAmount,
                _vaultDetails.shortStrikePrice,
                _vaultDetails.longStrikePrice
            )
            : _getCallSpreadMarginRequired(
                _shortAmount,
                _longAmount,
                _vaultDetails.shortStrikePrice,
                _vaultDetails.longStrikePrice
            );
        return (valueRequired, toUseLongAmount);
    }

    /**
     * @notice calculates collateral required to mint amount of oToken for a given vault
     */
    function _getCollateralRequired(VaultDetails memory _vaultDetails, uint256 _shortAmount)
        internal
        view
        returns (
            uint256[] memory,
            uint256[] memory,
            uint256[] memory,
            uint256[] memory,
            uint256
        )
    {
        require(_shortAmount > 0, "amount must be greater than 0");

        uint256 unusedLongAmount = _vaultDetails.longAmount.sub(_vaultDetails.usedLongAmount);
        (FPI.FixedPointInt memory valueRequired, FPI.FixedPointInt memory toUseLongAmount) = _getValueRequired(
            _vaultDetails,
            _shortAmount,
            unusedLongAmount
        );

        (
            uint256[] memory collateralsAmountsRequired,
            uint256[] memory collateralsValuesRequired,
            uint256[] memory collateralsAmountsUsed,
            uint256[] memory collateralsValuesUsed
        ) = _calculateCollateralsRequired(_vaultDetails, valueRequired, toUseLongAmount);

        return (
            collateralsAmountsRequired,
            collateralsValuesRequired,
            collateralsAmountsUsed,
            collateralsValuesUsed,
            toUseLongAmount.toScaledUint(BASE, true)
        );
    }

    function _calculateCollateralsRequired(
        VaultDetails memory _vaultDetails,
        FPI.FixedPointInt memory _valueRequired,
        FPI.FixedPointInt memory _usedLongAmount
    )
        internal
        view
        returns (
            uint256[] memory,
            uint256[] memory,
            uint256[] memory,
            uint256[] memory
        )
    {
        // Create "higher" variable in stack same as function argument to prevent stack too deep error when accessing _valueRequired, same for _vaultDetails.collateralsDecimals
        FPI.FixedPointInt memory valueRequired = _valueRequired;

        uint256[] memory collateralsDecimals = _vaultDetails.collateralsDecimals;
        // availableCollateralsValues is how much worth available collateral in strike asset for put and underlying asset for call
        // availableCollateralTotalValue - how much value totally available in vault in valueAsset
        (
            FPI.FixedPointInt[] memory availableCollateralsAmounts,
            FPI.FixedPointInt[] memory availableCollateralsValues,
            FPI.FixedPointInt memory availableCollateralTotalValue
        ) = _calculateVaultAvailableCollateralsValues(_vaultDetails);
        console.log("valueRequired", valueRequired.toScaledUint(BASE, true));
        console.log("availableCollateralTotalValue", availableCollateralTotalValue.toScaledUint(BASE, true));
        require(
            availableCollateralTotalValue.isGreaterThanOrEqual(valueRequired),
            "Vault value is not enough to collaterize the amount"
        );

        console.log("_usedLongAmount", _usedLongAmount.toScaledUint(BASE, true));
        uint256 collateralsLength = _vaultDetails.collateralAssets.length;

        uint256[] memory collateralsAmountsUsed;
        uint256[] memory collateralsValuesUsed;
        if (_vaultDetails.longOtoken != address(0)) {
            (collateralsAmountsUsed, collateralsValuesUsed) = _calculateOtokenCollaterizationsOfAmount(
                _vaultDetails.longOtoken,
                _usedLongAmount
            );
        } else {
            collateralsAmountsUsed = new uint256[](collateralsLength);
            collateralsValuesUsed = new uint256[](collateralsLength);
        }

        uint256[] memory collateralsAmountsRequired = new uint256[](collateralsLength);
        uint256[] memory collateralsValuesRequired = new uint256[](collateralsLength);

        FPI.FixedPointInt memory collaterizationRatio = valueRequired.div(availableCollateralTotalValue);

        for (uint256 i = 0; i < collateralsLength; i++) {
            if (availableCollateralsValues[i].isGreaterThan(ZERO)) {
                collateralsValuesRequired[i] = availableCollateralsValues[i].mul(collaterizationRatio).toScaledUint(
                    BASE,
                    true
                );
                collateralsAmountsRequired[i] = availableCollateralsAmounts[i].mul(collaterizationRatio).toScaledUint(
                    collateralsDecimals[i],
                    true
                );
            } else {
                collateralsAmountsRequired[i] = 0;
                collateralsValuesRequired[i] = 0;
            }
            console.log("BEFORE ADD REAL USE collateralsAmountsUsed[i]", collateralsAmountsUsed[i]);
            console.log("BEFORE ADD REAL USE collateralsValueUsed[i]", collateralsValuesUsed[i]);
            collateralsAmountsUsed[i] = collateralsAmountsUsed[i].add(collateralsAmountsRequired[i]);
            collateralsValuesUsed[i] = collateralsValuesUsed[i].add(collateralsValuesRequired[i]);
            console.log("AFTER ADD REAL USE collateralsAmountsUsed[i]", collateralsAmountsUsed[i]);
            console.log("AFTER ADD REAL USE collateralsValueUsed[i]", collateralsValuesUsed[i]);
        }

        return (collateralsAmountsRequired, collateralsValuesRequired, collateralsAmountsUsed, collateralsValuesUsed);
    }

    function _calculateVaultAvailableCollateralsValues(VaultDetails memory _vaultDetails)
        internal
        view
        returns (
            FPI.FixedPointInt[] memory,
            FPI.FixedPointInt[] memory,
            FPI.FixedPointInt memory
        )
    {
        address _valueAsset = _vaultDetails.isPut ? _vaultDetails.strikeAsset : _vaultDetails.underlyingAsset;
        address[] memory _collateralAssets = _vaultDetails.collateralAssets;
        uint256[] memory _unusedCollateralAmounts = _vaultDetails.unusedCollateralAmounts;
        uint256[] memory _collateralsDecimals = _vaultDetails.collateralsDecimals;

        uint256 collateralsLength = _collateralAssets.length;

        // availableCollateralsValues is how much worth available collateral in strike asset for put and underlying asset for call
        FPI.FixedPointInt[] memory availableCollateralsValues = new FPI.FixedPointInt[](collateralsLength);
        // availableCollateralTotalValue - how much value totally available in vault in valueAsset
        FPI.FixedPointInt memory availableCollateralTotalValue;

        FPI.FixedPointInt[] memory availableCollateralsAmounts = new FPI.FixedPointInt[](collateralsLength);

        for (uint256 i = 0; i < collateralsLength; i++) {
            if (_unusedCollateralAmounts[i] == 0) {
                availableCollateralsValues[i] = ZERO;
                continue;
            }
            availableCollateralsAmounts[i] = FPI.fromScaledUint(_unusedCollateralAmounts[i], _collateralsDecimals[i]);
            availableCollateralsValues[i] = _convertAmountOnLivePrice(
                availableCollateralsAmounts[i],
                _collateralAssets[i],
                _valueAsset
            );

            availableCollateralTotalValue = availableCollateralTotalValue.add(availableCollateralsValues[i]);
        }

        return (availableCollateralsAmounts, availableCollateralsValues, availableCollateralTotalValue);
    }

    /**
     * @dev returns the strike asset amount of margin required for a put or put spread with the given short oTokens, long oTokens and amounts
     *
     * marginRequired = max( (short amount * short strike) - (long strike * min (short amount, long amount)) , 0 )
     *
     * @return margin requirement denominated in the strike asset
     */
    function _getPutSpreadMarginRequired(
        uint256 _shortAmount,
        uint256 _longAmount,
        uint256 _shortStrike,
        uint256 _longStrike
    ) internal view returns (FPI.FixedPointInt memory, FPI.FixedPointInt memory) {
        FPI.FixedPointInt memory shortStrikeFPI = FPI.fromScaledUint(_shortStrike, BASE);
        FPI.FixedPointInt memory longStrikeFPI = FPI.fromScaledUint(_longStrike, BASE);
        FPI.FixedPointInt memory shortAmountFPI = FPI.fromScaledUint(_shortAmount, BASE);
        FPI.FixedPointInt memory longAmountFPI = _longAmount != 0 ? FPI.fromScaledUint(_longAmount, BASE) : ZERO;

        FPI.FixedPointInt memory longAmountUsed = longStrikeFPI.isEqual(ZERO)
            ? ZERO
            : FPI.min(shortAmountFPI, longAmountFPI);

        return (
            FPI.max(shortAmountFPI.mul(shortStrikeFPI).sub(longStrikeFPI.mul(longAmountUsed)), ZERO),
            longAmountUsed
        );
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
        uint256 _shortAmount,
        uint256 _longAmount,
        uint256 _shortStrike,
        uint256 _longStrike
    ) internal view returns (FPI.FixedPointInt memory, FPI.FixedPointInt memory) {
        console.log("shortAmount", _shortAmount);
        console.log("_shortStrike", _shortStrike);
        console.log("_longAmount", _longAmount);
        console.log("_longStrike", _longStrike);
        FPI.FixedPointInt memory shortStrikeFPI = FPI.fromScaledUint(_shortStrike, BASE);
        FPI.FixedPointInt memory longStrikeFPI = FPI.fromScaledUint(_longStrike, BASE);
        FPI.FixedPointInt memory shortAmountFPI = FPI.fromScaledUint(_shortAmount, BASE);
        FPI.FixedPointInt memory longAmountFPI = FPI.fromScaledUint(_longAmount, BASE);

        // max (short amount - long amount , 0)
        if (_longStrike == 0 || _longAmount == 0) {
            return (shortAmountFPI, ZERO);
        }

        /**
         *             (long strike - short strike) * short amount
         * calculate  ----------------------------------------------
         *                             long strike
         */
        FPI.FixedPointInt memory firstPart = longStrikeFPI.sub(shortStrikeFPI).mul(shortAmountFPI).div(longStrikeFPI);

        /**
         * calculate max ( short amount - long amount , 0)
         */
        FPI.FixedPointInt memory secondPart = FPI.max(shortAmountFPI.sub(longAmountFPI), ZERO);

        FPI.FixedPointInt memory longAmountUsed = longStrikeFPI.isEqual(ZERO)
            ? ZERO
            : FPI.min(shortAmountFPI, longAmountFPI);

        return (FPI.max(firstPart, secondPart), longAmountUsed);
    }

    function _calculateOtokenCollaterizationsOfAmount(address _otoken, FPI.FixedPointInt memory _amount)
        internal
        view
        returns (uint256[] memory, uint256[] memory)
    {
        OTokenDetails memory oTokenDetails = OTokenDetails(
            new address[](0), // [yvUSDC, cUSDC, ...etc]
            new uint256[](0), // [0, 200, ...etc]
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
            oTokenDetails.collateralsValues, // WETH // USDC
            ,
            ,
            ,
            ,
            ,

        ) = _getOtokenDetails(_otoken);

        // Create "higher" variable in stack same as function argument to prevent stack too deep error when accessing amount
        FPI.FixedPointInt memory amount = _amount;
        uint256[] memory collateralsAmounts = new uint256[](oTokenDetails.collaterals.length);
        uint256[] memory collateralsValues = new uint256[](oTokenDetails.collaterals.length);

        if (amount.isEqual(ZERO)) {
            return (collateralsAmounts, collateralsValues);
        }

        FPI.FixedPointInt memory oTokenTotalCollateralValue = FPI.fromScaledUint(
            uint256ArraySum(oTokenDetails.collateralsValues),
            BASE
        );

        for (uint256 i = 0; i < oTokenDetails.collaterals.length; i++) {
            uint256 collateralDecimals = uint256(IERC20Metadata(oTokenDetails.collaterals[i]).decimals());
            FPI.FixedPointInt memory collateralValue = FPI.fromScaledUint(oTokenDetails.collateralsValues[i], BASE);
            FPI.FixedPointInt memory collateralRatio = collateralValue.div(oTokenTotalCollateralValue);

            collateralsAmounts[i] = amount
                .mul(FPI.fromScaledUint(oTokenDetails.collateralsAmounts[i], collateralDecimals))
                .mul(collateralRatio)
                .toScaledUint(collateralDecimals, true);

            collateralsValues[i] = amount.mul(collateralRatio).toScaledUint(collateralDecimals, true);
        }

        return (collateralsAmounts, collateralsValues);
    }
}
