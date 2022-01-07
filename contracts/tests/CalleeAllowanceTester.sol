/**
 * SPDX-License-Identifier: UNLICENSED
 */
pragma solidity 0.8.9;

pragma experimental ABIEncoderV2;

import {CalleeInterface} from "../interfaces/CalleeInterface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import {SafeERC20} from "../packages/oz/SafeERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title CalleeAllowanceTester
 * @notice contract test if we can successfully pull weth from the payable proxy
 */
contract CalleeAllowanceTester is CalleeInterface {
    using SafeERC20 for IERC20;
    IERC20 public weth;

    constructor(address _weth) {
        weth = IERC20(_weth);
    }

    // tset pull token
    function callFunction(address payable, bytes memory _data) external override {
        (address from, uint256 amount) = abi.decode(_data, (address, uint256));

        weth.safeTransferFrom(from, address(this), amount);
    }
}
