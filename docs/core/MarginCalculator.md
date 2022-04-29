## `MarginCalculator`

Calculator module that checks if a given vault is valid, calculates margin requirements, and settlement proceeds




### `constructor(address _oracle)` (public)

constructor




### `getPayout(address _onToken, uint256 _amount) → uint256[]` (public)

get an onToken's payout/cash value after expiry, in the collateral asset




### `getExpiredPayoutRate(address _onToken) → uint256[] collateralsPayoutRate` (public)

return the cash value of an expired onToken, denominated in collateral




### `getExcessCollateral(struct MarginVault.Vault _vault) → uint256[]` (external)

returns the amount of collateral that can be removed from an actual or a theoretical vault


return amount is denominated in the collateral asset for the onToken in the vault, or the collateral asset in the vault


### `_getExcessCollateral(struct MarginCalculator.VaultDetails vaultDetails, uint256[] shortPayoutsRaw, uint256[] onTokenCollateralsValues, uint256 onTokenCollaterizedTotalAmount) → uint256[]` (internal)





### `uint256ArraySum(uint256[] _array) → uint256` (internal)

calculates sum of uint256 array




### `uint256ArraysAdd(uint256[] _array, uint256[] _array2) → uint256[]` (internal)

calculates sum of uint256 array with corresponing elemnt of second array




### `_getExpiredCashValue(address _underlying, address _strike, uint256 _expiryTimestamp, uint256 _strikePrice, bool _isPut) → struct FPI.FixedPointInt` (internal)

return the cash value of an expired onToken, denominated in strike asset


for a call, return Max (0, underlyingPriceInStrike - onToken.strikePrice)
for a put, return Max(0, onToken.strikePrice - underlyingPriceInStrike)


### `_convertAmountOnLivePrice(struct FPI.FixedPointInt _amount, address _assetA, address _assetB) → struct FPI.FixedPointInt` (internal)

convert an amount in asset A to equivalent amount of asset B, based on a live price


function includes the amount and applies .mul() first to increase the accuracy


### `_convertAmountOnExpiryPrice(struct FPI.FixedPointInt _amount, address _assetA, address _assetB, uint256 _expiry) → struct FPI.FixedPointInt` (internal)

convert an amount in asset A to equivalent amount of asset B, based on an expiry price


function includes the amount and apply .mul() first to increase the accuracy


### `_getVaultDetails(struct MarginVault.Vault _vault) → struct MarginCalculator.VaultDetails` (internal)

get vault details to save us from making multiple external calls




### `_getExpiredSpreadCashValue(struct FPI.FixedPointInt _shortAmount, struct FPI.FixedPointInt _longAmount, struct FPI.FixedPointInt _shortCashValue, struct FPI.FixedPointInt _longCashValue) → struct FPI.FixedPointInt` (internal)



calculate the cash value obligation for an expired vault, where a positive number is an obligation

Formula: net = (short cash value * short amount) - ( long cash value * long Amount )



### `isMarginableLong(address longONtokenAddress, struct MarginVault.Vault _vault) → bool` (external)

if there is a short option and a long option in the vault,
ensure that the long option is able to be used as collateral for the short option




### `_getProductHash(address _underlying, address _strike, address[] _collaterals, bool _isPut) → bytes32` (internal)

get a product hash




### `_getCashValue(struct FPI.FixedPointInt _strikePrice, struct FPI.FixedPointInt _underlyingPrice, bool _isPut) → struct FPI.FixedPointInt` (internal)

get option cash value


this assume that the underlying price is denominated in strike asset
cash value = max(underlying price - strike price, 0)


### `_getONtokenDetails(address _onToken) → address[], uint256[], uint256[], uint256[], address, address, uint256, uint256, bool, uint256` (internal)



get onToken detail

### `_getONtokenDetailsStruct(address _onToken) → struct MarginCalculator.ONTokenDetails` (internal)



same as _getONtokenDetails but returns struct, usefull to avoid stack too deep

### `getAfterBurnCollateralRatio(struct MarginVault.Vault _vault, uint256 _shortBurnAmount) → struct FPI.FixedPointInt, uint256` (external)



return ratio which represends how much of already used collateral will be used after burn


### `_getAfterBurnCollateralRatio(struct MarginCalculator.VaultDetails _vaultDetails, uint256 _shortBurnAmount) → struct FPI.FixedPointInt, uint256` (internal)





