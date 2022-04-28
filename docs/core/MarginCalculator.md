# MarginCalculator

Calculator module that checks if a given vault is valid, calculates margin requirements, and settlement proceeds

### BASE

```solidity
uint256 BASE
```

_decimals used by strike price and oracle price_

### AUCTION_TIME

```solidity
uint256 AUCTION_TIME
```

auction length

### VaultDetails

```solidity
struct VaultDetails {
  uint256 shortAmount;
  uint256 longAmount;
  uint256 usedLongAmount;
  uint256 shortStrikePrice;
  uint256 longStrikePrice;
  uint256 expiryTimestamp;
  address shortOtoken;
  bool isPut;
  bool hasLong;
  address longOtoken;
  address underlyingAsset;
  address strikeAsset;
  address[] collateralAssets;
  uint256[] collateralAmounts;
  uint256[] reservedCollateralAmounts;
  uint256[] availableCollateralAmounts;
  uint256[] collateralsDecimals;
  uint256[] usedCollateralValues;
}
```

### OTokenDetails

```solidity
struct OTokenDetails {
  address[] collaterals;
  uint256[] collateralsAmounts;
  uint256[] collateralsValues;
  uint256[] collateralsDecimals;
  address underlying;
  address strikeAsset;
  uint256 strikePrice;
  uint256 expiry;
  bool isPut;
  uint256 collaterizedTotalAmount;
}
```

### ZERO

```solidity
struct FPI.FixedPointInt ZERO
```

_FixedPoint 0_

### dust

```solidity
mapping(address &#x3D;&gt; uint256) dust
```

_mapping to store dust amount per option collateral asset (scaled by collateral asset decimals)_

### timesToExpiryForProduct

```solidity
mapping(bytes32 &#x3D;&gt; uint256[]) timesToExpiryForProduct
```

_mapping to store array of time to expiry for a given product_

### maxPriceAtTimeToExpiry

```solidity
mapping(bytes32 &#x3D;&gt; mapping(uint256 &#x3D;&gt; uint256)) maxPriceAtTimeToExpiry
```

_mapping to store option upper bound value at specific time to expiry for a given product (1e27)_

### oracle

```solidity
contract OracleInterface oracle
```

_oracle module_

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

### constructor

```solidity
constructor(address _oracle) public
```

constructor

| Name | Type | Description |
| ---- | ---- | ----------- |
| _oracle | address | oracle module address |

### setCollateralDust

```solidity
function setCollateralDust(address _collateral, uint256 _dust) external
```

set dust amount for collateral asset

_can only be called by owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _collateral | address | collateral asset address |
| _dust | uint256 | dust amount, should be scaled by collateral asset decimals |

### setUpperBoundValues

```solidity
function setUpperBoundValues(address _underlying, address _strike, address[] _collaterals, bool _isPut, uint256[] _timesToExpiry, uint256[] _values) external
```

set product upper bound values

_can only be called by owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlying | address | otoken underlying asset |
| _strike | address | otoken strike asset |
| _collaterals | address[] | otoken collateral asset |
| _isPut | bool | otoken type |
| _timesToExpiry | uint256[] | array of times to expiry timestamp |
| _values | uint256[] | upper bound values array |

### updateUpperBoundValue

```solidity
function updateUpperBoundValue(address _underlying, address _strike, address[] _collaterals, bool _isPut, uint256 _timeToExpiry, uint256 _value) external
```

set option upper bound value for specific time to expiry (1e27)

_can only be called by owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlying | address | otoken underlying asset |
| _strike | address | otoken strike asset |
| _collaterals | address[] | otoken collateral asset |
| _isPut | bool | otoken type |
| _timeToExpiry | uint256 | option time to expiry timestamp |
| _value | uint256 | upper bound value |

### getCollateralDust

```solidity
function getCollateralDust(address _collateral) external view returns (uint256)
```

get dust amount for collateral asset

| Name | Type | Description |
| ---- | ---- | ----------- |
| _collateral | address | collateral asset address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | dust amount |

### getTimesToExpiry

```solidity
function getTimesToExpiry(address _underlying, address _strike, address[] _collaterals, bool _isPut) external view returns (uint256[])
```

