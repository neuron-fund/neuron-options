# Solidity API

## MarginCalculatorInterface

### CollateralDustUpdated

```solidity
event CollateralDustUpdated(address collateral, uint256 dust)
```

emits an event when collateral dust is updated

### TimeToExpiryAdded

```solidity
event TimeToExpiryAdded(bytes32 productHash, uint256 timeToExpiry)
```

emits an event when new time to expiry is added for a specific product

### MaxPriceAdded

```solidity
event MaxPriceAdded(bytes32 productHash, uint256 timeToExpiry, uint256 value)
```

emits an event when new upper bound value is added for a specific time to expiry timestamp

### MaxPriceUpdated

```solidity
event MaxPriceUpdated(bytes32 productHash, uint256 timeToExpiry, uint256 oldValue, uint256 newValue)
```

emits an event when updating upper bound value at specific expiry timestamp

### AUCTION_TIME

```solidity
function AUCTION_TIME() external view returns (uint256)
```

### getAfterBurnCollateralRatio

```solidity
function getAfterBurnCollateralRatio(struct MarginVault.Vault _vault, uint256 _shortBurnAmount) external view returns (struct FPI.FixedPointInt, uint256)
```

### getCollateralRequired

```solidity
function getCollateralRequired(struct MarginVault.Vault _vault, uint256 _amount) external view returns (uint256[] collateralsAmountsRequired, uint256[] collateralsAmountsUsed, uint256[] collateralsValuesUsed, uint256 usedLongAmount)
```

### _getCollateralizationRatio

```solidity
function _getCollateralizationRatio(address _otoken, address _collateralAsset) external view returns (struct FPI.FixedPointInt)
```

### getCollateralDust

```solidity
function getCollateralDust(address _collateral) external view returns (uint256)
```

### isMarginableLong

```solidity
function isMarginableLong(address longOtokenAddress, struct MarginVault.Vault _vault) external view returns (bool)
```

### getExcessCollateral

```solidity
function getExcessCollateral(struct MarginVault.Vault _vault) external view returns (uint256[])
```

### getExpiredPayoutRate

```solidity
function getExpiredPayoutRate(address _otoken) external view returns (uint256[])
```

### getMaxShortAmount

```solidity
function getMaxShortAmount(struct MarginVault.Vault _vault) external view returns (uint256)
```

### getMaxPrice

```solidity
function getMaxPrice(address _underlying, address _strike, address[] _collaterals, bool _isPut, uint256 _timeToExpiry) external view returns (uint256)
```

### getPayout

```solidity
function getPayout(address _otoken, uint256 _amount) external view returns (uint256[])
```

### getTimesToExpiry

```solidity
function getTimesToExpiry(address _underlying, address _strike, address[] _collaterals, bool _isPut) external view returns (uint256[])
```

### oracle

```solidity
function oracle() external view returns (address)
```

### owner

```solidity
function owner() external view returns (address)
```

### renounceOwnership

```solidity
function renounceOwnership() external
```

### setCollateralDust

```solidity
function setCollateralDust(address _collateral, uint256 _dust) external
```

### setUpperBoundValues

```solidity
function setUpperBoundValues(address _underlying, address _strike, address[] _collaterals, bool _isPut, uint256[] _timesToExpiry, uint256[] _values) external
```

### transferOwnership

```solidity
function transferOwnership(address newOwner) external
```

### updateUpperBoundValue

```solidity
function updateUpperBoundValue(address _underlying, address _strike, address[] _collaterals, bool _isPut, uint256 _timeToExpiry, uint256 _value) external
```

## FixedPointInt256

### FixedPointInt

```solidity
struct FixedPointInt {
  int256 value;
}
```

