# Solidity API

## FPI

FixedPoint library

### SCALING_FACTOR

```solidity
int256 SCALING_FACTOR
```

### BASE_DECIMALS

```solidity
uint256 BASE_DECIMALS
```

### FixedPointInt

```solidity
struct FixedPointInt {
  int256 value;
}
```

### fromUnscaledInt

```solidity
function fromUnscaledInt(int256 a) internal pure returns (struct FPI.FixedPointInt)
```

constructs an &#x60;FixedPointInt&#x60; from an unscaled int, e.g., &#x60;b&#x3D;5&#x60; gets stored internally as &#x60;5**27&#x60;.

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | int256 | int to convert into a FixedPoint. |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | the converted FixedPoint. |

### fromScaledUint

```solidity
function fromScaledUint(uint256 _a, uint256 _decimals) internal pure returns (struct FPI.FixedPointInt)
```

constructs an FixedPointInt from an scaled uint with {_decimals} decimals
Examples:
(1)  USDC    decimals &#x3D; 6
     Input:  5 * 1e6 USDC  &#x3D;&gt;    Output: 5 * 1e27 (FixedPoint 5.0 USDC)
(2)  cUSDC   decimals &#x3D; 8
     Input:  5 * 1e6 cUSDC &#x3D;&gt;    Output: 5 * 1e25 (FixedPoint 0.05 cUSDC)

| Name | Type | Description |
| ---- | ---- | ----------- |
| _a | uint256 | uint256 to convert into a FixedPoint. |
| _decimals | uint256 | original decimals _a has |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | the converted FixedPoint, with 27 decimals. |

### toScaledUint

```solidity
function toScaledUint(struct FPI.FixedPointInt _a, uint256 _decimals, bool _roundDown) internal pure returns (uint256)
```

convert a FixedPointInt number to an uint256 with a specific number of decimals

| Name | Type | Description |
| ---- | ---- | ----------- |
| _a | struct FPI.FixedPointInt | FixedPointInt to convert |
| _decimals | uint256 | number of decimals that the uint256 should be scaled to |
| _roundDown | bool | True to round down the result, False to round up |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | the converted uint256 |

### add

```solidity
function add(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (struct FPI.FixedPointInt)
```

add two signed integers, a + b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | sum of the two signed integers |

### sub

```solidity
function sub(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (struct FPI.FixedPointInt)
```

subtract two signed integers, a-b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | difference of two signed integers |

### mul

```solidity
function mul(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (struct FPI.FixedPointInt)
```

multiply two signed integers, a by b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | mul of two signed integers |

### div

```solidity
function div(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (struct FPI.FixedPointInt)
```

divide two signed integers, a by b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | div of two signed integers |

### min

```solidity
function min(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (struct FPI.FixedPointInt)
```

minimum between two signed integers, a and b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | min of two signed integers |

### max

```solidity
function max(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (struct FPI.FixedPointInt)
```

maximum between two signed integers, a and b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | max of two signed integers |

### isEqual

```solidity
function isEqual(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (bool)
```

is a is equal to b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if equal, False if not |

### isGreaterThan

```solidity
function isGreaterThan(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (bool)
```

is a greater than b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if a &gt; b, False if not |

### isGreaterThanOrEqual

```solidity
function isGreaterThanOrEqual(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (bool)
```

is a greater than or equal to b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if a &gt;&#x3D; b, False if not |

### isLessThan

```solidity
function isLessThan(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (bool)
```

is a is less than b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if a &lt; b, False if not |

### isLessThanOrEqual

```solidity
function isLessThanOrEqual(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) internal pure returns (bool)
```

is a less than or equal to b

| Name | Type | Description |
| ---- | ---- | ----------- |
| a | struct FPI.FixedPointInt | FixedPointInt |
| b | struct FPI.FixedPointInt | FixedPointInt |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if a &lt;&#x3D; b, False if not |

