## `Actions`

A library that provides a ActionArgs struct, sub types of Action structs, and functions to parse ActionArgs into specific Actions.
errorCode
A1 can only parse arguments for open vault actions
A2 cannot open vault for an invalid account
A3 cannot open vault with an invalid type
A4 can only parse arguments for mint actions
A5 cannot mint from an invalid account
A6 can only parse arguments for burn actions
A7 cannot burn from an invalid account
A8 can only parse arguments for deposit collateral action
A9 cannot deposit to an invalid account
A10 can only parse arguments for withdraw actions
A11 cannot withdraw from an invalid account
A12 cannot withdraw to an invalid account
A13 can only parse arguments for redeem actions
A14 cannot redeem to an invalid account
A15 can only parse arguments for settle vault actions
A16 cannot settle vault for an invalid account
A17 cannot withdraw payout to an invalid account
A18 can only parse arguments for liquidate action
A19 cannot liquidate vault for an invalid account owner
A20 cannot send collateral to an invalid account
A21 cannot parse liquidate action with no round id
A22 can only parse arguments for call actions
A23 target address cannot be address(0)
A24 amounts for minting onToken should be array with 1 element
A26 param "assets" should have 1 element for redeem action
A27 param "assets" first element should not be zero address for redeem action
A28 param "amounts" should have 1 element for redeem action
A29 param "amounts" first element should not be zero, cant redeem zero amount
A30 param "amounts" should be same length as param "assets"
A31 param "assets" should have 1 element for depositLong action
A32 param "amounts" should have 1 element for depositLong action
A33 param "amounts" should have 1 element for withdrawLong action
A34 param "amounts" should have 1 element for burnShort action
A35 param "assets" should have 1 element for burnShort action




### `_parseOpenVaultArgs(struct Actions.ActionArgs _args) → struct Actions.OpenVaultArgs` (internal)

parses the passed in action arguments to get the arguments for an open vault action




### `_parseMintArgs(struct Actions.ActionArgs _args) → struct Actions.MintArgs` (internal)

parses the passed in action arguments to get the arguments for a mint action




### `_parseBurnArgs(struct Actions.ActionArgs _args) → struct Actions.BurnArgs` (internal)

parses the passed in action arguments to get the arguments for a burn action




### `_parseDepositCollateralArgs(struct Actions.ActionArgs _args) → struct Actions.DepositCollateralArgs` (internal)

parses the passed in action arguments to get the arguments for a deposit action




### `_parseDepositLongArgs(struct Actions.ActionArgs _args) → struct Actions.DepositLongArgs` (internal)

parses the passed in action arguments to get the arguments for a deposit action




### `_parseWithdrawLongArgs(struct Actions.ActionArgs _args) → struct Actions.WithdrawLongArgs` (internal)

parses the passed in action arguments to get the arguments for a withdraw action




### `_parseWithdrawCollateralArgs(struct Actions.ActionArgs _args) → struct Actions.WithdrawCollateralArgs` (internal)

parses the passed in action arguments to get the arguments for a withdraw action




### `_parseRedeemArgs(struct Actions.ActionArgs _args) → struct Actions.RedeemArgs` (internal)

parses the passed in action arguments to get the arguments for an redeem action




### `_parseSettleVaultArgs(struct Actions.ActionArgs _args) → struct Actions.SettleVaultArgs` (internal)

parses the passed in action arguments to get the arguments for a settle vault action




### `_parseCallArgs(struct Actions.ActionArgs _args) → struct Actions.CallArgs` (internal)

parses the passed in action arguments to get the arguments for a call action






### `ActionArgs`


enum Actions.ActionType actionType


address owner


address secondAddress


address[] assets


uint256 vaultId


uint256[] amounts


bytes data


### `MintArgs`


address owner


uint256 vaultId


address to


uint256 amount


### `BurnArgs`


address owner


uint256 vaultId


uint256 amount


### `OpenVaultArgs`


address owner


address shortONtoken


uint256 vaultId


### `DepositCollateralArgs`


address owner


uint256 vaultId


address from


uint256[] amounts


### `DepositLongArgs`


address owner


uint256 vaultId


address from


address longONtoken


uint256 amount


### `RedeemArgs`


address receiver


address onToken


uint256 amount


### `WithdrawLongArgs`


address owner


uint256 vaultId


address to


uint256 amount


### `WithdrawCollateralArgs`


address owner


uint256 vaultId


address to


uint256[] amounts


### `SettleVaultArgs`


address owner


uint256 vaultId


address to


### `CallArgs`


address callee


bytes data



### `ActionType`
































