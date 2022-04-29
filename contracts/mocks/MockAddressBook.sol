// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.9;

contract MockAddressBook {
    address private _onTokenImpl;
    address private _whitelist;
    address private _onTokenFactoryImpl;
    address private _oracle;
    address private _controllerImpl;
    address private _oracleImpl;
    address private _calculatorImpl;
    address private _marginPool;

    function setONtokenImpl(address _newImpl) external {
        _onTokenImpl = _newImpl;
    }

    function setWhitelist(address _newImpl) external {
        _whitelist = _newImpl;
    }

    function setONtokenFactory(address _onTokenFactory) external {
        _onTokenFactoryImpl = _onTokenFactory;
    }

    function setController(address _controller) external {
        _controllerImpl = _controller;
    }

    function setOracle(address _oracleAddr) external {
        _oracleImpl = _oracleAddr;
    }

    function setMarginCalculator(address _calculator) external {
        _calculatorImpl = _calculator;
    }

    function setMarginPool(address _pool) external {
        _marginPool = _pool;
    }

    function getONtokenImpl() external view returns (address) {
        return _onTokenImpl;
    }

    function getWhitelist() external view returns (address) {
        return _whitelist;
    }

    function getONtokenFactory() external view returns (address) {
        return _onTokenFactoryImpl;
    }

    function getOracle() external view returns (address) {
        return _oracleImpl;
    }

    function getController() external view returns (address) {
        return _controllerImpl;
    }

    function getMarginCalculator() external view returns (address) {
        return _calculatorImpl;
    }

    function getMarginPool() external view returns (address) {
        return _marginPool;
    }
}
