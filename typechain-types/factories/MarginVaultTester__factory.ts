/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  MarginVaultTester,
  MarginVaultTesterInterface,
} from "../MarginVaultTester";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_vaultIndex",
        type: "uint256",
      },
    ],
    name: "getVault",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "shortOtoken",
            type: "address",
          },
          {
            internalType: "address[]",
            name: "longOtokens",
            type: "address[]",
          },
          {
            internalType: "address[]",
            name: "collateralAssets",
            type: "address[]",
          },
          {
            internalType: "uint256",
            name: "shortAmount",
            type: "uint256",
          },
          {
            internalType: "uint256[]",
            name: "longAmounts",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "collateralAmounts",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "usedCollateralAmounts",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "usedCollateralValues",
            type: "uint256[]",
          },
          {
            internalType: "uint256[]",
            name: "unusedCollateralAmounts",
            type: "uint256[]",
          },
        ],
        internalType: "struct MarginVault.Vault",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_vaultIndex",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "_collateralAssets",
        type: "address[]",
      },
    ],
    name: "initCollaterals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_vaultIndex",
        type: "uint256",
      },
      {
        internalType: "address[]",
        name: "_collateralAssets",
        type: "address[]",
      },
      {
        internalType: "uint256[]",
        name: "_amounts",
        type: "uint256[]",
      },
    ],
    name: "testAddCollaterals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_vaultIndex",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_longOtoken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "testAddLong",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_vaultIndex",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_shortOtoken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "testAddShort",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_vaultIndex",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_collateralAsset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "testRemoveCollateral",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_vaultIndex",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_longOtoken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_index",
        type: "uint256",
      },
    ],
    name: "testRemoveLong",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_vaultIndex",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "_shortOtoken",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "testRemoveShort",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50610f92806100206000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c806349f87f621161005b57806349f87f62146100db5780637cb26bd1146100ee5780638a2ae0a8146101015780639403b6341461011457600080fd5b80631a4b299d1461008d57806337079420146100a25780633ef3feaf146100b55780633f05ddad146100c8575b600080fd5b6100a061009b366004610a52565b61013d565b005b6100a06100b0366004610a8d565b6101de565b6100a06100c3366004610a52565b610276565b6100a06100d6366004610a8d565b6102e5565b6100a06100e9366004610b0e565b6103a3565b6100a06100fc366004610b5a565b610454565b6100a061010f366004610a52565b610575565b610127610122366004610bd4565b6105e4565b6040516101349190610c61565b60405180910390f35b3360009081526020818152604080832087845290915290819020905163951dd8d360e01b815260048101919091526001600160a01b0384166024820152604481018390526064810182905273__$f483377b159a5ea0e3632e216689e4fd4e$__9063951dd8d3906084015b60006040518083038186803b1580156101c057600080fd5b505af41580156101d4573d6000803e3d6000fd5b5050505050505050565b3360009081526020818152604080832086845290915290819020905163bc59bba760e01b815260048101919091526001600160a01b03831660248201526044810182905273__$f483377b159a5ea0e3632e216689e4fd4e$__9063bc59bba79060640160006040518083038186803b15801561025957600080fd5b505af415801561026d573d6000803e3d6000fd5b50505050505050565b33600090815260208181526040808320878452909152908190209051630380bfdd60e61b815260048101919091526001600160a01b0384166024820152604481018390526064810182905273__$f483377b159a5ea0e3632e216689e4fd4e$__9063e02ff740906084016101a8565b336000908152602081815260408083208684529091529081902090516314a5127960e11b815260048101919091526001600160a01b03831660248201526044810182905273__$f483377b159a5ea0e3632e216689e4fd4e$__9063294a24f29060640160006040518083038186803b15801561036057600080fd5b505af4158015610374573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261039c9190810190610e0e565b5050505050565b33600090815260208181526040808320868452909152902060050154156103c957600080fd5b3360009081526020818152604080832086845290915290206103ef9060020183836109be565b5060005b8181101561044e5733600090815260208181526040808320878452825282206005810180546001808201835591855283852001849055600890910180549182018155835290822001558061044681610e72565b9150506103f3565b50505050565b61049f858585600081811061046b5761046b610e9b565b90506020020160208101906104809190610eb1565b8484600081811061049357610493610e9b565b905060200201356108f7565b33600090815260208181526040808320888452909152812060020180546104e792906104cd576104cd610e9b565b6000918252602090912001546001600160a01b0316610952565b33600090815260208181526040808320888452909152908190209051633233079960e11b815273__$f483377b159a5ea0e3632e216689e4fd4e$__916364660f329161053e91908890889088908890600401610ed3565b60006040518083038186803b15801561055657600080fd5b505af415801561056a573d6000803e3d6000fd5b505050505050505050565b3360009081526020818152604080832087845290915290819020905163155bf27360e31b815260048101919091526001600160a01b0384166024820152604481018390526064810182905273__$f483377b159a5ea0e3632e216689e4fd4e$__9063aadf9398906084016101a8565b61063c60405180610120016040528060006001600160a01b0316815260200160608152602001606081526020016000815260200160608152602001606081526020016060815260200160608152602001606081525090565b3360009081526020818152604080832085845282529182902082516101208101845281546001600160a01b03168152600182018054855181860281018601909652808652919492938581019392908301828280156106c357602002820191906000526020600020905b81546001600160a01b031681526001909101906020018083116106a5575b505050505081526020016002820180548060200260200160405190810160405280929190818152602001828054801561072557602002820191906000526020600020905b81546001600160a01b03168152600190910190602001808311610707575b50505050508152602001600382015481526020016004820180548060200260200160405190810160405280929190818152602001828054801561078757602002820191906000526020600020905b815481526020019060010190808311610773575b50505050508152602001600582018054806020026020016040519081016040528092919081815260200182805480156107df57602002820191906000526020600020905b8154815260200190600101908083116107cb575b505050505081526020016006820180548060200260200160405190810160405280929190818152602001828054801561083757602002820191906000526020600020905b815481526020019060010190808311610823575b505050505081526020016007820180548060200260200160405190810160405280929190818152602001828054801561088f57602002820191906000526020600020905b81548152602001906001019080831161087b575b50505050508152602001600882018054806020026020016040519081016040528092919081815260200182805480156108e757602002820191906000526020600020905b8154815260200190600101908083116108d3575b5050505050815250509050919050565b604051602481018490526001600160a01b03831660448201526064810182905261094d9060840160408051601f198184030181529190526020810180516001600160e01b0316634421a1d560e11b17905261099d565b505050565b6040516001600160a01b038216602482015261099a9060440160408051601f198184030181529190526020810180516001600160e01b031663161765e160e11b17905261099d565b50565b80516a636f6e736f6c652e6c6f67602083016000808483855afa5050505050565b828054828255906000526020600020908101928215610a11579160200282015b82811115610a115781546001600160a01b0319166001600160a01b038435161782556020909201916001909101906109de565b50610a1d929150610a21565b5090565b5b80821115610a1d5760008155600101610a22565b80356001600160a01b0381168114610a4d57600080fd5b919050565b60008060008060808587031215610a6857600080fd5b84359350610a7860208601610a36565b93969395505050506040820135916060013590565b600080600060608486031215610aa257600080fd5b83359250610ab260208501610a36565b9150604084013590509250925092565b60008083601f840112610ad457600080fd5b50813567ffffffffffffffff811115610aec57600080fd5b6020830191508360208260051b8501011115610b0757600080fd5b9250929050565b600080600060408486031215610b2357600080fd5b83359250602084013567ffffffffffffffff811115610b4157600080fd5b610b4d86828701610ac2565b9497909650939450505050565b600080600080600060608688031215610b7257600080fd5b85359450602086013567ffffffffffffffff80821115610b9157600080fd5b610b9d89838a01610ac2565b90965094506040880135915080821115610bb657600080fd5b50610bc388828901610ac2565b969995985093965092949392505050565b600060208284031215610be657600080fd5b5035919050565b600081518084526020808501945080840160005b83811015610c265781516001600160a01b031687529582019590820190600101610c01565b509495945050505050565b600081518084526020808501945080840160005b83811015610c2657815187529582019590820190600101610c45565b60208152610c7b6020820183516001600160a01b03169052565b60006020830151610120806040850152610c99610140850183610bed565b91506040850151601f1980868503016060870152610cb78483610bed565b93506060870151608087015260808701519150808685030160a0870152610cde8483610c31565b935060a08701519150808685030160c0870152610cfb8483610c31565b935060c08701519150808685030160e0870152610d188483610c31565b935060e08701519150610100818786030181880152610d378584610c31565b908801518782039092018488015293509050610d538382610c31565b9695505050505050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112610d8457600080fd5b8151602067ffffffffffffffff80831115610da157610da1610d5d565b8260051b604051601f19603f83011681018181108482111715610dc657610dc6610d5d565b604052938452858101830193838101925087851115610de457600080fd5b83870191505b84821015610e0357815183529183019190830190610dea565b979650505050505050565b60008060408385031215610e2157600080fd5b825167ffffffffffffffff80821115610e3957600080fd5b610e4586838701610d73565b93506020850151915080821115610e5b57600080fd5b50610e6885828601610d73565b9150509250929050565b6000600019821415610e9457634e487b7160e01b600052601160045260246000fd5b5060010190565b634e487b7160e01b600052603260045260246000fd5b600060208284031215610ec357600080fd5b610ecc82610a36565b9392505050565b85815260606020808301829052908201859052600090869060808401835b88811015610f1d576001600160a01b03610f0a85610a36565b1682529282019290820190600101610ef1565b5084810360408601528581526001600160fb1b03861115610f3d57600080fd5b8560051b9250828783830137600092010190815297965050505050505056fea2646970667358221220e2489d70b33f4f493c3c9d9838777af336201f5f62a01b337bbc8b58e5d780d664736f6c63430008090033";

