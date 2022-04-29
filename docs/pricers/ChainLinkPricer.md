## `ChainLinkPricer`

A Pricer contract for one asset as reported by Chainlink



### `onlyBot()`

modifier to check if sender address is equal to bot address




### `constructor(address _bot, address _asset, address _aggregator, address _oracle)` (public)





### `setExpiryPriceInOracle(uint256 _expiryTimestamp, uint80 _roundId)` (external)

set the expiry price in the oracle, can only be called by Bot address


a roundId must be provided to confirm price validity, which is the first Chainlink price provided after the expiryTimestamp


### `getPrice() → uint256` (external)

get the live price for the asset


overides the getPrice function in PricerInterface


### `getHistoricalPrice(uint80 _roundId) → uint256, uint256` (external)

get historical chainlink price




### `_scaleToBase(uint256 _price) → uint256` (internal)

scale aggregator response to base decimals (1e8)







