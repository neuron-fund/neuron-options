// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

import {ERC20PermitUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/extensions/draft-ERC20PermitUpgradeable.sol";

contract MockPermitERC20 is ERC20PermitUpgradeable {
    uint8 private _decimals_;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) {
        __ERC20_init_unchained(_name, _symbol);
        __ERC20Permit_init(_name);
        _decimals_ = _decimals;
    }

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals_;
    }
}
