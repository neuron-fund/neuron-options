/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { MarginPool, MarginPoolInterface } from "../MarginPool";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_addressBook",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "receiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "AssetFarmed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "oldAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newAddress",
        type: "address",
      },
    ],
    name: "FarmerUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TransferToPool",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "asset",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "TransferToUser",
    type: "event",
  },
  {
    inputs: [],
    name: "addressBook",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_asset",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "_user",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_amount",
        type: "uint256[]",
      },
    ],
    name: "batchTransferToPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_asset",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "_user",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_amount",
        type: "uint256[]",
      },
    ],
    name: "batchTransferToUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_asset",
        type: "address",
      },
      {
        internalType: "address",
        name: "_receiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "farm",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "farmer",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_asset",
        type: "address",
      },
    ],
    name: "getStoredBalance",
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
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_farmer",
        type: "address",
      },
    ],
    name: "setFarmer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_asset",
        type: "address",
      },
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "transferToPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_asset",
        type: "address",
      },
      {
        internalType: "address",
        name: "_user",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "transferToUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516114eb3803806114eb83398101604081905261002f91610107565b610038336100b7565b6001600160a01b0381166100925760405162461bcd60e51b815260206004820152601460248201527f496e76616c6964206164647265737320626f6f6b000000000000000000000000604482015260640160405180910390fd5b600180546001600160a01b0319166001600160a01b0392909216919091179055610137565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b60006020828403121561011957600080fd5b81516001600160a01b038116811461013057600080fd5b9392505050565b6113a5806101466000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c8063d811fcf011610071578063d811fcf01461015d578063dd2c99f714610170578063e2ed781c14610183578063f2fde38b14610196578063f5887cdd146101a9578063fa93b2a5146101bc57600080fd5b80634979cd14146100b9578063715018a6146100ce57806386a19c5e146100d65780638da5cb5b146100e9578063baf46ba614610113578063c595b00714610126575b600080fd5b6100cc6100c7366004611071565b6101cf565b005b6100cc61038c565b6100cc6100e4366004611071565b6103c2565b6000546001600160a01b03165b6040516001600160a01b0390911681526020015b60405180910390f35b6100cc61012136600461114f565b610570565b61014f610134366004611190565b6001600160a01b031660009081526003602052604090205490565b60405190815260200161010a565b6002546100f6906001600160a01b031681565b6100cc61017e36600461114f565b610794565b6100cc610191366004611190565b61094f565b6100cc6101a4366004611190565b6109d5565b6001546100f6906001600160a01b031681565b6100cc6101ca36600461114f565b610a70565b600160009054906101000a90046001600160a01b03166001600160a01b0316633018205f6040518163ffffffff1660e01b815260040160206040518083038186803b15801561021d57600080fd5b505afa158015610231573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061025591906111ad565b6001600160a01b0316336001600160a01b03161461028e5760405162461bcd60e51b8152600401610285906111ca565b60405180910390fd5b815183511480156102a0575080518251145b6103125760405162461bcd60e51b815260206004820152603b60248201527f4d617267696e506f6f6c3a2062617463685472616e73666572546f506f6f6c2060448201527f6172726179206c656e6774687320617265206e6f7420657175616c00000000006064820152608401610285565b60005b8351811015610386576103748482815181106103335761033361120e565b602002602001015184838151811061034d5761034d61120e565b60200260200101518484815181106103675761036761120e565b6020026020010151610794565b8061037e8161123a565b915050610315565b50505050565b6000546001600160a01b031633146103b65760405162461bcd60e51b815260040161028590611255565b6103c06000610c24565b565b600160009054906101000a90046001600160a01b03166001600160a01b0316633018205f6040518163ffffffff1660e01b815260040160206040518083038186803b15801561041057600080fd5b505afa158015610424573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061044891906111ad565b6001600160a01b0316336001600160a01b0316146104785760405162461bcd60e51b8152600401610285906111ca565b8151835114801561048a575080518251145b6104fc5760405162461bcd60e51b815260206004820152603b60248201527f4d617267696e506f6f6c3a2062617463685472616e73666572546f557365722060448201527f6172726179206c656e6774687320617265206e6f7420657175616c00000000006064820152608401610285565b60005b83518110156103865761055e84828151811061051d5761051d61120e565b60200260200101518483815181106105375761053761120e565b60200260200101518484815181106105515761055161120e565b6020026020010151610a70565b806105688161123a565b9150506104ff565b6002546001600160a01b031633146105ca5760405162461bcd60e51b815260206004820181905260248201527f4d617267696e506f6f6c3a2053656e646572206973206e6f74206661726d65726044820152606401610285565b6001600160a01b03821661062c5760405162461bcd60e51b8152602060048201526024808201527f4d617267696e506f6f6c3a20696e76616c6964207265636569766572206164646044820152637265737360e01b6064820152608401610285565b6040516370a0823160e01b81523060048201526000906001600160a01b038516906370a082319060240160206040518083038186803b15801561066e57600080fd5b505afa158015610682573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906106a6919061128a565b6001600160a01b0385166000908152600360205260409020549091506106cc8282610c74565b83111561072c5760405162461bcd60e51b815260206004820152602860248201527f4d617267696e506f6f6c3a20616d6f756e7420746f206661726d206578636565604482015267191cc81b1a5b5a5d60c21b6064820152608401610285565b6107406001600160a01b0386168585610c87565b836001600160a01b0316856001600160a01b03167f2bfce9f5efc2d7cd579270748ddf9d23bc6c0af5193a2759314c2300af9956b18560405161078591815260200190565b60405180910390a35050505050565b600160009054906101000a90046001600160a01b03166001600160a01b0316633018205f6040518163ffffffff1660e01b815260040160206040518083038186803b1580156107e257600080fd5b505afa1580156107f6573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061081a91906111ad565b6001600160a01b0316336001600160a01b03161461084a5760405162461bcd60e51b8152600401610285906111ca565b600081116108b25760405162461bcd60e51b815260206004820152602f60248201527f4d617267696e506f6f6c3a207472616e73666572546f506f6f6c20616d6f756e60448201526e07420697320657175616c20746f203608c1b6064820152608401610285565b6001600160a01b0383166000908152600360205260409020546108d59082610cef565b6001600160a01b0384166000818152600360205260409020919091556108fd90833084610cfb565b816001600160a01b0316836001600160a01b03167f9b4f8cdd00ca1dad21e1b00707351fe747dd74738cf95f60f66518c52c35e6458360405161094291815260200190565b60405180910390a3505050565b6000546001600160a01b031633146109795760405162461bcd60e51b815260040161028590611255565b6002546040516001600160a01b038084169216907fec2062989428d4fc69d3ba2664807361f4647daf215450588331bbe51efb6a6890600090a3600280546001600160a01b0319166001600160a01b0392909216919091179055565b6000546001600160a01b031633146109ff5760405162461bcd60e51b815260040161028590611255565b6001600160a01b038116610a645760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610285565b610a6d81610c24565b50565b600160009054906101000a90046001600160a01b03166001600160a01b0316633018205f6040518163ffffffff1660e01b815260040160206040518083038186803b158015610abe57600080fd5b505afa158015610ad2573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610af691906111ad565b6001600160a01b0316336001600160a01b031614610b265760405162461bcd60e51b8152600401610285906111ca565b6001600160a01b038216301415610b955760405162461bcd60e51b815260206004820152602d60248201527f4d617267696e506f6f6c3a2063616e6e6f74207472616e73666572206173736560448201526c3a39903a379037b732b9b2b63360991b6064820152608401610285565b6001600160a01b038316600090815260036020526040902054610bb89082610c74565b6001600160a01b038416600081815260036020526040902091909155610bdf908383610c87565b816001600160a01b0316836001600160a01b03167f2d6ff46a316ec627f7677daafa6ad7d6f36bcf938c5f47bf6e671b09d27b415f8360405161094291815260200190565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6000610c8082846112a3565b9392505050565b6040516001600160a01b038316602482015260448101829052610cea90849063a9059cbb60e01b906064015b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b031990931692909217909152610d33565b505050565b6000610c8082846112ba565b6040516001600160a01b03808516602483015283166044820152606481018290526103869085906323b872dd60e01b90608401610cb3565b6000610d88826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c6564815250856001600160a01b0316610e059092919063ffffffff16565b805190915015610cea5780806020019051810190610da691906112d2565b610cea5760405162461bcd60e51b815260206004820152602a60248201527f5361666545524332303a204552433230206f7065726174696f6e20646964206e6044820152691bdd081cdd58d8d9595960b21b6064820152608401610285565b6060610e148484600085610e1c565b949350505050565b606082471015610e7d5760405162461bcd60e51b815260206004820152602660248201527f416464726573733a20696e73756666696369656e742062616c616e636520666f6044820152651c8818d85b1b60d21b6064820152608401610285565b843b610ecb5760405162461bcd60e51b815260206004820152601d60248201527f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000006044820152606401610285565b600080866001600160a01b03168587604051610ee79190611320565b60006040518083038185875af1925050503d8060008114610f24576040519150601f19603f3d011682016040523d82523d6000602084013e610f29565b606091505b5091509150610f39828286610f44565b979650505050505050565b60608315610f53575081610c80565b825115610f635782518084602001fd5b8160405162461bcd60e51b8152600401610285919061133c565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff81118282101715610fbc57610fbc610f7d565b604052919050565b600067ffffffffffffffff821115610fde57610fde610f7d565b5060051b60200190565b6001600160a01b0381168114610a6d57600080fd5b600082601f83011261100e57600080fd5b8135602061102361101e83610fc4565b610f93565b82815260059290921b8401810191818101908684111561104257600080fd5b8286015b8481101561106657803561105981610fe8565b8352918301918301611046565b509695505050505050565b60008060006060848603121561108657600080fd5b833567ffffffffffffffff8082111561109e57600080fd5b6110aa87838801610ffd565b94506020915081860135818111156110c157600080fd5b6110cd88828901610ffd565b9450506040860135818111156110e257600080fd5b86019050601f810187136110f557600080fd5b803561110361101e82610fc4565b81815260059190911b8201830190838101908983111561112257600080fd5b928401925b8284101561114057833582529284019290840190611127565b80955050505050509250925092565b60008060006060848603121561116457600080fd5b833561116f81610fe8565b9250602084013561117f81610fe8565b929592945050506040919091013590565b6000602082840312156111a257600080fd5b8135610c8081610fe8565b6000602082840312156111bf57600080fd5b8151610c8081610fe8565b60208082526024908201527f4d617267696e506f6f6c3a2053656e646572206973206e6f7420436f6e74726f604082015263363632b960e11b606082015260800190565b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b600060001982141561124e5761124e611224565b5060010190565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b60006020828403121561129c57600080fd5b5051919050565b6000828210156112b5576112b5611224565b500390565b600082198211156112cd576112cd611224565b500190565b6000602082840312156112e457600080fd5b81518015158114610c8057600080fd5b60005b8381101561130f5781810151838201526020016112f7565b838111156103865750506000910152565b600082516113328184602087016112f4565b9190910192915050565b602081526000825180602084015261135b8160408501602087016112f4565b601f01601f1916919091016040019291505056fea264697066735822122041dfde87e8d3457f956c70f5d3e1e284db2e077ddfaecf03bedfb0c77db3d83d64736f6c63430008090033";

type MarginPoolConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MarginPoolConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MarginPool__factory extends ContractFactory {
  constructor(...args: MarginPoolConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _addressBook: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MarginPool> {
    return super.deploy(_addressBook, overrides || {}) as Promise<MarginPool>;
  }
  getDeployTransaction(
    _addressBook: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_addressBook, overrides || {});
  }
  attach(address: string): MarginPool {
    return super.attach(address) as MarginPool;
  }
  connect(signer: Signer): MarginPool__factory {
    return super.connect(signer) as MarginPool__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MarginPoolInterface {
    return new utils.Interface(_abi) as MarginPoolInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MarginPool {
    return new Contract(address, _abi, signerOrProvider) as MarginPool;
  }
}