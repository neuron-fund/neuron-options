## `ONtokenFactory`

SPDX-License-Identifier: UNLICENSED
Create new onTokens and keep track of all created tokens


Calculate contract address before each creation with CREATE2
and deploy eip-1167 minimal proxies for onToken logic contract


### `constructor(address _addressBook)` (public)





### `createONtoken(address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiry, bool _isPut) → address` (external)

create new onTokens


deploy an eip-1167 minimal proxy with CREATE2 and register it to the whitelist module


### `getONtokensLength() → uint256` (external)

get the total onTokens created by the factory




### `getONtoken(address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiry, bool _isPut) → address` (external)

get the onToken address for an already created onToken, if no onToken has been created with these parameters, it will return address(0)




### `getTargetONtokenAddress(address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiry, bool _isPut) → address` (external)

get the address at which a new onToken with these parameters would be deployed


return the exact address that will be deployed at with _computeAddress


### `_getOptionId(address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiry, bool _isPut) → bytes32` (internal)



hash onToken parameters and return a unique option id



### `ONtokenCreated(address tokenAddress, address creator, address underlying, address strike, address[] collateral, uint256 strikePrice, uint256 expiry, bool isPut)`

emitted when the factory creates a new Option




### `ONtokenParams`


bytes32 id


address whitelist


address onTokenImpl


address newONtoken



