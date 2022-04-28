# Solidity API

## ChainLinkPricer

A Pricer contract for one asset as reported by Chainlink

### BASE

```solidity
uint256 BASE
```

_base decimals_

### aggregatorDecimals

```solidity
uint256 aggregatorDecimals
```

chainlink response decimals

### oracle

```solidity
contract OracleInterface oracle
```

the oracle address

### aggregator

```solidity
contract AggregatorInterface aggregator
```

the aggregator for an asset

### asset

```solidity
address asset
```

asset that this pricer will a get price for

### bot

```solidity
address bot
```

bot address that is allowed to call setExpiryPriceInOracle

### constructor

```solidity
constructor(address _bot, address _asset, address _aggregator, address _oracle) public
```

| Name | Type | Description |
| ---- | ---- | ----------- |
| _bot | address | priveleged address that can call setExpiryPriceInOracle |
| _asset | address | asset that this pricer will get a price for |
| _aggregator | address | Chainlink aggregator contract for the asset |
| _oracle | address | Oracle address |

### onlyBot

```solidity
modifier onlyBot()
```

modifier to check if sender address is equal to bot address

### setExpiryPriceInOracle

```solidity
function setExpiryPriceInOracle(uint256 _expiryTimestamp, uint80 _roundId) external
```

set the expiry price in the oracle, can only be called by Bot address

_a roundId must be provided to confirm price validity, which is the first Chainlink price provided after the expiryTimestamp_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _expiryTimestamp | uint256 | expiry to set a price for |
| _roundId | uint80 | the first roundId after expiryTimestamp |

### getPrice

```solidity
function getPrice() external view returns (uint256)
```

get the live price for the asset

_overides the getPrice function in PricerInterface_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price of the asset in USD, scaled by 1e8 |

### getHistoricalPrice

```solidity
function getHistoricalPrice(uint80 _roundId) external view returns (uint256, uint256)
```

get historical chainlink price

| Name | Type | Description |
| ---- | ---- | ----------- |
| _roundId | uint80 | chainlink round id |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | round price and timestamp |
| [1] | uint256 |  |

### _scaleToBase

```solidity
function _scaleToBase(uint256 _price) internal view returns (uint256)
```

scale aggregator response to base decimals (1e8)

| Name | Type | Description |
| ---- | ---- | ----------- |
| _price | uint256 | aggregator price |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price scaled to 1e8 |

