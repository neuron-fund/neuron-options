# Solidity API

## OtokenInterface

### Approval

```solidity
event Approval(address owner, address spender, uint256 value)
```

### Transfer

```solidity
event Transfer(address from, address to, uint256 value)
```

### DOMAIN_SEPARATOR

```solidity
function DOMAIN_SEPARATOR() external view returns (bytes32)
```

### allowance

```solidity
function allowance(address owner, address spender) external view returns (uint256)
```

### approve

```solidity
function approve(address spender, uint256 amount) external returns (bool)
```

### balanceOf

```solidity
function balanceOf(address account) external view returns (uint256)
```

### burnOtoken

```solidity
function burnOtoken(address account, uint256 amount) external
```

### reduceCollaterization

```solidity
function reduceCollaterization(uint256[] collateralsAmountsForReduce, uint256[] collateralsValuesForReduce, uint256 oTokenAmountBurnt) external
```

### getCollateralAssets

```solidity
function getCollateralAssets() external view returns (address[])
```

### getCollateralsAmounts

```solidity
function getCollateralsAmounts() external view returns (uint256[])
```

### getCollateralConstraints

```solidity
function getCollateralConstraints() external view returns (uint256[])
```

### collateralsValues

```solidity
function collateralsValues(uint256) external view returns (uint256)
```

### getCollateralsValues

```solidity
function getCollateralsValues() external view returns (uint256[])
```

### controller

```solidity
function controller() external view returns (address)
```

### decimals

```solidity
function decimals() external view returns (uint8)
```

### collaterizedTotalAmount

```solidity
function collaterizedTotalAmount() external view returns (uint256)
```

### decreaseAllowance

```solidity
function decreaseAllowance(address spender, uint256 subtractedValue) external returns (bool)
```

### expiryTimestamp

```solidity
function expiryTimestamp() external view returns (uint256)
```

### getOtokenDetails

```solidity
function getOtokenDetails() external view returns (address[], uint256[], uint256[], uint256[], address, address, uint256, uint256, bool, uint256)
```

### increaseAllowance

```solidity
function increaseAllowance(address spender, uint256 addedValue) external returns (bool)
```

### init

```solidity
function init(address _addressBook, address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiryTimestamp, bool _isPut) external
```

### isPut

```solidity
function isPut() external view returns (bool)
```

### mintOtoken

```solidity
function mintOtoken(address account, uint256 amount, uint256[] collateralsAmountsForMint, uint256[] collateralsValuesForMint) external
```

### name

```solidity
function name() external view returns (string)
```

### nonces

```solidity
function nonces(address owner) external view returns (uint256)
```

### permit

```solidity
function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external
```

### strikeAsset

```solidity
function strikeAsset() external view returns (address)
```

### strikePrice

```solidity
function strikePrice() external view returns (uint256)
```

### symbol

```solidity
function symbol() external view returns (string)
```

### totalSupply

```solidity
function totalSupply() external view returns (uint256)
```

### transfer

```solidity
function transfer(address recipient, uint256 amount) external returns (bool)
```

### transferFrom

```solidity
function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)
```

### underlyingAsset

```solidity
function underlyingAsset() external view returns (address)
```

