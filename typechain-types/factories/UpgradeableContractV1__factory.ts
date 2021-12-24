/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  UpgradeableContractV1,
  UpgradeableContractV1Interface,
} from "../UpgradeableContractV1";

const _abi = [
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
    inputs: [],
    name: "getV1Version",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_addressBook",
        type: "address",
      },
      {
        internalType: "address",
        name: "_owner",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
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
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610230806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c8063485cc955146100515780638da5cb5b146100665780638f26c06114610096578063f5887cdd146100a5575b600080fd5b61006461005f3660046101c7565b6100b8565b005b603454610079906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6040516001815260200161008d565b603354610079906001600160a01b031681565b600054610100900460ff16806100cd5750303b155b806100db575060005460ff16155b6101425760405162461bcd60e51b815260206004820152602e60248201527f436f6e747261637420696e7374616e63652068617320616c726561647920626560448201526d195b881a5b9a5d1a585b1a5e995960921b606482015260840160405180910390fd5b600054610100900460ff16158015610164576000805461ffff19166101011790555b603380546001600160a01b038086166001600160a01b031992831617909255603480549285169290911691909117905580156101a6576000805461ff00191690555b505050565b80356001600160a01b03811681146101c257600080fd5b919050565b600080604083850312156101da57600080fd5b6101e3836101ab565b91506101f1602084016101ab565b9050925092905056fea26469706673582212208f7c0471017d013a6062cf5a059f244e2fec0afa97244e3707c6b80693eb735764736f6c63430008090033";

type UpgradeableContractV1ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: UpgradeableContractV1ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class UpgradeableContractV1__factory extends ContractFactory {
  constructor(...args: UpgradeableContractV1ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<UpgradeableContractV1> {
    return super.deploy(overrides || {}) as Promise<UpgradeableContractV1>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): UpgradeableContractV1 {
    return super.attach(address) as UpgradeableContractV1;
  }
  connect(signer: Signer): UpgradeableContractV1__factory {
    return super.connect(signer) as UpgradeableContractV1__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): UpgradeableContractV1Interface {
    return new utils.Interface(_abi) as UpgradeableContractV1Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): UpgradeableContractV1 {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as UpgradeableContractV1;
  }
}