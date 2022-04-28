# Solidity API

## WhitelistInterface

### addressBook

```solidity
function addressBook() external view returns (address)
```

### blacklistCallee

```solidity
function blacklistCallee(address _callee) external
```

### blacklistCollateral

```solidity
function blacklistCollateral(address[] _collaterals) external
```

### blacklistOtoken

```solidity
function blacklistOtoken(address _otokenAddress) external
```

### blacklistProduct

```solidity
function blacklistProduct(address _underlying, address _strike, address[] _collaterals, bool _isPut) external
```

### isWhitelistedCallee

```solidity
function isWhitelistedCallee(address _callee) external view returns (bool)
```

### isWhitelistedCollaterals

```solidity
function isWhitelistedCollaterals(address[] _collaterals) external view returns (bool)
```

### isWhitelistedOtoken

```solidity
function isWhitelistedOtoken(address _otoken) external view returns (bool)
```

### isWhitelistedProduct

```solidity
function isWhitelistedProduct(address _underlying, address _strike, address[] _collateral, bool _isPut) external view returns (bool)
```

### whitelistCallee

```solidity
function whitelistCallee(address _callee) external
```

### whitelistCollaterals

```solidity
function whitelistCollaterals(address[] _collaterals) external
```

### whitelistOtoken

```solidity
function whitelistOtoken(address _otokenAddress) external
```

### whitelistProduct

```solidity
function whitelistProduct(address _underlying, address _strike, address[] _collaterals, bool _isPut) external
```

