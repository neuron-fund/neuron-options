/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { OtokenFactory, OtokenFactoryInterface } from "../OtokenFactory";

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
        indexed: false,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address",
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
        internalType: "uint256",
        name: "strikePrice",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isPut",
        type: "bool",
      },
    ],
    name: "OtokenCreated",
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
        name: "_underlyingAsset",
        type: "address",
      },
      {
        internalType: "address",
        name: "_strikeAsset",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "_collateralAssets",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "_strikePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_expiry",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isPut",
        type: "bool",
      },
    ],
    name: "createOtoken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_underlyingAsset",
        type: "address",
      },
      {
        internalType: "address",
        name: "_strikeAsset",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "_collateralAssets",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "_strikePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_expiry",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isPut",
        type: "bool",
      },
    ],
    name: "getOtoken",
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
    name: "getOtokensLength",
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
        name: "_underlyingAsset",
        type: "address",
      },
      {
        internalType: "address",
        name: "_strikeAsset",
        type: "address",
      },
      {
        internalType: "address[]",
        name: "_collateralAssets",
        type: "address[]",
      },
      {
        internalType: "uint256",
        name: "_strikePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_expiry",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isPut",
        type: "bool",
      },
    ],
    name: "getTargetOtokenAddress",
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
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "otokens",
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
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5060405161127b38038061127b83398101604081905261002f91610054565b600080546001600160a01b0319166001600160a01b0392909216919091179055610084565b60006020828403121561006657600080fd5b81516001600160a01b038116811461007d57600080fd5b9392505050565b6111e8806100936000396000f3fe60806040523480156200001157600080fd5b50600436106200006a5760003560e01c806301da031c146200006f57806346e63dc414620000a35780634e540fc614620000b5578063c74c12cd14620000cc578063de0120de14620000e3578063f5887cdd14620000fa575b600080fd5b620000866200008036600462000be7565b6200010e565b6040516001600160a01b0390911681526020015b60405180910390f35b6001546040519081526020016200009a565b62000086620000c636600462000be7565b62000147565b62000086620000dd36600462000be7565b62000792565b62000086620000f436600462000cb1565b6200089e565b60005462000086906001600160a01b031681565b6000806200012289898989898989620008c9565b6000908152600260205260409020546001600160a01b03169998505050505050505050565b6000428311620001b15760405162461bcd60e51b815260206004820152602a60248201527f4f746f6b656e466163746f72793a2043616e27742063726561746520657870696044820152693932b21037b83a34b7b760b11b60648201526084015b60405180910390fd5b6402c33b9c8083106200022d5760405162461bcd60e51b815260206004820152603b60248201527f4f746f6b656e466163746f72793a2043616e277420637265617465206f70746960448201527f6f6e207769746820657870697279203e20323334352f31322f333100000000006064820152608401620001a8565b6200024a6201518062000243856170806200090d565b9062000922565b15620002af5760405162461bcd60e51b815260206004820152602d60248201527f4f746f6b656e466163746f72793a204f7074696f6e2068617320746f2065787060448201526c6972652030383a30302055544360981b6064820152608401620001a8565b6000620002c289898989898989620008c9565b6000818152600260205260409020549091506001600160a01b0316156200033a5760405162461bcd60e51b815260206004820152602560248201527f4f746f6b656e466163746f72793a204f7074696f6e20616c726561647920637260448201526419585d195960da1b6064820152608401620001a8565b60008060009054906101000a90046001600160a01b03166001600160a01b031663d01f63f56040518163ffffffff1660e01b815260040160206040518083038186803b1580156200038a57600080fd5b505afa1580156200039f573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620003c5919062000ccb565b604051635c3b07db60e11b81529091506001600160a01b0382169063b8760fb690620003fe908d908d908d908d908b9060040162000d38565b60206040518083038186803b1580156200041757600080fd5b505afa1580156200042c573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000452919062000d7b565b620004ab5760405162461bcd60e51b815260206004820152602260248201527f4f746f6b656e466163746f72793a20556e737570706f727465642050726f647560448201526118dd60f21b6064820152608401620001a8565b831580620004b95750600086115b620005225760405162461bcd60e51b815260206004820152603260248201527f4f746f6b656e466163746f72793a2043616e27742063726561746520612024306044820152711039ba3934b5b290383aba1037b83a34b7b760711b6064820152608401620001a8565b60008060009054906101000a90046001600160a01b03166001600160a01b031663a8de41d56040518163ffffffff1660e01b815260040160206040518083038186803b1580156200057257600080fd5b505afa15801562000587573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190620005ad919062000ccb565b600080546040519293509091632d8133d160e21b91620005ea916001600160a01b03909116908f908f908f908f908f908f908f9060240162000d9b565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b031990931692909217909152905060006200062c838362000930565b60008681526002602052604080822080546001600160a01b038581166001600160a01b0319928316811790935560018054808201825595527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6909401805490911682179055905163763893db60e11b8152600481019190915291925085169063ec7127b690602401600060405180830381600087803b158015620006cf57600080fd5b505af1158015620006e4573d6000803e3d6000fd5b505050508a8a604051620006fa92919062000e39565b60405180910390208c6001600160a01b03168e6001600160a01b03167f94cfb468fac2fb7fe34ee506896068eabee44ccd3099ecda1b448e18e7c5cb0184338e8e8e6040516200077a9594939291906001600160a01b03958616815293909416602084015260408301919091526060820152901515608082015260a00190565b60405180910390a49c9b505050505050505050505050565b600080546040805163a8de41d560e01b8152905183926001600160a01b03169163a8de41d5916004808301926020929190829003018186803b158015620007d857600080fd5b505afa158015620007ed573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019062000813919062000ccb565b600080546040519293509091632d8133d160e21b9162000850916001600160a01b03909116908d908d908d908d908d908d908d9060240162000d9b565b60408051601f198184030181529190526020810180516001600160e01b03166001600160e01b0319909316929092179091529050620008908282620009b4565b9a9950505050505050505050565b60018181548110620008af57600080fd5b6000918252602090912001546001600160a01b0316905081565b600087878787878787604051602001620008ea979695949392919062000e48565b604051602081830303815290604052805190602001209050979650505050505050565b60006200091b828462000e9e565b9392505050565b60006200091b828462000ec4565b60008060405180602001620009459062000b9f565b601f1982820381018352601f9091011660408190526200096c908690869060200162000f1a565b60408051601f19818403018152908290526200098c929160200162000f5e565b60408051601f198184030181529190529050620009ac6000808362000a97565b949350505050565b60008060405180602001620009c99062000b9f565b601f1982820381018352601f909101166040819052620009f0908690869060200162000f1a565b60408051601f198184030181529082905262000a10929160200162000f5e565b60408051601f198184030181529190528051602082012090915062000a8e600082604080516001600160f81b03196020808301919091523060601b6bffffffffffffffffffffffff1916602183015260358201859052605580830185905283518084039091018152607590920190925280519101206000906200091b565b95945050505050565b6000808447101562000aec5760405162461bcd60e51b815260206004820152601d60248201527f437265617465323a20696e73756666696369656e742062616c616e63650000006044820152606401620001a8565b825162000b3c5760405162461bcd60e51b815260206004820181905260248201527f437265617465323a2062797465636f6465206c656e677468206973207a65726f6044820152606401620001a8565b8383516020850187f590506001600160a01b038116620009ac5760405162461bcd60e51b815260206004820152601960248201527f437265617465323a204661696c6564206f6e206465706c6f79000000000000006044820152606401620001a8565b6102218062000f9283390190565b6001600160a01b038116811462000bc357600080fd5b50565b801515811462000bc357600080fd5b803562000be28162000bc6565b919050565b600080600080600080600060c0888a03121562000c0357600080fd5b873562000c108162000bad565b9650602088013562000c228162000bad565b9550604088013567ffffffffffffffff8082111562000c4057600080fd5b818a0191508a601f83011262000c5557600080fd5b81358181111562000c6557600080fd5b8b60208260051b850101111562000c7b57600080fd5b602083019750809650505050606088013592506080880135915062000ca360a0890162000bd5565b905092959891949750929550565b60006020828403121562000cc457600080fd5b5035919050565b60006020828403121562000cde57600080fd5b81516200091b8162000bad565b8183526000602080850194508260005b8581101562000d2d57813562000d118162000bad565b6001600160a01b03168752958201959082019060010162000cfb565b509495945050505050565b6001600160a01b0386811682528516602082015260806040820181905260009062000d67908301858762000ceb565b905082151560608301529695505050505050565b60006020828403121562000d8e57600080fd5b81516200091b8162000bc6565b6001600160a01b03898116825288811660208301528716604082015260e06060820181905260009062000dd2908301878962000ceb565b60808301959095525060a0810192909252151560c09091015295945050505050565b60008160005b8481101562000e2f57813562000e108162000bad565b6001600160a01b03168652602095860195919091019060010162000dfa565b5093949350505050565b6000620009ac82848662000df4565b60006bffffffffffffffffffffffff19808a60601b168352808960601b1660148401525062000e7c60288301878962000df4565b94855250506020830191909152151560f81b6040820152604101949350505050565b60008282101562000ebf57634e487b7160e01b600052601160045260246000fd5b500390565b60008262000ee257634e487b7160e01b600052601260045260246000fd5b500690565b60005b8381101562000f0457818101518382015260200162000eea565b8381111562000f14576000848401525b50505050565b60018060a01b0383168152604060208201526000825180604084015262000f4981606085016020870162000ee7565b601f01601f1916919091016060019392505050565b6000835162000f7281846020880162000ee7565b83519083019062000f8881836020880162000ee7565b0194935050505056fe608060405260405161022138038061022183398101604081905261002291610136565b6000826001600160a01b03168260405161003c9190610204565b600060405180830381855af49150503d8060008114610077576040519150601f19603f3d011682016040523d82523d6000602084013e61007c565b606091505b505090508061008f573d6000803e3d6000fd5b60405169363d3d373d3d3d363d7360b01b60208201526001600160601b0319606085901b16602a8201526e5af43d82803e903d91602b57fd5bf360881b603e820152600090604d016040516020818303038152906040529050602d81602001f35b634e487b7160e01b600052604160045260246000fd5b60005b83811015610121578181015183820152602001610109565b83811115610130576000848401525b50505050565b6000806040838503121561014957600080fd5b82516001600160a01b038116811461016057600080fd5b60208401519092506001600160401b038082111561017d57600080fd5b818501915085601f83011261019157600080fd5b8151818111156101a3576101a36100f0565b604051601f8201601f19908116603f011681019083821181831017156101cb576101cb6100f0565b816040528281528860208487010111156101e457600080fd5b6101f5836020830160208801610106565b80955050505050509250929050565b60008251610216818460208701610106565b919091019291505056fea264697066735822122091b9c1e42d720d1789973b155e371b223438efa0188a10fa1bb24629d02f75c664736f6c63430008090033";

type OtokenFactoryConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: OtokenFactoryConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class OtokenFactory__factory extends ContractFactory {
  constructor(...args: OtokenFactoryConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _addressBook: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<OtokenFactory> {
    return super.deploy(
      _addressBook,
      overrides || {}
    ) as Promise<OtokenFactory>;
  }
  getDeployTransaction(
    _addressBook: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(_addressBook, overrides || {});
  }
  attach(address: string): OtokenFactory {
    return super.attach(address) as OtokenFactory;
  }
  connect(signer: Signer): OtokenFactory__factory {
    return super.connect(signer) as OtokenFactory__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): OtokenFactoryInterface {
    return new utils.Interface(_abi) as OtokenFactoryInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OtokenFactory {
    return new Contract(address, _abi, signerOrProvider) as OtokenFactory;
  }
}
