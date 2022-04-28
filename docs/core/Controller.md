# Controller

Contract that controls the Gamma Protocol and the interaction of all sub contracts

### addressbook

```solidity
contract AddressBookInterface addressbook
```

### whitelist

```solidity
contract WhitelistInterface whitelist
```

### oracle

```solidity
contract OracleInterface oracle
```

### calculator

```solidity
contract MarginCalculatorInterface calculator
```

### pool

```solidity
contract MarginPoolInterface pool
```

### BASE

```solidity
uint256 BASE
```

_scale used in MarginCalculator_

### partialPauser

```solidity
address partialPauser
```

address that has permission to partially pause the system, where system functionality is paused
except redeem and settleVault

### fullPauser

```solidity
address fullPauser
```

address that has permission to fully pause the system, where all system functionality is paused

### systemPartiallyPaused

```solidity
bool systemPartiallyPaused
```

True if all system functionality is paused other than redeem and settle vault

### systemFullyPaused

```solidity
bool systemFullyPaused
```

True if all system functionality is paused

### callRestricted

```solidity
bool callRestricted
```

True if a call action can only be executed to a whitelisted callee

### accountVaultCounter

```solidity
mapping(address &#x3D;&gt; uint256) accountVaultCounter
```

_mapping between an owner address and the number of owner address vaults_

### vaults

```solidity
mapping(address &#x3D;&gt; mapping(uint256 &#x3D;&gt; struct MarginVault.Vault)) vaults
```

_mapping between an owner address and a specific vault using a vault id_

### operators

```solidity
mapping(address &#x3D;&gt; mapping(address &#x3D;&gt; bool)) operators
```

_mapping between an account owner and their approved or unapproved account operators_

### vaultLatestUpdate

```solidity
mapping(address &#x3D;&gt; mapping(uint256 &#x3D;&gt; uint256)) vaultLatestUpdate
```

_mapping to store the timestamp at which the vault was last updated, will be updated in every action that changes the vault state or when calling sync()_

### AccountOperatorUpdated

```solidity
event AccountOperatorUpdated(address accountOwner, address operator, bool isSet)
```

emits an event when an account operator is updated for a specific account owner

### VaultOpened

```solidity
event VaultOpened(address accountOwner, uint256 vaultId)
```

emits an event when a new vault is opened

### LongOtokenDeposited

```solidity
event LongOtokenDeposited(address otoken, address accountOwner, address from, uint256 vaultId, uint256 amount)
```

emits an event when a long oToken is deposited into a vault

### LongOtokenWithdrawed

```solidity
event LongOtokenWithdrawed(address otoken, address accountOwner, address to, uint256 vaultId, uint256 amount)
```

emits an event when a long oToken is withdrawn from a vault

### CollateralAssetDeposited

```solidity
event CollateralAssetDeposited(address asset, address accountOwner, address from, uint256 vaultId, uint256 amount)
```

emits an event when a collateral asset is deposited into a vault

### CollateralAssetWithdrawed

```solidity
event CollateralAssetWithdrawed(address asset, address accountOwner, address to, uint256 vaultId, uint256 amount)
```

emits an event when a collateral asset is withdrawn from a vault

### ShortOtokenMinted

```solidity
event ShortOtokenMinted(address otoken, address accountOwner, address to, uint256 vaultId, uint256 amount)
```

emits an event when a short oToken is minted from a vault

### ShortOtokenBurned

```solidity
event ShortOtokenBurned(address otoken, address accountOwner, address sender, uint256 vaultId, uint256 amount)
```

emits an event when a short oToken is burned

### Redeem

```solidity
event Redeem(address otoken, address redeemer, address receiver, address[] collateralAssets, uint256 otokenBurned, uint256[] payouts)
```

emits an event when an oToken is redeemed

### VaultSettled

```solidity
event VaultSettled(address accountOwner, address shortOtoken, address to, uint256[] payouts, uint256 vaultId)
```

emits an event when a vault is settled

### VaultLiquidated

