# MarginPoolInterface

### addressBook

```solidity
function addressBook() external view returns (address)
```

### farmer

```solidity
function farmer() external view returns (address)
```

### getStoredBalance

```solidity
function getStoredBalance(address _asset) external view returns (uint256)
```

### setFarmer

```solidity
function setFarmer(address _farmer) external
```

### farm

```solidity
function farm(address _asset, address _receiver, uint256 _amount) external
```

### transferToPool

```solidity
function transferToPool(address _asset, address _user, uint256 _amount) external
```

### transferToUser

```solidity
function transferToUser(address _asset, address _user, uint256 _amount) external
```

### batchTransferToPool

```solidity
function batchTransferToPool(address[] _asset, address[] _user, uint256[] _amount) external
```

### batchTransferToUser

```solidity
function batchTransferToUser(address[] _asset, address[] _user, uint256[] _amount) external
```

