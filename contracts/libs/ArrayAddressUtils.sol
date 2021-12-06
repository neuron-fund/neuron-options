/**
 * SPDX-License-Identifier: UNLICENSED
 */
pragma solidity 0.8.9;

/**
 * Utils library for comparing arrays of addresses
 */
library ArrayAddressUtils {
    /**
     * @dev uses hashes of array to compare, therefore arrays with different order of same elements wont be equal
     * TODO make it work for arrays with different order
     * @param self address[]
     * @param arr address[]
     * @return bool
     */
    function isEqual(address[] memory self, address[] memory arr) internal pure returns (bool) {
        return keccak256(abi.encodePacked(self)) == keccak256(abi.encodePacked(arr));
    }
}
