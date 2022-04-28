# ZeroXExchangeInterface

_ZeroX Exchange contract interface._

### LimitOrder

```solidity
struct LimitOrder {
  address makerToken;
  address takerToken;
  uint128 makerAmount;
  uint128 takerAmount;
  uint128 takerTokenFeeAmount;
  address maker;
  address taker;
  address sender;
  address feeRecipient;
  bytes32 pool;
  uint64 expiry;
  uint256 salt;
}
```

### Signature

```solidity
struct Signature {
  uint8 signatureType;
  uint8 v;
  bytes32 r;
  bytes32 s;
}
```

### batchFillLimitOrders

```solidity
function batchFillLimitOrders(struct ZeroXExchangeInterface.LimitOrder[] orders, struct ZeroXExchangeInterface.Signature[] signatures, uint128[] takerTokenFillAmounts, bool revertIfIncomplete) external payable returns (uint128[] takerTokenFilledAmounts, uint128[] makerTokenFilledAmounts)
```

_Executes multiple calls of fillLimitOrder._

| Name | Type | Description |
| ---- | ---- | ----------- |
| orders | struct ZeroXExchangeInterface.LimitOrder[] | Array of order specifications. |
| signatures | struct ZeroXExchangeInterface.Signature[] | Array of proofs that orders have been created by makers. |
| takerTokenFillAmounts | uint128[] | Array of desired amounts of takerToken to sell in orders. |
| revertIfIncomplete | bool |  |

| Name | Type | Description |
| ---- | ---- | ----------- |
| takerTokenFilledAmounts | uint128[] | Array of amount of takerToken(s) filled. |
| makerTokenFilledAmounts | uint128[] | Array of amount of makerToken(s) filled. |