```solidity
event VaultLiquidated(address liquidator, address receiver, address vaultOwner, uint256 auctionPrice, uint256 auctionStartingRound, uint256 collateralPayout, uint256 debtAmount, uint256 vaultId)
```

emits an event when a vault is liquidated

### CallExecuted

```solidity
event CallExecuted(address from, address to, bytes data)
```

emits an event when a call action is executed

### FullPauserUpdated

```solidity
event FullPauserUpdated(address oldFullPauser, address newFullPauser)
```

emits an event when the fullPauser address changes

### PartialPauserUpdated

```solidity
event PartialPauserUpdated(address oldPartialPauser, address newPartialPauser)
```

emits an event when the partialPauser address changes

### SystemPartiallyPaused

```solidity
event SystemPartiallyPaused(bool isPaused)
```

emits an event when the system partial paused status changes

### SystemFullyPaused

```solidity
event SystemFullyPaused(bool isPaused)
```

emits an event when the system fully paused status changes

### CallRestricted

```solidity
event CallRestricted(bool isRestricted)
```

emits an event when the call action restriction changes

### Donated

```solidity
event Donated(address donator, address asset, uint256 amount)
```

emits an event when a donation transfer executed

### notPartiallyPaused

```solidity
modifier notPartiallyPaused()
```

modifier to check if the system is not partially paused, where only redeem and settleVault is allowed

### notFullyPaused

```solidity
modifier notFullyPaused()
```

modifier to check if the system is not fully paused, where no functionality is allowed

### onlyFullPauser

```solidity
modifier onlyFullPauser()
```

modifier to check if sender is the fullPauser address

### onlyPartialPauser

```solidity
modifier onlyPartialPauser()
```

modifier to check if the sender is the partialPauser address

### onlyAuthorized

```solidity
modifier onlyAuthorized(address _sender, address _accountOwner)
```

modifier to check if the sender is the account owner or an approved account operator

| Name | Type | Description |
| ---- | ---- | ----------- |
| _sender | address | sender address |
| _accountOwner | address | account owner address |

### onlyWhitelistedCallee

```solidity
modifier onlyWhitelistedCallee(address _callee)
```

modifier to check if the called address is a whitelisted callee address

| Name | Type | Description |
| ---- | ---- | ----------- |
| _callee | address | called address |

### _isNotPartiallyPaused

```solidity
function _isNotPartiallyPaused() internal view
```

_check if the system is not in a partiallyPaused state_

### _isNotFullyPaused

```solidity
function _isNotFullyPaused() internal view
```

_check if the system is not in an fullyPaused state_

### _isAuthorized

```solidity
function _isAuthorized(address _sender, address _accountOwner) internal view
```

_check if the sender is an authorized operator_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _sender | address | msg.sender |
| _accountOwner | address | owner of a vault |

### initialize

```solidity
function initialize(address _addressBook, address _owner) external
```

initalize the deployed contract

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addressBook | address | addressbook module |
| _owner | address | account owner address |

### donate

```solidity
function donate(address _asset, uint256 _amount) external
```

send asset amount to margin pool

_use donate() instead of direct transfer() to store the balance in assetBalance_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |
| _amount | uint256 | amount to donate to pool |

### setSystemPartiallyPaused

```solidity
function setSystemPartiallyPaused(bool _partiallyPaused) external
```

allows the partialPauser to toggle the systemPartiallyPaused variable and partially pause or partially unpause the system

_can only be called by the partialPauser_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _partiallyPaused | bool | new boolean value to set systemPartiallyPaused to |

### setSystemFullyPaused

```solidity
function setSystemFullyPaused(bool _fullyPaused) external
```

allows the fullPauser to toggle the systemFullyPaused variable and fully pause or fully unpause the system

_can only be called by the fullyPauser_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _fullyPaused | bool | new boolean value to set systemFullyPaused to |

### setFullPauser

```solidity
function setFullPauser(address _fullPauser) external
```

allows the owner to set the fullPauser address

_can only be called by the owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _fullPauser | address | new fullPauser address |

### setPartialPauser

```solidity
function setPartialPauser(address _partialPauser) external
```

allows the owner to set the partialPauser address

_can only be called by the owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _partialPauser | address | new partialPauser address |

