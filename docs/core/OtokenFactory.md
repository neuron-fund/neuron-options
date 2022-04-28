# Solidity API

## OtokenFactory

SPDX-License-Identifier: UNLICENSED
Create new oTokens and keep track of all created tokens

_Calculate contract address before each creation with CREATE2
and deploy eip-1167 minimal proxies for oToken logic contract_

### addressBook

```solidity
address addressBook
```

AddressBook contract that records the address of the Whitelist module and the Otoken impl address. */

### otokens

```solidity
address[] otokens
```

array of all created otokens */

### idToAddress

```solidity
mapping(bytes32 &#x3D;&gt; address) idToAddress
```

_mapping from parameters hash to its deployed address_

### MAX_EXPIRY

```solidity
uint256 MAX_EXPIRY
```

_max expiry that BokkyPooBahsDateTimeLibrary can handle. (2345/12/31)_

### constructor

```solidity
constructor(address _addressBook) public
```

### OtokenCreated

```solidity
event OtokenCreated(address tokenAddress, address creator, address underlying, address strike, address[] collateral, uint256 strikePrice, uint256 expiry, bool isPut)
```

emitted when the factory creates a new Option

### OtokenParams

```solidity
struct OtokenParams {
  bytes32 id;
  address whitelist;
  address otokenImpl;
  address newOtoken;
}
```

### createOtoken

```solidity
function createOtoken(address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiry, bool _isPut) external returns (address)
```

create new oTokens

_deploy an eip-1167 minimal proxy with CREATE2 and register it to the whitelist module_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlyingAsset | address | asset that the option references |
| _strikeAsset | address | asset that the strike price is denominated in |
| _collateralAssets | address[] | assets that is held as collateral against short/written options |
| _collateralConstraints | uint256[] | limits the maximum number of untrusted collateral tokens (0 - no limit) |
| _strikePrice | uint256 | strike price with decimals &#x3D; 18 |
| _expiry | uint256 | expiration timestamp as a unix timestamp |
| _isPut | bool | True if a put option, False if a call option |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | newOtoken address of the newly created option |

### getOtokensLength

```solidity
function getOtokensLength() external view returns (uint256)
```

get the total oTokens created by the factory

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | length of the oTokens array |

### getOtoken

```solidity
function getOtoken(address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiry, bool _isPut) external view returns (address)
```

get the oToken address for an already created oToken, if no oToken has been created with these parameters, it will return address(0)

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlyingAsset | address | asset that the option references |
| _strikeAsset | address | asset that the strike price is denominated in |
| _collateralAssets | address[] | asset that is held as collateral against short/written options |
| _collateralConstraints | uint256[] |  |
| _strikePrice | uint256 | strike price with decimals &#x3D; 18 |
| _expiry | uint256 | expiration timestamp as a unix timestamp |
| _isPut | bool | True if a put option, False if a call option |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | the address of target otoken. |

### getTargetOtokenAddress

```solidity
function getTargetOtokenAddress(address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiry, bool _isPut) external view returns (address)
```

get the address at which a new oToken with these parameters would be deployed

_return the exact address that will be deployed at with _computeAddress_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlyingAsset | address | asset that the option references |
| _strikeAsset | address | asset that the strike price is denominated in |
| _collateralAssets | address[] | asset that is held as collateral against short/written options |
| _collateralConstraints | uint256[] | limits the maximum number of untrusted collateral tokens (0 - no limit) |
| _strikePrice | uint256 | strike price with decimals &#x3D; 18 |
| _expiry | uint256 | expiration timestamp as a unix timestamp |
| _isPut | bool | True if a put option, False if a call option |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | targetAddress the address this oToken would be deployed at |

### _getOptionId

```solidity
function _getOptionId(address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiry, bool _isPut) internal pure returns (bytes32)
```

_hash oToken parameters and return a unique option id_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlyingAsset | address | asset that the option references |
| _strikeAsset | address | asset that the strike price is denominated in |
| _collateralAssets | address[] | asset that is held as collateral against short/written options |
| _collateralConstraints | uint256[] |  |
| _strikePrice | uint256 | strike price with decimals &#x3D; 18 |
| _expiry | uint256 | expiration timestamp as a unix timestamp |
| _isPut | bool | True if a put option, False if a call option |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | id the unique id of an oToken |

