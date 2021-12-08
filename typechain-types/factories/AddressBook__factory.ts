/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { AddressBook, AddressBookInterface } from "../AddressBook";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "add",
        type: "address",
      },
    ],
    name: "AddressAdded",
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
        internalType: "bytes32",
        name: "id",
        type: "bytes32",
      },
      {
        indexed: true,
        internalType: "address",
        name: "proxy",
        type: "address",
      },
    ],
    name: "ProxyCreated",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
    ],
    name: "getAddress",
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
    name: "getController",
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
    name: "getLiquidationManager",
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
    name: "getMarginCalculator",
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
    name: "getMarginPool",
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
    name: "getOracle",
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
    name: "getOtokenFactory",
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
    name: "getOtokenImpl",
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
    name: "getWhitelist",
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
        internalType: "bytes32",
        name: "_key",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_address",
        type: "address",
      },
    ],
    name: "setAddress",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_controller",
        type: "address",
      },
    ],
    name: "setController",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_liquidationManager",
        type: "address",
      },
    ],
    name: "setLiquidationManager",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_marginCalculator",
        type: "address",
      },
    ],
    name: "setMarginCalculator",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_marginPool",
        type: "address",
      },
    ],
    name: "setMarginPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_oracle",
        type: "address",
      },
    ],
    name: "setOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_otokenFactory",
        type: "address",
      },
    ],
    name: "setOtokenFactory",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_otokenImpl",
        type: "address",
      },
    ],
    name: "setOtokenImpl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_whitelist",
        type: "address",
      },
    ],
    name: "setWhitelist",
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
        internalType: "bytes32",
        name: "_id",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "_newAddress",
        type: "address",
      },
    ],
    name: "updateImpl",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b61108e8061007e6000396000f3fe608060405234801561001057600080fd5b50600436106101425760003560e01c806392eefe9b116100b8578063d01f63f51161007c578063d01f63f514610246578063d94f323e1461024e578063e7cf784114610261578063e9f2e8be14610274578063ee8a463214610287578063f2fde38b1461028f57600080fd5b806392eefe9b146101fd578063a8de41d514610210578063b508ac9914610218578063ca446dd91461022b578063cf28493f1461023e57600080fd5b8063715018a61161010a578063715018a6146101ae57806375486342146101b65780637adbf973146101be578063833b1fce146101d1578063854cff2f146101d95780638da5cb5b146101ec57600080fd5b80631ffaf0db1461014757806321f8a7211461016b5780632b6bfeaa1461017e5780633018205f1461019357806338f92fc71461019b575b600080fd5b61014f6102a2565b6040516001600160a01b03909116815260200160405180910390f35b61014f610179366004610a47565b6102d2565b61019161018c366004610a7c565b6102ed565b005b61014f6104d1565b6101916101a9366004610aa8565b6104fc565b610191610553565b61014f610589565b6101916101cc366004610aa8565b6105b4565b61014f610608565b6101916101e7366004610aa8565b610633565b6000546001600160a01b031661014f565b61019161020b366004610aa8565b610687565b61014f6106db565b610191610226366004610aa8565b610706565b610191610239366004610a7c565b610756565b61014f6107d9565b61014f610804565b61019161025c366004610aa8565b61082f565b61019161026f366004610aa8565b610883565b610191610282366004610aa8565b6108d7565b61014f61092b565b61019161029d366004610aa8565b610956565b60006102cd7f6c7b3c92d6683027c836120c8fbf9e114ae1c35064b3146ad12b327283cbc3056102d2565b905090565b6000908152600160205260409020546001600160a01b031690565b6000546001600160a01b031633146103205760405162461bcd60e51b815260040161031790610aca565b60405180910390fd5b600061032b836102d2565b90506001600160a01b03811661046d576000306103506000546001600160a01b031690565b6040516001600160a01b0392831660248201529116604482015260640160408051601f198184030181529181526020820180516001600160e01b031663485cc95560e01b179052519091506000906103a790610a3a565b604051809103906000f0801580156103c3573d6000803e3d6000fd5b5090506103d08582610756565b6040516001600160a01b0382169086907f1eb35cb4b5bbb23d152f3b4016a5a46c37a07ae930ed0956aba951e23114243890600090a360405163278f794360e11b81526001600160a01b03821690634f1ef286906104349087908690600401610aff565b600060405180830381600087803b15801561044e57600080fd5b505af1158015610462573d6000803e3d6000fd5b505050505050505050565b604051631b2ce7f360e11b81526001600160a01b038381166004830152829190821690633659cfe690602401600060405180830381600087803b1580156104b357600080fd5b505af11580156104c7573d6000803e3d6000fd5b5050505050505050565b60006102cd7f70546d1c92f8c2132ae23a23f5177aa8526356051c7510df99f50e012d2215296102d2565b6000546001600160a01b031633146105265760405162461bcd60e51b815260040161031790610aca565b6105507f0b8b100501322269eb8293378cdaf941a0d883fad7878cbc00f3c143fa0c6c9682610756565b50565b6000546001600160a01b0316331461057d5760405162461bcd60e51b815260040161031790610aca565b61058760006109ea565b565b60006102cd7f78b1c356e2d402258b87b91de50983999dcba778bd0bb81016081dd89fd94bed6102d2565b6000546001600160a01b031633146105de5760405162461bcd60e51b815260040161031790610aca565b6105507f352d05fe3946dbe49277552ba941e744d5a96d9c60bc1ba0ea5f1d3ae000f7c882610756565b60006102cd7f352d05fe3946dbe49277552ba941e744d5a96d9c60bc1ba0ea5f1d3ae000f7c86102d2565b6000546001600160a01b0316331461065d5760405162461bcd60e51b815260040161031790610aca565b6105507f0af0c3ebe77999ca20698e1ff25f812bf82409a59d21ca15a41f39e0ce9f250082610756565b6000546001600160a01b031633146106b15760405162461bcd60e51b815260040161031790610aca565b6105507f70546d1c92f8c2132ae23a23f5177aa8526356051c7510df99f50e012d221529826102ed565b60006102cd7faee068cb91ac3caa77e3f86bb6b9c8ad08f00dc9628a6fa3c4c849f48215f4206102d2565b6000546001600160a01b031633146107305760405162461bcd60e51b815260040161031790610aca565b6105507faee068cb91ac3caa77e3f86bb6b9c8ad08f00dc9628a6fa3c4c849f48215f420825b6000546001600160a01b031633146107805760405162461bcd60e51b815260040161031790610aca565b60008281526001602052604080822080546001600160a01b0319166001600160a01b0385169081179091559051909184917f3eb532562a19423f49e2e3b30790b23d00c625f3ee37c7359d03688bf7111f6c9190a35050565b60006102cd7f4f4e515be2faa2fc03d2f4678d7e8086e6cddc9f0b80eb45fd3f08bd319dfa706102d2565b60006102cd7f0af0c3ebe77999ca20698e1ff25f812bf82409a59d21ca15a41f39e0ce9f25006102d2565b6000546001600160a01b031633146108595760405162461bcd60e51b815260040161031790610aca565b6105507f6c7b3c92d6683027c836120c8fbf9e114ae1c35064b3146ad12b327283cbc30582610756565b6000546001600160a01b031633146108ad5760405162461bcd60e51b815260040161031790610aca565b6105507f78b1c356e2d402258b87b91de50983999dcba778bd0bb81016081dd89fd94bed82610756565b6000546001600160a01b031633146109015760405162461bcd60e51b815260040161031790610aca565b6105507f4f4e515be2faa2fc03d2f4678d7e8086e6cddc9f0b80eb45fd3f08bd319dfa7082610756565b60006102cd7f0b8b100501322269eb8293378cdaf941a0d883fad7878cbc00f3c143fa0c6c966102d2565b6000546001600160a01b031633146109805760405162461bcd60e51b815260040161031790610aca565b6001600160a01b0381166109e55760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610317565b610550815b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6104f480610b6583390190565b600060208284031215610a5957600080fd5b5035919050565b80356001600160a01b0381168114610a7757600080fd5b919050565b60008060408385031215610a8f57600080fd5b82359150610a9f60208401610a60565b90509250929050565b600060208284031215610aba57600080fd5b610ac382610a60565b9392505050565b6020808252818101527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604082015260600190565b60018060a01b038316815260006020604081840152835180604085015260005b81811015610b3b57858101830151858201606001528201610b1f565b81811115610b4d576000606083870101525b50601f01601f19169290920160600194935050505056fe608060405234801561001057600080fd5b50610039337f337c729c04082e3bdd94ba7d2b5a8a642f3a138702366a91707825373a2029ba55565b6104ac806100486000396000f3fe60806040526004361061004a5760003560e01c8063025313a21461009c5780633659cfe6146100d65780634f1ef286146100f85780635c60da1b1461010b578063f1739cae1461012d575b60006100626000805160206104378339815191525490565b90506001600160a01b03811661007757600080fd5b60405136600082376000803683855af43d806000843e818015610098578184f35b8184fd5b3480156100a857600080fd5b50600080516020610457833981519152545b6040516001600160a01b03909116815260200160405180910390f35b3480156100e257600080fd5b506100f66100f1366004610381565b61014d565b005b6100f66101063660046103a3565b610186565b34801561011757600080fd5b50600080516020610437833981519152546100ba565b34801561013957600080fd5b506100f6610148366004610381565b61022f565b600080516020610457833981519152546001600160a01b0316336001600160a01b03161461017a57600080fd5b610183816102de565b50565b600080516020610457833981519152546001600160a01b0316336001600160a01b0316146101b357600080fd5b6101bc8361014d565b6000306001600160a01b03163484846040516101d9929190610426565b60006040518083038185875af1925050503d8060008114610216576040519150601f19603f3d011682016040523d82523d6000602084013e61021b565b606091505b505090508061022957600080fd5b50505050565b600080516020610457833981519152546001600160a01b0316336001600160a01b03161461025c57600080fd5b6001600160a01b03811661026f57600080fd5b7f5a3e66efaa1e445ebd894728a69d6959842ea1e97bd79b892797106e270efcd96102a66000805160206104578339815191525490565b604080516001600160a01b03928316815291841660208301520160405180910390a16101838160008051602061045783398151915255565b60006102f66000805160206104378339815191525490565b9050816001600160a01b0316816001600160a01b0316141561031757600080fd5b61032d8260008051602061043783398151915255565b6040516001600160a01b038316907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a25050565b80356001600160a01b038116811461037c57600080fd5b919050565b60006020828403121561039357600080fd5b61039c82610365565b9392505050565b6000806000604084860312156103b857600080fd5b6103c184610365565b9250602084013567ffffffffffffffff808211156103de57600080fd5b818601915086601f8301126103f257600080fd5b81358181111561040157600080fd5b87602082850101111561041357600080fd5b6020830194508093505050509250925092565b818382376000910190815291905056fe7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3337c729c04082e3bdd94ba7d2b5a8a642f3a138702366a91707825373a2029baa26469706673582212207248d65a925ed11886db798d63981c3f3112ad62eac676b5a0b30a19657bd38e64736f6c63430008090033a2646970667358221220c3d3ba4c8e4f4b366501217fe9e0b8f18d2c2090469353dc407ab6154cd3b5dc64736f6c63430008090033";

type AddressBookConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: AddressBookConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class AddressBook__factory extends ContractFactory {
  constructor(...args: AddressBookConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<AddressBook> {
    return super.deploy(overrides || {}) as Promise<AddressBook>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): AddressBook {
    return super.attach(address) as AddressBook;
  }
  connect(signer: Signer): AddressBook__factory {
    return super.connect(signer) as AddressBook__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): AddressBookInterface {
    return new utils.Interface(_abi) as AddressBookInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): AddressBook {
    return new Contract(address, _abi, signerOrProvider) as AddressBook;
  }
}
