# Solidity API

## MarginPool

Contract that holds all protocol funds

### addressBook

```solidity
address addressBook
```

AddressBook module

### farmer

```solidity
address farmer
```

_the address that has the ability to withdraw excess assets in the pool_

### assetBalance

```solidity
mapping(address &#x3D;&gt; uint256) assetBalance
```

_mapping between an asset and the amount of the asset in the pool_

### constructor

```solidity
constructor(address _addressBook) public
```

contructor

| Name | Type | Description |
| ---- | ---- | ----------- |
| _addressBook | address | AddressBook module |

### TransferToPool

```solidity
event TransferToPool(address asset, address user, uint256 amount)
```

emits an event when marginpool receive funds from controller

### TransferToUser

```solidity
event TransferToUser(address asset, address user, uint256 amount)
```

emits an event when marginpool transfer funds to controller

### FarmerUpdated

```solidity
event FarmerUpdated(address oldAddress, address newAddress)
```

emit event after updating the farmer address

### AssetFarmed

```solidity
event AssetFarmed(address asset, address receiver, uint256 amount)
```

emit event when an asset gets harvested from the pool

### onlyController

```solidity
modifier onlyController()
```

check if the sender is the Controller module

### onlyFarmer

```solidity
modifier onlyFarmer()
```

check if the sender is the farmer address

### transferToPool

```solidity
function transferToPool(address _asset, address _user, uint256 _amount) public
```

transfers an asset from a user to the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | address of the asset to transfer |
| _user | address | address of the user to transfer assets from |
| _amount | uint256 | amount of the token to transfer from _user |

### transferToUser

```solidity
function transferToUser(address _asset, address _user, uint256 _amount) public
```

transfers an asset from the pool to a user

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | address of the asset to transfer |
| _user | address | address of the user to transfer assets to |
| _amount | uint256 | amount of the token to transfer to _user |

### getStoredBalance

```solidity
function getStoredBalance(address _asset) external view returns (uint256)
```

get the stored balance of an asset

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | uint256 | asset balance |

### batchTransferToPool

```solidity
function batchTransferToPool(address[] _asset, address[] _user, uint256[] _amount) external
```

transfers multiple assets from users to the pool

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address[] | addresses of the assets to transfer |
| _user | address[] | addresses of the users to transfer assets to |
| _amount | uint256[] | amount of each token to transfer to pool |

### batchTransferToUser

```solidity
function batchTransferToUser(address[] _asset, address[] _user, uint256[] _amount) external
```

transfers multiple assets from the pool to users

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address[] | addresses of the assets to transfer |
| _user | address[] | addresses of the users to transfer assets to |
| _amount | uint256[] | amount of each token to transfer to _user |

### farm

```solidity
function farm(address _asset, address _receiver, uint256 _amount) external
```

function to collect the excess balance of a particular asset

_can only be called by the farmer address. Do not farm otokens._

| Name | Type | Description |
| ---- | ---- | ----------- |
| _asset | address | asset address |
| _receiver | address | receiver address |
| _amount | uint256 | amount to remove from pool |

### setFarmer

```solidity
function setFarmer(address _farmer) external
```

function to set farmer address

_can only be called by MarginPool owner_

| Name | Type | Description |
| ---- | ---- | ----------- |
| _farmer | address | farmer address |

