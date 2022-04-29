## `CompoundPricer`

A Pricer contract for a Compound cToken




### `constructor(address _cToken, address _underlying, address _oracle)` (public)





### `getPrice() → uint256` (external)

get the live price for the asset




### `setExpiryPriceInOracle(uint256 _expiryTimestamp)` (external)

set the expiry price in the oracle


requires that the underlying price has been set before setting a cToken price


### `_underlyingPriceToCtokenPrice(uint256 _underlyingPrice) → uint256` (internal)



convert underlying price to cToken price with the cToken to underlying exchange rate





