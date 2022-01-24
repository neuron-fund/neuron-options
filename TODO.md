cases:

- Mint multi collateral
- Check price on expire multi collateral
- Burn multicollateral option tokens and withdraw assets
- vaultDetails.hasColateral fix
- restrict collateral to one token for call option
- restrict adding collateral to vault after minting first option
- restrict option expire not on friday

FPI to uint256 precision loss?

TODO use clones for deploying oTokens for gas optimization?

Due to collateral wrapper token fluctations should we collaterize with more than 100% value?

Pricer should unwrap collaterals in oTokens after expire?

Known limitations:

- minting o tokens any time after creation and before expiration can lead to undercollateralized collateral due to price fluctuations of collateral tokens. Thats if we take price of collateral on the moment of time of option creation
- if we calculate collateral on live price

Is it possible to call library MarginVault of Controller from outside

For burning oTokens give vault owner ability to burn oToken to get collateral. Transfer protportianlly to number of burn to total minted by this vault owner. !REQUIRE check that number he has and wants to burn does not exceeds number of oTokens he minted for the vault.

Restrict ratios for collateral to restrict minting a lot of oTokens for non liquid assets

TODO make helper function to help users of vault to calculate how much of collateral they should deposit to cover the collaterization of provided oToken amount, depends on their wallet balances

TODO restrict zero strike

TODO if one of collateral drastically falls in price we should still allow redeemer to redeem atleast other collaterals. Check calculations if expiry price is zero or very small and not enough balance.

TODO get rid of safeMath probably since it's integrated in 8+ version of Solidity
