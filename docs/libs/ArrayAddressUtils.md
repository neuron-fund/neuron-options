# ArrayAddressUtils

Utils library for comparing arrays of addresses

### isEqual

```solidity
function isEqual(address[] arr1, address[] arr2) external pure returns (bool)
```

_uses hashes of array to compare, therefore arrays with different order of same elements wont be equal_

| Name | Type | Description |
| ---- | ---- | ----------- |
| arr1 | address[] | address[] |
| arr2 | address[] | address[] |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | bool |

### _isNotEmpty

```solidity
function _isNotEmpty(address[] _array) internal pure returns (bool)
```

