# Solidity API

## MarginVault

A library that provides the Controller with a Vault struct and the functions that manipulate vaults.
Vaults describe discrete position combinations of long options, short options, and collateral assets that a user can have.

### BASE

```solidity
uint256 BASE
```

### Vault

```solidity
struct Vault {
  address shortOtoken;
  address longOtoken;
  address[] collateralAssets;
  uint256 shortAmount;
  uint256 longAmount;
  uint256 usedLongAmount;
  uint256[] collateralAmounts;
  uint256[] reservedCollateralAmounts;
  uint256[] usedCollateralValues;
  uint256[] availableCollateralAmounts;
}
```

### addShort

```solidity
function addShort(struct MarginVault.Vault _vault, address _shortOtoken, uint256 _amount) external
```

_increase the short oToken balance in a vault when a new oToken is minted_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _vault | struct MarginVault.Vault | vault to add or increase the short position in |
| _shortOtoken | address | address of the _shortOtoken being minted from the user&#x27;s vault |
| _amount | uint256 | number of _shortOtoken being minted from the user&#x27;s vault |

### removeShort

```solidity
function removeShort(struct MarginVault.Vault _vault, address _shortOtoken, uint256 _amount, struct FPI.FixedPointInt _newCollateralRatio, uint256 _newUsedLongAmount) external returns (uint256[] freedCollateralAmounts, uint256[] freedCollateralValues)
```

_decrease the short oToken balance in a vault when an oToken is burned_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _vault | struct MarginVault.Vault | vault to decrease short position in |
| _shortOtoken | address | address of the _shortOtoken being reduced in the user&#x27;s vault |
| _amount | uint256 | number of _shortOtoken being reduced in the user&#x27;s vault |
| _newCollateralRatio | struct FPI.FixedPointInt | ratio representing how much of alreadt used collateral will be used after burn |
| _newUsedLongAmount | uint256 | new used long amount |

### toFPImulAndBack

```solidity
function toFPImulAndBack(uint256 _value, uint256 _decimals, struct FPI.FixedPointInt _multiplicator, bool roundDown) internal pure returns (uint256)
```

### addLong

```solidity
function addLong(struct MarginVault.Vault _vault, address _longOtoken, uint256 _amount) external
```

_increase the long oToken balance in a vault when an oToken is deposited_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _vault | struct MarginVault.Vault | vault to add a long position to |
| _longOtoken | address | address of the _longOtoken being added to the user&#x27;s vault |
| _amount | uint256 | number of _longOtoken the protocol is adding to the user&#x27;s vault |

### removeLong

```solidity
function removeLong(struct MarginVault.Vault _vault, address _longOtoken, uint256 _amount) external
```

_decrease the long oToken balance in a vault when an oToken is withdrawn_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _vault | struct MarginVault.Vault | vault to remove a long position from |
| _longOtoken | address | address of the _longOtoken being removed from the user&#x27;s vault |
| _amount | uint256 | number of _longOtoken the protocol is removing from the user&#x27;s vault |

### addCollaterals

```solidity
function addCollaterals(struct MarginVault.Vault _vault, address[] _collateralAssets, uint256[] _amounts) external
```

_increase the collaterals balances in a vault_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _vault | struct MarginVault.Vault | vault to add collateral to |
| _collateralAssets | address[] | addresses of the _collateralAssets being added to the user&#x27;s vault |
| _amounts | uint256[] | number of _collateralAssets being added to the user&#x27;s vault |

### removeCollateral

```solidity
function removeCollateral(struct MarginVault.Vault _vault, uint256[] _amounts) external
```

_decrease the collateral balance in a vault_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _vault | struct MarginVault.Vault | vault to remove collateral from |
| _amounts | uint256[] | number of _collateralAssets being removed from the user&#x27;s vault |

### useCollateralBulk

```solidity
function useCollateralBulk(struct MarginVault.Vault _vault, uint256[] _amounts, uint256 _usedLongAmount, uint256[] _reservedCollateralValues) external
```