### `getMaxShortAmount(struct MarginVault.Vault _vault) → uint256` (external)

calculates maximal short amount can be minted for collateral and long in a given vault




### `getCollateralsToCoverShort(struct MarginVault.Vault _vault, uint256 _shortAmount) → uint256[], uint256[], uint256[], uint256` (external)

calculates collateral required to mint amount of onToken for a given vault




### `_getValueRequired(struct MarginCalculator.VaultDetails _vaultDetails, uint256 _shortAmount, uint256 _longAmount) → struct FPI.FixedPointInt, struct FPI.FixedPointInt` (internal)

calculates how much value of collaterals denominated in strike asset
required to mint short amount with for provided vault and long amounts available




### `_getCollateralsToCoverShort(struct MarginCalculator.VaultDetails _vaultDetails, uint256 _shortAmount) → uint256[], uint256[], uint256[], uint256` (internal)

calculates collateral amounts, values required and used (including long)
required to mint amount of onToken for a given vault




### `_getCollateralsToCoverValue(struct MarginCalculator.VaultDetails _vaultDetails, struct FPI.FixedPointInt _valueRequired, struct FPI.FixedPointInt _toUseLongAmount) → uint256[], uint256[], uint256[], uint256[]` (internal)

calculates vault's deposited collateral amounts and values
required to cover provided value (denominated in strike asset) for a given vault




### `_calculateVaultAvailableCollateralsValues(struct MarginCalculator.VaultDetails _vaultDetails) → struct FPI.FixedPointInt[], struct FPI.FixedPointInt[], struct FPI.FixedPointInt` (internal)

calculates vault's available collateral amounts value and total value of all collateral
not including value and amounts from vault's long, values are denominated in strike asset




### `_getPutSpreadMarginRequired(uint256 _shortAmount, uint256 _longAmount, uint256 _shortStrike, uint256 _longStrike) → struct FPI.FixedPointInt, struct FPI.FixedPointInt` (internal)



returns the strike asset amount of margin required for a put or put spread with the given short onTokens, long onTokens and amounts

marginRequired = max( (short amount * short strike) - (long strike * min (short amount, long amount)) , 0 )



### `_getCallSpreadMarginRequired(uint256 _shortAmount, uint256 _longAmount, uint256 _shortStrike, uint256 _longStrike) → struct FPI.FixedPointInt, struct FPI.FixedPointInt` (internal)



returns the underlying asset amount required for a call or call spread with the given short onTokens, long onTokens, and amounts

                          (long strike - short strike) * short amount
marginRequired =  max( ------------------------------------------------- , max (short amount - long amount, 0) )
                                          long strike

if long strike = 0, return max( short amount - long amount, 0)


### `_calculateONtokenCollaterizationsOfAmount(address _onToken, struct FPI.FixedPointInt _amount) → uint256[], uint256[]` (internal)



calculates current onToken's amount collaterization with it's collaterals




### `VaultDetails`


uint256 shortAmount


uint256 longAmount


uint256 usedLongAmount


uint256 shortStrikePrice


uint256 longStrikePrice


uint256 expiryTimestamp


address shortONtoken


bool isPut


bool hasLong


address longONtoken


address underlyingAsset


address strikeAsset


address[] collateralAssets


uint256[] collateralAmounts


uint256[] reservedCollateralAmounts


uint256[] availableCollateralAmounts


uint256[] collateralsDecimals


uint256[] usedCollateralValues


### `ONTokenDetails`


address[] collaterals


uint256[] collateralsAmounts


uint256[] collateralsValues


uint256[] collateralsDecimals


address underlying


address strikeAsset


uint256 strikePrice


uint256 expiry


bool isPut


uint256 collaterizedTotalAmount


### `ShortScaledDetails`


struct FPI.FixedPointInt shortAmount


struct FPI.FixedPointInt shortStrike


struct FPI.FixedPointInt shortUnderlyingPrice


### `ONtokenDetails`


address[] collateralAssets


uint256[] collateralsAmounts


uint256[] collateralsValues


uint256[] collateralsDecimals


address underlyingAsset


address strikeAsset


uint256 strikePrice


uint256 expiryTimestamp


bool isPut


uint256 collaterizedTotalAmount



