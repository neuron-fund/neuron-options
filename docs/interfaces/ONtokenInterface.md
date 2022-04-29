## `ONtokenInterface`






### `DOMAIN_SEPARATOR() → bytes32` (external)





### `allowance(address owner, address spender) → uint256` (external)





### `approve(address spender, uint256 amount) → bool` (external)





### `balanceOf(address account) → uint256` (external)





### `burnONtoken(address account, uint256 amount)` (external)





### `reduceCollaterization(uint256[] collateralsAmountsForReduce, uint256[] collateralsValuesForReduce, uint256 onTokenAmountBurnt)` (external)





### `getCollateralAssets() → address[]` (external)





### `getCollateralsAmounts() → uint256[]` (external)





### `getCollateralConstraints() → uint256[]` (external)





### `collateralsValues(uint256) → uint256` (external)





### `getCollateralsValues() → uint256[]` (external)





### `controller() → address` (external)





### `decimals() → uint8` (external)





### `collaterizedTotalAmount() → uint256` (external)





### `decreaseAllowance(address spender, uint256 subtractedValue) → bool` (external)





### `expiryTimestamp() → uint256` (external)





### `getONtokenDetails() → address[], uint256[], uint256[], uint256[], address, address, uint256, uint256, bool, uint256` (external)





### `increaseAllowance(address spender, uint256 addedValue) → bool` (external)





### `init(address _addressBook, address _underlyingAsset, address _strikeAsset, address[] _collateralAssets, uint256[] _collateralConstraints, uint256 _strikePrice, uint256 _expiryTimestamp, bool _isPut)` (external)





### `isPut() → bool` (external)





### `mintONtoken(address account, uint256 amount, uint256[] collateralsAmountsForMint, uint256[] collateralsValuesForMint)` (external)





### `name() → string` (external)





### `nonces(address owner) → uint256` (external)





### `permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)` (external)





### `strikeAsset() → address` (external)





### `strikePrice() → uint256` (external)





### `symbol() → string` (external)





### `totalSupply() → uint256` (external)





### `transfer(address recipient, uint256 amount) → bool` (external)





### `transferFrom(address sender, address recipient, uint256 amount) → bool` (external)





### `underlyingAsset() → address` (external)






### `Approval(address owner, address spender, uint256 value)`





### `Transfer(address from, address to, uint256 value)`







