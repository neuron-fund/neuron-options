# OracleInterface

### isLockingPeriodOver

```solidity
function isLockingPeriodOver(address _asset, uint256 _expiryTimestamp) external view returns (bool)
```

### isDisputePeriodOver

```solidity
function isDisputePeriodOver(address _asset, uint256 _expiryTimestamp) external view returns (bool)
```

### getExpiryPrice

```solidity
function getExpiryPrice(address _asset, uint256 _expiryTimestamp) external view returns (uint256, bool)
```

### getDisputer

```solidity
function getDisputer() external view returns (address)
```

### getPricer

```solidity
function getPricer(address _asset) external view returns (address)
```

### getPrice

```solidity
function getPrice(address _asset) external view returns (uint256)
```

### getPricerLockingPeriod

```solidity
function getPricerLockingPeriod(address _pricer) external view returns (uint256)
```

### getPricerDisputePeriod

```solidity
function getPricerDisputePeriod(address _pricer) external view returns (uint256)
```

### getChainlinkRoundData

```solidity
function getChainlinkRoundData(address _asset, uint80 _roundId) external view returns (uint256, uint256)
```

### setAssetPricer

```solidity
function setAssetPricer(address _asset, address _pricer) external
```

### setLockingPeriod

```solidity
function setLockingPeriod(address _pricer, uint256 _lockingPeriod) external
```

### setDisputePeriod

```solidity
function setDisputePeriod(address _pricer, uint256 _disputePeriod) external
```

### setExpiryPrice

```solidity
function setExpiryPrice(address _asset, uint256 _expiryTimestamp, uint256 _price) external
```

### disputeExpiryPrice

```solidity
function disputeExpiryPrice(address _asset, uint256 _expiryTimestamp, uint256 _price) external
```

### setDisputer

```solidity
function setDisputer(address _disputer) external
```

