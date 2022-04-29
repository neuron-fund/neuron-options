# Neuron fund options

# Architecture

[AddressBook](./contracts//core/AddressBook.sol) is an address discovery module that keeps track of all the contract addresses in the v2 system.
Whitelist is a module that manages all restrictions set by the admin.

[ONToken](./contracts/core/ONToken.sol) is the ERC20 contract that each represents an option product. Users can easily transfer any onToken just like any other ERC20 tokens, but only the Controller has the privilege to mint or burn onTokens.

[ONTokenFactory](./contracts/core/ONTokenFactory.sol) is a factory contract to clone ONtoken contracts, anyone can create options with arbitrary strike price and expiry, if the onToken params composition (underlying assset, collaterals assets + collateral assets constraints + strike asset + is Put or Call) is whitelisted. These params are: underlying assset, collaterals assets, collateral assets constraints, strike asset, is Put or Call.

[Controller](./contracts/core/Controller.sol) is the entry point for all users, it manages all the opened vaults for all sellers, and also takes care of the exercise operation for buyers. Users can do several operations in a single transaction through the operate function in Controller, and Controller will mint / burn onTokens (interact with ONToken contracts), move funds (interact with MarginPool).

[MarginCalculator](./contracts/core/MarginCalculator.sol) is a very specific math library for vaults. Its purpose is to calculate payouts for options redeemers, proper collaterization of options, return of collaterals for vaults on settle.

[Oracle](./contracts/core/Oracle.sol) is the oracle module for the whole system, the MarginCalculator will constantly read from oracle to determine if a vault is properly collateralized. The pricer roles are defined to determine who is in charge of submitting prices for each asset. MarginPool is the contract that stores all the funds, and only listens to transfer commands from Controller.

[MarginPool](./contracts/core/MarginPool.sol) is the contract that stores all the funds, and can only be called by the Controller. To open a vault, a user need to approve MarginPool contract to move its ERC20 tokens to deposit collateral and long onTokens.

# Dev

## Before all

---

- Run `npm i`

- Create `.env` following `.env.example`

## Tests

---

### Unit tests

```
npm run unit-tests
```

### E2E tests

Note that e2e test require RPC node set through `ALCHEMY` param in `.env` file

```
npm run e2e-tests
```

## Utils

---

### Check contract sizes

`npm run size-contracts`
