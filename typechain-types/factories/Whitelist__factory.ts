/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Whitelist, WhitelistInterface } from "../Whitelist";

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
        name: "_callee",
        type: "address",
      },
    ],
    name: "CalleeBlacklisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "_callee",
        type: "address",
      },
    ],
    name: "CalleeWhitelisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address[]",
        name: "collateral",
        type: "address[]",
      },
    ],
    name: "CollateralBlacklisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address[]",
        name: "collateral",
        type: "address[]",
      },
    ],
    name: "CollateralWhitelisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "otoken",
        type: "address",
      },
    ],
    name: "OtokenBlacklisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "otoken",
        type: "address",
      },
    ],
    name: "OtokenWhitelisted",
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
        indexed: false,
        internalType: "bytes32",
        name: "productHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "underlying",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "strike",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address[]",
        name: "collateral",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPut",
        type: "bool",
      },
    ],
    name: "ProductBlacklisted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "productHash",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "underlying",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "strike",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address[]",
        name: "collaterals",
        type: "address[]",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPut",
        type: "bool",
      },
    ],
    name: "ProductWhitelisted",
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
        internalType: "address",
        name: "_callee",
        type: "address",
      },
    ],
    name: "blacklistCallee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_collaterals",
        type: "address[]",
      },
    ],
    name: "blacklistCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_otokenAddress",
        type: "address",
      },
    ],
    name: "blacklistOtoken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_underlying",
        type: "address",
      },
      {
        internalType: "address",
        name: "_strike",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "_collaterals",
        type: "address[]",
      },
      {
        internalType: "bool",
        name: "_isPut",
        type: "bool",
      },
    ],
    name: "blacklistProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_callee",
        type: "address",
      },
    ],
    name: "isWhitelistedCallee",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_collaterals",
        type: "address[]",
      },
    ],
    name: "isWhitelistedCollaterals",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_otoken",
        type: "address",
      },
    ],
    name: "isWhitelistedOtoken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_underlying",
        type: "address",
      },
      {
        internalType: "address",
        name: "_strike",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "_collateral",
        type: "address[]",
      },
      {
        internalType: "bool",
        name: "_isPut",
        type: "bool",
      },
    ],
    name: "isWhitelistedProduct",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
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
        name: "_callee",
        type: "address",
      },
    ],
    name: "whitelistCallee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "_collaterals",
        type: "address[]",
      },
    ],
    name: "whitelistCollaterals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_otokenAddress",
        type: "address",
      },
    ],
    name: "whitelistOtoken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_underlying",
        type: "address",
      },
      {
        internalType: "address",
        name: "_strike",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "_collaterals",
        type: "address[]",
      },
      {
        internalType: "bool",
        name: "_isPut",
        type: "bool",
      },
    ],
    name: "whitelistProduct",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610eb1380380610eb183398101604081905261002f91610107565b610038336100b7565b6001600160a01b0381166100925760405162461bcd60e51b815260206004820152601460248201527f496e76616c6964206164647265737320626f6f6b000000000000000000000000604482015260640160405180910390fd5b600180546001600160a01b0319166001600160a01b0392909216919091179055610137565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b60006020828403121561011957600080fd5b81516001600160a01b038116811461013057600080fd5b9392505050565b610d6b806101466000396000f3fe608060405234801561001057600080fd5b50600436106101005760003560e01c8063a2ae545a11610097578063ebd31e8e11610066578063ebd31e8e14610239578063ec7127b61461024c578063f2fde38b1461025f578063f5887cdd1461027257600080fd5b8063a2ae545a146101d4578063b8760fb614610200578063bb7a7df814610213578063bd365d5c1461022657600080fd5b8063715018a6116100d3578063715018a61461018157806379df1e44146101895780638da5cb5b1461019c578063a03eb6ef146101c157600080fd5b806311946b9814610105578063469f1c4f14610146578063668414f71461015b578063708a03931461016e575b600080fd5b610131610113366004610ac7565b6001600160a01b031660009081526004602052604090205460ff1690565b60405190151581526020015b60405180910390f35b610159610154366004610b37565b610285565b005b610159610169366004610bb9565b610409565b61015961017c366004610ac7565b6104cb565b610159610541565b610159610197366004610ac7565b610577565b6000546001600160a01b03165b6040516001600160a01b03909116815260200161013d565b6101316101cf366004610bb9565b6105ea565b6101316101e2366004610ac7565b6001600160a01b031660009081526005602052604090205460ff1690565b61013161020e366004610b37565b610633565b610159610221366004610b37565b610682565b610159610234366004610bb9565b610751565b610159610247366004610ac7565b610813565b61015961025a366004610ac7565b610886565b61015961026d366004610ac7565b6109c7565b6001546101a9906001600160a01b031681565b6000546001600160a01b031633146102b85760405162461bcd60e51b81526004016102af90610bfb565b60405180910390fd5b6003600084846040516020016102cf929190610c79565b60408051601f198184030181529181528151602092830120835290820192909252016000205460ff166103555760405162461bcd60e51b815260206004820152602860248201527f57686974656c6973743a20436f6c6c61746572616c206973206e6f74207768696044820152671d195b1a5cdd195960c21b60648201526084016102af565b60008585858585604051602001610370959493929190610c95565b60408051601f19818403018152828252805160209182012060008181526002909252919020805460ff1916600117905591506103af9085908590610cd6565b604080519182900382208383528415156020840152916001600160a01b0380891692908a16917f487e44930714e3200672ff6f65931b6b0ee7f5c21f42897857c6e1553c04c96491015b60405180910390a4505050505050565b6000546001600160a01b031633146104335760405162461bcd60e51b81526004016102af90610bfb565b600060036000848460405160200161044c929190610c79565b60405160208183030381529060405280519060200120815260200190815260200160002060006101000a81548160ff0219169083151502179055508181604051610497929190610cd6565b604051908190038120907f76560da933b69084aa8417c14a3cac2f0a8748f70ca366c7358a665783a120e290600090a25050565b6000546001600160a01b031633146104f55760405162461bcd60e51b81526004016102af90610bfb565b6001600160a01b038116600081815260056020526040808220805460ff19166001179055517f9334f1cf560b8678d242a97ff8aa0f60f61c40b3b7e3bd1a1b6759bb0cec6b9e9190a250565b6000546001600160a01b0316331461056b5760405162461bcd60e51b81526004016102af90610bfb565b6105756000610a62565b565b6000546001600160a01b031633146105a15760405162461bcd60e51b81526004016102af90610bfb565b6001600160a01b038116600081815260046020526040808220805460ff19169055517fdb9b6d848ff0a15fae4f0c0424b4bb6ddd97ac1d06b2d160ba86fc2832de58149190a250565b6000600360008484604051602001610603929190610c79565b60408051808303601f190181529181528151602092830120835290820192909252016000205460ff169392505050565b600080868686868660405160200161064f959493929190610c95565b60408051808303601f1901815291815281516020928301206000908152600290925290205460ff16979650505050505050565b6000546001600160a01b031633146106ac5760405162461bcd60e51b81526004016102af90610bfb565b600085858585856040516020016106c7959493929190610c95565b60408051601f19818403018152828252805160209182012060008181526002909252919020805460ff1916905591506107039085908590610cd6565b604080519182900382208383528415156020840152916001600160a01b0380891692908a16917fa3c16a165e4c9dc7e7fef6e5eb0c766aeb085e2d998a06077938282367c7aa0d91016103f9565b6000546001600160a01b0316331461077b5760405162461bcd60e51b81526004016102af90610bfb565b6001600360008484604051602001610794929190610c79565b60405160208183030381529060405280519060200120815260200190815260200160002060006101000a81548160ff02191690831515021790555081816040516107df929190610cd6565b604051908190038120907fc95f2e27a61ec8dec2456642814ad06d45690881ec1091953078c783474a6d1190600090a25050565b6000546001600160a01b0316331461083d5760405162461bcd60e51b81526004016102af90610bfb565b6001600160a01b038116600081815260056020526040808220805460ff19169055517f1b04f3cb09a85dced592e37ae08b2a135757683e30116221003f6620de94d4009190a250565b600160009054906101000a90046001600160a01b03166001600160a01b0316631ffaf0db6040518163ffffffff1660e01b815260040160206040518083038186803b1580156108d457600080fd5b505afa1580156108e8573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061090c9190610d18565b6001600160a01b0316336001600160a01b03161461097b5760405162461bcd60e51b815260206004820152602660248201527f57686974656c6973743a2053656e646572206973206e6f74204f746f6b656e466044820152656163746f727960d01b60648201526084016102af565b6001600160a01b038116600081815260046020526040808220805460ff19166001179055517fafbb5b30329d7def9553a137626d5bc919fda8f5d1d1b5a64aa6123445b9415b9190a250565b6000546001600160a01b031633146109f15760405162461bcd60e51b81526004016102af90610bfb565b6001600160a01b038116610a565760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b60648201526084016102af565b610a5f81610a62565b50565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6001600160a01b0381168114610a5f57600080fd5b600060208284031215610ad957600080fd5b8135610ae481610ab2565b9392505050565b60008083601f840112610afd57600080fd5b50813567ffffffffffffffff811115610b1557600080fd5b6020830191508360208260051b8501011115610b3057600080fd5b9250929050565b600080600080600060808688031215610b4f57600080fd5b8535610b5a81610ab2565b94506020860135610b6a81610ab2565b9350604086013567ffffffffffffffff811115610b8657600080fd5b610b9288828901610aeb565b90945092505060608601358015158114610bab57600080fd5b809150509295509295909350565b60008060208385031215610bcc57600080fd5b823567ffffffffffffffff811115610be357600080fd5b610bef85828601610aeb565b90969095509350505050565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b8183526000602080850194508260005b85811015610c6e578135610c5381610ab2565b6001600160a01b031687529582019590820190600101610c40565b509495945050505050565b602081526000610c8d602083018486610c30565b949350505050565b6001600160a01b03868116825285166020820152608060408201819052600090610cc29083018587610c30565b905082151560608301529695505050505050565b60008184825b85811015610d0d578135610cef81610ab2565b6001600160a01b031683526020928301929190910190600101610cdc565b509095945050505050565b600060208284031215610d2a57600080fd5b8151610ae481610ab256fea2646970667358221220399f09abd32e87274870369bc2167133da1d54950f59d3a666aeb8d64150f42864736f6c63430008090033";

type WhitelistConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WhitelistConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class Whitelist__factory extends ContractFactory {
  constructor(...args: WhitelistConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _addressBook: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<Whitelist> {
    return super.deploy(_addressBook, overrides || {}) as Promise<Whitelist>;
  }
  getDeployTransaction(
    _addressBook: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_addressBook, overrides || {});
  }
  attach(address: string): Whitelist {
    return super.attach(address) as Whitelist;
  }
  connect(signer: Signer): Whitelist__factory {
    return super.connect(signer) as Whitelist__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WhitelistInterface {
    return new utils.Interface(_abi) as WhitelistInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Whitelist {
    return new Contract(address, _abi, signerOrProvider) as Whitelist;
  }
}