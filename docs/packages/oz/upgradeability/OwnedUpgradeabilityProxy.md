# Solidity API

## OwnedUpgradeabilityProxy

_This contract combines an upgradeability proxy with basic authorization control functionalities_

### ProxyOwnershipTransferred

```solidity
event ProxyOwnershipTransferred(address previousOwner, address newOwner)
```

_Event to show ownership has been transferred_

| Name | Type | Description |
| ---- | ---- | ----------- |
| previousOwner | address | representing the address of the previous owner |
| newOwner | address | representing the address of the new owner |

### proxyOwnerPosition

```solidity
bytes32 proxyOwnerPosition
```

_Storage position of the owner of the contract_

### constructor

```solidity
constructor() public
```

_the constructor sets the original owner of the contract to the sender account._

### onlyProxyOwner

```solidity
modifier onlyProxyOwner()
```

_Throws if called by any account other than the owner._

### proxyOwner

```solidity
function proxyOwner() public view returns (address owner)
```

_Tells the address of the owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| owner | address | the address of the owner |

### setUpgradeabilityOwner

```solidity
function setUpgradeabilityOwner(address _newProxyOwner) internal
```

_Sets the address of the owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newProxyOwner | address | address of new proxy owner |

### transferProxyOwnership

```solidity
function transferProxyOwnership(address _newOwner) public
```

_Allows the current owner to transfer control of the contract to a newOwner._

| Name | Type | Description |
| ---- | ---- | ----------- |
| _newOwner | address | The address to transfer ownership to. |

### upgradeTo

```solidity
function upgradeTo(address _implementation) public
```

_Allows the proxy owner to upgrade the current version of the proxy._

| Name | Type | Description |
| ---- | ---- | ----------- |
| _implementation | address | representing the address of the new implementation to be set. |

### upgradeToAndCall

```solidity
function upgradeToAndCall(address _implementation, bytes _data) public payable
```

_Allows the proxy owner to upgrade the current version of the proxy and call the new implementation
to initialize whatever is needed through a low level call._

| Name | Type | Description |
| ---- | ---- | ----------- |
| _implementation | address | representing the address of the new implementation to be set. |
| _data | bytes | represents the msg.data to bet sent in the low level call. This parameter may include the function signature of the implementation to be called with the needed payload |

