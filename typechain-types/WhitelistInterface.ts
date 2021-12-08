/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  ContractTransaction,
  Overrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface WhitelistInterfaceInterface extends utils.Interface {
  functions: {
    "addressBook()": FunctionFragment;
    "blacklistCallee(address)": FunctionFragment;
    "blacklistCollateral(address[])": FunctionFragment;
    "blacklistOtoken(address)": FunctionFragment;
    "blacklistProduct(address,address,address[],bool)": FunctionFragment;
    "isWhitelistedCallee(address)": FunctionFragment;
    "isWhitelistedCollaterals(address[])": FunctionFragment;
    "isWhitelistedOtoken(address)": FunctionFragment;
    "isWhitelistedProduct(address,address,address[],bool)": FunctionFragment;
    "owner()": FunctionFragment;
    "renounceOwnership()": FunctionFragment;
    "transferOwnership(address)": FunctionFragment;
    "whitelistCallee(address)": FunctionFragment;
    "whitelistCollaterals(address[])": FunctionFragment;
    "whitelistOtoken(address)": FunctionFragment;
    "whitelistProduct(address,address,address[],bool)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "addressBook",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "blacklistCallee",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "blacklistCollateral",
    values: [string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "blacklistOtoken",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "blacklistProduct",
    values: [string, string, string[], boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "isWhitelistedCallee",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "isWhitelistedCollaterals",
    values: [string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "isWhitelistedOtoken",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "isWhitelistedProduct",
    values: [string, string, string[], boolean]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "whitelistCallee",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "whitelistCollaterals",
    values: [string[]]
  ): string;
  encodeFunctionData(
    functionFragment: "whitelistOtoken",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "whitelistProduct",
    values: [string, string, string[], boolean]
  ): string;

  decodeFunctionResult(
    functionFragment: "addressBook",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "blacklistCallee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "blacklistCollateral",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "blacklistOtoken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "blacklistProduct",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isWhitelistedCallee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isWhitelistedCollaterals",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isWhitelistedOtoken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isWhitelistedProduct",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "whitelistCallee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "whitelistCollaterals",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "whitelistOtoken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "whitelistProduct",
    data: BytesLike
  ): Result;

  events: {};
}

export interface WhitelistInterface extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: WhitelistInterfaceInterface;

  queryFilter<TEvent extends TypedEvent>(
    event: TypedEventFilter<TEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TEvent>>;

  listeners<TEvent extends TypedEvent>(
    eventFilter?: TypedEventFilter<TEvent>
  ): Array<TypedListener<TEvent>>;
  listeners(eventName?: string): Array<Listener>;
  removeAllListeners<TEvent extends TypedEvent>(
    eventFilter: TypedEventFilter<TEvent>
  ): this;
  removeAllListeners(eventName?: string): this;
  off: OnEvent<this>;
  on: OnEvent<this>;
  once: OnEvent<this>;
  removeListener: OnEvent<this>;

  functions: {
    addressBook(overrides?: CallOverrides): Promise<[string]>;

    blacklistCallee(
      _callee: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    blacklistCollateral(
      _collaterals: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    blacklistOtoken(
      _otokenAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    blacklistProduct(
      _underlying: string,
      _strike: string,
      _collaterals: string[],
      _isPut: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    isWhitelistedCallee(
      _callee: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isWhitelistedCollaterals(
      _collaterals: string[],
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isWhitelistedOtoken(
      _otoken: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isWhitelistedProduct(
      _underlying: string,
      _strike: string,
      _collateral: string[],
      _isPut: boolean,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    owner(overrides?: CallOverrides): Promise<[string]>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    whitelistCallee(
      _callee: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    whitelistCollaterals(
      _collaterals: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    whitelistOtoken(
      _otokenAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    whitelistProduct(
      _underlying: string,
      _strike: string,
      _collaterals: string[],
      _isPut: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  addressBook(overrides?: CallOverrides): Promise<string>;

  blacklistCallee(
    _callee: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  blacklistCollateral(
    _collaterals: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  blacklistOtoken(
    _otokenAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  blacklistProduct(
    _underlying: string,
    _strike: string,
    _collaterals: string[],
    _isPut: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  isWhitelistedCallee(
    _callee: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isWhitelistedCollaterals(
    _collaterals: string[],
    overrides?: CallOverrides
  ): Promise<boolean>;

  isWhitelistedOtoken(
    _otoken: string,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isWhitelistedProduct(
    _underlying: string,
    _strike: string,
    _collateral: string[],
    _isPut: boolean,
    overrides?: CallOverrides
  ): Promise<boolean>;

  owner(overrides?: CallOverrides): Promise<string>;

  renounceOwnership(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  transferOwnership(
    newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  whitelistCallee(
    _callee: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  whitelistCollaterals(
    _collaterals: string[],
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  whitelistOtoken(
    _otokenAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  whitelistProduct(
    _underlying: string,
    _strike: string,
    _collaterals: string[],
    _isPut: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    addressBook(overrides?: CallOverrides): Promise<string>;

    blacklistCallee(_callee: string, overrides?: CallOverrides): Promise<void>;

    blacklistCollateral(
      _collaterals: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    blacklistOtoken(
      _otokenAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    blacklistProduct(
      _underlying: string,
      _strike: string,
      _collaterals: string[],
      _isPut: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    isWhitelistedCallee(
      _callee: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isWhitelistedCollaterals(
      _collaterals: string[],
      overrides?: CallOverrides
    ): Promise<boolean>;

    isWhitelistedOtoken(
      _otoken: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isWhitelistedProduct(
      _underlying: string,
      _strike: string,
      _collateral: string[],
      _isPut: boolean,
      overrides?: CallOverrides
    ): Promise<boolean>;

    owner(overrides?: CallOverrides): Promise<string>;

    renounceOwnership(overrides?: CallOverrides): Promise<void>;

    transferOwnership(
      newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    whitelistCallee(_callee: string, overrides?: CallOverrides): Promise<void>;

    whitelistCollaterals(
      _collaterals: string[],
      overrides?: CallOverrides
    ): Promise<void>;

    whitelistOtoken(
      _otokenAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    whitelistProduct(
      _underlying: string,
      _strike: string,
      _collaterals: string[],
      _isPut: boolean,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    addressBook(overrides?: CallOverrides): Promise<BigNumber>;

    blacklistCallee(
      _callee: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    blacklistCollateral(
      _collaterals: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    blacklistOtoken(
      _otokenAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    blacklistProduct(
      _underlying: string,
      _strike: string,
      _collaterals: string[],
      _isPut: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    isWhitelistedCallee(
      _callee: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isWhitelistedCollaterals(
      _collaterals: string[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isWhitelistedOtoken(
      _otoken: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isWhitelistedProduct(
      _underlying: string,
      _strike: string,
      _collateral: string[],
      _isPut: boolean,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    owner(overrides?: CallOverrides): Promise<BigNumber>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    whitelistCallee(
      _callee: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    whitelistCollaterals(
      _collaterals: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    whitelistOtoken(
      _otokenAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    whitelistProduct(
      _underlying: string,
      _strike: string,
      _collaterals: string[],
      _isPut: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    addressBook(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    blacklistCallee(
      _callee: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    blacklistCollateral(
      _collaterals: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    blacklistOtoken(
      _otokenAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    blacklistProduct(
      _underlying: string,
      _strike: string,
      _collaterals: string[],
      _isPut: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    isWhitelistedCallee(
      _callee: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isWhitelistedCollaterals(
      _collaterals: string[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isWhitelistedOtoken(
      _otoken: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isWhitelistedProduct(
      _underlying: string,
      _strike: string,
      _collateral: string[],
      _isPut: boolean,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    owner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    renounceOwnership(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    transferOwnership(
      newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    whitelistCallee(
      _callee: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    whitelistCollaterals(
      _collaterals: string[],
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    whitelistOtoken(
      _otokenAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    whitelistProduct(
      _underlying: string,
      _strike: string,
      _collaterals: string[],
      _isPut: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}