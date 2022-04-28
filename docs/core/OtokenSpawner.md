# Solidity API

## OtokenSpawner

This contract spawns and initializes eip-1167 minimal proxies that
point to existing logic contracts.
This contract was modified from Spawner.sol
https://github.com/0age/Spawner/blob/master/contracts/Spawner.sol to fit into OtokenFactory

### SALT

```solidity
bytes32 SALT
```

### _spawn

```solidity
function _spawn(address logicContract, bytes initializationCalldata) internal returns (address)
```

internal function for spawning an eip-1167 minimal proxy using &#x60;CREATE2&#x60;

| Name | Type | Description |
| ---- | ---- | ----------- |
| logicContract | address | address of the logic contract |
| initializationCalldata | bytes | calldata that will be supplied to the &#x60;DELEGATECALL&#x60; from the spawned contract to the logic contract during contract creation |

| Name | Type | Description |
| ---- | ---- | ----------- |
| [0] | address | spawnedContract the address of the newly-spawned contract |

### _computeAddress

```solidity
function _computeAddress(address logicContract, bytes initializationCalldata) internal view returns (address target)
```

internal view function for finding the address of the standard
eip-1167 minimal proxy created using &#x60;CREATE2&#x60; with a given logic contract
and initialization calldata payload

| Name | Type | Description |
| ---- | ---- | ----------- |
| logicContract | address | address of the logic contract |
| initializationCalldata | bytes | calldata that will be supplied to the &#x60;DELEGATECALL&#x60; from the spawned contract to the logic contract during contract creation |

| Name | Type | Description |
| ---- | ---- | ----------- |
| target | address | address of the next spawned minimal proxy contract with the given parameters. |

