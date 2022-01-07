## Before all

`npm i`

## Compile contracts

`npx hardhat compile`

## Test

`npx hardhat test`

## Test deploy

First terminal:
`npx hardhat node`

Second terminal:
`npx hardhat run --network localhost scripts/deploy.js`

## Check contract sizes

`OPTIMIZER=200 npx hardhat compile --quiet --no-typechain && npx hardhat size-contracts`
