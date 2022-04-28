# SignedConverter

A library to convert an unsigned integer to signed integer or signed integer to unsigned integer.

### uintToInt

```solidity
function uintToInt(uint256 a) internal pure returns (int256)
```

convert an unsigned integer to a signed integer

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | uint256 | uint to convert into a signed integer |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | int256 | converted signed integer |

### intToUint

```solidity
function intToUint(int256 a) internal pure returns (uint256)
```

convert a signed integer to an unsigned integer

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | int256 | int to convert into an unsigned integer |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | converted unsigned integer |

