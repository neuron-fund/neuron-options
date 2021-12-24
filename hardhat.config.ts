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

const config: HardhatUserConfig = {
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
      chainId: process.env.POLYGON ? 1339 : 1337,
      forking: {
        url: process.env.POLYGON ? process.env.ALCHEMY_POLYGON : process.env.ALCHEMY,
        // Hardhat advices to set block number for testing
        // "You're running a network fork starting from the latest block.
        // Performance may degrade due to fetching data from the network with each run.
        // If connecting to an archival node (e.g. Alchemy), we strongly recommend setting
        // blockNumber to a fixed value to increase performance with a local cache."
        blockNumber: Number(process.env.FORK_BLOCK_NUMBER) || undefined,
      },
      loggingEnabled: true,
      blockGasLimit: 0x1fffffffffffff,
      gas: 120e9,
      accounts: getHardhatAccounts(),
    },
    prodMainnet: {
      url: process.env.PROD_MAINNET_RPC,
      gasPrice: 40e9,
      blockGasLimit: 5e6,
    },
    prodPolygon: {
      url: process.env.PROD_POLYGON_RPC,
    },
    localPolygon: {
      url: 'http://127.0.0.1:8546/',
    },
    testnet: {
      url: 'https://neurontestnet.xyz/',
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API,
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    timeout: 300000,
  },
  // TODO typed named accounts
  namedAccounts: {
    deployer: {
      default: 0,
    },
    pricerBot: {
      default: 1,
    },
    user: {
      default: 2,
    },
    redeemer: {
      default: 3,
    },
    random_user: {
      default: 4,
    },
    random_user2: {
      default: 5,
    },
    random_user3: {
      default: 6,
    },    
  }
}

export default config
