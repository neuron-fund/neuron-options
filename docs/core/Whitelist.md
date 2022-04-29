## `Whitelist`

The whitelist module keeps track of all valid onToken addresses, product hashes, collateral addresses, and callee addresses.



### `onlyFactory()`

check if the sender is the onTokenFactory module




### `constructor(address _addressBook)` (public)



constructor


### `isWhitelistedProduct(address _underlying, address _strike, address[] _collateral, bool _isPut) → bool` (external)

check if a product is whitelisted


product is the hash of underlying asset, strike asset, collateral asset, and isPut


### `isWhitelistedCollaterals(address[] _collaterals) → bool` (external)

check if a collateral asset is whitelisted




### `isWhitelistedONtoken(address _onToken) → bool` (external)

check if an onToken is whitelisted




### `isWhitelistedCallee(address _callee) → bool` (external)

check if a callee address is whitelisted for the call action




### `whitelistProduct(address _underlying, address _strike, address[] _collaterals, bool _isPut)` (external)

allows the owner to whitelist a product


product is the hash of underlying asset, strike asset, collateral asset, and isPut
can only be called from the owner address


### `blacklistProduct(address _underlying, address _strike, address[] _collaterals, bool _isPut)` (external)

allow the owner to blacklist a product


product is the hash of underlying asset, strike asset, collateral asset, and isPut
can only be called from the owner address


### `whitelistCollaterals(address[] _collaterals)` (external)

allows the owner to whitelist a collateral address


can only be called from the owner address. This function is used to whitelist any asset other than ONtoken as collateral. WhitelistONtoken() is used to whitelist ONtoken contracts.


### `blacklistCollateral(address[] _collaterals)` (external)

allows the owner to blacklist a collateral address


can only be called from the owner address


### `whitelistONtoken(address _onTokenAddress)` (external)

allows the ONtokenFactory module to whitelist a new option


can only be called from the ONtokenFactory address


### `blacklistONtoken(address _onTokenAddress)` (external)

allows the owner to blacklist an option


can only be called from the owner address


### `whitelistCallee(address _callee)` (external)

allows the owner to whitelist a destination address for the call action


can only be called from the owner address


### `blacklistCallee(address _callee)` (external)

allows the owner to blacklist a destination address for the call action


can only be called from the owner address



### `ProductWhitelisted(bytes32 productHash, address underlying, address strike, address[] collaterals, bool isPut)`

emits an event a product is whitelisted by the owner address



### `ProductBlacklisted(bytes32 productHash, address underlying, address strike, address[] collateral, bool isPut)`

emits an event a product is blacklisted by the owner address



### `CollateralWhitelisted(address[] collateral)`

emits an event when a collateral address is whitelisted by the owner address



### `CollateralBlacklisted(address[] collateral)`

emits an event when a collateral address is blacklist by the owner address



### `ONtokenWhitelisted(address onToken)`

emits an event when an onToken is whitelisted by the ONtokenFactory module



### `ONtokenBlacklisted(address onToken)`

emits an event when an onToken is blacklisted by the ONtokenFactory module



### `CalleeWhitelisted(address _callee)`

emits an event when a callee address is whitelisted by the owner address



### `CalleeBlacklisted(address _callee)`

emits an event when a callee address is blacklisted by the owner address





