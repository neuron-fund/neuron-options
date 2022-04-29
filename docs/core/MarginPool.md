## `MarginPool`

Contract that holds all protocol funds



### `onlyController()`

check if the sender is the Controller module




### `constructor(address _addressBook)` (public)

contructor




### `transferToPool(address _asset, address _user, uint256 _amount)` (public)

transfers an asset from a user to the pool




### `transferToUser(address _asset, address _user, uint256 _amount)` (public)

transfers an asset from the pool to a user




### `getStoredBalance(address _asset) → uint256` (external)

get the stored balance of an asset





### `TransferToPool(address asset, address user, uint256 amount)`

emits an event when marginpool receive funds from controller



### `TransferToUser(address asset, address user, uint256 amount)`

emits an event when marginpool transfer funds to controller





