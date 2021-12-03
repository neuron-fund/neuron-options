// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.10;

pragma experimental ABIEncoderV2;

import {MarginVault} from "../libs/MarginVault.sol";

interface MarginCalculatorInterface {
    function addressBook() external view returns (address);

    function getExpiredPayoutRate(address _otoken) external view returns (uint256[] memory);

    function getExcessCollateral(MarginVault.Vault calldata _vault, uint256 _vaultType)
        external
        view
        returns (uint256[] memory netValues, bool isExcess);

    function isLiquidatable(
        MarginVault.Vault memory _vault,
        uint256 _vaultType,
        uint256 _vaultLatestUpdate,
        uint256 _roundId
    )
        external
        view
        returns (
            bool,
            uint256,
            uint256
        );

    function _getCollateralRequired(
        MarginVault.Vault memory _vault,
        address _otoken,
        uint256 _amount
    ) external view returns (uint256[] memory collateralsAmountsRequired, uint256[] memory collateralsValuesRequired);
}
