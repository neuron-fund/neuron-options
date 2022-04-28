# Solidity API

## CountersUpgradeable

_Provides counters that can only be incremented or decremented by one. This can be used e.g. to track the number
of elements in a mapping, issuing ERC721 ids, or counting request ids.

Include with &#x60;using Counters for Counters.Counter;&#x60;
Since it is not possible to overflow a 256 bit integer with increments of one, &#x60;increment&#x60; can skip the {SafeMath}
overflow check, thereby saving gas. This does assume however correct usage, in that the underlying &#x60;_value&#x60; is never
directly accessed._

### Counter

```solidity
struct Counter {
  uint256 _value;
}
```

### current

```solidity
function current(struct CountersUpgradeable.Counter counter) internal view returns (uint256)
```

### increment

```solidity
function increment(struct CountersUpgradeable.Counter counter) internal
```

### decrement

```solidity
function decrement(struct CountersUpgradeable.Counter counter) internal
```

