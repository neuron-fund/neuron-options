## `WstethPricer`

A Pricer contract for a wstETH token




### `constructor(address _wstETH, address _underlying, address _oracle)` (public)





### `getPrice() → uint256` (external)

get the live price for the asset


overrides the getPrice function in PricerInterface


### `setExpiryPriceInOracle(uint256 _expiryTimestamp)` (external)

set the expiry price in the oracle


requires that the underlying price has been set before setting a wstETH price


### `getHistoricalPrice(uint80) → uint256, uint256` (external)








