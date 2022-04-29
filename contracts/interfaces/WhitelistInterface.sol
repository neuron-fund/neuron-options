// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

interface WhitelistInterface {
    function addressBook() external view returns (address);

    function blacklistCallee(address _callee) external;

    function blacklistCollateral(address[] memory _collaterals) external;

    function blacklistONtoken(address _onTokenAddress) external;

    function blacklistProduct(
        address _underlying,
        address _strike,
        address[] memory _collaterals,
        bool _isPut
    ) external;

    function isWhitelistedCallee(address _callee) external view returns (bool);

    function isWhitelistedCollaterals(address[] memory _collaterals) external view returns (bool);

    function isWhitelistedONtoken(address _onToken) external view returns (bool);

    function isWhitelistedProduct(
        address _underlying,
        address _strike,
        address[] memory _collateral,
        bool _isPut
    ) external view returns (bool);

    //  function owner() external view returns (address);

    //  function renounceOwnership() external;

    //  function transferOwnership(address newOwner) external;

    function whitelistCallee(address _callee) external;

    function whitelistCollaterals(address[] memory _collaterals) external;

    function whitelistONtoken(address _onTokenAddress) external;

    function whitelistProduct(
        address _underlying,
        address _strike,
        address[] memory _collaterals,
        bool _isPut
    ) external;
}
