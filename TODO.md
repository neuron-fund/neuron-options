cases:

-   Mint multi collateral
-   Check price on expire multi collateral
-   Burn multicollateral option tokens and withdraw assets
-   vaultDetails.hasColateral fix
-   restrict collateral to one token for call option
-   restrict adding collateral to vault after minting first option
-   restrict option expire not on friday

FPI to uint256 precision loss?

TODO use clones for deploying oTokens for gas optimization?

Due to collateral wrapper token fluctations should we collaterize with more than 100% value?

Pricer should unwrap collaterals in oTokens after expire?

Known limitations:

-   minting o tokens any time after creation and before expiration can lead to undercollateralized collateral due to price fluctuations of collateral tokens. Thats if we take price of collateral on the moment of time of option creation
-   if we calculate collateral on live price

Is it possible to call library MarginVault of Controller from outside
