/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { WstethPricer, WstethPricerInterface } from "../WstethPricer";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_wstETH",
        type: "address",
      },
      {
        internalType: "address",
        name: "_underlying",
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
    inputs: [
      {
        internalType: "uint80",
        name: "",
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
    stateMutability: "pure",
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
    ],
    name: "setExpiryPriceInOracle",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "underlying",
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
    name: "wstETH",
    outputs: [
      {
        internalType: "contract WSTETHInterface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
  "0x608060405234801561001057600080fd5b506040516106c33803806106c383398101604081905261002f91610143565b6001600160a01b03831661006f5760405162461bcd60e51b8152602060048201526002602482015261573160f01b60448201526064015b60405180910390fd5b6001600160a01b0382166100aa5760405162461bcd60e51b81526020600482015260026024820152612b9960f11b6044820152606401610066565b6001600160a01b0381166100e55760405162461bcd60e51b8152602060048201526002602482015261573360f01b6044820152606401610066565b600180546001600160a01b039485166001600160a01b031991821617909155600080549285169282169290921790915560028054929093169116179055610186565b80516001600160a01b038116811461013e57600080fd5b919050565b60008060006060848603121561015857600080fd5b61016184610127565b925061016f60208501610127565b915061017d60408501610127565b90509250925092565b61052e806101956000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c80634aa07e64146100675780636f307dc3146100975780637dc0d1d0146100aa57806396367290146100bd57806398d5fdca146100d2578063eec377c0146100e8575b600080fd5b60015461007a906001600160a01b031681565b6040516001600160a01b0390911681526020015b60405180910390f35b60025461007a906001600160a01b031681565b60005461007a906001600160a01b031681565b6100d06100cb366004610416565b610110565b005b6100da610254565b60405190815260200161008e565b6100fb6100f636600461042f565b61031e565b6040805192835260208301919091520161008e565b600080546002546040516301957f8160e01b81526001600160a01b039182166004820152602481018590529116906301957f8190604401604080518083038186803b15801561015e57600080fd5b505afa158015610172573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610196919061045b565b509050600081116101d35760405162461bcd60e51b8152602060048201526002602482015261573560f01b60448201526064015b60405180910390fd5b60006101de82610350565b60005460015460405163ee53140960e01b81526001600160a01b0391821660048201526024810187905260448101849052929350169063ee53140990606401600060405180830381600087803b15801561023757600080fd5b505af115801561024b573d6000803e3d6000fd5b50505050505050565b600080546002546040516341976e0960e01b81526001600160a01b039182166004820152839291909116906341976e099060240160206040518083038186803b1580156102a057600080fd5b505afa1580156102b4573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102d89190610490565b90506000811161030f5760405162461bcd60e51b815260206004820152600260248201526115cd60f21b60448201526064016101ca565b61031881610350565b91505090565b60405162461bcd60e51b81526020600482015260026024820152612b9b60f11b604482015260009081906064016101ca565b600080600160009054906101000a90046001600160a01b03166001600160a01b031663035faf826040518163ffffffff1660e01b815260040160206040518083038186803b1580156103a157600080fd5b505afa1580156103b5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103d99190610490565b90506103f7670de0b6b3a76400006103f183866103fe565b9061040a565b9392505050565b60006103f782846104a9565b60006103f782846104d6565b60006020828403121561042857600080fd5b5035919050565b60006020828403121561044157600080fd5b813569ffffffffffffffffffff811681146103f757600080fd5b6000806040838503121561046e57600080fd5b825191506020830151801515811461048557600080fd5b809150509250929050565b6000602082840312156104a257600080fd5b5051919050565b60008160001904831182151516156104d157634e487b7160e01b600052601160045260246000fd5b500290565b6000826104f357634e487b7160e01b600052601260045260246000fd5b50049056fea2646970667358221220fd97c7bc69eb152af54fd7b23f09de3475a08338bcf4dc39c5b7a197004cac1e64736f6c63430008090033";

type WstethPricerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: WstethPricerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class WstethPricer__factory extends ContractFactory {
  constructor(...args: WstethPricerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    _wstETH: string,
    _underlying: string,
    _oracle: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<WstethPricer> {
    return super.deploy(
      _wstETH,
      _underlying,
      _oracle,
      overrides || {}
    ) as Promise<WstethPricer>;
  }
  getDeployTransaction(
    _wstETH: string,
    _underlying: string,
    _oracle: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      _wstETH,
      _underlying,
      _oracle,
      overrides || {}
    );
  }
  attach(address: string): WstethPricer {
    return super.attach(address) as WstethPricer;
  }
  connect(signer: Signer): WstethPricer__factory {
    return super.connect(signer) as WstethPricer__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): WstethPricerInterface {
    return new utils.Interface(_abi) as WstethPricerInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): WstethPricer {
    return new Contract(address, _abi, signerOrProvider) as WstethPricer;
  }
}
