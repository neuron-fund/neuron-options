## `Controller`

Contract that controls the Gamma Protocol and the interaction of all sub contracts



### `notPartiallyPaused()`

modifier to check if the system is not partially paused, where only redeem and settleVault is allowed



### `notFullyPaused()`

modifier to check if the system is not fully paused, where no functionality is allowed



### `onlyFullPauser()`

modifier to check if sender is the fullPauser address



### `onlyPartialPauser()`

modifier to check if the sender is the partialPauser address



### `onlyAuthorized(address _sender, address _accountOwner)`

modifier to check if the sender is the account owner or an approved account operator




### `onlyWhitelistedCallee(address _callee)`

modifier to check if the called address is a whitelisted callee address





### `_isNotPartiallyPaused()` (internal)



check if the system is not in a partiallyPaused state

### `_isNotFullyPaused()` (internal)



check if the system is not in an fullyPaused state

### `_isAuthorized(address _sender, address _accountOwner)` (internal)



check if the sender is an authorized operator


### `initialize(address _addressBook, address _owner)` (external)

initalize the deployed contract




### `donate(address _asset, uint256 _amount)` (external)

send asset amount to margin pool


use donate() instead of direct transfer() to store the balance in assetBalance


### `setSystemPartiallyPaused(bool _partiallyPaused)` (external)

allows the partialPauser to toggle the systemPartiallyPaused variable and partially pause or partially unpause the system


can only be called by the partialPauser


### `setSystemFullyPaused(bool _fullyPaused)` (external)

allows the fullPauser to toggle the systemFullyPaused variable and fully pause or fully unpause the system


can only be called by the fullyPauser


### `setFullPauser(address _fullPauser)` (external)

allows the owner to set the fullPauser address


can only be called by the owner


### `setPartialPauser(address _partialPauser)` (external)

allows the owner to set the partialPauser address


can only be called by the owner


### `setCallRestriction(bool _isRestricted)` (external)

allows the owner to toggle the restriction on whitelisted call actions and only allow whitelisted
call addresses or allow any arbitrary call addresses


can only be called by the owner


### `setOperator(address _operator, bool _isOperator)` (external)

allows a user to give or revoke privileges to an operator which can act on their behalf on their vaults


can only be updated by the vault owner


### `refreshConfiguration()` (external)



updates the configuration of the controller. can only be called by the owner

### `operate(struct Actions.ActionArgs[] _actions)` (external)

execute a number of actions on specific vaults


can only be called when the system is not fully paused


### `sync(address _owner, uint256 _vaultId)` (external)

sync vault latest update timestamp


anyone can update the latest time the vault was touched by calling this function
vaultLatestUpdate will sync if the vault is well collateralized


### `isOperator(address _owner, address _operator) → bool` (external)

check if a specific address is an operator for an owner account




### `getProceed(address _owner, uint256 _vaultId) → uint256[]` (external)

return a vault's proceeds pre or post expiry, the amount of collateral that can be removed from a vault




### `isSettlementAllowed(address _onToken) → bool` (external)



return if an expired onToken is ready to be settled, only true when price for underlying,
strike and collateral assets at this specific expiry is available in our Oracle module


### `hasExpired(address _onToken) → bool` (external)

check if an onToken has expired




### `getVaultWithDetails(address _owner, uint256 _vaultId) → struct MarginVault.Vault, uint256` (public)

return a specific vault




### `_runActions(struct Actions.ActionArgs[] _actions) → bool, address, uint256` (internal)

execute a variety of actions


for each action in the action array, execute the corresponding action, only one vault can be modified
for all actions except SettleVault, Redeem, and Call


### `_openVault(struct Actions.OpenVaultArgs _args)` (internal)

open a new vault inside an account


only the account owner or operator can open a vault, cannot be called when system is partiallyPaused or fullyPaused


### `_depositLong(struct Actions.DepositLongArgs _args)` (internal)

deposit a long onToken into a vault


only the account owner or operator can deposit a long onToken, cannot be called when system is partiallyPaused or fullyPaused


### `_withdrawLong(struct Actions.WithdrawLongArgs _args)` (internal)

withdraw a long onToken from a vault


only the account owner or operator can withdraw a long onToken, cannot be called when system is partiallyPaused or fullyPaused


### `_depositCollateral(struct Actions.DepositCollateralArgs _args)` (internal)

deposit a collateral asset into a vault


