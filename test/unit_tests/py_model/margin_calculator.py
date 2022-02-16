from fixed_point_int import FPI, FixedPointInt
from mock_oracle import Oracle

from collections import defaultdict

from dataclasses import dataclass
from soltypes import uint256list, address, addrlist, uint256

BASE = 8; # internal
ZERO = FPI.fromScaledUint(0, BASE) # internal
dust = {}
timesToExpiryForProduct = defaultdict(list)
maxPriceAtTimeToExpiry = defaultdict(dict)

@dataclass
class VaultDetails:
    shortAmount: uint256
    longAmount: uint256
    usedLongAmount: uint256
    shortStrikePrice: uint256
    longStrikePrice: uint256
    expiryTimestamp: uint256
    shortOtoken: address
    isPut: bool
    hasLong: bool
    longOtoken: address
    underlyingAsset: address
    strikeAsset: address
    collateralAssets: addrlist
    collateralAmounts: uint256list
    usedCollateralAmounts: uint256list
    unusedCollateralAmounts: uint256list
    collateralsDecimals: uint256list
    reservedCollateralValues: uint256list

@dataclass
class OTokenDetails:
    collaterals: addrlist # yvUSDC
    collateralsAmounts: uint256 # yvUSDC
    collateralsValues: uint256 # yvUSDC
    underlying: address #WETH
    strikeAsset: address # USDC
    strikePrice: uint256
    expiry: uint256
    isPut: bool
    collaterizedTotalAmount: uint256


class MarginCalculator:
    def __init__(self):
        self.AUCTION_TIME = uint256(3600)