### setCallRestriction

```solidity
function setCallRestriction(bool _isRestricted) external
```

allows the owner to toggle the restriction on whitelisted call actions and only allow whitelisted
call addresses or allow any arbitrary call addresses

_can only be called by the owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _isRestricted | bool | new call restriction state |

### setOperator

```solidity
function setOperator(address _operator, bool _isOperator) external
```

allows a user to give or revoke privileges to an operator which can act on their behalf on their vaults

_can only be updated by the vault owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _operator | address | operator that the sender wants to give privileges to or revoke them from |
| _isOperator | bool | new boolean value that expresses if the sender is giving or revoking privileges for _operator |

### refreshConfiguration

```solidity
function refreshConfiguration() external
```

_updates the configuration of the controller. can only be called by the owner_

### operate

```solidity
function operate(struct Actions.ActionArgs[] _actions) external
```

execute a number of actions on specific vaults

_can only be called when the system is not fully paused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _actions | struct Actions.ActionArgs[] | array of actions arguments |

### sync

```solidity
function sync(address _owner, uint256 _vaultId) external
```

sync vault latest update timestamp

_anyone can update the latest time the vault was touched by calling this function
vaultLatestUpdate will sync if the vault is well collateralized_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | vault owner address |
| _vaultId | uint256 | vault id |

### isOperator

```solidity
function isOperator(address _owner, address _operator) external view returns (bool)
```

check if a specific address is an operator for an owner account

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | account owner address |
| _operator | address | account operator address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the _operator is an approved operator for the _owner account |

### getProceed

```solidity
function getProceed(address _owner, uint256 _vaultId) external view returns (uint256[])
```

return a vault&#x27;s proceeds pre or post expiry, the amount of collateral that can be removed from a vault

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | account owner of the vault |
| _vaultId | uint256 | vaultId to return balances for |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256[] | amount of collateral that can be taken out |

### isSettlementAllowed

```solidity
function isSettlementAllowed(address _otoken) external view returns (bool)
```

_return if an expired oToken is ready to be settled, only true when price for underlying,
strike and collateral assets at this specific expiry is available in our Oracle module_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _otoken | address | oToken |

### canSettleAssets

```solidity
function canSettleAssets(address _underlying, address _strike, address[] _collaterals, uint256 _expiry) external view returns (bool)
```

_return if underlying, strike, collateral are all allowed to be settled_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _underlying | address | oToken underlying asset |
| _strike | address | oToken strike asset |
| _collaterals | address[] | oToken collateral assets |
| _expiry | uint256 | otoken expiry timestamp |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the oToken has expired AND all oracle prices at the expiry timestamp have been finalized, False if not |

### getVault

```solidity
function getVault(address _owner, uint256 _vaultId) external view returns (struct MarginVault.Vault)
```

return a specific vault

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | account owner |
| _vaultId | uint256 | vault id of vault to return |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct MarginVault.Vault | Vault struct that corresponds to the _vaultId of _owner |

### getVaultWithDetails

```solidity
function getVaultWithDetails(address _owner, uint256 _vaultId) public view returns (struct MarginVault.Vault, uint256)
```

return a specific vault

| Name | Type | Description |
| ---- | ---- | ----------- |
| _owner | address | account owner |
| _vaultId | uint256 | vault id of vault to return |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct MarginVault.Vault | Vault struct that corresponds to the _vaultId of _owner, vault type and the latest timestamp when the vault was updated |
| [1] | uint256 |  |

### _runActions

```solidity
function _runActions(struct Actions.ActionArgs[] _actions) internal returns (bool, address, uint256)
```

execute a variety of actions

_for each action in the action array, execute the corresponding action, only one vault can be modified
for all actions except SettleVault, Redeem, and Call_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _actions | struct Actions.ActionArgs[] | array of type Actions.ActionArgs[], which expresses which actions the user wants to execute |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | vaultUpdated, indicates if a vault has changed |
| [1] | address | owner, the vault owner if a vault has changed |
| [2] | uint256 | vaultId, the vault Id if a vault has changed |

