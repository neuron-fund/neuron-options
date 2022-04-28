# Solidity API

## Actions

A library that provides a ActionArgs struct, sub types of Action structs, and functions to parse ActionArgs into specific Actions.
errorCode
A1 can only parse arguments for open vault actions
A2 cannot open vault for an invalid account
A3 cannot open vault with an invalid type
A4 can only parse arguments for mint actions
A5 cannot mint from an invalid account
A6 can only parse arguments for burn actions
A7 cannot burn from an invalid account
A8 can only parse arguments for deposit actions
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
A24 amounts for minting oToken should be array with 1 element
A26 param &quot;assets&quot; should have 1 element for redeem action
A27 param &quot;assets&quot; first element should not be zero address for redeem action
A28 param &quot;amounts&quot; should have 1 element for redeem action
A29 param &quot;amounts&quot; first element should not be zero, cant redeem zero amount
A30 param &quot;amounts&quot; should be same length as param &quot;assets&quot;
A31 param &quot;assets&quot; should have 1 element for depositLong action
A32 param &quot;amounts&quot; should have 1 element for depositLong action
A33 param &quot;amounts&quot; should have 1 element for withdrawLong action
A34 param &quot;amounts&quot; should have 1 element for burnShort action
A35 param &quot;assets&quot; should have 1 element for burnShort action

### ActionType

```solidity
enum ActionType {
  OpenVault,
  MintShortOption,
  BurnShortOption,
  DepositLongOption,
  WithdrawLongOption,
  DepositCollateral,
  WithdrawCollateral,
  SettleVault,
  Redeem,
  Call
}
```

### ActionArgs

```solidity
struct ActionArgs {
  enum Actions.ActionType actionType;
  address owner;
  address secondAddress;
  address[] assets;
  uint256 vaultId;
  uint256[] amounts;
  bytes data;
}
```

### MintArgs

```solidity
struct MintArgs {
  address owner;
  uint256 vaultId;
  address to;
  uint256 amount;
}
```

### BurnArgs

```solidity
struct BurnArgs {
  address owner;
  uint256 vaultId;
  address otoken;
  uint256 amount;
}
```

### OpenVaultArgs

```solidity
struct OpenVaultArgs {
  address owner;
  address shortOtoken;
  uint256 vaultId;
}
```

### DepositCollateralArgs

```solidity
struct DepositCollateralArgs {
  address owner;
  uint256 vaultId;
  address from;
  uint256[] amounts;
}
```

### DepositLongArgs

```solidity
struct DepositLongArgs {
  address owner;
  uint256 vaultId;
  address from;
  address longOtoken;
  uint256 amount;
}
```

### RedeemArgs

```solidity
struct RedeemArgs {
  address receiver;
  address otoken;
  uint256 amount;
}
```

### WithdrawLongArgs

```solidity
struct WithdrawLongArgs {
  address owner;
  uint256 vaultId;
  address to;
  uint256 amount;
}
```

### WithdrawCollateralArgs

```solidity
struct WithdrawCollateralArgs {
  address owner;
  uint256 vaultId;
  address to;
  uint256[] amounts;
}
```

### SettleVaultArgs

```solidity
struct SettleVaultArgs {
  address owner;
  uint256 vaultId;
  address to;
}
```

### CallArgs

```solidity
struct CallArgs {
  address callee;
  bytes data;
}
```

### _parseOpenVaultArgs

```solidity
function _parseOpenVaultArgs(struct Actions.ActionArgs _args) internal pure returns (struct Actions.OpenVaultArgs)
```

parses the passed in action arguments to get the arguments for an open vault action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.ActionArgs | general action arguments structure |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Actions.OpenVaultArgs | arguments for a open vault action |

### _parseMintArgs

```solidity
function _parseMintArgs(struct Actions.ActionArgs _args) internal pure returns (struct Actions.MintArgs)
```

parses the passed in action arguments to get the arguments for a mint action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.ActionArgs | general action arguments structure |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Actions.MintArgs | arguments for a mint action |

### _parseBurnArgs

```solidity
function _parseBurnArgs(struct Actions.ActionArgs _args) internal pure returns (struct Actions.BurnArgs)
```

parses the passed in action arguments to get the arguments for a burn action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.ActionArgs | general action arguments structure |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Actions.BurnArgs | arguments for a burn action |

### _parseDepositCollateralArgs

```solidity
function _parseDepositCollateralArgs(struct Actions.ActionArgs _args) internal pure returns (struct Actions.DepositCollateralArgs)
```

parses the passed in action arguments to get the arguments for a deposit action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.ActionArgs | general action arguments structure |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Actions.DepositCollateralArgs | arguments for a deposit action |

### _parseDepositLongArgs

```solidity
function _parseDepositLongArgs(struct Actions.ActionArgs _args) internal pure returns (struct Actions.DepositLongArgs)
```

parses the passed in action arguments to get the arguments for a deposit action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.ActionArgs | general action arguments structure |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Actions.DepositLongArgs | arguments for a deposit action |

### _parseWithdrawLongArgs

```solidity
function _parseWithdrawLongArgs(struct Actions.ActionArgs _args) internal pure returns (struct Actions.WithdrawLongArgs)
```

parses the passed in action arguments to get the arguments for a withdraw action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.ActionArgs | general action arguments structure |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Actions.WithdrawLongArgs | arguments for a withdraw action |

### _parseWithdrawCollateralArgs

```solidity
function _parseWithdrawCollateralArgs(struct Actions.ActionArgs _args) internal pure returns (struct Actions.WithdrawCollateralArgs)
```

parses the passed in action arguments to get the arguments for a withdraw action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.ActionArgs | general action arguments structure |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Actions.WithdrawCollateralArgs | arguments for a withdraw action |

### _parseRedeemArgs

```solidity
function _parseRedeemArgs(struct Actions.ActionArgs _args) internal pure returns (struct Actions.RedeemArgs)
```

parses the passed in action arguments to get the arguments for an redeem action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.ActionArgs | general action arguments structure |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Actions.RedeemArgs | arguments for a redeem action |

### _parseSettleVaultArgs

```solidity
function _parseSettleVaultArgs(struct Actions.ActionArgs _args) internal pure returns (struct Actions.SettleVaultArgs)
```

parses the passed in action arguments to get the arguments for a settle vault action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.ActionArgs | general action arguments structure |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Actions.SettleVaultArgs | arguments for a settle vault action |

### _parseCallArgs

```solidity
function _parseCallArgs(struct Actions.ActionArgs _args) internal pure returns (struct Actions.CallArgs)
```

parses the passed in action arguments to get the arguments for a call action

| Name | Type | Description |
| ---- | ---- | ----------- |
| _args | struct Actions.ActionArgs | general action arguments structure |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | struct Actions.CallArgs | arguments for a call action |

