# Otoken

Otoken is the ERC20 token for an option

_The Otoken inherits ERC20Upgradeable because we need to use the init instead of constructor_

### collaterizedTotalAmount

```solidity
uint256 collaterizedTotalAmount
```

total amount of minted oTokens, does not decrease on burn when otoken is redeemed, but decreases when burnOToken is called by vault owner

### controller

```solidity
address controller
```

address of the Controller module

### underlyingAsset

```solidity
address underlyingAsset
```

asset that the option references

### strikeAsset

```solidity
address strikeAsset
```

asset that the strike price is denominated in

### collateralAssets

```solidity
address[] collateralAssets
```

assets that is held as collateral against short/written options

### collateralsAmounts

```solidity
uint256[] collateralsAmounts
```

amounts of collateralAssets used for collaterization of total supply of this oToken
updated upon every mint

### collateralsValues

```solidity
uint256[] collateralsValues
```

value of collateral assets denominated in strike asset used for mint total supply of this oToken
updated upon every mint

### collateralConstraints

```solidity
uint256[] collateralConstraints
```

amounts of collateralConstraints used to limit the maximum number of untrusted collateral tokens (0 - no limit)

### strikePrice

```solidity
uint256 strikePrice
```

strike price with decimals &#x3D; 8

### expiryTimestamp

```solidity
uint256 expiryTimestamp
```

expiration timestamp of the option, represented as a unix timestamp

### isPut

```solidity
bool isPut
```

True if a put option, False if a call option

### STRIKE_PRICE_SCALE

```solidity
uint256 STRIKE_PRICE_SCALE
```

### STRIKE_PRICE_DIGITS

```solidity
uint256 STRIKE_PRICE_DIGITS
```

### init

```solidity
function init(address _addressBook, address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiryTimestamp, bool _isPut) external
```

initialize the oToken

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addressBook | address | addressbook module |
| _underlyingAsset | address | asset that the option references |
| _strikeAsset | address | asset that the strike price is denominated in |
| _collateralAssets | address[] | asset that is held as collateral against short/written options |
| _collateralConstraints | uint256[] | limits the maximum number of untrusted collateral tokens (0 - no limit) |
| _strikePrice | uint256 | strike price with decimals &#x3D; 8 |
| _expiryTimestamp | uint256 | expiration timestamp of the option, represented as a unix timestamp |
| _isPut | bool | True if a put option, False if a call option |

### decimals

```solidity
function decimals() public view virtual returns (uint8)
```

_Returns the number of decimals used to get its user representation.
For example, if &#x60;decimals&#x60; equals &#x60;2&#x60;, a balance of &#x60;505&#x60; tokens should
be displayed to a user as &#x60;5.05&#x60; (&#x60;505 / 10 ** 2&#x60;).

Tokens usually opt for a value of 18, imitating the relationship between
Ether and Wei. This is the value {ERC20} uses, unless this function is
overridden;

NOTE: This information is only used for _display_ purposes: it in
no way affects any of the arithmetic of the contract, including
{IERC20-balanceOf} and {IERC20-transfer}._

### getOtokenDetails

```solidity
function getOtokenDetails() external view returns (address[], uint256[], uint256[], uint256[], address, address, uint256, uint256, bool, uint256)
```

### getCollateralAssets

```solidity
function getCollateralAssets() external view returns (address[])
```

### getCollateralConstraints

```solidity
function getCollateralConstraints() external view returns (uint256[])
```

### getCollateralsAmounts

```solidity
function getCollateralsAmounts() external view returns (uint256[])
```

### getCollateralsValues

```solidity
function getCollateralsValues() external view returns (uint256[])
```

### mintOtoken

```solidity
function mintOtoken(address account, uint256 amount, uint256[] collateralsAmountsForMint, uint256[] collateralsValuesForMint) external
```

mint oToken for an account

_Controller only method where access control is taken care of by _beforeTokenTransfer hook_

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | account to mint token to |
| amount | uint256 | amount to mint |
| collateralsAmountsForMint | uint256[] | amounts of colateral assets to mint with |
| collateralsValuesForMint | uint256[] | value of collateral assets in strike asset tokens used for this mint |

### burnOtoken

```solidity
function burnOtoken(address account, uint256 amount) external
```

burn oToken from an account.

_Controller only method where access control is taken care of by _beforeTokenTransfer hook_

| Name | Type | Description |
| ---- | ---- | ----------- |
| account | address | account to burn token from |
| amount | uint256 | amount to burn |

### reduceCollaterization

```solidity
function reduceCollaterization(uint256[] collateralsAmountsForReduce, uint256[] collateralsValuesForReduce, uint256 oTokenAmountBurnt) external
```

### _getNameAndSymbol

```solidity
function _getNameAndSymbol() internal view returns (string tokenName, string tokenSymbol)
```

generates the name and symbol for an option

_this function uses a named return variable to avoid the stack-too-deep error_

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenName | string | (ex: ETHUSDC 05-September-2020 200 Put USDC Collateral) |
| tokenSymbol | string | (ex: oETHUSDC-05SEP20-200P) |

### _getDisplayedStrikePrice

```solidity
function _getDisplayedStrikePrice(uint256 _strikePrice) internal pure returns (string)
```

_convert strike price scaled by 1e8 to human readable number string_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _strikePrice | uint256 | strike price scaled by 1e8 |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | strike price string |

### _uintTo2Chars

```solidity
function _uintTo2Chars(uint256 number) internal pure returns (string)
```

_return a representation of a number using 2 characters, adds a leading 0 if one digit, uses two trailing digits if a 3 digit number_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | string | 2 characters that corresponds to a number |

### _getOptionType

```solidity
function _getOptionType(bool _isPut) internal pure returns (string shortString, string longString)
```

_return string representation of option type_

| Name | Type | Description |
| ---- | ---- | ----------- |
| shortString | string | a 1 character representation of option type (P or C) |
| longString | string | a full length string of option type (Put or Call) |

### _slice

```solidity
function _slice(string _s, uint256 _start, uint256 _end) internal pure returns (string)
```

_cut string s into s[start:end]_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _s | string | the string to cut |
| _start | uint256 | the starting index |
| _end | uint256 | the ending index (excluded in the substring) |

### _getMonth

```solidity
function _getMonth(uint256 _month) internal pure returns (string shortString, string longString)
```

_return string representation of a month_

| Name | Type | Description |
| ---- | ---- | ----------- |
| shortString | string | a 3 character representation of a month (ex: SEP, DEC, etc) |
| longString | string | a full length string of a month (ex: September, December, etc) |

