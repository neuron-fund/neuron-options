import { config as dontenvConfig } from 'dotenv'
import dotenvExpand from 'dotenv-expand'
const env = dontenvConfig()
dotenvExpand(env)

import { HardhatUserConfig } from 'hardhat/config'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-vyper'
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
      },
      loggingEnabled: true,
      blockGasLimit: 0x1fffffffffffff,
      gas: 120e9,
      accounts: getHardhatAccounts(20),
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
  vyper: {
    version: '0.2.12',
  },
  mocha: {
    reporter: 'eth-gas-reporter',
    timeout: 300000,
  },
  // namedAccounts: {
  //   default: {
  //     default: 0,

  //   }
  // }
}

export default config
