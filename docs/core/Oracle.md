## `Oracle`

The Oracle module sets, retrieves, and stores USD prices (USD per asset) for underlying, collateral, and strike assets
manages pricers that are used for different assets




### `migrateOracle(address _asset, uint256[] _expiries, uint256[] _prices)` (external)

function to mgirate asset prices from old oracle to new deployed oracle


this can only be called by owner, should be used at the deployment time before setting Oracle module into AddressBook


### `endMigration()` (external)

end migration process


can only be called by owner, should be called before setting Oracle module into AddressBook

### `setAssetPricer(address _asset, address _pricer)` (external)

sets the pricer for an asset


can only be called by the owner


### `setLockingPeriod(address _pricer, uint256 _lockingPeriod)` (external)

sets the locking period for a pricer


can only be called by the owner


### `setDisputePeriod(address _pricer, uint256 _disputePeriod)` (external)

sets the dispute period for a pricer


can only be called by the owner
for a composite pricer (ie CompoundPricer) that depends on or calls other pricers, ensure
that the dispute period for the composite pricer is longer than the dispute period for the
asset pricer that it calls to ensure safe usage as a dispute in the other pricer will cause
the need for a dispute with the composite pricer's price


### `setDisputer(address _disputer)` (external)

set the disputer address


can only be called by the owner


### `setStablePrice(address _asset, uint256 _price)` (external)

set stable asset price


price should be scaled by 1e8


### `disputeExpiryPrice(address _asset, uint256 _expiryTimestamp, uint256 _price)` (external)

dispute an asset price during the dispute period


only the disputer can dispute a price during the dispute period, by setting a new one


### `setExpiryPrice(address _asset, uint256 _expiryTimestamp, uint256 _price)` (external)

submits the expiry price to the oracle, can only be set from the pricer


asset price can only be set after the locking period is over and before the dispute period has started


### `getPrice(address _asset) → uint256` (external)

get a live asset price from the asset's pricer contract




### `getExpiryPrice(address _asset, uint256 _expiryTimestamp) → uint256, bool` (external)

get the asset price at specific expiry timestamp




### `getPricer(address _asset) → address` (external)

get the pricer for an asset




### `getDisputer() → address` (external)

get the disputer address




### `getPricerLockingPeriod(address _pricer) → uint256` (external)

get a pricer's locking period
locking period is the period of time after the expiry timestamp where a price can not be pushed


during the locking period an expiry price can not be submitted to this contract


### `getPricerDisputePeriod(address _pricer) → uint256` (external)

get a pricer's dispute period
dispute period is the period of time after an expiry price has been pushed where a price can be disputed


during the dispute period, the disputer can dispute the submitted price and modify it


### `getChainlinkRoundData(address _asset, uint80 _roundId) → uint256, uint256` (external)

get historical asset price and timestamp


if asset is a stable asset, will return stored price and timestamp equal to block.timestamp


### `isLockingPeriodOver(address _asset, uint256 _expiryTimestamp) → bool` (public)

check if the locking period is over for setting the asset price at a particular expiry timestamp




### `isDisputePeriodOver(address _asset, uint256 _expiryTimestamp) → bool` (public)

check if the dispute period is over





### `DisputerUpdated(address newDisputer)`

emits an event when the disputer is updated



### `PricerUpdated(address asset, address pricer)`

emits an event when the pricer is updated for an asset



### `PricerLockingPeriodUpdated(address pricer, uint256 lockingPeriod)`

emits an event when the locking period is updated for a pricer



### `PricerDisputePeriodUpdated(address pricer, uint256 disputePeriod)`

emits an event when the dispute period is updated for a pricer



### `ExpiryPriceUpdated(address asset, uint256 expiryTimestamp, uint256 price, uint256 onchainTimestamp)`

emits an event when an expiry price is updated for a specific asset



### `ExpiryPriceDisputed(address asset, uint256 expiryTimestamp, uint256 disputedPrice, uint256 newPrice, uint256 disputeTimestamp)`

emits an event when the disputer disputes a price during the dispute period



### `StablePriceUpdated(address asset, uint256 price)`

emits an event when a stable asset price changes




### `Price`


uint256 price


uint256 timestamp



