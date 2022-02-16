SCALING_FACTOR = 1e27
BASE_DECIMALS = 27

class FixedPointInt:
    def __init__(self, _value: int):
        assert _value > 0, 'only unsigned int supported'
        self.value = _value
        # For call to repr(). Prints object's information
    def __repr__(self):
       return f'FixedPointInt({self.value}, {BASE_DECIMALS}), {self.value/10**BASE_DECIMALS}'
  
    # For call to str(). Prints readable form
    def __str__(self):
       return f'FixedPointInt({self.value}, {BASE_DECIMALS}), {self.value/10**BASE_DECIMALS}'

class FPI:
    @staticmethod
    def fromUnscaledInt(a: int):
        '''
        /**
        * @notice constructs an `FixedPointInt` from an unscaled int, e.g., `b=5` gets stored internally as `5**27`.
        * @param a int to convert into a FixedPoint.
        * @return the converted FixedPoint.
        */
        '''
        return FixedPointInt(a*SCALING_FACTOR)
    
    @staticmethod
    def fromScaledUint(_a: int, _decimals: int):
        '''
        /**
        * @notice constructs an FixedPointInt from an scaled uint with {_decimals} decimals
        * Examples:
        * (1)  USDC    decimals = 6
        *      Input:  5 * 1e6 USDC  =>    Output: 5 * 1e27 (FixedPoint 5.0 USDC)
        * (2)  cUSDC   decimals = 8
        *      Input:  5 * 1e6 cUSDC =>    Output: 5 * 1e25 (FixedPoint 0.05 cUSDC)
        * @param _a uint256 to convert into a FixedPoint.
        * @param _decimals  original decimals _a has
        * @return the converted FixedPoint, with 27 decimals.
        */
        '''
        fixedPoint = FixedPointInt()
        if _decimals == BASE_DECIMALS:
            fixedPoint = FixedPointInt(_a);
        elif (_decimals > BASE_DECIMALS):
            exp = _decimals - BASE_DECIMALS
            fixedPoint = FixedPointInt(_a // (10**exp))
        else:
            exp = BASE_DECIMALS - _decimals
            fixedPoint = FixedPointInt(_a * (10**exp))
        return fixedPoint

    @staticmethod
    def toScaledUint(_a: FixedPointInt, _decimals: int, _roundDown: bool = False):
        '''
        /**
        * @notice convert a FixedPointInt number to an uint256 with a specific number of decimals
        * @param _a FixedPointInt to convert
        * @param _decimals number of decimals that the uint256 should be scaled to
        * @param _roundDown True to round down the result, False to round up
        * @return the converted uint256
        */
        '''
        scaledUint: int = 0

        if _decimals == BASE_DECIMALS:
            scaledUint = _a.value
        elif _decimals > BASE_DECIMALS:
            exp = _decimals - BASE_DECIMALS;
            scaledUint = _a.value*(10**exp)
        else:
            exp = BASE_DECIMALS - _decimals;
            tailing = 1 if (not _roundDown and _a.value % (10**exp)) else 0
            scaledUint = _a.value // (10**exp) + tailing
        return scaledUint


    @staticmethod
    def add(a: FixedPointInt, b: FixedPointInt) -> FixedPointInt:
        return FixedPointInt(a.value + b.value)

    @staticmethod
    def sub(a: FixedPointInt, b: FixedPointInt) -> FixedPointInt:
        return FixedPointInt(a.value - b.value)

    @staticmethod
    def mul(a: FixedPointInt, b: FixedPointInt) -> FixedPointInt:
        return FixedPointInt((a.value * b.value) // SCALING_FACTOR)
    
    @staticmethod
    def div(a: FixedPointInt, b: FixedPointInt) -> FixedPointInt:
        return FixedPointInt((a.value * SCALING_FACTOR) // b.value)

    @staticmethod
    def min(a: FixedPointInt, b: FixedPointInt) -> FixedPointInt:
        return a if a.value < b.value else b

    @staticmethod
    def max(a: FixedPointInt, b: FixedPointInt) -> FixedPointInt:
        return a if a.value > b.value else b
    
    @staticmethod
    def isEqual(a: FixedPointInt, b: FixedPointInt) -> bool:
        return a.value == b.value

    @staticmethod
    def isGreaterThan(a: FixedPointInt, b: FixedPointInt) -> bool:
        return a.value > b.value

    @staticmethod
    def isGreaterThanOrEqual(a: FixedPointInt, b: FixedPointInt) -> bool:
        return a.value >= b.value

    @staticmethod
    def isLessThan(a: FixedPointInt, b: FixedPointInt) -> bool:
        return a.value < b.value

    @staticmethod
    def isLessThanOrEqual(a: FixedPointInt, b: FixedPointInt) -> bool:
        return a.value <= b.value


#FixedPointInt.add = lambda self, b: FPI.add(self, b)
FixedPointInt.add = FPI.add
FixedPointInt.sub = FPI.sub
FixedPointInt.mul = FPI.mul
FixedPointInt.div = FPI.div

FixedPointInt.min = FPI.min
FixedPointInt.max = FPI.max

FixedPointInt.toScaledUint = FPI.toScaledUint
FixedPointInt.isGreaterThan = FPI.isGreaterThan
FixedPointInt.isGreaterThanOrEqual = FPI.isGreaterThanOrEqual
FixedPointInt.isLessThan = FPI.isLessThan
FixedPointInt.isLessThanOrEqual = FPI.isLessThanOrEqual