only the account owner or operator can deposit collateral, cannot be called when system is partiallyPaused or fullyPaused


### `_withdrawCollateral(struct Actions.WithdrawCollateralArgs _args)` (internal)

withdraw a collateral asset from a vault


only the account owner or operator can withdraw collateral, cannot be called when system is partiallyPaused or fullyPaused


### `getMaxCollateratedShortAmount(address user, uint256 vault_id) → uint256` (external)

calculates maximal short amount can be minted for collateral in a given user and vault



### `_mintONtoken(struct Actions.MintArgs _args)` (internal)

mint short onTokens from a vault which creates an obligation that is recorded in the vault


only the account owner or operator can mint an onToken, cannot be called when system is partiallyPaused or fullyPaused


### `_burnONtoken(struct Actions.BurnArgs _args)` (internal)

burn onTokens to reduce or remove the minted onToken obligation recorded in a vault


only the account owner or operator can burn an onToken, cannot be called when system is partiallyPaused or fullyPaused


### `_redeem(struct Actions.RedeemArgs _args)` (internal)

redeem an onToken after expiry, receiving the payout of the onToken in the collateral asset


cannot be called when system is fullyPaused


### `_settleVault(struct Actions.SettleVaultArgs _args)` (internal)

settle a vault after expiry, removing the net proceeds/collateral after both long and short onToken payouts have settled


deletes a vault of vaultId after net proceeds/collateral is removed, cannot be called when system is fullyPaused


### `_call(struct Actions.CallArgs _args)` (internal)

execute arbitrary calls


cannot be called when system is partiallyPaused or fullyPaused


### `_checkVaultId(address _accountOwner, uint256 _vaultId) → bool` (internal)

check if a vault id is valid for a given account owner address




### `_isCalleeWhitelisted(address _callee) → bool` (internal)

return if a callee address is whitelisted or not




### `_getONtokenDetails(address _onToken) → address[], address, address, uint256` (internal)



get onToken detail


### `canSettleAssets(address _underlying, address _strike, address[] _collaterals, uint256 _expiry) → bool` (public)



return if underlying, strike, collateral are all allowed to be settled


### `_refreshConfigInternal()` (internal)



updates the internal configuration of the controller


### `AccountOperatorUpdated(address accountOwner, address operator, bool isSet)`

emits an event when an account operator is updated for a specific account owner



### `VaultOpened(address accountOwner, uint256 vaultId)`

emits an event when a new vault is opened



### `LongONtokenDeposited(address onToken, address accountOwner, address from, uint256 vaultId, uint256 amount)`

emits an event when a long onToken is deposited into a vault



### `LongONtokenWithdrawed(address onToken, address accountOwner, address to, uint256 vaultId, uint256 amount)`

emits an event when a long onToken is withdrawn from a vault



### `CollateralAssetDeposited(address asset, address accountOwner, address from, uint256 vaultId, uint256 amount)`

emits an event when a collateral asset is deposited into a vault



### `CollateralAssetWithdrawed(address asset, address accountOwner, address to, uint256 vaultId, uint256 amount)`

emits an event when a collateral asset is withdrawn from a vault



### `ShortONtokenMinted(address onToken, address accountOwner, address to, uint256 vaultId, uint256 amount)`

emits an event when a short onToken is minted from a vault



### `ShortONtokenBurned(address onToken, address accountOwner, address sender, uint256 vaultId, uint256 amount)`

emits an event when a short onToken is burned



### `Redeem(address onToken, address redeemer, address receiver, address[] collateralAssets, uint256 onTokenBurned, uint256[] payouts)`

emits an event when an onToken is redeemed



### `VaultSettled(address accountOwner, address shortONtoken, address to, uint256[] payouts, uint256 vaultId)`

emits an event when a vault is settled



### `CallExecuted(address from, address to, bytes data)`

emits an event when a call action is executed



### `FullPauserUpdated(address oldFullPauser, address newFullPauser)`

emits an event when the fullPauser address changes



### `PartialPauserUpdated(address oldPartialPauser, address newPartialPauser)`

emits an event when the partialPauser address changes



### `SystemPartiallyPaused(bool isPaused)`

emits an event when the system partial paused status changes



### `SystemFullyPaused(bool isPaused)`

emits an event when the system fully paused status changes



### `CallRestricted(bool isRestricted)`

emits an event when the call action restriction changes



### `Donated(address donator, address asset, uint256 amount)`

emits an event when a donation transfer executed





