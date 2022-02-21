/* SPDX-License-Identifier: UNLICENSED */
pragma solidity 0.8.9;
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";
import {AddressBookInterface} from "../interfaces/AddressBookInterface.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {Constants} from "../core/Constants.sol";

contract MockOtoken is ERC20PermitUpgradeable {
    using SafeMath for uint256;

    /// @notice total amount of minted oTokens, does not decrease on burn when otoken is redeemed, but decreases when burnOToken is called by vault owner
    // used for calculating redeems and settles
    uint256 public collaterizedTotalAmount;

    /// @notice address of the Controller module
    address public controller;

    /// @notice asset that the option references
    address public underlyingAsset;

    /// @notice asset that the strike price is denominated in
    address public strikeAsset;

    /// @notice assets that is held as collateral against short/written options
    address[] public collateralAssets;

    /// @notice amounts of collateralAssets used for collaterization of total supply of this oToken
    /// updated upon every mint
    uint256[] public collateralsAmounts;

    /// @notice value of collateral assets denominated in strike asset used for mint total supply of this oToken
    /// updated upon every mint
    uint256[] public collateralsValues;

    /// @notice strike price with decimals = 8
    uint256 public strikePrice;

    /// @notice expiration timestamp of the option, represented as a unix timestamp
    uint256 public expiryTimestamp;

    /// @notice True if a put option, False if a call option
    bool public isPut;

    uint256 private constant STRIKE_PRICE_SCALE = 1e8;
    uint256 private constant STRIKE_PRICE_DIGITS = 8;

    /**
     * @notice initialize the oToken
     * @param _addressBook addressbook module
     * @param _underlyingAsset asset that the option references
     * @param _strikeAsset asset that the strike price is denominated in
     * @param _collateralAssets asset that is held as collateral against short/written options
     * @param _strikePrice strike price with decimals = 8
     * @param _expiryTimestamp expiration timestamp of the option, represented as a unix timestamp
     * @param _isPut True if a put option, False if a call option
     */
    function init(
        address _addressBook,
        address _underlyingAsset,
        address _strikeAsset,
        address[] calldata _collateralAssets,
        uint256 _strikePrice,
        uint256 _expiryTimestamp,
        bool _isPut
    ) external initializer {
        require(_collateralAssets.length > 0, "collateralAssets must be non-empty");
        require(
            _collateralAssets.length <= Constants.MAX_COLLATERAL_ASSETS,
            "collateralAssets must be less than or equal to MAX_COLLATERAL_ASSETS"
        );
        controller = AddressBookInterface(_addressBook).getController();
        underlyingAsset = _underlyingAsset;
        strikeAsset = _strikeAsset;
        collateralAssets = _collateralAssets;
        collateralsAmounts = new uint256[](collateralAssets.length);
        collateralsValues = new uint256[](collateralAssets.length);
        strikePrice = _strikePrice;
        expiryTimestamp = _expiryTimestamp;
        isPut = _isPut;
        (string memory tokenName, string memory tokenSymbol) = _getNameAndSymbol();
        __ERC20_init_unchained(tokenName, tokenSymbol);
        __ERC20Permit_init(tokenName);
    }

    function decimals() public view virtual override returns (uint8) {
        return 8;
    }

    function getOtokenDetails()
        external
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
        uint256 collateralAssetsLength = collateralAssets.length;
        uint[] memory collateralsDecimals = new uint[](collateralAssetsLength);

        for (uint256 i = 0; i < collateralAssetsLength; i++) {
            collateralsDecimals[i] = ERC20Upgradeable(collateralAssets[i]).decimals();
        }
        return (
            collateralAssets,
            collateralsAmounts,
            collateralsValues,
            collateralsDecimals,
            underlyingAsset,
            strikeAsset,
            strikePrice,
            expiryTimestamp,
            isPut,
            collaterizedTotalAmount
        );
    }

    function getCollateralAssets() external view returns (address[] memory) {
        return collateralAssets;
    }

    function getCollateralsAmounts() external view returns (uint256[] memory) {
        return collateralsAmounts;
    }

    function getCollateralsValues() external view returns (uint256[] memory) {
        return collateralsValues;
    }

    /**
     * @notice mint oToken for an account
     * @dev Controller only method where access control is taken care of by _beforeTokenTransfer hook
     * @param account account to mint token to
     * @param amount amount to mint
     * @param collateralsAmountsForMint amounts of colateral assets to mint with
     * @param collateralsValuesForMint value of collateral assets in strike asset tokens used for this mint
     */
    function mintOtoken(
        address account,
        uint256 amount,
        uint256[] calldata collateralsAmountsForMint,
        uint256[] calldata collateralsValuesForMint
    ) external {
        //require(msg.sender == controller, "Otoken: Only Controller can mint Otokens");
        require(
            collateralAssets.length == collateralsValuesForMint.length,
            "Otoken: collateralAssets and collateralsValuesForMint must be of same length"
        );
        require(
            collateralAssets.length == collateralsAmountsForMint.length,
            "Otoken: collateralAssets and collateralsAmountsForMint must be of same length"
        );
        for (uint256 i = 0; i < collateralAssets.length; i++) {
            collateralsValues[i] = collateralsValuesForMint[i].add(collateralsValues[i]);
            collateralsAmounts[i] = collateralsAmounts[i].add(collateralsAmountsForMint[i]);
        }
        collaterizedTotalAmount = collaterizedTotalAmount.add(amount);
        _mint(account, amount);
    }

    /**
     * @notice burn oToken from an account.
     * @dev Controller only method where access control is taken care of by _beforeTokenTransfer hook
     * @param account account to burn token from
     * @param amount amount to burn
     */
    function burnOtoken(address account, uint256 amount) external {
        require(msg.sender == controller, "Otoken: Only Controller can burn Otokens");
        _burn(account, amount);
    }

    function reduceCollaterization(
        uint256[] calldata collateralsAmountsForReduce,
        uint256[] calldata collateralsValuesForReduce,
        uint256 oTokenAmountBurnt
    ) external {
        require(msg.sender == controller, "Otoken: Only Controller can burn Otokens");
        require(
            collateralAssets.length == collateralsValuesForReduce.length,
            "Otoken: collateralAssets and collateralsValuesForReduce must be of same length"
        );
        require(
            collateralAssets.length == collateralsAmountsForReduce.length,
            "Otoken: collateralAssets and collateralsAmountsForReduce must be of same length"
        );
        for (uint256 i = 0; i < collateralAssets.length; i++) {
            collateralsValues[i] = collateralsValues[i].sub(collateralsValuesForReduce[i]);
            collateralsAmounts[i] = collateralsAmounts[i].sub(collateralsAmountsForReduce[i]);
        }
        collaterizedTotalAmount = collaterizedTotalAmount.sub(oTokenAmountBurnt);
    }

    /**
     * @notice generates the name and symbol for an option
     * @dev this function uses a named return variable to avoid the stack-too-deep error
     * @return tokenName (ex: ETHUSDC 05-September-2020 200 Put USDC Collateral)
     * @return tokenSymbol (ex: oETHUSDC-05SEP20-200P)
     */
    function _getNameAndSymbol() internal view returns (string memory tokenName, string memory tokenSymbol) {
        tokenName = "tokenName";
        tokenSymbol = "tokenSymbol";
    }

    /**
     * @dev convert strike price scaled by 1e8 to human readable number string
     * @param _strikePrice strike price scaled by 1e8
     * @return strike price string
     */
    function _getDisplayedStrikePrice(uint256 _strikePrice) internal pure returns (string memory) {
        return "completeStr";
    }

    /**
     * @dev return a representation of a number using 2 characters, adds a leading 0 if one digit, uses two trailing digits if a 3 digit number
     * @return 2 characters that corresponds to a number
     */
    function _uintTo2Chars(uint256 number) internal pure returns (string memory) {
        return "str";
    }

    /**
     * @dev return string representation of option type
     * @return shortString a 1 character representation of option type (P or C)
     * @return longString a full length string of option type (Put or Call)
     */
    function _getOptionType(bool _isPut) internal pure returns (string memory shortString, string memory longString) {
        if (_isPut) {
            return ("P", "Put");
        } else {
            return ("C", "Call");
        }
    }

    /**
     * @dev cut string s into s[start:end]
     * @param _s the string to cut
     * @param _start the starting index
     * @param _end the ending index (excluded in the substring)
     */
    function _slice(
        string memory _s,
        uint256 _start,
        uint256 _end
    ) internal pure returns (string memory) {
        bytes memory a = new bytes(_end - _start);
        for (uint256 i = 0; i < _end - _start; i++) {
            a[i] = bytes(_s)[_start + i];
        }
        return string(a);
    }

    /**
     * @dev return string representation of a month
     * @return shortString a 3 character representation of a month (ex: SEP, DEC, etc)
     * @return longString a full length string of a month (ex: September, December, etc)
     */
    function _getMonth(uint256 _month) internal pure returns (string memory shortString, string memory longString) {
        if (_month == 1) {
            return ("JAN", "January");
        } else if (_month == 2) {
            return ("FEB", "February");
        } else if (_month == 3) {
            return ("MAR", "March");
        } else if (_month == 4) {
            return ("APR", "April");
        } else if (_month == 5) {
            return ("MAY", "May");
        } else if (_month == 6) {
            return ("JUN", "June");
        } else if (_month == 7) {
            return ("JUL", "July");
        } else if (_month == 8) {
            return ("AUG", "August");
        } else if (_month == 9) {
            return ("SEP", "September");
        } else if (_month == 10) {
            return ("OCT", "October");
        } else if (_month == 11) {
            return ("NOV", "November");
        } else {
            return ("DEC", "December");
        }
    }
}
