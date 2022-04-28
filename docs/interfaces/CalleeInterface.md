# CalleeInterface

_Contract interface that can be called from Controller as a call action._

### callFunction

```solidity
function callFunction(address payable _sender, bytes _data) external
```

Allows users to send this contract arbitrary data.

| Name | Type | Description |
| ---- | ---- | ----------- |
| _sender | address payable | The msg.sender to Controller |
| _data | bytes | Arbitrary data given by the sender |

