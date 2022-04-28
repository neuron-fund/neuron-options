# Solidity API

## Proxy

_Gives the possibility to delegate any call to a foreign implementation._

### implementation

```solidity
function implementation() public view virtual returns (address)
```

_Tells the address of the implementation where every call will be delegated._

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | address of the implementation to which it will be delegated |

### fallback

```solidity
fallback() external payable
```

_Fallback function allowing to perform a delegatecall to the given implementation.
This function will return whatever the implementation call returns_

