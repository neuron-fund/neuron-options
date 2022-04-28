# Spawn

This contract provides creation code that is used by Spawner in order
to initialize and deploy eip-1167 minimal proxies for a given logic contract.
SPDX-License-Identifier: MIT

### constructor

```solidity
constructor(address logicContract, bytes initializationCalldata) public payable
```

