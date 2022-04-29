## `MarginVault`

A library that provides the Controller with a Vault struct and the functions that manipulate vaults.
Vaults describe discrete position combinations of long options, short options, and collateral assets that a user can have.




### `addShort(struct MarginVault.Vault _vault, address _shortONtoken, uint256 _amount)` (external)



increase the short onToken balance in a vault when a new onToken is minted


### `removeShort(struct MarginVault.Vault _vault, address _shortONtoken, uint256 _amount, struct FPI.FixedPointInt _newCollateralRatio, uint256 _newUsedLongAmount) → uint256[] freedCollateralAmounts, uint256[] freedCollateralValues` (external)



decrease the short onToken balance in a vault when an onToken is burned


### `toFPImulAndBack(uint256 _value, uint256 _decimals, struct FPI.FixedPointInt _multiplicator, bool roundDown) → uint256` (internal)



helper function to transform uint256 to FPI multiply by another FPI and transform back to uint256

### `addLong(struct MarginVault.Vault _vault, address _longONtoken, uint256 _amount)` (external)



increase the long onToken balance in a vault when an onToken is deposited


### `removeLong(struct MarginVault.Vault _vault, address _longONtoken, uint256 _amount)` (external)



decrease the long onToken balance in a vault when an onToken is withdrawn


### `addCollaterals(struct MarginVault.Vault _vault, address[] _collateralAssets, uint256[] _amounts)` (external)



increase the collaterals balances in a vault


### `removeCollateral(struct MarginVault.Vault _vault, uint256[] _amounts)` (external)



decrease the collateral balance in a vault


### `useVaultsAssets(struct MarginVault.Vault _vault, uint256[] _amounts, uint256 _usedLongAmount, uint256[] _usedCollateralValues)` (external)



decrease vaults avalaible collateral and long to update vaults used assets data
used when vaults mint option to lock provided assets




### `Vault`


address shortONtoken


address longONtoken


address[] collateralAssets


uint256 shortAmount


uint256 longAmount


uint256 usedLongAmount


uint256[] collateralAmounts


uint256[] reservedCollateralAmounts


uint256[] usedCollateralValues


uint256[] availableCollateralAmounts



