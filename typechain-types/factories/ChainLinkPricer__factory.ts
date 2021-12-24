/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  ChainLinkPricer,
  ChainLinkPricerInterface,
} from "../ChainLinkPricer";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_bot",
        type: "address",
      },
      {
        internalType: "address",
        name: "_asset",
        type: "address",
      },
      {
        internalType: "address",
        name: "_aggregator",
        type: "address",
      },
      {
        internalType: "address",
        name: "_oracle",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "aggregator",
    outputs: [
      {
        internalType: "contract AggregatorInterface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "aggregatorDecimals",
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
    name: "asset",
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
    name: "bot",
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
        internalType: "uint80",
        name: "_roundId",
        type: "uint80",
      },
    ],
    name: "getHistoricalPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
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
    name: "getPrice",
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
    name: "oracle",
    outputs: [
      {
        internalType: "contract OracleInterface",
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
        name: "_expiryTimestamp",
        type: "uint256",
      },
      {
        internalType: "uint80",
        name: "_roundId",
        type: "uint80",
      },
    ],
    name: "setExpiryPriceInOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b50604051610a98380380610a9883398101604081905261002f91610237565b6001600160a01b03841661008d5760405162461bcd60e51b815260206004820152602c6024820152600080516020610a7883398151915260448201526b191c995cdcc8185cc8189bdd60a21b60648201526084015b60405180910390fd5b6001600160a01b0381166100e95760405162461bcd60e51b815260206004820152602f6024820152600080516020610a7883398151915260448201526e6472657373206173206f7261636c6560881b6064820152608401610084565b6001600160a01b0382166101535760405162461bcd60e51b81526020600482015260336024820152600080516020610a7883398151915260448201527f64726573732061732061676772656761746f72000000000000000000000000006064820152608401610084565b600480546001600160a01b038087166001600160a01b0319928316178355600180548583169084161790556002805486831690841681179091556003805492881692909316919091179091556040805163313ce56760e01b81529051919263313ce567928282019260209290829003018186803b1580156101d357600080fd5b505afa1580156101e7573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061020b919061028b565b60ff16600055506102b592505050565b80516001600160a01b038116811461023257600080fd5b919050565b6000806000806080858703121561024d57600080fd5b6102568561021b565b93506102646020860161021b565b92506102726040860161021b565b91506102806060860161021b565b905092959194509250565b60006020828403121561029d57600080fd5b815160ff811681146102ae57600080fd5b9392505050565b6107b4806102c46000396000f3fe608060405234801561001057600080fd5b50600436106100885760003560e01c80637dc0d1d01161005b5780637dc0d1d0146100fa57806398d5fdca1461010d578063b2b63d9f14610115578063eec377c01461012a57600080fd5b806310814c371461008d578063245a7bfc146100bd57806331b46c8b146100d057806338d52e0f146100e7575b600080fd5b6004546100a0906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b6002546100a0906001600160a01b031681565b6100d960005481565b6040519081526020016100b4565b6003546100a0906001600160a01b031681565b6001546100a0906001600160a01b031681565b6100d9610152565b610128610123366004610574565b610254565b005b61013d6101383660046105a4565b610412565b604080519283526020830191909152016100b4565b600080600260009054906101000a90046001600160a01b03166001600160a01b031663feaf968c6040518163ffffffff1660e01b815260040160a06040518083038186803b1580156101a357600080fd5b505afa1580156101b7573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101db91906105c8565b505050915050600081136102455760405162461bcd60e51b815260206004820152602660248201527f436861696e4c696e6b5072696365723a207072696365206973206c6f7765722060448201526507468616e20360d41b60648201526084015b60405180910390fd5b61024e816104bc565b91505090565b6004546001600160a01b031633146102ba5760405162461bcd60e51b8152602060048201526024808201527f436861696e4c696e6b5072696365723a20756e617574686f72697a6564207365604482015263373232b960e11b606482015260840161023c565b600254604051639a6fc8f560e01b815269ffffffffffffffffffff8316600482015260009182916001600160a01b0390911690639a6fc8f59060240160a06040518083038186803b15801561030e57600080fd5b505afa158015610322573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061034691906105c8565b509350509250508084111561039d5760405162461bcd60e51b815260206004820181905260248201527f436861696e4c696e6b5072696365723a20696e76616c696420726f756e644964604482015260640161023c565b60015460035460405163ee53140960e01b81526001600160a01b039182166004820152602481018790526044810185905291169063ee53140990606401600060405180830381600087803b1580156103f457600080fd5b505af1158015610408573d6000803e3d6000fd5b5050505050505050565b600254604051639a6fc8f560e01b815269ffffffffffffffffffff831660048201526000918291829182916001600160a01b0390911690639a6fc8f59060240160a06040518083038186803b15801561046a57600080fd5b505afa15801561047e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104a291906105c8565b509350509250506104b2826104bc565b9590945092505050565b6000600860005411156104f657600080546104d890600861052c565b90506104ef6104e882600a61071a565b8490610541565b9250505090565b6008600054101561052857600080546105119060089061052c565b90506104ef61052182600a61071a565b849061054d565b5090565b60006105388284610726565b90505b92915050565b6000610538828461073d565b6000610538828461075f565b69ffffffffffffffffffff8116811461057157600080fd5b50565b6000806040838503121561058757600080fd5b82359150602083013561059981610559565b809150509250929050565b6000602082840312156105b657600080fd5b81356105c181610559565b9392505050565b600080600080600060a086880312156105e057600080fd5b85516105eb81610559565b80955050602086015193506040860151925060608601519150608086015161061281610559565b809150509295509295909350565b634e487b7160e01b600052601160045260246000fd5b600181815b8085111561067157816000190482111561065757610657610620565b8085161561066457918102915b93841c939080029061063b565b509250929050565b6000826106885750600161053b565b816106955750600061053b565b81600181146106ab57600281146106b5576106d1565b600191505061053b565b60ff8411156106c6576106c6610620565b50506001821b61053b565b5060208310610133831016604e8410600b84101617156106f4575081810a61053b565b6106fe8383610636565b806000190482111561071257610712610620565b029392505050565b60006105388383610679565b60008282101561073857610738610620565b500390565b60008261075a57634e487b7160e01b600052601260045260246000fd5b500490565b600081600019048311821515161561077957610779610620565b50029056fea2646970667358221220dc1e3f2b7dcd2a3a41554b9aea651cf07f9b7ad745d2a2cd34dc6801f91b5c3b64736f6c63430008090033436861696e4c696e6b5072696365723a2043616e6e6f74207365742030206164";

type ChainLinkPricerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: ChainLinkPricerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class ChainLinkPricer__factory extends ContractFactory {
  constructor(...args: ChainLinkPricerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _bot: string,
    _asset: string,
    _aggregator: string,
    _oracle: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ChainLinkPricer> {
    return super.deploy(
      _bot,
      _asset,
      _aggregator,
      _oracle,
      overrides || {}
    ) as Promise<ChainLinkPricer>;
  }
  getDeployTransaction(
    _bot: string,
    _asset: string,
    _aggregator: string,
    _oracle: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _bot,
      _asset,
      _aggregator,
      _oracle,
      overrides || {}
    );
  }
  attach(address: string): ChainLinkPricer {
    return super.attach(address) as ChainLinkPricer;
  }
  connect(signer: Signer): ChainLinkPricer__factory {
    return super.connect(signer) as ChainLinkPricer__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): ChainLinkPricerInterface {
    return new utils.Interface(_abi) as ChainLinkPricerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): ChainLinkPricer {
    return new Contract(address, _abi, signerOrProvider) as ChainLinkPricer;
  }
}
