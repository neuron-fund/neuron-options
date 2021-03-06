// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

pragma experimental ABIEncoderV2;

import {Actions} from "../libs/Actions.sol";

contract ActionTester {
    Actions.OpenVaultArgs private openVaultArgs;
    Actions.DepositCollateralArgs private depositCollateralArgs;
    Actions.DepositLongArgs private depositLongArgs;
    Actions.WithdrawCollateralArgs private withdrawCollateralArgs;
    Actions.WithdrawLongArgs private withdrawLongArgs;
    Actions.MintArgs private mintArgs;
    Actions.BurnArgs private burnArgs;
    Actions.RedeemArgs private redeemArgs;
    Actions.SettleVaultArgs private settleVaultArgs;

    function testParseDespositCollateralAction(Actions.ActionArgs memory _args) external {
        depositCollateralArgs = Actions._parseDepositCollateralArgs(_args);
    }

    function testParseDespositLongAction(Actions.ActionArgs memory _args) external {
        depositLongArgs = Actions._parseDepositLongArgs(_args);
    }

    function getDepositCollateralArgs() external view returns (Actions.DepositCollateralArgs memory) {
        return depositCollateralArgs;
    }

    function getDepositLongArgs() external view returns (Actions.DepositLongArgs memory) {
        return depositLongArgs;
    }

    function testParseWithdrawAction(Actions.ActionArgs memory _args) external {
        withdrawCollateralArgs = Actions._parseWithdrawCollateralArgs(_args);
    }

    function testParseWithdrawLong(Actions.ActionArgs memory _args) external {
        withdrawLongArgs = Actions._parseWithdrawLongArgs(_args);
    }

    function getWithdrawArgs() external view returns (Actions.WithdrawCollateralArgs memory) {
        return withdrawCollateralArgs;
    }

    function getWithdrawLong() external view returns (Actions.WithdrawLongArgs memory) {
        return withdrawLongArgs;
    }

    function testParseOpenVaultAction(Actions.ActionArgs memory _args) external {
        openVaultArgs = Actions._parseOpenVaultArgs(_args);
    }

    function getOpenVaultArgs() external view returns (Actions.OpenVaultArgs memory) {
        return openVaultArgs;
    }

    function testParseRedeemAction(Actions.ActionArgs memory _args) external {
        redeemArgs = Actions._parseRedeemArgs(_args);
    }

    function getRedeemArgs() external view returns (Actions.RedeemArgs memory) {
        return redeemArgs;
    }

    function testParseSettleVaultAction(Actions.ActionArgs memory _args) external {
        settleVaultArgs = Actions._parseSettleVaultArgs(_args);
    }

    function getSettleVaultArgs() external view returns (Actions.SettleVaultArgs memory) {
        return settleVaultArgs;
    }

    function testParseMintAction(Actions.ActionArgs memory _args) external {
        mintArgs = Actions._parseMintArgs(_args);
    }

    function getMintArgs() external view returns (Actions.MintArgs memory) {
        return mintArgs;
    }

    function testParseBurnAction(Actions.ActionArgs memory _args) external {
        burnArgs = Actions._parseBurnArgs(_args);
    }

    function getBurnArgs() external view returns (Actions.BurnArgs memory) {
        return burnArgs;
    }
}
