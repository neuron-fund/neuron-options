# Oracle

The Oracle module sets, retrieves, and stores USD prices (USD per asset) for underlying, collateral, and strike assets
manages pricers that are used for different assets

### Price

```solidity
struct Price {
  uint256 price;
  uint256 timestamp;
}
```

### disputer

```solidity
address disputer
```

### migrated

```solidity
bool migrated
```

### pricerLockingPeriod

```solidity
mapping(address &#x3D;&gt; uint256) pricerLockingPeriod
```

_mapping of asset pricer to its locking period
locking period is the period of time after the expiry timestamp where a price can not be pushed_

### pricerDisputePeriod

```solidity
mapping(address &#x3D;&gt; uint256) pricerDisputePeriod
```

_mapping of asset pricer to its dispute period
dispute period is the period of time after an expiry price has been pushed where a price can be disputed_

### assetPricer

```solidity
mapping(address &#x3D;&gt; address) assetPricer
```

_mapping between an asset and its pricer_

### storedPrice

```solidity
mapping(address &#x3D;&gt; mapping(uint256 &#x3D;&gt; struct Oracle.Price)) storedPrice
```

_mapping between asset, expiry timestamp, and the Price structure at the expiry timestamp_

### stablePrice

```solidity
mapping(address &#x3D;&gt; uint256) stablePrice
```

_mapping between stable asset and price_

### DisputerUpdated

```solidity
event DisputerUpdated(address newDisputer)
```

emits an event when the disputer is updated

### PricerUpdated

```solidity
event PricerUpdated(address asset, address pricer)
```

emits an event when the pricer is updated for an asset

### PricerLockingPeriodUpdated

```solidity
event PricerLockingPeriodUpdated(address pricer, uint256 lockingPeriod)
```

emits an event when the locking period is updated for a pricer

### PricerDisputePeriodUpdated

```solidity
event PricerDisputePeriodUpdated(address pricer, uint256 disputePeriod)
```

emits an event when the dispute period is updated for a pricer

### ExpiryPriceUpdated

```solidity
event ExpiryPriceUpdated(address asset, uint256 expiryTimestamp, uint256 price, uint256 onchainTimestamp)
```

emits an event when an expiry price is updated for a specific asset

### ExpiryPriceDisputed

```solidity
event ExpiryPriceDisputed(address asset, uint256 expiryTimestamp, uint256 disputedPrice, uint256 newPrice, uint256 disputeTimestamp)
```

emits an event when the disputer disputes a price during the dispute period

### StablePriceUpdated

```solidity
event StablePriceUpdated(address asset, uint256 price)
```

emits an event when a stable asset price changes

### migrateOracle

```solidity
function migrateOracle(address _asset, uint256[] _expiries, uint256[] _prices) external
```

function to mgirate asset prices from old oracle to new deployed oracle

_this can only be called by owner, should be used at the deployment time before setting Oracle module into AddressBook_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |
| _expiries | uint256[] | array of expiries timestamps |
| _prices | uint256[] | array of prices |

### endMigration

```solidity
function endMigration() external
```

end migration process

_can only be called by owner, should be called before setting Oracle module into AddressBook_

### setAssetPricer

```solidity
function setAssetPricer(address _asset, address _pricer) external
```

sets the pricer for an asset

_can only be called by the owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |
| _pricer | address | pricer address |

### setLockingPeriod

```solidity
function setLockingPeriod(address _pricer, uint256 _lockingPeriod) external
```

sets the locking period for a pricer

_can only be called by the owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pricer | address | pricer address |
| _lockingPeriod | uint256 | locking period |

### setDisputePeriod

```solidity
function setDisputePeriod(address _pricer, uint256 _disputePeriod) external
```

sets the dispute period for a pricer

