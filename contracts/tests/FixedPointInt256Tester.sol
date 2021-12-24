/**
 * SPDX-License-Identifier: UNLICENSED
 */
pragma solidity 0.8.9;

pragma experimental ABIEncoderV2;

import "../libs/FixedPointInt256.sol";

/**
 * @author Opyn Team
 * @notice FixedPointInt256 contract tester
 */
contract FixedPointInt256Tester {
    using FPI for FPI.FixedPointInt;

    function testFromUnscaledInt(int256 a) external pure returns (FPI.FixedPointInt memory) {
        return FPI.fromUnscaledInt(a);
    }

    function testAdd(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (FPI.FixedPointInt memory)
    {
        return a.add(b);
    }

    function testSub(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (FPI.FixedPointInt memory)
    {
        return a.sub(b);
    }

    function testMul(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (FPI.FixedPointInt memory)
    {
        return a.mul(b);
    }

    function testDiv(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (FPI.FixedPointInt memory)
    {
        return a.div(b);
    }

    function testMin(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (FPI.FixedPointInt memory)
    {
        return FPI.min(a, b);
    }

    function testMax(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (FPI.FixedPointInt memory)
    {
        return FPI.max(a, b);
    }

    function testIsEqual(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (bool)
    {
        return a.isEqual(b);
    }

    function testIsGreaterThan(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (bool)
    {
        return a.isGreaterThan(b);
    }

    function testIsGreaterThanOrEqual(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (bool)
    {
        return a.isGreaterThanOrEqual(b);
    }

    function testIsLessThan(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (bool)
    {
        return a.isLessThan(b);
    }

    function testIsLessThanOrEqual(FPI.FixedPointInt memory a, FPI.FixedPointInt memory b)
        external
        pure
        returns (bool)
    {
        return a.isLessThanOrEqual(b);
    }
}
