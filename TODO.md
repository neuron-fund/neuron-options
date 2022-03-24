TODO isMarginableLong requires in \_depositLong, for restriction adding longs which do not comply with short
TODO withdraw bulk collaterals
TODO test depositCollateral after one mint to vault and mint again
TODO close vault with zero short amount

DISCUSS restrict ratios for collateral to restrict minting a lot of oTokens for non liquid assets
TODO Restrict by absolute figures in collateral value for all minted options, restrictions for minting oTokens on whitelist level

TODO test deposit long and than mint more longs, check if right settleVault and redeem for long and short

IMPROVEMENT get rid of SafeMath if neccessary for optiomization and reduce delpoy size

IMPROVEMENT unwrap assets for redeemers

IMPROVEMENT getExpiredPayoutRate calculations should be done only once after oToken expiry but not on every redeem as its now. It will help save gas for redeemers