get times to expiry for a specific product

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlying | address | otoken underlying asset |
| _strike | address | otoken strike asset |
| _collaterals | address[] | otoken collateral asset |
| _isPut | bool | otoken type |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | array of times to expiry |

### getMaxPrice

```solidity
function getMaxPrice(address _underlying, address _strike, address[] _collaterals, bool _isPut, uint256 _timeToExpiry) external view returns (uint256)
```

get option upper bound value for specific time to expiry

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlying | address | otoken underlying asset |
| _strike | address | otoken strike asset |
| _collaterals | address[] | otoken collateral asset |
| _isPut | bool | otoken type |
| _timeToExpiry | uint256 | option time to expiry timestamp |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | option upper bound value (1e27) |

### getPayout

```solidity
function getPayout(address _otoken, uint256 _amount) public view returns (uint256[])
```

get an oToken&#x27;s payout/cash value after expiry, in the collateral asset

| Name | Type | Description |
| ---- | ---- | ----------- |
| _otoken | address | oToken address |
| _amount | uint256 | amount of the oToken to calculate the payout for, always represented in 1e8 |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | amount of collateral to pay out for provided amount rate |

### getExpiredPayoutRate

```solidity
function getExpiredPayoutRate(address _otoken) public view returns (uint256[] collateralsPayoutRate)
```

return the cash value of an expired oToken, denominated in collateral

| Name | Type | Description |
| ---- | ---- | ----------- |
| _otoken | address | oToken address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateralsPayoutRate | uint256[] | how much collateral can be taken out by 1 otoken unit, scaled by 1e8, or how much collateral can be taken out for 1 (1e8) oToken |

### ShortScaledDetails

```solidity
struct ShortScaledDetails {
  struct FPI.FixedPointInt shortAmount;
  struct FPI.FixedPointInt shortStrike;
  struct FPI.FixedPointInt shortUnderlyingPrice;
}
```

### getExcessCollateral

```solidity
function getExcessCollateral(struct MarginVault.Vault _vault) external view returns (uint256[])
```

returns the amount of collateral that can be removed from an actual or a theoretical vault

_return amount is denominated in the collateral asset for the oToken in the vault, or the collateral asset in the vault_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _vault | struct MarginVault.Vault | theoretical vault that needs to be checked |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | excessCollateral the amount by which the margin is above or below the required amount |

### _getExcessCollateral

```solidity
function _getExcessCollateral(struct MarginCalculator.VaultDetails vaultDetails, uint256[] shortPayoutsRaw, uint256[] oTokenCollateralsValues, uint256 oTokenCollaterizedTotalAmount) internal view returns (uint256[])
```

### uint256ArraySum

```solidity
function uint256ArraySum(uint256[] _array) internal pure returns (uint256)
```

calculates sum of uint256 array

| Name | Type | Description |
| ---- | ---- | ----------- |
| _array | uint256[] | uint256[] memory |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | uint256 sum of all elements in _array |

### uint256ArraysAdd

```solidity
function uint256ArraysAdd(uint256[] _array, uint256[] _array2) internal pure returns (uint256[])
```

calculates sum of uint256 array with corresponing elemnt of second array

| Name | Type | Description |
| ---- | ---- | ----------- |
| _array | uint256[] | uint256[] memory |
| _array2 | uint256[] | uint256[] memory |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | uint256[] memory array with elements sum of input arrays |

### _getExpiredCashValue

```solidity
function _getExpiredCashValue(address _underlying, address _strike, uint256 _expiryTimestamp, uint256 _strikePrice, bool _isPut) internal view returns (struct FPI.FixedPointInt)
```

return the cash value of an expired oToken, denominated in strike asset

_for a call, return Max (0, underlyingPriceInStrike - otoken.strikePrice)
for a put, return Max(0, otoken.strikePrice - underlyingPriceInStrike)_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlying | address | otoken underlying asset |
| _strike | address | otoken strike asset |
| _expiryTimestamp | uint256 | otoken expiry timestamp |
| _strikePrice | uint256 | otoken strike price |
| _isPut | bool |  |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | cash value of an expired otoken, denominated in the strike asset |

### OtokenDetails

