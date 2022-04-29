## `FPI`

FixedPoint library




### `fromUnscaledInt(int256 a) → struct FPI.FixedPointInt` (internal)

constructs an `FixedPointInt` from an unscaled int, e.g., `b=5` gets stored internally as `5**27`.




### `fromScaledUint(uint256 _a, uint256 _decimals) → struct FPI.FixedPointInt` (internal)

constructs an FixedPointInt from an scaled uint with {_decimals} decimals
Examples:
(1)  USDC    decimals = 6
     Input:  5 * 1e6 USDC  =>    Output: 5 * 1e27 (FixedPoint 5.0 USDC)
(2)  cUSDC   decimals = 8
     Input:  5 * 1e6 cUSDC =>    Output: 5 * 1e25 (FixedPoint 0.05 cUSDC)




### `toScaledUint(struct FPI.FixedPointInt _a, uint256 _decimals, bool _roundDown) → uint256` (internal)

convert a FixedPointInt number to an uint256 with a specific number of decimals




### `add(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → struct FPI.FixedPointInt` (internal)

add two signed integers, a + b




### `sub(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → struct FPI.FixedPointInt` (internal)

subtract two signed integers, a-b




### `mul(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → struct FPI.FixedPointInt` (internal)

multiply two signed integers, a by b




### `div(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → struct FPI.FixedPointInt` (internal)

divide two signed integers, a by b




### `min(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → struct FPI.FixedPointInt` (internal)

minimum between two signed integers, a and b




### `max(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → struct FPI.FixedPointInt` (internal)

maximum between two signed integers, a and b




### `isEqual(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → bool` (internal)

is a is equal to b




### `isGreaterThan(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → bool` (internal)

is a greater than b




### `isGreaterThanOrEqual(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → bool` (internal)

is a greater than or equal to b




### `isLessThan(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → bool` (internal)

is a is less than b




### `isLessThanOrEqual(struct FPI.FixedPointInt a, struct FPI.FixedPointInt b) → bool` (internal)

is a less than or equal to b






### `FixedPointInt`


int256 value



