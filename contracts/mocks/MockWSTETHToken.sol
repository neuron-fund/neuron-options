// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import {ERC20Upgradeable} from "../packages/oz/upgradeability/ERC20Upgradeable.sol";

contract MockWSTETHToken is ERC20Upgradeable {
    uint256 public stEthPerToken;

    constructor(string memory _name, string memory _symbol) {
        __ERC20_init_unchained(_name, _symbol);
        _setupDecimals(18);
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function setStEthPerToken(uint256 _stEthPerToken) external {
        stEthPerToken = _stEthPerToken;
    }
}
