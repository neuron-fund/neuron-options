/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Signer,
  utils,
  Contract,
  ContractFactory,
  Overrides,
  BigNumberish,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  MockPermitERC20,
  MockPermitERC20Interface,
} from "../MockPermitERC20";

const _abi = [
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_symbol",
        type: "string",
      },
      {
        internalType: "uint8",
        name: "_decimals",
        type: "uint8",
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
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
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
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
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
        name: "account",
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
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "subtractedValue",
        type: "uint256",
      },
    ],
    name: "decreaseAllowance",
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
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "addedValue",
        type: "uint256",
      },
    ],
    name: "increaseAllowance",
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
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "nonces",
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
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
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
        name: "sender",
        type: "address",
      },
      {
        internalType: "address",
        name: "recipient",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
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
];

const _bytecode =
  "0x60806040523480156200001157600080fd5b506040516200155538038062001555833981016040819052620000349162000461565b62000040838362000068565b6200004b83620000f8565b60cc805460ff191660ff9290921691909117905550620005239050565b600054610100900460ff16620000c85760405162461bcd60e51b815260206004820152602b60248201526000805160206200153583398151915260448201526a6e697469616c697a696e6760a81b60648201526084015b60405180910390fd5b8151620000dd906036906020850190620002ee565b508051620000f3906037906020840190620002ee565b505050565b600054610100900460ff16620001545760405162461bcd60e51b815260206004820152602b60248201526000805160206200153583398151915260448201526a6e697469616c697a696e6760a81b6064820152608401620000bf565b6200015e62000197565b6200018981604051806040016040528060018152602001603160f81b815250620001f560201b60201c565b62000194816200026b565b50565b600054610100900460ff16620001f35760405162461bcd60e51b815260206004820152602b60248201526000805160206200153583398151915260448201526a6e697469616c697a696e6760a81b6064820152608401620000bf565b565b600054610100900460ff16620002515760405162461bcd60e51b815260206004820152602b60248201526000805160206200153583398151915260448201526a6e697469616c697a696e6760a81b6064820152608401620000bf565b815160209283012081519190920120606591909155606655565b600054610100900460ff16620002c75760405162461bcd60e51b815260206004820152602b60248201526000805160206200153583398151915260448201526a6e697469616c697a696e6760a81b6064820152608401620000bf565b507f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9609a55565b828054620002fc90620004e6565b90600052602060002090601f0160209004810192826200032057600085556200036b565b82601f106200033b57805160ff19168380011785556200036b565b828001600101855582156200036b579182015b828111156200036b5782518255916020019190600101906200034e565b50620003799291506200037d565b5090565b5b808211156200037957600081556001016200037e565b634e487b7160e01b600052604160045260246000fd5b600082601f830112620003bc57600080fd5b81516001600160401b0380821115620003d957620003d962000394565b604051601f8301601f19908116603f0116810190828211818310171562000404576200040462000394565b816040528381526020925086838588010111156200042157600080fd5b600091505b8382101562000445578582018301518183018401529082019062000426565b83821115620004575760008385830101525b9695505050505050565b6000806000606084860312156200047757600080fd5b83516001600160401b03808211156200048f57600080fd5b6200049d87838801620003aa565b94506020860151915080821115620004b457600080fd5b50620004c386828701620003aa565b925050604084015160ff81168114620004db57600080fd5b809150509250925092565b600181811c90821680620004fb57607f821691505b602082108114156200051d57634e487b7160e01b600052602260045260246000fd5b50919050565b61100280620005336000396000f3fe608060405234801561001057600080fd5b50600436106100f55760003560e01c806340c10f1911610097578063a457c2d711610066578063a457c2d7146101e9578063a9059cbb146101fc578063d505accf1461020f578063dd62ed3e1461022257600080fd5b806340c10f191461019057806370a08231146101a55780637ecebe00146101ce57806395d89b41146101e157600080fd5b806323b872dd116100d357806323b872dd1461014d578063313ce567146101605780633644e51514610175578063395093511461017d57600080fd5b806306fdde03146100fa578063095ea7b31461011857806318160ddd1461013b575b600080fd5b61010261025b565b60405161010f9190610dbc565b60405180910390f35b61012b610126366004610e2d565b6102ed565b604051901515815260200161010f565b6035545b60405190815260200161010f565b61012b61015b366004610e57565b610303565b60cc5460405160ff909116815260200161010f565b61013f6103b2565b61012b61018b366004610e2d565b6103c1565b6101a361019e366004610e2d565b6103fd565b005b61013f6101b3366004610e93565b6001600160a01b031660009081526033602052604090205490565b61013f6101dc366004610e93565b61040b565b61010261042b565b61012b6101f7366004610e2d565b61043a565b61012b61020a366004610e2d565b6104d3565b6101a361021d366004610eb5565b6104e0565b61013f610230366004610f28565b6001600160a01b03918216600090815260346020908152604080832093909416825291909152205490565b60606036805461026a90610f5b565b80601f016020809104026020016040519081016040528092919081815260200182805461029690610f5b565b80156102e35780601f106102b8576101008083540402835291602001916102e3565b820191906000526020600020905b8154815290600101906020018083116102c657829003601f168201915b5050505050905090565b60006102fa338484610626565b50600192915050565b600061031084848461074a565b6001600160a01b03841660009081526034602090815260408083203384529091529020548281101561039a5760405162461bcd60e51b815260206004820152602860248201527f45524332303a207472616e7366657220616d6f756e74206578636565647320616044820152676c6c6f77616e636560c01b60648201526084015b60405180910390fd5b6103a78533858403610626565b506001949350505050565b60006103bc610919565b905090565b3360008181526034602090815260408083206001600160a01b038716845290915281205490916102fa9185906103f8908690610f90565b610626565b6104078282610994565b5050565b6001600160a01b0381166000908152609960205260408120545b92915050565b60606037805461026a90610f5b565b3360009081526034602090815260408083206001600160a01b0386168452909152812054828110156104bc5760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b6064820152608401610391565b6104c93385858403610626565b5060019392505050565b60006102fa33848461074a565b834211156105305760405162461bcd60e51b815260206004820152601d60248201527f45524332305065726d69743a206578706972656420646561646c696e650000006044820152606401610391565b6000609a548888886105418c610a73565b6040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810186905260e001604051602081830303815290604052805190602001209050600061059c82610a9b565b905060006105ac82878787610ae9565b9050896001600160a01b0316816001600160a01b03161461060f5760405162461bcd60e51b815260206004820152601e60248201527f45524332305065726d69743a20696e76616c6964207369676e617475726500006044820152606401610391565b61061a8a8a8a610626565b50505050505050505050565b6001600160a01b0383166106885760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610391565b6001600160a01b0382166106e95760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610391565b6001600160a01b0383811660008181526034602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925910160405180910390a3505050565b6001600160a01b0383166107ae5760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610391565b6001600160a01b0382166108105760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610391565b6001600160a01b038316600090815260336020526040902054818110156108885760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610391565b6001600160a01b038085166000908152603360205260408082208585039055918516815290812080548492906108bf908490610f90565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef8460405161090b91815260200190565b60405180910390a350505050565b60006103bc7f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f61094860655490565b6066546040805160208101859052908101839052606081018290524660808201523060a082015260009060c0016040516020818303038152906040528051906020012090509392505050565b6001600160a01b0382166109ea5760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610391565b80603560008282546109fc9190610f90565b90915550506001600160a01b03821660009081526033602052604081208054839290610a29908490610f90565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b6001600160a01b03811660009081526099602052604090208054600181018255905b50919050565b6000610425610aa8610919565b8360405161190160f01b6020820152602281018390526042810182905260009060620160405160208183030381529060405280519060200120905092915050565b6000806000610afa87878787610b11565b91509150610b0781610bfe565b5095945050505050565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115610b485750600090506003610bf5565b8460ff16601b14158015610b6057508460ff16601c14155b15610b715750600090506004610bf5565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa158015610bc5573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116610bee57600060019250925050610bf5565b9150600090505b94509492505050565b6000816004811115610c1257610c12610fb6565b1415610c1b5750565b6001816004811115610c2f57610c2f610fb6565b1415610c7d5760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606401610391565b6002816004811115610c9157610c91610fb6565b1415610cdf5760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606401610391565b6003816004811115610cf357610cf3610fb6565b1415610d4c5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b6064820152608401610391565b6004816004811115610d6057610d60610fb6565b1415610db95760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604482015261756560f01b6064820152608401610391565b50565b600060208083528351808285015260005b81811015610de957858101830151858201604001528201610dcd565b81811115610dfb576000604083870101525b50601f01601f1916929092016040019392505050565b80356001600160a01b0381168114610e2857600080fd5b919050565b60008060408385031215610e4057600080fd5b610e4983610e11565b946020939093013593505050565b600080600060608486031215610e6c57600080fd5b610e7584610e11565b9250610e8360208501610e11565b9150604084013590509250925092565b600060208284031215610ea557600080fd5b610eae82610e11565b9392505050565b600080600080600080600060e0888a031215610ed057600080fd5b610ed988610e11565b9650610ee760208901610e11565b95506040880135945060608801359350608088013560ff81168114610f0b57600080fd5b9699959850939692959460a0840135945060c09093013592915050565b60008060408385031215610f3b57600080fd5b610f4483610e11565b9150610f5260208401610e11565b90509250929050565b600181811c90821680610f6f57607f821691505b60208210811415610a9557634e487b7160e01b600052602260045260246000fd5b60008219821115610fb157634e487b7160e01b600052601160045260246000fd5b500190565b634e487b7160e01b600052602160045260246000fdfea26469706673582212202ead7aebcc9e2f95ead1436d05eb9a48d21ead32f482781fed8a2c421e0b49ab64736f6c63430008090033496e697469616c697a61626c653a20636f6e7472616374206973206e6f742069";

type MockPermitERC20ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockPermitERC20ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockPermitERC20__factory extends ContractFactory {
  constructor(...args: MockPermitERC20ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _name: string,
    _symbol: string,
    _decimals: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MockPermitERC20> {
    return super.deploy(
      _name,
      _symbol,
      _decimals,
      overrides || {}
    ) as Promise<MockPermitERC20>;
  }
  getDeployTransaction(
    _name: string,
    _symbol: string,
    _decimals: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _name,
      _symbol,
      _decimals,
      overrides || {}
    );
  }
  attach(address: string): MockPermitERC20 {
    return super.attach(address) as MockPermitERC20;
  }
  connect(signer: Signer): MockPermitERC20__factory {
    return super.connect(signer) as MockPermitERC20__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockPermitERC20Interface {
    return new utils.Interface(_abi) as MockPermitERC20Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MockPermitERC20 {
    return new Contract(address, _abi, signerOrProvider) as MockPermitERC20;
  }
}