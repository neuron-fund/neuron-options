With modifiers
| Controller · 27.678 │

Without modifiers
| Controller · 27.736 │

Naked margin things removed
| Controller · 26.978 │

\_isCalleeWhitelisted function (used only once) removed
| Controller · 26.968

uint256 unused variable removed
Controller · 26.951

removed getConfiguration function
| Controller · 26.876

removed isOperator function
Controller · 26.805

removed try catch in getOTokenDetails
| Controller · 26.340 │

removed if (hasLong) { in \_settleVault
Controller · 26.130

shortOtokens made as uint not array
Controller · 25.581

## Array adress utils "isEqual" "\_isNotEmpty" optimizations

internal internal
| Controller · 25.651

external external
| Controller · 25.628 │

internal external
| Controller · 25.635 │

Adress external internal **WIN**
| Controller · 25.581 │

removed getAccountVaultCounter but made accountVaultCounter variable public
| Controller · 25.572

removed hasExpired function which content was just "return block.timestamp >= OtokenInterface(\_otoken).expiryTimestamp();"
| Controller · 25.418 │
·-------------------------------|-------------·

removed and made vaults public

```
// function getVault(address \_owner, uint256 \_vaultId) external view returns (MarginVault.Vault memory) {
// return (vaults[\_owner][_vaultid]);
// }
```

| Controller · 24.835 │

removed

```
function isSettlementAllowed(address _otoken) external view returns (bool) {
  (address[] memory collaterals, address underlying, address strike, uint256 expiry) = _getOtokenDetails(_otoken);
    return _canSettleAssets(underlying, strike, collaterals, expiry);
  }
```

**| Controller · 24.768 │**

removed getPayout and replaced it's usage by its content (1 usage)

````
  function getPayout(address _otoken, uint256 _amount) public view returns (uint256[] memory) {
        // payoutsRaw continats amounts of each of collateral asset in collateral asset decimals to be paid out for 1e8 of the oToken
        return calculator.getPayout(_otoken, _amount);
    }
    ```
````

| Controller · 24.735 │

removed

````
    function isLiquidatable(
        address _owner,
        uint256 _vaultId,
        uint256 _roundId
    )
        external
        view
        returns (
            bool,
            uint256,
            uint256[] memory
        )
    {
        (, bool isUnderCollat, uint256 price, uint256[] memory dust) = _isLiquidatable(_owner, _vaultId, _roundId);
        return (isUnderCollat, price, dust);
    }
    ```
````

Controller · 24.564 │ **WIN**
