/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { WETH9, WETH9Interface } from "../WETH9";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "guy",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "dst",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "src",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256",
      },
    ],
    name: "Withdrawal",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_guy",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_wad",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_dst",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_wad",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_src",
        type: "address",
      },
      {
        internalType: "address",
        name: "_dst",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_wad",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_wad",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x60c0604052600d60808190526c2bb930b83832b21022ba3432b960991b60a090815261002e916000919061007a565b50604080518082019091526004808252630ae8aa8960e31b602090920191825261005a9160019161007a565b506002805460ff1916601217905534801561007457600080fd5b5061014e565b82805461008690610113565b90600052602060002090601f0160209004810192826100a857600085556100ee565b82601f106100c157805160ff19168380011785556100ee565b828001600101855582156100ee579182015b828111156100ee5782518255916020019190600101906100d3565b506100fa9291506100fe565b5090565b5b808211156100fa57600081556001016100ff565b600181811c9082168061012757607f821691505b6020821081141561014857634e487b7160e01b600052602260045260246000fd5b50919050565b6108b28061015d6000396000f3fe6080604052600436106100a05760003560e01c8063313ce56711610064578063313ce5671461016c57806370a082311461019857806395d89b41146101c5578063a9059cbb146101da578063d0e30db0146101fa578063dd62ed3e1461020257600080fd5b806306fdde03146100b4578063095ea7b3146100df57806318160ddd1461010f57806323b872dd1461012c5780632e1a7d4d1461014c57600080fd5b366100af576100ad61023a565b005b600080fd5b3480156100c057600080fd5b506100c9610295565b6040516100d691906106be565b60405180910390f35b3480156100eb57600080fd5b506100ff6100fa36600461072f565b610323565b60405190151581526020016100d6565b34801561011b57600080fd5b50475b6040519081526020016100d6565b34801561013857600080fd5b506100ff610147366004610759565b61038f565b34801561015857600080fd5b506100ad610167366004610795565b6105a9565b34801561017857600080fd5b506002546101869060ff1681565b60405160ff90911681526020016100d6565b3480156101a457600080fd5b5061011e6101b33660046107ae565b60036020526000908152604090205481565b3480156101d157600080fd5b506100c961069d565b3480156101e657600080fd5b506100ff6101f536600461072f565b6106aa565b6100ad61023a565b34801561020e57600080fd5b5061011e61021d3660046107c9565b600460209081526000928352604080842090915290825290205481565b3360009081526003602052604081208054349290610259908490610812565b909155505060405134815233907fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c9060200160405180910390a2565b600080546102a29061082a565b80601f01602080910402602001604051908101604052809291908181526020018280546102ce9061082a565b801561031b5780601f106102f05761010080835404028352916020019161031b565b820191906000526020600020905b8154815290600101906020018083116102fe57829003601f168201915b505050505081565b3360008181526004602090815260408083206001600160a01b038716808552925280832085905551919290917f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259061037e9086815260200190565b60405180910390a350600192915050565b6001600160a01b0383166000908152600360205260408120548211156104075760405162461bcd60e51b815260206004820152602260248201527f57455448393a20696e73756666696369656e7420736f757263652062616c616e604482015261636560f01b60648201526084015b60405180910390fd5b6001600160a01b038416331480159061044557506001600160a01b038416600090815260046020908152604080832033845290915290205460001914155b156104f6576001600160a01b03841660009081526004602090815260408083203384529091529020548211156104bd5760405162461bcd60e51b815260206004820152601860248201527f57455448393a20696e76616c696420616c6c6f77616e6365000000000000000060448201526064016103fe565b6001600160a01b0384166000908152600460209081526040808320338452909152812080548492906104f0908490610865565b90915550505b6001600160a01b0384166000908152600360205260408120805484929061051e908490610865565b90915550506001600160a01b0383166000908152600360205260408120805484929061054b908490610812565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161059791815260200190565b60405180910390a35060019392505050565b336000908152600360205260409020548111156106135760405162461bcd60e51b815260206004820152602260248201527f57455448393a20696e73756666696369656e742073656e6465722062616c616e604482015261636560f01b60648201526084016103fe565b3360009081526003602052604081208054839290610632908490610865565b9091555050604051339082156108fc029083906000818181858888f19350505050158015610664573d6000803e3d6000fd5b5060405181815233907f7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b659060200160405180910390a250565b600180546102a29061082a565b60006106b733848461038f565b9392505050565b600060208083528351808285015260005b818110156106eb578581018301518582016040015282016106cf565b818111156106fd576000604083870101525b50601f01601f1916929092016040019392505050565b80356001600160a01b038116811461072a57600080fd5b919050565b6000806040838503121561074257600080fd5b61074b83610713565b946020939093013593505050565b60008060006060848603121561076e57600080fd5b61077784610713565b925061078560208501610713565b9150604084013590509250925092565b6000602082840312156107a757600080fd5b5035919050565b6000602082840312156107c057600080fd5b6106b782610713565b600080604083850312156107dc57600080fd5b6107e583610713565b91506107f360208401610713565b90509250929050565b634e487b7160e01b600052601160045260246000fd5b60008219821115610825576108256107fc565b500190565b600181811c9082168061083e57607f821691505b6020821081141561085f57634e487b7160e01b600052602260045260246000fd5b50919050565b600082821015610877576108776107fc565b50039056fea2646970667358221220ca1f95b09a9fbdcba14a73a16dcc12898858b2a7be331f9579a9e7002776088564736f6c63430008090033";

type WETH9ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WETH9ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WETH9__factory extends ContractFactory {
  constructor(...args: WETH9ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<WETH9> {
    return super.deploy(overrides || {}) as Promise<WETH9>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): WETH9 {
    return super.attach(address) as WETH9;
  }
  connect(signer: Signer): WETH9__factory {
    return super.connect(signer) as WETH9__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WETH9Interface {
    return new utils.Interface(_abi) as WETH9Interface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): WETH9 {
    return new Contract(address, _abi, signerOrProvider) as WETH9;
  }
}
