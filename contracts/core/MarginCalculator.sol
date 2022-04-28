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
        uint256[] reservedCollateralAmounts;
        uint256[] availableCollateralAmounts;
        uint256[] collateralsDecimals;
        uint256[] usedCollateralValues;
    }

    struct OTokenDetails {
        address[] collaterals; // yvUSDC
        uint256[] collateralsAmounts; // yvUSDC
        uint256[] collateralsValues; // yvUSDC
        uint256[] collateralsDecimals; // yvUSDC
        address underlying; // WETH
        address strikeAsset; // USDC
        uint256 strikePrice;
        uint256 expiry;
        bool isPut;
        uint256 collaterizedTotalAmount;
    }

    /// @dev FixedPoint 0
    FPI.FixedPointInt internal ZERO = FPI.fromScaledUint(0, BASE);

    /// @dev oracle module
    OracleInterface public oracle;

    /**
     * @notice constructor
     * @param _oracle oracle module address
     */
    constructor(address _oracle) {
        require(_oracle != address(0), "MarginCalculator: invalid oracle address");

        oracle = OracleInterface(_oracle);
    }

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
            payouts[i] = payoutsRaw[i].mul(_amount).div(10**BASE);
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
        uint256 oTokenTotalCollateralValue = uint256ArraySum(oTokenDetails.collateralsValues);

        // FPI.FixedPointInt memory strikePriceFpi = FPI.fromScaledUint(oToenDetails.strikePrice, BASE);
        // Amounts of collateral to transfer for 1 oToken
        collateralsPayoutRate = new uint256[](oTokenDetails.collaterals.length);

        // In case of all oToken amount was burnt
        if (oTokenTotalCollateralValue == 0) {
            return collateralsPayoutRate;
        }

        FPI.FixedPointInt memory collateraizedTotalAmount = FPI.fromScaledUint(
            oTokenDetails.collaterizedTotalAmount,
            BASE
        );
        for (uint256 i = 0; i < oTokenDetails.collaterals.length; i++) {
            // the exchangeRate was scaled by 1e8, if 1e8 otoken can take out 1 USDC, the exchangeRate is currently 1e8
            // we want to return: how much USDC units can be taken out by 1 (1e8 units) oToken

            uint256 collateralDecimals = oTokenDetails.collateralsDecimals[i];
            // Collateral value is calculated in strike asset, used BASE decimals only for convinience
            FPI.FixedPointInt memory collateralValue = FPI.fromScaledUint(oTokenDetails.collateralsValues[i], BASE);
            FPI.FixedPointInt memory collateralPayoutValueInStrike = collateralValue.mul(cashValueInStrike).div(
                FPI.fromScaledUint(oTokenTotalCollateralValue, BASE)
            );

            // Compute maximal collateral payout rate as oToken.collateralsAmounts[i] / collaterizedTotalAmount
            FPI.FixedPointInt memory maxCollateralPayoutRate = FPI
                .fromScaledUint(oTokenDetails.collateralsAmounts[i], collateralDecimals)
                .div(collateraizedTotalAmount);
            // Compute collateralPayoutRate for normal conditions
            FPI.FixedPointInt memory collateralPayoutRate = _convertAmountOnExpiryPrice(
                collateralPayoutValueInStrike,
                oTokenDetails.strikeAsset,
                oTokenDetails.collaterals[i],
                oTokenDetails.expiry
            );
            collateralsPayoutRate[i] = FPI.min(maxCollateralPayoutRate, collateralPayoutRate).toScaledUint(
                collateralDecimals,
                false
            );
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
    function getExcessCollateral(MarginVault.Vault memory _vault) external view returns (uint256[] memory) {
        bool hasExpiredShort = OtokenInterface(_vault.shortOtoken).expiryTimestamp() <= block.timestamp;

        // if the vault contains no oTokens, return the amount of collateral
        if (!hasExpiredShort) {
            return _vault.availableCollateralAmounts;
        }

        VaultDetails memory vaultDetails = _getVaultDetails(_vault);

        // This payout represents how much redeemer will get for each 1e8 of oToken. But from the vault side we should also calculate ratio
        // of amounts of each collateral provided by vault to same total amount used for mint total number of oTokens
        // For example: one vault provided [200 USDC, 0 DAI], and another vault [0 USDC, 200 DAI] for the oToken mint
        // and get payout returns [100 USDC, 100 DAI] first vault pays all the 100 USDC and the second one all the 100 DAI
        // uint256[] memory payoutsRaw = getExpiredPayoutRate(vaultDetails.shortOtoken);
        uint256[] memory oTokenCollateralsValues = OtokenInterface(vaultDetails.shortOtoken).getCollateralsValues();
        uint256 oTokenCollaterizedTotalAmount = OtokenInterface(vaultDetails.shortOtoken).collaterizedTotalAmount();
        uint256[] memory shortPayoutsRaw = getExpiredPayoutRate(vaultDetails.shortOtoken);

        return
            _getExcessCollateral(vaultDetails, shortPayoutsRaw, oTokenCollateralsValues, oTokenCollaterizedTotalAmount);
    }

    function _getExcessCollateral(
        VaultDetails memory vaultDetails,
        uint256[] memory shortPayoutsRaw,
        uint256[] memory oTokenCollateralsValues,
        uint256 oTokenCollaterizedTotalAmount
    ) internal view returns (uint256[] memory) {
        uint256[] memory longPayouts = vaultDetails.hasLong && vaultDetails.longAmount != 0
            ? getPayout(vaultDetails.longOtoken, vaultDetails.longAmount)
            : new uint256[](vaultDetails.collateralAssets.length);

        FPI.FixedPointInt memory _oTokenCollaterizedTotalAmount = FPI.fromScaledUint(
            oTokenCollaterizedTotalAmount,
            BASE
        );
        uint256[] memory _excessCollaterals = vaultDetails.collateralAmounts;
        for (uint256 i = 0; i < vaultDetails.collateralAssets.length; i++) {
            uint256 collateralValueProvidedByVault = vaultDetails.usedCollateralValues[i];
            if (collateralValueProvidedByVault == 0) {
                continue;
            }

            uint256 collateralDecimals = vaultDetails.collateralsDecimals[i];

            FPI.FixedPointInt memory totalCollateralValue = FPI
                .fromScaledUint(shortPayoutsRaw[i], collateralDecimals)
                .mul(_oTokenCollaterizedTotalAmount);

            // This ratio represents for specific collateral what part does this vault cover total collaterization of oToken by this collateral
            FPI.FixedPointInt memory vaultCollateralRatio = FPI
                .fromScaledUint(collateralValueProvidedByVault, BASE)
                .div(FPI.fromScaledUint(oTokenCollateralsValues[i], BASE));

            uint256 shortRedeemableCollateral = totalCollateralValue.mul(vaultCollateralRatio).toScaledUint(
                collateralDecimals,
                // Round down shoud be false here cause we subsctruct this value and true can lead to overflow
                false
            );
            _excessCollaterals[i] = _excessCollaterals[i].add(longPayouts[i]).sub(shortRedeemableCollateral);
        }

        return _excessCollaterals;
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
        uint256[] collateralsDecimals;
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
            new uint256[](0), // uint256[] reservedCollateralAmounts;
            new uint256[](0), // uint256[] availableCollateralAmounts;
            new uint256[](0), // uint256[] collateralsDecimals;
            new uint256[](0) // uint256[] usedCollateralValues;
        );

        // check if vault has long, short otoken and collateral asset
        vaultDetails.longOtoken = _vault.longOtoken;
        vaultDetails.hasLong = _vault.longOtoken != address(0) && _vault.longAmount != 0;
        vaultDetails.shortOtoken = _vault.shortOtoken;
        vaultDetails.shortAmount = _vault.shortAmount;
        vaultDetails.longAmount = _vault.longAmount;
        vaultDetails.usedLongAmount = _vault.usedLongAmount;
        vaultDetails.collateralAmounts = _vault.collateralAmounts;
        vaultDetails.reservedCollateralAmounts = _vault.reservedCollateralAmounts;
        vaultDetails.availableCollateralAmounts = _vault.availableCollateralAmounts;
        vaultDetails.usedCollateralValues = _vault.usedCollateralValues;

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
            vaultDetails.collateralsDecimals,
            vaultDetails.underlyingAsset,
            vaultDetails.strikeAsset,
            vaultDetails.shortStrikePrice,
            vaultDetails.expiryTimestamp,
            vaultDetails.isPut,

        ) = _getOtokenDetails(address(short));

        /*
        vaultDetails.collateralsDecimals = new uint256[](_vault.collateralAssets.length);
        for (uint256 i = 0; i < _vault.collateralAssets.length; i++) {
            vaultDetails.collateralsDecimals[i] = uint256(IERC20Metadata(_vault.collateralAssets[i]).decimals());
        }
        */

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

        bool isSameLongCollaterals = keccak256(abi.encode(long.collaterals)) ==
            keccak256(abi.encode(short.collaterals));

        return
            block.timestamp < long.expiry &&
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

    function _getOtokenDetailsFull(address _otoken) internal view returns (OTokenDetails memory) {
        OTokenDetails memory oTokenDetails;
        (
            address[] memory collaterals, // yvUSDC
            uint256[] memory collateralsAmounts,
            uint256[] memory collateralsValues,
            uint256[] memory collateralsDecimals,
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
        oTokenDetails.collateralsDecimals = collateralsDecimals;
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
        bool isPut = _vaultDetails.isPut;
        (FPI.FixedPointInt memory valueRequired, FPI.FixedPointInt memory toUseLongAmount) = isPut
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

        // Convert value to Strike asset for calls
        valueRequired = isPut
            ? valueRequired
            : _convertAmountOnLivePrice(valueRequired, _vaultDetails.underlyingAsset, _vaultDetails.strikeAsset);
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
            ,
            uint256[] memory collateralsAmountsUsed,
            uint256[] memory collateralsValuesUsed
        ) = _calculateCollateralsRequired(_vaultDetails, valueRequired, toUseLongAmount);

        return (
            collateralsAmountsRequired,
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
        // availableCollateralsValues is how much worth available collateral in strike asset
        // availableCollateralTotalValue - how much value totally available in vault in valueAsset
        (
            FPI.FixedPointInt[] memory availableCollateralsAmounts,
            FPI.FixedPointInt[] memory availableCollateralsValues,
            FPI.FixedPointInt memory availableCollateralTotalValue
        ) = _calculateVaultAvailableCollateralsValues(_vaultDetails);
        require(
            availableCollateralTotalValue.isGreaterThanOrEqual(valueRequired),
            "Vault value is not enough to collaterize the amount"
        );

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

        FPI.FixedPointInt memory collaterizationRatio = valueRequired.isGreaterThan(ZERO)
            ? valueRequired.div(availableCollateralTotalValue)
            : ZERO;

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
            collateralsAmountsUsed[i] = collateralsAmountsUsed[i].add(collateralsAmountsRequired[i]);
            collateralsValuesUsed[i] = collateralsValuesUsed[i].add(collateralsValuesRequired[i]);
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
        address _valueAsset = _vaultDetails.strikeAsset;
        address[] memory _collateralAssets = _vaultDetails.collateralAssets;
        uint256[] memory _unusedCollateralAmounts = _vaultDetails.availableCollateralAmounts;
        uint256[] memory _collateralsDecimals = _vaultDetails.collateralsDecimals;

        uint256 collateralsLength = _collateralAssets.length;
        // then we need arrays to use short otoken collateral constraints
        OtokenInterface short = OtokenInterface(_vaultDetails.shortOtoken);
        uint256[] memory _shortCollateralConstraints = short.getCollateralConstraints();
        uint256[] memory _shortCollateralsAmounts = short.getCollateralsAmounts();
        // availableCollateralsValues is how much worth available collateral in strike asset
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

            if (_shortCollateralConstraints[i] > 0) {
                //if this collateral token has constraint
                FPI.FixedPointInt memory maxAmount = FPI.fromScaledUint(
                    _shortCollateralConstraints[i].sub(_shortCollateralsAmounts[i]),
                    _collateralsDecimals[i]
                );
                availableCollateralsAmounts[i] = FPI.min(maxAmount, availableCollateralsAmounts[i]);
            }

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
            new uint256[](0), // [18, 8, 10]
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
            oTokenDetails.collateralsDecimals,
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
            uint256 collateralDecimals = oTokenDetails.collateralsDecimals[i];
            FPI.FixedPointInt memory collateralValue = FPI.fromScaledUint(oTokenDetails.collateralsValues[i], BASE);
            FPI.FixedPointInt memory collateralRatio = collateralValue.div(oTokenTotalCollateralValue);

            collateralsAmounts[i] = amount
                .mul(FPI.fromScaledUint(oTokenDetails.collateralsAmounts[i], collateralDecimals))
                .mul(collateralRatio)
                .toScaledUint(collateralDecimals, true);

            collateralsValues[i] = collateralValue.mul(collateralRatio).toScaledUint(BASE, true);
        }

        return (collateralsAmounts, collateralsValues);
    }
}