_can only be called by the owner
for a composite pricer (ie CompoundPricer) that depends on or calls other pricers, ensure
that the dispute period for the composite pricer is longer than the dispute period for the
asset pricer that it calls to ensure safe usage as a dispute in the other pricer will cause
the need for a dispute with the composite pricer&#x27;s price_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pricer | address | pricer address |
| _disputePeriod | uint256 | dispute period |

### setDisputer

```solidity
function setDisputer(address _disputer) external
```

set the disputer address

_can only be called by the owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _disputer | address | disputer address |

### setStablePrice

```solidity
function setStablePrice(address _asset, uint256 _price) external
```

set stable asset price

_price should be scaled by 1e8_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |
| _price | uint256 | price |

### disputeExpiryPrice

```solidity
function disputeExpiryPrice(address _asset, uint256 _expiryTimestamp, uint256 _price) external
```

dispute an asset price during the dispute period

_only the disputer can dispute a price during the dispute period, by setting a new one_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |
| _expiryTimestamp | uint256 | expiry timestamp |
| _price | uint256 | the correct price |

### setExpiryPrice

```solidity
function setExpiryPrice(address _asset, uint256 _expiryTimestamp, uint256 _price) external
```

submits the expiry price to the oracle, can only be set from the pricer

_asset price can only be set after the locking period is over and before the dispute period has started_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |
| _expiryTimestamp | uint256 | expiry timestamp |
| _price | uint256 | asset price at expiry |

### getPrice

```solidity
function getPrice(address _asset) external view returns (uint256)
```

get a live asset price from the asset&#x27;s pricer contract

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price scaled by 1e8, denominated in USD e.g. 17568900000 &#x3D;&gt; 175.689 USD |

### getExpiryPrice

```solidity
function getExpiryPrice(address _asset, uint256 _expiryTimestamp) external view returns (uint256, bool)
```

get the asset price at specific expiry timestamp

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |
| _expiryTimestamp | uint256 | expiry timestamp |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price scaled by 1e8, denominated in USD |
| [1] | bool | isFinalized True, if the price is finalized, False if not |

### getPricer

```solidity
function getPricer(address _asset) external view returns (address)
```

get the pricer for an asset

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | pricer address |

### getDisputer

```solidity
function getDisputer() external view returns (address)
```

get the disputer address

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | disputer address |

### getPricerLockingPeriod

```solidity
function getPricerLockingPeriod(address _pricer) external view returns (uint256)
```

get a pricer&#x27;s locking period
locking period is the period of time after the expiry timestamp where a price can not be pushed

_during the locking period an expiry price can not be submitted to this contract_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pricer | address | pricer address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | locking period |

### getPricerDisputePeriod

```solidity
function getPricerDisputePeriod(address _pricer) external view returns (uint256)
```

get a pricer&#x27;s dispute period
dispute period is the period of time after an expiry price has been pushed where a price can be disputed

_during the dispute period, the disputer can dispute the submitted price and modify it_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _pricer | address | pricer address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | dispute period |

### getChainlinkRoundData

```solidity
function getChainlinkRoundData(address _asset, uint80 _roundId) external view returns (uint256, uint256)
```

get historical asset price and timestamp

_if asset is a stable asset, will return stored price and timestamp equal to block.timestamp_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address to get it&#x27;s historical price |
| _roundId | uint80 | chainlink round id |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | price and round timestamp |
| [1] | uint256 |  |

### isLockingPeriodOver

```solidity
function isLockingPeriodOver(address _asset, uint256 _expiryTimestamp) public view returns (bool)
```

check if the locking period is over for setting the asset price at a particular expiry timestamp

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |
| _expiryTimestamp | uint256 | expiry timestamp |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if locking period is over, False if not |

### isDisputePeriodOver

```solidity
function isDisputePeriodOver(address _asset, uint256 _expiryTimestamp) public view returns (bool)
```

check if the dispute period is over

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |
| _expiryTimestamp | uint256 | expiry timestamp |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if dispute period is over, False if not |

