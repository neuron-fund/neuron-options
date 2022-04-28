# Solidity API

## CTokenInterface

_Interface of Compound cToken_

### exchangeRateStored

```solidity
function exchangeRateStored() external view returns (uint256)
```

Calculates the exchange rate from the underlying to the CToken

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | Calculated exchange rate scaled by 1e18 |

### decimals

```solidity
function decimals() external view returns (uint256)
```

