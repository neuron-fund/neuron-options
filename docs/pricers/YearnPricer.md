# YearnPricer

A Pricer contract for a Yearn yToken

### oracle

```solidity
contract OracleInterface oracle
```

oracle address

### yToken

```solidity
contract YearnVaultInterface yToken
```

yToken that this pricer will a get price for

### underlying

```solidity
contract ERC20Interface underlying
```

underlying asset for this yToken

### constructor

```solidity
constructor(address _yToken, address _underlying, address _oracle) public
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| _yToken | address | yToken asset |
| _underlying | address | underlying asset for this yToken |
| _oracle | address | Oracle contract address |

### getPrice

```solidity
function getPrice() external view returns (uint256)
```

get the live price for the asset

_overrides the getPrice function in PricerInterface_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price of 1e8 yToken in USD, scaled by 1e8 |

### setExpiryPriceInOracle

```solidity
function setExpiryPriceInOracle(uint256 _expiryTimestamp) external
```

set the expiry price in the oracle

_requires that the underlying price has been set before setting a yToken price_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _expiryTimestamp | uint256 | expiry to set a price for |

### _underlyingPriceToYtokenPrice

```solidity
function _underlyingPriceToYtokenPrice(uint256 _underlyingPrice) private view returns (uint256)
```

_convert underlying price to yToken price with the yToken to underlying exchange rate_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlyingPrice | uint256 | price of 1 underlying token (ie 1e6 USDC, 1e18 WETH) in USD, scaled by 1e8 |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price of 1e8 yToken in USD, scaled by 1e8 |

### getHistoricalPrice

```solidity
function getHistoricalPrice(uint80 _roundId) external view returns (uint256, uint256)
```

