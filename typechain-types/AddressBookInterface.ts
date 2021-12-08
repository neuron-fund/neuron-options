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

export interface AddressBookInterfaceInterface extends utils.Interface {
  functions: {
    "getAddress(bytes32)": FunctionFragment;
    "getController()": FunctionFragment;
    "getLiquidationManager()": FunctionFragment;
    "getMarginCalculator()": FunctionFragment;
    "getMarginPool()": FunctionFragment;
    "getOracle()": FunctionFragment;
    "getOtokenFactory()": FunctionFragment;
    "getOtokenImpl()": FunctionFragment;
    "getWhitelist()": FunctionFragment;
    "setAddress(bytes32,address)": FunctionFragment;
    "setController(address)": FunctionFragment;
    "setLiquidationManager(address)": FunctionFragment;
    "setMarginCalculator(address)": FunctionFragment;
    "setMarginPool(address)": FunctionFragment;
    "setOracleImpl(address)": FunctionFragment;
    "setOtokenFactory(address)": FunctionFragment;
    "setOtokenImpl(address)": FunctionFragment;
    "setWhitelist(address)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getAddress",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getController",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLiquidationManager",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMarginCalculator",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMarginPool",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "getOracle", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getOtokenFactory",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getOtokenImpl",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getWhitelist",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setAddress",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setController",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setLiquidationManager",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setMarginCalculator",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setMarginPool",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setOracleImpl",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setOtokenFactory",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setOtokenImpl",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setWhitelist",
    values: [string]
  ): string;

  decodeFunctionResult(functionFragment: "getAddress", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getController",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLiquidationManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMarginCalculator",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMarginPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getOracle", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getOtokenFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getOtokenImpl",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "setAddress", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "setController",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setLiquidationManager",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMarginCalculator",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMarginPool",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setOracleImpl",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setOtokenFactory",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setOtokenImpl",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setWhitelist",
    data: BytesLike
  ): Result;

  events: {};
}

export interface AddressBookInterface extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: AddressBookInterfaceInterface;

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
    getAddress(_id: BytesLike, overrides?: CallOverrides): Promise<[string]>;

    getController(overrides?: CallOverrides): Promise<[string]>;

    getLiquidationManager(overrides?: CallOverrides): Promise<[string]>;

    getMarginCalculator(overrides?: CallOverrides): Promise<[string]>;

    getMarginPool(overrides?: CallOverrides): Promise<[string]>;

    getOracle(overrides?: CallOverrides): Promise<[string]>;

    getOtokenFactory(overrides?: CallOverrides): Promise<[string]>;

    getOtokenImpl(overrides?: CallOverrides): Promise<[string]>;

    getWhitelist(overrides?: CallOverrides): Promise<[string]>;

    setAddress(
      _id: BytesLike,
      _newImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setController(
      _controller: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setLiquidationManager(
      _liquidationManager: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setMarginCalculator(
      _calculator: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setMarginPool(
      _marginPool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setOracleImpl(
      _otokenImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setOtokenFactory(
      _factory: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setOtokenImpl(
      _otokenImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setWhitelist(
      _whitelist: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  getAddress(_id: BytesLike, overrides?: CallOverrides): Promise<string>;

  getController(overrides?: CallOverrides): Promise<string>;

  getLiquidationManager(overrides?: CallOverrides): Promise<string>;

  getMarginCalculator(overrides?: CallOverrides): Promise<string>;

  getMarginPool(overrides?: CallOverrides): Promise<string>;

  getOracle(overrides?: CallOverrides): Promise<string>;

  getOtokenFactory(overrides?: CallOverrides): Promise<string>;

  getOtokenImpl(overrides?: CallOverrides): Promise<string>;

  getWhitelist(overrides?: CallOverrides): Promise<string>;

  setAddress(
    _id: BytesLike,
    _newImpl: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setController(
    _controller: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setLiquidationManager(
    _liquidationManager: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setMarginCalculator(
    _calculator: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setMarginPool(
    _marginPool: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setOracleImpl(
    _otokenImpl: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setOtokenFactory(
    _factory: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setOtokenImpl(
    _otokenImpl: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setWhitelist(
    _whitelist: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    getAddress(_id: BytesLike, overrides?: CallOverrides): Promise<string>;

    getController(overrides?: CallOverrides): Promise<string>;

    getLiquidationManager(overrides?: CallOverrides): Promise<string>;

    getMarginCalculator(overrides?: CallOverrides): Promise<string>;

    getMarginPool(overrides?: CallOverrides): Promise<string>;

    getOracle(overrides?: CallOverrides): Promise<string>;

    getOtokenFactory(overrides?: CallOverrides): Promise<string>;

    getOtokenImpl(overrides?: CallOverrides): Promise<string>;

    getWhitelist(overrides?: CallOverrides): Promise<string>;

    setAddress(
      _id: BytesLike,
      _newImpl: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setController(
      _controller: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setLiquidationManager(
      _liquidationManager: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setMarginCalculator(
      _calculator: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setMarginPool(
      _marginPool: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setOracleImpl(
      _otokenImpl: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setOtokenFactory(
      _factory: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setOtokenImpl(
      _otokenImpl: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setWhitelist(_whitelist: string, overrides?: CallOverrides): Promise<void>;
  };

  filters: {};

  estimateGas: {
    getAddress(_id: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;

    getController(overrides?: CallOverrides): Promise<BigNumber>;

    getLiquidationManager(overrides?: CallOverrides): Promise<BigNumber>;

    getMarginCalculator(overrides?: CallOverrides): Promise<BigNumber>;

    getMarginPool(overrides?: CallOverrides): Promise<BigNumber>;

    getOracle(overrides?: CallOverrides): Promise<BigNumber>;

    getOtokenFactory(overrides?: CallOverrides): Promise<BigNumber>;

    getOtokenImpl(overrides?: CallOverrides): Promise<BigNumber>;

    getWhitelist(overrides?: CallOverrides): Promise<BigNumber>;

    setAddress(
      _id: BytesLike,
      _newImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setController(
      _controller: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setLiquidationManager(
      _liquidationManager: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setMarginCalculator(
      _calculator: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setMarginPool(
      _marginPool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setOracleImpl(
      _otokenImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setOtokenFactory(
      _factory: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setOtokenImpl(
      _otokenImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setWhitelist(
      _whitelist: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getAddress(
      _id: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getController(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getLiquidationManager(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getMarginCalculator(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getMarginPool(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOracle(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOtokenFactory(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getOtokenImpl(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getWhitelist(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    setAddress(
      _id: BytesLike,
      _newImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setController(
      _controller: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setLiquidationManager(
      _liquidationManager: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setMarginCalculator(
      _calculator: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setMarginPool(
      _marginPool: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setOracleImpl(
      _otokenImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setOtokenFactory(
      _factory: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setOtokenImpl(
      _otokenImpl: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setWhitelist(
      _whitelist: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}