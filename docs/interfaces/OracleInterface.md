## `OracleInterface`






### `isLockingPeriodOver(address _asset, uint256 _expiryTimestamp) → bool` (external)





### `isDisputePeriodOver(address _asset, uint256 _expiryTimestamp) → bool` (external)





### `getExpiryPrice(address _asset, uint256 _expiryTimestamp) → uint256, bool` (external)





### `getDisputer() → address` (external)





### `getPricer(address _asset) → address` (external)





### `getPrice(address _asset) → uint256` (external)





### `getPricerLockingPeriod(address _pricer) → uint256` (external)





### `getPricerDisputePeriod(address _pricer) → uint256` (external)





### `getChainlinkRoundData(address _asset, uint80 _roundId) → uint256, uint256` (external)





### `setAssetPricer(address _asset, address _pricer)` (external)





### `setLockingPeriod(address _pricer, uint256 _lockingPeriod)` (external)





### `setDisputePeriod(address _pricer, uint256 _disputePeriod)` (external)





### `setExpiryPrice(address _asset, uint256 _expiryTimestamp, uint256 _price)` (external)





### `disputeExpiryPrice(address _asset, uint256 _expiryTimestamp, uint256 _price)` (external)





### `setDisputer(address _disputer)` (external)