```solidity
struct OtokenDetails {
  address[] collateralAssets;
  uint256[] collateralsAmounts;
  uint256[] collateralsValues;
  uint256[] collateralsDecimals;
  address underlyingAsset;
  address strikeAsset;
  uint256 strikePrice;
  uint256 expiryTimestamp;
  bool isPut;
  uint256 collaterizedTotalAmount;
}
```

### _convertAmountOnLivePrice

```solidity
function _convertAmountOnLivePrice(struct FPI.FixedPointInt _amount, address _assetA, address _assetB) internal view returns (struct FPI.FixedPointInt)
```

convert an amount in asset A to equivalent amount of asset B, based on a live price

_function includes the amount and applies .mul() first to increase the accuracy_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | struct FPI.FixedPointInt | amount in asset A |
| _assetA | address | asset A |
| _assetB | address | asset B |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | _amount in asset B |

### _convertAmountOnExpiryPrice

```solidity
function _convertAmountOnExpiryPrice(struct FPI.FixedPointInt _amount, address _assetA, address _assetB, uint256 _expiry) internal view returns (struct FPI.FixedPointInt)
```

convert an amount in asset A to equivalent amount of asset B, based on an expiry price

_function includes the amount and apply .mul() first to increase the accuracy_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _amount | struct FPI.FixedPointInt | amount in asset A |
| _assetA | address | asset A |
| _assetB | address | asset B |
| _expiry | uint256 |  |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | _amount in asset B |

### _getVaultDetails

```solidity
function _getVaultDetails(struct MarginVault.Vault _vault) internal view returns (struct MarginCalculator.VaultDetails)
```

get vault details to save us from making multiple external calls

| Name | Type | Description |
| ---- | ---- | ----------- |
| _vault | struct MarginVault.Vault | vault struct |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct MarginCalculator.VaultDetails | vault details in VaultDetails struct |

### _getExpiredSpreadCashValue

```solidity
function _getExpiredSpreadCashValue(struct FPI.FixedPointInt _shortAmount, struct FPI.FixedPointInt _longAmount, struct FPI.FixedPointInt _shortCashValue, struct FPI.FixedPointInt _longCashValue) internal pure returns (struct FPI.FixedPointInt)
```

_calculate the cash value obligation for an expired vault, where a positive number is an obligation

Formula: net &#x3D; (short cash value * short amount) - ( long cash value * long Amount )_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | cash value obligation denominated in the strike asset |

### _isNotEmpty

```solidity
function _isNotEmpty(address[] _assets) internal pure returns (bool)
```

_check if asset array contain a token address_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the array is not empty |

### _checkIsValidVault

```solidity
function _checkIsValidVault(struct MarginVault.Vault _vault, struct MarginCalculator.VaultDetails _vaultDetails) internal pure
```

_ensure that:
a) at most 1 asset type used as collateral
b) at most 1 series of option used as the long option
c) at most 1 series of option used as the short option
d) asset array lengths match for long, short and collateral
e) long option and collateral asset is acceptable for margin with short asset_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _vault | struct MarginVault.Vault | the vault to check |
| _vaultDetails | struct MarginCalculator.VaultDetails | vault details struct |

### isMarginableLong

```solidity
function isMarginableLong(address longOtokenAddress, struct MarginVault.Vault _vault) external view returns (bool)
```

_if there is a short option and a long option in the vault, ensure that the long option is able to be used as collateral for the short option_

| Name | Type | Description |
| ---- | ---- | ----------- |
| longOtokenAddress | address |  |
| _vault | struct MarginVault.Vault | the vault to check |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | true if long is marginable or false if not |

### _getProductHash

```solidity
function _getProductHash(address _underlying, address _strike, address[] _collaterals, bool _isPut) internal pure returns (bytes32)
```

get a product hash

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlying | address | option underlying asset |
| _strike | address | option strike asset |
| _collaterals | address[] | option collateral asset |
| _isPut | bool | option type |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bytes32 | product hash |

### _getCashValue

```solidity
function _getCashValue(struct FPI.FixedPointInt _strikePrice, struct FPI.FixedPointInt _underlyingPrice, bool _isPut) internal view returns (struct FPI.FixedPointInt)
```

get option cash value

_this assume that the underlying price is denominated in strike asset
cash value &#x3D; max(underlying price - strike price, 0)_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _strikePrice | struct FPI.FixedPointInt | option strike price |
| _underlyingPrice | struct FPI.FixedPointInt | option underlying price |
| _isPut | bool | option type, true for put and false for call option |

