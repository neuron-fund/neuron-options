# Solidity API

## WstethPricer

A Pricer contract for a wstETH token

### oracle

```solidity
contract OracleInterface oracle
```

oracle address

### wstETH

```solidity
contract WSTETHInterface wstETH
```

wstETH token

### underlying

```solidity
address underlying
```

underlying asset (WETH)

### constructor

```solidity
constructor(address _wstETH, address _underlying, address _oracle) public
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| _wstETH | address | wstETH |
| _underlying | address | underlying asset for wstETH |
| _oracle | address | Oracle contract address |

### getPrice

```solidity
function getPrice() external view returns (uint256)
```

get the live price for the asset

_overrides the getPrice function in PricerInterface_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price of 1 wstETH in USD, scaled by 1e8 |

### setExpiryPriceInOracle

```solidity
function setExpiryPriceInOracle(uint256 _expiryTimestamp) external
```

set the expiry price in the oracle

_requires that the underlying price has been set before setting a wstETH price_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _expiryTimestamp | uint256 | expiry to set a price for |

### _underlyingPriceToWstethPrice

```solidity
function _underlyingPriceToWstethPrice(uint256 _underlyingPrice) private view returns (uint256)
```

/**

_convert underlying price to wstETH price with the wstETH to stETH exchange rate (1 stETH ≈ 1 ETH)_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlyingPrice | uint256 | price of 1 underlying token (ie 1e18 WETH) in USD, scaled by 1e8 |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price of 1 wstETH in USD, scaled by 1e8 / |

### getHistoricalPrice

```solidity
function getHistoricalPrice(uint80) external pure returns (uint256, uint256)
```