type MarginVaultTesterConstructorParams =
  | [linkLibraryAddresses: MarginVaultTesterLibraryAddresses, signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MarginVaultTesterConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => {
  return (
    typeof xs[0] === "string" ||
    (Array.isArray as (arg: any) => arg is readonly any[])(xs[0]) ||
    "_isInterface" in xs[0]
  );
};

export class MarginVaultTester__factory extends ContractFactory {
  constructor(...args: MarginVaultTesterConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      const [linkLibraryAddresses, signer] = args;
      super(
        _abi,
        MarginVaultTester__factory.linkBytecode(linkLibraryAddresses),
        signer
      );
    }
  }

  static linkBytecode(
    linkLibraryAddresses: MarginVaultTesterLibraryAddresses
  ): string {
    let linkedBytecode = _bytecode;

    linkedBytecode = linkedBytecode.replace(
      new RegExp("__\\$f483377b159a5ea0e3632e216689e4fd4e\\$__", "g"),
      linkLibraryAddresses["contracts/libs/MarginVault.sol:MarginVault"]
        .replace(/^0x/, "")
        .toLowerCase()
    );

    return linkedBytecode;
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<MarginVaultTester> {
    return super.deploy(overrides || {}) as Promise<MarginVaultTester>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): MarginVaultTester {
    return super.attach(address) as MarginVaultTester;
  }
  connect(signer: Signer): MarginVaultTester__factory {
    return super.connect(signer) as MarginVaultTester__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MarginVaultTesterInterface {
    return new utils.Interface(_abi) as MarginVaultTesterInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MarginVaultTester {
    return new Contract(address, _abi, signerOrProvider) as MarginVaultTester;
  }
}

export interface MarginVaultTesterLibraryAddresses {
  ["contracts/libs/MarginVault.sol:MarginVault"]: string;
}