### _getOtokenDetails

```solidity
function _getOtokenDetails(address _otoken) internal view returns (address[], uint256[], uint256[], uint256[], address, address, uint256, uint256, bool, uint256)
```

_get otoken detail, from both otoken versions_

### _getOtokenDetailsFull

```solidity
function _getOtokenDetailsFull(address _otoken) internal view returns (struct MarginCalculator.OTokenDetails)
```

### getAfterBurnCollateralRatio

```solidity
function getAfterBurnCollateralRatio(struct MarginVault.Vault _vault, uint256 _shortBurnAmount) external view returns (struct FPI.FixedPointInt, uint256)
```

### _getAfterBurnCollateralRatio

```solidity
function _getAfterBurnCollateralRatio(struct MarginCalculator.VaultDetails _vaultDetails, uint256 _shortBurnAmount) internal view returns (struct FPI.FixedPointInt, uint256)
```

### getMaxShortAmount

```solidity
function getMaxShortAmount(struct MarginVault.Vault _vault) external view returns (uint256)
```

calculates maximal short amount can be minted for collateral in a given vault

### getCollateralRequired

```solidity
function getCollateralRequired(struct MarginVault.Vault _vault, uint256 _shortAmount) external view returns (uint256[], uint256[], uint256[], uint256)
```

calculates collateral required to mint amount of oToken for a given vault

### _getValueRequired

```solidity
function _getValueRequired(struct MarginCalculator.VaultDetails _vaultDetails, uint256 _shortAmount, uint256 _longAmount) internal view returns (struct FPI.FixedPointInt, struct FPI.FixedPointInt)
```

### _getCollateralRequired

```solidity
function _getCollateralRequired(struct MarginCalculator.VaultDetails _vaultDetails, uint256 _shortAmount) internal view returns (uint256[], uint256[], uint256[], uint256)
```

calculates collateral required to mint amount of oToken for a given vault

### _calculateCollateralsRequired

```solidity
function _calculateCollateralsRequired(struct MarginCalculator.VaultDetails _vaultDetails, struct FPI.FixedPointInt _valueRequired, struct FPI.FixedPointInt _usedLongAmount) internal view returns (uint256[], uint256[], uint256[], uint256[])
```

### _calculateVaultAvailableCollateralsValues

```solidity
function _calculateVaultAvailableCollateralsValues(struct MarginCalculator.VaultDetails _vaultDetails) internal view returns (struct FPI.FixedPointInt[], struct FPI.FixedPointInt[], struct FPI.FixedPointInt)
```

### _getPutSpreadMarginRequired

```solidity
function _getPutSpreadMarginRequired(uint256 _shortAmount, uint256 _longAmount, uint256 _shortStrike, uint256 _longStrike) internal view returns (struct FPI.FixedPointInt, struct FPI.FixedPointInt)
```

_returns the strike asset amount of margin required for a put or put spread with the given short oTokens, long oTokens and amounts

marginRequired &#x3D; max( (short amount * short strike) - (long strike * min (short amount, long amount)) , 0 )_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | margin requirement denominated in the strike asset |
| [1] | struct FPI.FixedPointInt |  |

### _getCallSpreadMarginRequired

```solidity
function _getCallSpreadMarginRequired(uint256 _shortAmount, uint256 _longAmount, uint256 _shortStrike, uint256 _longStrike) internal view returns (struct FPI.FixedPointInt, struct FPI.FixedPointInt)
```

_returns the underlying asset amount required for a call or call spread with the given short oTokens, long oTokens, and amounts

                          (long strike - short strike) * short amount
marginRequired &#x3D;  max( ------------------------------------------------- , max (short amount - long amount, 0) )
                                          long strike

if long strike &#x3D; 0, return max( short amount - long amount, 0)_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct FPI.FixedPointInt | margin requirement denominated in the underlying asset |
| [1] | struct FPI.FixedPointInt |  |

### _calculateOtokenCollaterizationsOfAmount

```solidity
function _calculateOtokenCollaterizationsOfAmount(address _otoken, struct FPI.FixedPointInt _amount) internal view returns (uint256[], uint256[])
```

