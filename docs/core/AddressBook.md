## `AddressBook`






### `getONtokenImpl() → address` (external)

return ONtoken implementation address




### `getONtokenFactory() → address` (external)

return onTokenFactory address




### `getWhitelist() → address` (external)

return Whitelist address




### `getController() → address` (external)

return Controller address




### `getMarginPool() → address` (external)

return MarginPool address




### `getMarginCalculator() → address` (external)

return MarginCalculator address




### `getLiquidationManager() → address` (external)

return LiquidationManager address




### `getOracle() → address` (external)

return Oracle address




### `setONtokenImpl(address _onTokenImpl)` (external)

set ONtoken implementation address


can only be called by the addressbook owner


### `setONtokenFactory(address _onTokenFactory)` (external)

set ONtokenFactory address


can only be called by the addressbook owner


### `setWhitelist(address _whitelist)` (external)

set Whitelist address


can only be called by the addressbook owner


### `setController(address _controller)` (external)

set Controller address


can only be called by the addressbook owner


### `setMarginPool(address _marginPool)` (external)

set MarginPool address


can only be called by the addressbook owner


### `setMarginCalculator(address _marginCalculator)` (external)

set MarginCalculator address


can only be called by the addressbook owner


### `setLiquidationManager(address _liquidationManager)` (external)

set LiquidationManager address


can only be called by the addressbook owner


### `setOracle(address _oracle)` (external)

set Oracle address


can only be called by the addressbook owner


### `getAddress(bytes32 _key) → address` (public)

return an address for specific key




### `setAddress(bytes32 _key, address _address)` (public)

set a specific address for a specific key


can only be called by the addressbook owner


### `updateImpl(bytes32 _id, address _newAddress)` (public)



function to update the implementation of a specific component of the protocol



### `ProxyCreated(bytes32 id, address proxy)`

emits an event when a new proxy is created



### `AddressAdded(bytes32 id, address add)`

emits an event when a new address is added





