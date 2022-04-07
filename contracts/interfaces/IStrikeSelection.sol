// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

interface IStrikeSelection {
    function getStrikePrice(uint256, bool) external view returns (uint256, uint256);

    function owner() external view returns (address);

    function setDelta(uint256 newDelta) external;
}
