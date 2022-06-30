import { config as dontenvConfig } from 'dotenv'
import dotenvExpand from 'dotenv-expand'
const env = dontenvConfig()
dotenvExpand(env)

import { HardhatUserConfig } from 'hardhat/config'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-deploy-ethers'
import 'hardhat-deploy'
import '@nomiclabs/hardhat-web3'
import 'hardhat-abi-exporter'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import '@nomiclabs/hardhat-etherscan'
import '@openzeppelin/hardhat-upgrades'
import '@nomiclabs/hardhat-solhint'
import 'hardhat-contract-sizer'
import { getHardhatAccounts } from './utils/accounts'
import '@nomiclabs/hardhat-truffle5'

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          optimizer: {
            enabled: true,
            // If the smart contract is only of one-time use as a smart contract for vesting or locking of tokens,
            // you can set the runs value to 1 so that the compiler will produce the smallest possible bytecode
            // but it may cost slightly more gas to call the function(s).
            // If you are deploying a contract that will be used a lot (like an ERC20 token), you should set the runs to a high number like 1337
            //  so that initial bytecode will be slightly larger but calls made to that contract will be cheaper.
            //  Commonly used functions like transfer will be cheaper.
            runs: Number(process.env.OPTIMIZER) || 200,
          },
        },
      },
    ],
  },
  abiExporter: {
    path: './abi',
  },
  networks: {
    hardhat: {
      chainId: 1337,
      forking: {
        url: process.env.RPC_URL,
        blockNumber: Number(process.env.FORK_BLOCK_NUMBER) || undefined,
      },
      loggingEnabled: true,
      blockGasLimit: 0x1fffffffffffff,
      gas: 120e9,
      accounts: getHardhatAccounts(),
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API,
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    timeout: 30000000,
  },
  namedAccounts: {
    deployer: {
      default: 10,
    },
    pricerBot: {
      default: 11,
    },
    user: {
      default: 12,
    },
    redeemer: {
      default: 13,
    },
    random_user: {
      default: 14,
    },
    random_user2: {
      default: 15,
    },
    random_user3: {
      default: 16,
    },
  },
}

export default config
