## `MarginCalculatorInterface`






### `getAfterBurnCollateralRatio(struct MarginVault.Vault _vault, uint256 _shortBurnAmount) → struct FPI.FixedPointInt, uint256` (external)





### `getCollateralsToCoverShort(struct MarginVault.Vault _vault, uint256 _shortAmount) → uint256[] collateralsAmountsRequired, uint256[] collateralsAmountsUsed, uint256[] collateralsValuesUsed, uint256 usedLongAmount` (external)





### `isMarginableLong(address longONtokenAddress, struct MarginVault.Vault _vault) → bool` (external)





### `getExcessCollateral(struct MarginVault.Vault _vault) → uint256[]` (external)





### `getExpiredPayoutRate(address _onToken) → uint256[]` (external)





### `getMaxShortAmount(struct MarginVault.Vault _vault) → uint256` (external)





### `getPayout(address _onToken, uint256 _amount) → uint256[]` (external)





### `oracle() → address` (external)





### `owner() → address` (external)





### `renounceOwnership()` (external)





### `transferOwnership(address newOwner)` (external)








