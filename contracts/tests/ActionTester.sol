// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

pragma experimental ABIEncoderV2;

import {Actions} from "../libs/Actions.sol";
import "hardhat/console.sol";

contract ActionTester {
    Actions.OpenVaultArgs private openVaultArgs;
    Actions.DepositCollateralArgs private depositCollateralArgs;
    Actions.WithdrawCollateralArgs private withdrawCollateralArgs;
    Actions.WithdrawLongArgs private withdrawLongArgs;
    Actions.MintArgs private mintArgs;
    Actions.BurnArgs private burnArgs;
    Actions.RedeemArgs private redeemArgs;
    Actions.SettleVaultArgs private settleVaultArgs;
    Actions.CallArgs private callArgs;

    function testParseDespositAction(Actions.ActionArgs memory _args) external {
        depositCollateralArgs = Actions._parseDepositCollateralArgs(_args);
    }

    function getDepositArgs() external view returns (Actions.DepositCollateralArgs memory) {
        return depositCollateralArgs;
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

    function testParseCallAction(Actions.ActionArgs memory _args) external {
        callArgs = Actions._parseCallArgs(_args);
    }

    function getCallArgs() external view returns (Actions.CallArgs memory) {
        return callArgs;
    }
}