### _openVault

```solidity
function _openVault(struct Actions.OpenVaultArgs _args) internal
```

open a new vault inside an account

_only the account owner or operator can open a vault, cannot be called when system is partiallyPaused or fullyPaused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.OpenVaultArgs | OpenVaultArgs structure |

### _depositLong

```solidity
function _depositLong(struct Actions.DepositLongArgs _args) internal
```

deposit a long oToken into a vault

_only the account owner or operator can deposit a long oToken, cannot be called when system is partiallyPaused or fullyPaused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.DepositLongArgs | DepositArgs structure |

### _withdrawLong

```solidity
function _withdrawLong(struct Actions.WithdrawLongArgs _args) internal
```

withdraw a long oToken from a vault

_only the account owner or operator can withdraw a long oToken, cannot be called when system is partiallyPaused or fullyPaused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.WithdrawLongArgs | WithdrawArgs structure |

### _depositCollateral

```solidity
function _depositCollateral(struct Actions.DepositCollateralArgs _args) internal
```

deposit a collateral asset into a vault

_only the account owner or operator can deposit collateral, cannot be called when system is partiallyPaused or fullyPaused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.DepositCollateralArgs | DepositArgs structure |

### _withdrawCollateral

```solidity
function _withdrawCollateral(struct Actions.WithdrawCollateralArgs _args) internal
```

withdraw a collateral asset from a vault

_only the account owner or operator can withdraw collateral, cannot be called when system is partiallyPaused or fullyPaused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.WithdrawCollateralArgs | WithdrawArgs structure |

### _mintOtoken

```solidity
function _mintOtoken(struct Actions.MintArgs _args) internal
```

mint short oTokens from a vault which creates an obligation that is recorded in the vault

_only the account owner or operator can mint an oToken, cannot be called when system is partiallyPaused or fullyPaused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.MintArgs | MintArgs structure |

### _burnOtoken

```solidity
function _burnOtoken(struct Actions.BurnArgs _args) internal
```

burn oTokens to reduce or remove the minted oToken obligation recorded in a vault

_only the account owner or operator can burn an oToken, cannot be called when system is partiallyPaused or fullyPaused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.BurnArgs | MintArgs structure |

### _redeem

```solidity
function _redeem(struct Actions.RedeemArgs _args) internal
```

redeem an oToken after expiry, receiving the payout of the oToken in the collateral asset

_cannot be called when system is fullyPaused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.RedeemArgs | RedeemArgs structure |

### _settleVault

```solidity
function _settleVault(struct Actions.SettleVaultArgs _args) internal
```

settle a vault after expiry, removing the net proceeds/collateral after both long and short oToken payouts have settled

_deletes a vault of vaultId after net proceeds/collateral is removed, cannot be called when system is fullyPaused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.SettleVaultArgs | SettleVaultArgs structure |

### _call

```solidity
function _call(struct Actions.CallArgs _args) internal
```

execute arbitrary calls

_cannot be called when system is partiallyPaused or fullyPaused_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.CallArgs | Call action |

### _checkVaultId

```solidity
function _checkVaultId(address _accountOwner, uint256 _vaultId) internal view returns (bool)
```

check if a vault id is valid for a given account owner address

| Name | Type | Description |
| ---- | ---- | ----------- |
| _accountOwner | address | account owner address |
| _vaultId | uint256 | vault id to check |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the _vaultId is valid, False if not |

### _getOtokenDetails

```solidity
function _getOtokenDetails(address _otoken) internal view returns (address[], address, address, uint256)
```

_get otoken detail, from both otoken versions_

### _canSettleAssets

```solidity
function _canSettleAssets(address _underlying, address _strike, address[] _collaterals, uint256 _expiry) internal view returns (bool)
```

_return if an expired oToken is ready to be settled, only true when price for underlying,
strike and collateral assets at this specific expiry is available in our Oracle module_

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | bool | True if the oToken has expired AND all oracle prices at the expiry timestamp have been finalized, False if not |

### _refreshConfigInternal

```solidity
function _refreshConfigInternal() internal
```

_updates the internal configuration of the controller_

