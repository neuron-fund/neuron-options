# Solidity API

## Whitelist

The whitelist module keeps track of all valid oToken addresses, product hashes, collateral addresses, and callee addresses.

### addressBook

```solidity
address addressBook
```

AddressBook module address

### whitelistedProduct

```solidity
mapping(bytes32 &#x3D;&gt; bool) whitelistedProduct
```

_mapping to track whitelisted products_

### whitelistedCollaterals

```solidity
mapping(bytes32 &#x3D;&gt; bool) whitelistedCollaterals
```

_mapping to track whitelisted collaterals_

### whitelistedOtoken

```solidity
mapping(address &#x3D;&gt; bool) whitelistedOtoken
```

_mapping to track whitelisted oTokens_

### whitelistedCallee

```solidity
mapping(address &#x3D;&gt; bool) whitelistedCallee
```

_mapping to track whitelisted callee addresses for the call action_

### constructor

```solidity
constructor(address _addressBook) public
```

_constructor_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addressBook | address | AddressBook module address |

### ProductWhitelisted

```solidity
event ProductWhitelisted(bytes32 productHash, address underlying, address strike, address[] collaterals, bool isPut)
```

emits an event a product is whitelisted by the owner address

### ProductBlacklisted

```solidity
event ProductBlacklisted(bytes32 productHash, address underlying, address strike, address[] collateral, bool isPut)
```

emits an event a product is blacklisted by the owner address

### CollateralWhitelisted

```solidity
event CollateralWhitelisted(address[] collateral)
```

emits an event when a collateral address is whitelisted by the owner address

### CollateralBlacklisted

```solidity
event CollateralBlacklisted(address[] collateral)
```

emits an event when a collateral address is blacklist by the owner address

### OtokenWhitelisted

```solidity
event OtokenWhitelisted(address otoken)
```

emits an event when an oToken is whitelisted by the OtokenFactory module

### OtokenBlacklisted

```solidity
event OtokenBlacklisted(address otoken)
```

emits an event when an oToken is blacklisted by the OtokenFactory module

### CalleeWhitelisted

```solidity
event CalleeWhitelisted(address _callee)
```

emits an event when a callee address is whitelisted by the owner address

### CalleeBlacklisted

```solidity
event CalleeBlacklisted(address _callee)
```

emits an event when a callee address is blacklisted by the owner address

### onlyFactory

```solidity
modifier onlyFactory()
```

check if the sender is the oTokenFactory module

### isWhitelistedProduct

```solidity
function isWhitelistedProduct(address _underlying, address _strike, address[] _collateral, bool _isPut) external view returns (bool)
```

check if a product is whitelisted

_product is the hash of underlying asset, strike asset, collateral asset, and isPut_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlying | address | asset that the option references |
| _strike | address | asset that the strike price is denominated in |
| _collateral | address[] | asset that is held as collateral against short/written options |
| _isPut | bool | True if a put option, False if a call option |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean, True if product is whitelisted |

### isWhitelistedCollaterals

```solidity
function isWhitelistedCollaterals(address[] _collaterals) external view returns (bool)
```

check if a collateral asset is whitelisted

| Name | Type | Description |
| ---- | ---- | ----------- |
| _collaterals | address[] | assets that is held as collateral against short/written options |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean, True if the collateral is whitelisted |

### isWhitelistedOtoken

```solidity
function isWhitelistedOtoken(address _otoken) external view returns (bool)
```

check if an oToken is whitelisted

| Name | Type | Description |
| ---- | ---- | ----------- |
| _otoken | address | oToken address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean, True if the oToken is whitelisted |

### isWhitelistedCallee

```solidity
function isWhitelistedCallee(address _callee) external view returns (bool)
```

check if a callee address is whitelisted for the call action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _callee | address | callee destination address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | boolean, True if the address is whitelisted |

### whitelistProduct

```solidity
function whitelistProduct(address _underlying, address _strike, address[] _collaterals, bool _isPut) external
```

allows the owner to whitelist a product

_product is the hash of underlying asset, strike asset, collateral asset, and isPut
can only be called from the owner address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlying | address | asset that the option references |
| _strike | address | asset that the strike price is denominated in |
| _collaterals | address[] | assets that is held as collateral against short/written options |
| _isPut | bool | True if a put option, False if a call option |

### blacklistProduct

```solidity
function blacklistProduct(address _underlying, address _strike, address[] _collaterals, bool _isPut) external
```

allow the owner to blacklist a product

_product is the hash of underlying asset, strike asset, collateral asset, and isPut
can only be called from the owner address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlying | address | asset that the option references |
| _strike | address | asset that the strike price is denominated in |
| _collaterals | address[] | assets that is held as collateral against short/written options |
| _isPut | bool | True if a put option, False if a call option |

### whitelistCollaterals

```solidity
function whitelistCollaterals(address[] _collaterals) external
```

allows the owner to whitelist a collateral address

_can only be called from the owner address. This function is used to whitelist any asset other than Otoken as collateral. WhitelistOtoken() is used to whitelist Otoken contracts._

| Name | Type | Description |
| ---- | ---- | ----------- |
| _collaterals | address[] | collateral assets addresses |

### blacklistCollateral

```solidity
function blacklistCollateral(address[] _collaterals) external
```

allows the owner to blacklist a collateral address

_can only be called from the owner address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _collaterals | address[] | collateral assets addresses |

### whitelistOtoken

```solidity
function whitelistOtoken(address _otokenAddress) external
```

allows the OtokenFactory module to whitelist a new option

_can only be called from the OtokenFactory address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _otokenAddress | address | oToken |

### blacklistOtoken

```solidity
function blacklistOtoken(address _otokenAddress) external
```

allows the owner to blacklist an option

_can only be called from the owner address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _otokenAddress | address | oToken |

### whitelistCallee

```solidity
function whitelistCallee(address _callee) external
```

allows the owner to whitelist a destination address for the call action

_can only be called from the owner address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _callee | address | callee address |

### blacklistCallee

```solidity
function blacklistCallee(address _callee) external
```

allows the owner to blacklist a destination address for the call action

_can only be called from the owner address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _callee | address | callee address |

