# Solidity API

## Initializable

_Helper contract to support initializer functions. To use it, replace
the constructor with a function that has the &#x60;initializer&#x60; modifier.
WARNING: Unlike constructors, initializer functions must be manually
invoked. This applies both to deploying an Initializable contract, as well
as extending an Initializable contract via inheritance.
WARNING: When used with inheritance, manual care must be taken to not invoke
a parent initializer twice, or ensure that all initializers are idempotent,
because this is not dealt with automatically as with constructors._

### initialized

```solidity
bool initialized
```

_Indicates that the contract has been initialized._

### initializing

```solidity
bool initializing
```

_Indicates that the contract is in the process of being initialized._

### initializer

```solidity
modifier initializer()
```

_Modifier to use in the initializer function of a contract._

### isConstructor

```solidity
function isConstructor() private view returns (bool)
```

_Returns true if and only if the function is running in the constructor_

### ______gap

```solidity
uint256[50] ______gap
```

