/**
 * SPDX-License-Identifier: UNLICENSED
 */
pragma solidity 0.8.9;
pragma experimental ABIEncoderV2;

import {ERC20Interface} from "../interfaces/ERC20Interface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @notice Mock 0x ERC20 Proxy

 */
contract Mock0xERC20Proxy {
    // using SafeERC20 for ERC20Interface;

    function transferToken(
        address token,
        address from,
        address to,
        uint256 amount
    ) external {
        SafeERC20.safeTransferFrom(IERC20(token), from, to, amount);
        //ERC20Interface(_token_address).safeTransferFrom(IERC20(_token_address), from, to, amount);
    }
}
