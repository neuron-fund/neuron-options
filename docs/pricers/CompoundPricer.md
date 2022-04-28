# CompoundPricer

A Pricer contract for a Compound cToken

### oracle

```solidity
contract OracleInterface oracle
```

oracle address

### cToken

```solidity
contract CTokenInterface cToken
```

cToken that this pricer will a get price for

### underlying

```solidity
contract ERC20Interface underlying
```

underlying asset for this cToken

### constructor

```solidity
constructor(address _cToken, address _underlying, address _oracle) public
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| _cToken | address | cToken asset |
| _underlying | address | underlying asset for this cToken |
| _oracle | address | Oracle contract address |

### getPrice

```solidity
function getPrice() external view returns (uint256)
```

get the live price for the asset

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price of 1e8 cToken in USD, scaled by 1e8 |

### setExpiryPriceInOracle

```solidity
function setExpiryPriceInOracle(uint256 _expiryTimestamp) external
```

set the expiry price in the oracle

_requires that the underlying price has been set before setting a cToken price_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _expiryTimestamp | uint256 | expiry to set a price for |

### _underlyingPriceToCtokenPrice

```solidity
function _underlyingPriceToCtokenPrice(uint256 _underlyingPrice) internal view returns (uint256)
```

_convert underlying price to cToken price with the cToken to underlying exchange rate_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlyingPrice | uint256 | price of 1 underlying token (ie 1e6 USDC, 1e18 WETH) in USD, scaled by 1e8 |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price of 1e8 cToken in USD, scaled by 1e8 |

