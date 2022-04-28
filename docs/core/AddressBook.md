# Solidity API

## AddressBook

### OTOKEN_IMPL

```solidity
bytes32 OTOKEN_IMPL
```

_Otoken implementation key_

### OTOKEN_FACTORY

```solidity
bytes32 OTOKEN_FACTORY
```

_OtokenFactory key_

### WHITELIST

```solidity
bytes32 WHITELIST
```

_Whitelist key_

### CONTROLLER

```solidity
bytes32 CONTROLLER
```

_Controller key_

### MARGIN_POOL

```solidity
bytes32 MARGIN_POOL
```

_MarginPool key_

### MARGIN_CALCULATOR

```solidity
bytes32 MARGIN_CALCULATOR
```

_MarginCalculator key_

### LIQUIDATION_MANAGER

```solidity
bytes32 LIQUIDATION_MANAGER
```

_LiquidationManager key_

### ORACLE

```solidity
bytes32 ORACLE
```

_Oracle key_

### addresses

```solidity
mapping(bytes32 &#x3D;&gt; address) addresses
```

_mapping between key and address_

### ProxyCreated

```solidity
event ProxyCreated(bytes32 id, address proxy)
```

emits an event when a new proxy is created

### AddressAdded

```solidity
event AddressAdded(bytes32 id, address add)
```

emits an event when a new address is added

### getOtokenImpl

```solidity
function getOtokenImpl() external view returns (address)
```

return Otoken implementation address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Otoken implementation address |

### getOtokenFactory

```solidity
function getOtokenFactory() external view returns (address)
```

return oTokenFactory address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | OtokenFactory address |

### getWhitelist

```solidity
function getWhitelist() external view returns (address)
```

return Whitelist address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Whitelist address |

### getController

```solidity
function getController() external view returns (address)
```

return Controller address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Controller address |

### getMarginPool

```solidity
function getMarginPool() external view returns (address)
```

return MarginPool address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | MarginPool address |

### getMarginCalculator

```solidity
function getMarginCalculator() external view returns (address)
```

return MarginCalculator address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | MarginCalculator address |

### getLiquidationManager

```solidity
function getLiquidationManager() external view returns (address)
```

return LiquidationManager address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | LiquidationManager address |

### getOracle

```solidity
function getOracle() external view returns (address)
```

return Oracle address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | Oracle address |

### setOtokenImpl

```solidity
function setOtokenImpl(address _otokenImpl) external
```

set Otoken implementation address

_can only be called by the addressbook owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _otokenImpl | address | Otoken implementation address |

### setOtokenFactory

```solidity
function setOtokenFactory(address _otokenFactory) external
```

set OtokenFactory address

_can only be called by the addressbook owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _otokenFactory | address | OtokenFactory address |

### setWhitelist

```solidity
function setWhitelist(address _whitelist) external
```

set Whitelist address

_can only be called by the addressbook owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _whitelist | address | Whitelist address |

### setController

```solidity
function setController(address _controller) external
```

set Controller address

_can only be called by the addressbook owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _controller | address | Controller address |

### setMarginPool

```solidity
function setMarginPool(address _marginPool) external
```

set MarginPool address

_can only be called by the addressbook owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _marginPool | address | MarginPool address |

### setMarginCalculator

```solidity
function setMarginCalculator(address _marginCalculator) external
```

set MarginCalculator address

_can only be called by the addressbook owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _marginCalculator | address | MarginCalculator address |

### setLiquidationManager

```solidity
function setLiquidationManager(address _liquidationManager) external
```

set LiquidationManager address

_can only be called by the addressbook owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _liquidationManager | address | LiquidationManager address |

### setOracle

```solidity
function setOracle(address _oracle) external
```

set Oracle address

_can only be called by the addressbook owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _oracle | address | Oracle address |

### getAddress

```solidity
function getAddress(bytes32 _key) public view returns (address)
```

return an address for specific key

| Name | Type | Description |
| ---- | ---- | ----------- |
| _key | bytes32 | key address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address |

### setAddress

```solidity
function setAddress(bytes32 _key, address _address) public
```

set a specific address for a specific key

_can only be called by the addressbook owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _key | bytes32 | key |
| _address | address | address |

### updateImpl

```solidity
function updateImpl(bytes32 _id, address _newAddress) public
```

_function to update the implementation of a specific component of the protocol_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _id | bytes32 | id of the contract to be updated |
| _newAddress | address | address of the new implementation |

