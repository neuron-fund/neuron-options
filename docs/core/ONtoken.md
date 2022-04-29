## `ONtoken`

ONtoken is the ERC20 token for an option


The ONtoken inherits ERC20Upgradeable thats' why we need to use the init instead of constructor


### `init(address _addressBook, address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiryTimestamp, bool _isPut)` (external)

initialize the onToken




### `decimals() → uint8` (public)





### `getONtokenDetails() → address[], uint256[], uint256[], uint256[], address, address, uint256, uint256, bool, uint256` (external)





### `getCollateralAssets() → address[]` (external)



helper function to get full array of collateral assets

### `getCollateralConstraints() → uint256[]` (external)



helper function to get full array of collateral constraints

### `getCollateralsAmounts() → uint256[]` (external)



helper function to get full array of collateral amounts

### `getCollateralsValues() → uint256[]` (external)



helper function to get full array of collateral values

### `mintONtoken(address account, uint256 amount, uint256[] collateralsAmountsForMint, uint256[] collateralsValuesForMint)` (external)

mint onToken for an account


Controller only method where access control is taken care of by _beforeTokenTransfer hook


### `burnONtoken(address account, uint256 amount)` (external)

burn onToken from an account.


Controller only method where access control is taken care of by _beforeTokenTransfer hook


### `reduceCollaterization(uint256[] collateralsAmountsForReduce, uint256[] collateralsValuesForReduce, uint256 onTokenAmountBurnt)` (external)

reduces collaterization amounts and values of onToken, used when onToken is burned by vault's owner


Controller only method where access control is taken care of by _beforeTokenTransfer hook

### `_getNameAndSymbol() → string tokenName, string tokenSymbol` (internal)

generates the name and symbol for an option


this function uses a named return variable to avoid the stack-too-deep error


### `_getDisplayedStrikePrice(uint256 _strikePrice) → string` (internal)



convert strike price scaled by 1e8 to human readable number string


### `_uintTo2Chars(uint256 number) → string` (internal)



return a representation of a number using 2 characters, adds a leading 0 if one digit, uses two trailing digits if a 3 digit number


### `_getOptionType(bool _isPut) → string shortString, string longString` (internal)



return string representation of option type


### `_slice(string _s, uint256 _start, uint256 _end) → string` (internal)



cut string s into s[start:end]


### `_getMonth(uint256 _month) → string shortString, string longString` (internal)



return string representation of a month





