/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type { OtokenImplV1, OtokenImplV1Interface } from "../OtokenImplV1";

const _abi = [
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
    name: "burnOtoken",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "collateralAsset",
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
    name: "controller",
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
    inputs: [],
    name: "expiryTimestamp",
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
    name: "getChainId",
    outputs: [
      {
        internalType: "uint256",
        name: "chainId",
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
        name: "_addressBook",
        type: "address",
      },
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
        internalType: "address",
        name: "_collateralAsset",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_strikePrice",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_expiryTimestamp",
        type: "uint256",
      },
      {
        internalType: "bool",
        name: "_isPut",
        type: "bool",
      },
    ],
    name: "init",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "inited",
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
    name: "isPut",
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
        name: "_to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_amount",
        type: "uint256",
      },
    ],
    name: "mintOtoken",
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
    name: "strikeAsset",
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
    name: "strikePrice",
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
  {
    inputs: [],
    name: "underlyingAsset",
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
  "0x608060405260d3805461ff001916905534801561001b57600080fd5b506118008061002b6000396000f3fe608060405234801561001057600080fd5b50600436106101a95760003560e01c80637158da7c116100f9578063c52987cf11610097578063f3c274a611610071578063f3c274a614610397578063f5887cdd146103a4578063f630df34146103b7578063f77c4791146103ca57600080fd5b8063c52987cf14610342578063d505accf1461034b578063dd62ed3e1461035e57600080fd5b8063a457c2d7116100d3578063a457c2d714610300578063a9059cbb14610313578063aabaecd614610326578063ade6e2aa1461033957600080fd5b80637158da7c146102d25780637ecebe00146102e557806395d89b41146102f857600080fd5b80633408e4701161016657806343c885ba1161014057806343c885ba1461026f57806351b0a4101461028157806356d878f71461029657806370a08231146102a957600080fd5b80633408e4701461024e5780633644e51514610254578063395093511461025c57600080fd5b806306fdde03146101ae578063095ea7b3146101cc57806317d69bc8146101ef57806318160ddd1461021a57806323b872dd1461022c578063313ce5671461023f575b600080fd5b6101b66103dd565b6040516101c3919061149e565b60405180910390f35b6101df6101da366004611508565b61046f565b60405190151581526020016101c3565b60cf54610202906001600160a01b031681565b6040516001600160a01b0390911681526020016101c3565b6035545b6040519081526020016101c3565b6101df61023a366004611534565b610485565b604051600881526020016101c3565b4661021e565b61021e610534565b6101df61026a366004611508565b610543565b60d3546101df90610100900460ff1681565b61029461028f366004611508565b61057f565b005b6102946102a4366004611508565b61058d565b61021e6102b7366004611575565b6001600160a01b031660009081526033602052604090205490565b60ce54610202906001600160a01b031681565b61021e6102f3366004611575565b610597565b6101b66105b7565b6101df61030e366004611508565b6105c6565b6101df610321366004611508565b61065f565b60d054610202906001600160a01b031681565b61021e60d25481565b61021e60d15481565b610294610359366004611599565b61066c565b61021e61036c366004611610565b6001600160a01b03918216600090815260346020908152604080832093909416825291909152205490565b60d3546101df9060ff1681565b60cc54610202906001600160a01b031681565b6102946103c5366004611649565b6107b2565b60cd54610202906001600160a01b031681565b6060603680546103ec906116d2565b80601f0160208091040260200160405190810160405280929190818152602001828054610418906116d2565b80156104655780601f1061043a57610100808354040283529160200191610465565b820191906000526020600020905b81548152906001019060200180831161044857829003601f168201915b5050505050905090565b600061047c3384846109c2565b50600192915050565b6000610492848484610ae7565b6001600160a01b03841660009081526034602090815260408083203384529091529020548281101561051c5760405162461bcd60e51b815260206004820152602860248201527f45524332303a207472616e7366657220616d6f756e74206578636565647320616044820152676c6c6f77616e636560c01b60648201526084015b60405180910390fd5b61052985338584036109c2565b506001949350505050565b600061053e610cb6565b905090565b3360008181526034602090815260408083206001600160a01b0387168452909152812054909161047c91859061057a90869061171d565b6109c2565b6105898282610d31565b5050565b6105898282610e10565b6001600160a01b0381166000908152609960205260408120545b92915050565b6060603780546103ec906116d2565b3360009081526034602090815260408083206001600160a01b0386168452909152812054828110156106485760405162461bcd60e51b815260206004820152602560248201527f45524332303a2064656372656173656420616c6c6f77616e63652062656c6f77604482015264207a65726f60d81b6064820152608401610513565b61065533858584036109c2565b5060019392505050565b600061047c338484610ae7565b834211156106bc5760405162461bcd60e51b815260206004820152601d60248201527f45524332305065726d69743a206578706972656420646561646c696e650000006044820152606401610513565b6000609a548888886106cd8c610f5b565b6040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810186905260e001604051602081830303815290604052805190602001209050600061072882610f83565b9050600061073882878787610fd1565b9050896001600160a01b0316816001600160a01b03161461079b5760405162461bcd60e51b815260206004820152601e60248201527f45524332305065726d69743a20696e76616c6964207369676e617475726500006044820152606401610513565b6107a68a8a8a6109c2565b50505050505050505050565b600054610100900460ff166107cd5760005460ff16156107d1565b303b155b6108345760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201526d191e481a5b9a5d1a585b1a5e995960921b6064820152608401610513565b600054610100900460ff16158015610856576000805461ffff19166101011790555b60d3805461ff00191661010017905560408051633018205f60e01b815290516001600160a01b038a1691633018205f916004808301926020929190829003018186803b1580156108a557600080fd5b505afa1580156108b9573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108dd9190611735565b60cd80546001600160a01b03199081166001600160a01b039384161790915560ce805482168a841617905560cf8054821689841617905560d0805490911691871691909117905560d184905560d283905560d3805460ff1916831515179055604080518082018252601c81527f455448555344432f313539373531313935352f323030502f55534443000000006020808301919091528251808401909352600983526806f45544855534443560bc1b908301529061099b8282610ff9565b6109a482611047565b505080156109b8576000805461ff00191690555b5050505050505050565b6001600160a01b038316610a245760405162461bcd60e51b8152602060048201526024808201527f45524332303a20617070726f76652066726f6d20746865207a65726f206164646044820152637265737360e01b6064820152608401610513565b6001600160a01b038216610a855760405162461bcd60e51b815260206004820152602260248201527f45524332303a20617070726f766520746f20746865207a65726f206164647265604482015261737360f01b6064820152608401610513565b6001600160a01b0383811660008181526034602090815260408083209487168084529482529182902085905590518481527f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92591015b60405180910390a3505050565b6001600160a01b038316610b4b5760405162461bcd60e51b815260206004820152602560248201527f45524332303a207472616e736665722066726f6d20746865207a65726f206164604482015264647265737360d81b6064820152608401610513565b6001600160a01b038216610bad5760405162461bcd60e51b815260206004820152602360248201527f45524332303a207472616e7366657220746f20746865207a65726f206164647260448201526265737360e81b6064820152608401610513565b6001600160a01b03831660009081526033602052604090205481811015610c255760405162461bcd60e51b815260206004820152602660248201527f45524332303a207472616e7366657220616d6f756e7420657863656564732062604482015265616c616e636560d01b6064820152608401610513565b6001600160a01b03808516600090815260336020526040808220858503905591851681529081208054849290610c5c90849061171d565b92505081905550826001600160a01b0316846001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef84604051610ca891815260200190565b60405180910390a350505050565b600061053e7f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f610ce560655490565b6066546040805160208101859052908101839052606081018290524660808201523060a082015260009060c0016040516020818303038152906040528051906020012090509392505050565b6001600160a01b038216610d875760405162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f2061646472657373006044820152606401610513565b8060356000828254610d99919061171d565b90915550506001600160a01b03821660009081526033602052604081208054839290610dc690849061171d565b90915550506040518181526001600160a01b038316906000907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9060200160405180910390a35050565b6001600160a01b038216610e705760405162461bcd60e51b815260206004820152602160248201527f45524332303a206275726e2066726f6d20746865207a65726f206164647265736044820152607360f81b6064820152608401610513565b6001600160a01b03821660009081526033602052604090205481811015610ee45760405162461bcd60e51b815260206004820152602260248201527f45524332303a206275726e20616d6f756e7420657863656564732062616c616e604482015261636560f01b6064820152608401610513565b6001600160a01b0383166000908152603360205260408120838303905560358054849290610f13908490611752565b90915550506040518281526000906001600160a01b038516907fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef90602001610ada565b505050565b6001600160a01b03811660009081526099602052604090208054600181018255905b50919050565b60006105b1610f90610cb6565b8360405161190160f01b6020820152602281018390526042810182905260009060620160405160208183030381529060405280519060200120905092915050565b6000806000610fe2878787876110a5565b91509150610fef81611192565b5095945050505050565b600054610100900460ff166110205760405162461bcd60e51b815260040161051390611769565b8151611033906036906020850190611405565b508051610f56906037906020840190611405565b600054610100900460ff1661106e5760405162461bcd60e51b815260040161051390611769565b61107661134d565b61109981604051806040016040528060018152602001603160f81b815250611376565b6110a2816113b7565b50565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08311156110dc5750600090506003611189565b8460ff16601b141580156110f457508460ff16601c14155b156111055750600090506004611189565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa158015611159573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b03811661118257600060019250925050611189565b9150600090505b94509492505050565b60008160048111156111a6576111a66117b4565b14156111af5750565b60018160048111156111c3576111c36117b4565b14156112115760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606401610513565b6002816004811115611225576112256117b4565b14156112735760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606401610513565b6003816004811115611287576112876117b4565b14156112e05760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b6064820152608401610513565b60048160048111156112f4576112f46117b4565b14156110a25760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604482015261756560f01b6064820152608401610513565b600054610100900460ff166113745760405162461bcd60e51b815260040161051390611769565b565b600054610100900460ff1661139d5760405162461bcd60e51b815260040161051390611769565b815160209283012081519190920120606591909155606655565b600054610100900460ff166113de5760405162461bcd60e51b815260040161051390611769565b507f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c9609a55565b828054611411906116d2565b90600052602060002090601f0160209004810192826114335760008555611479565b82601f1061144c57805160ff1916838001178555611479565b82800160010185558215611479579182015b8281111561147957825182559160200191906001019061145e565b50611485929150611489565b5090565b5b80821115611485576000815560010161148a565b600060208083528351808285015260005b818110156114cb578581018301518582016040015282016114af565b818111156114dd576000604083870101525b50601f01601f1916929092016040019392505050565b6001600160a01b03811681146110a257600080fd5b6000806040838503121561151b57600080fd5b8235611526816114f3565b946020939093013593505050565b60008060006060848603121561154957600080fd5b8335611554816114f3565b92506020840135611564816114f3565b929592945050506040919091013590565b60006020828403121561158757600080fd5b8135611592816114f3565b9392505050565b600080600080600080600060e0888a0312156115b457600080fd5b87356115bf816114f3565b965060208801356115cf816114f3565b95506040880135945060608801359350608088013560ff811681146115f357600080fd5b9699959850939692959460a0840135945060c09093013592915050565b6000806040838503121561162357600080fd5b823561162e816114f3565b9150602083013561163e816114f3565b809150509250929050565b600080600080600080600060e0888a03121561166457600080fd5b873561166f816114f3565b9650602088013561167f816114f3565b9550604088013561168f816114f3565b9450606088013561169f816114f3565b93506080880135925060a0880135915060c088013580151581146116c257600080fd5b8091505092959891949750929550565b600181811c908216806116e657607f821691505b60208210811415610f7d57634e487b7160e01b600052602260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b6000821982111561173057611730611707565b500190565b60006020828403121561174757600080fd5b8151611592816114f3565b60008282101561176457611764611707565b500390565b6020808252602b908201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960408201526a6e697469616c697a696e6760a81b606082015260800190565b634e487b7160e01b600052602160045260246000fdfea2646970667358221220a3d83db4ffb74f2db0fb5770177d8075d8fe05ed717ffa8be5814b3910361f4364736f6c63430008090033";

type OtokenImplV1ConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: OtokenImplV1ConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class OtokenImplV1__factory extends ContractFactory {
  constructor(...args: OtokenImplV1ConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  deploy(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<OtokenImplV1> {
    return super.deploy(overrides || {}) as Promise<OtokenImplV1>;
  }
  getDeployTransaction(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  attach(address: string): OtokenImplV1 {
    return super.attach(address) as OtokenImplV1;
  }
  connect(signer: Signer): OtokenImplV1__factory {
    return super.connect(signer) as OtokenImplV1__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): OtokenImplV1Interface {
    return new utils.Interface(_abi) as OtokenImplV1Interface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): OtokenImplV1 {
    return new Contract(address, _abi, signerOrProvider) as OtokenImplV1;
  }
}