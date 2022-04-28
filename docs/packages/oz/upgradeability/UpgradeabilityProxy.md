# Solidity API

## UpgradeabilityProxy

_This contract represents a proxy where the implementation address to which it will delegate can be upgraded_

### Upgraded

```solidity
event Upgraded(address implementation)
```

_This event will be emitted every time the implementation gets upgraded_

| Name | Type | Description |
| ---- | ---- | ----------- |
| implementation | address | representing the address of the upgraded implementation |

### implementationPosition

```solidity
bytes32 implementationPosition
```

_Storage position of the address of the current implementation_

### implementation

```solidity
function implementation() public view returns (address impl)
```

_Tells the address of the current implementation_

| Name | Type | Description |
| ---- | ---- | ----------- |
| impl | address | address of the current implementation |

### setImplementation

```solidity
function setImplementation(address _newImplementation) internal
```

_Sets the address of the current implementation_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newImplementation | address | address representing the new implementation to be set |

### _upgradeTo

```solidity
function _upgradeTo(address _newImplementation) internal
```

_Upgrades the implementation address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newImplementation | address | representing the address of the new implementation to be set |

