import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'


import '@nomiclabs/hardhat-web3'
import 'hardhat-abi-exporter'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import '@nomiclabs/hardhat-etherscan'
import '@openzeppelin/hardhat-upgrades'
import '@nomiclabs/hardhat-solhint'
import 'hardhat-contract-sizer'
// import 'solidity-coverage'
import { getHardhatAccounts } from './utils/accounts'

import "@nomiclabs/hardhat-truffle5";


module.exports = {
  paths: {
      // contracts: "./contracts",
      // artifacts: "./artifacts"
  },
  solidity: {
      compilers: [
          {
            version: '0.8.9',
            settings: {
              optimizer: {
                enabled: true,
                // TODO figure out best value
                // If the smart contract is only of one-time use as a smart contract for vesting or locking of tokens,
                // you can set the runs value to 1 so that the compiler will produce the smallest possible bytecode
                // but it may cost slightly more gas to call the function(s).
                // If you are deploying a contract that will be used a lot (like an ERC20 token), you should set the runs to a high number like 1337
                //  so that initial bytecode will be slightly larger but calls made to that contract will be cheaper.
                //  Commonly used functions like transfer will be cheaper.
                runs: 200,
              },
            },
          },
        ],    
},
  networks: {
      hardhat: {
          accounts: getHardhatAccounts(),
          gas: 10000000,  // tx gas limit
          blockGasLimit: 15000000, 
          gasPrice: 20000000000,
          hardfork: "london",
          initialBaseFeePerGas: 0
      }
  },
  mocha: {    
      reporter: 'eth-gas-reporter',
      timeout: 12000000 
  },
  rpc: {
      host: "localhost",
      port: 8545
  },
};
