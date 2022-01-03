/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BigNumberish,
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

export interface MockOracleInterface extends utils.Interface {
  functions: {
    "getChainlinkRoundData(address,uint80)": FunctionFragment;
    "getExpiryPrice(address,uint256)": FunctionFragment;
    "getPrice(address)": FunctionFragment;
    "getPricer(address)": FunctionFragment;
    "getPricerDisputePeriod(address)": FunctionFragment;
    "getPricerLockingPeriod(address)": FunctionFragment;
    "isDisputePeriodOver(address,uint256)": FunctionFragment;
    "isFinalized(address,uint256)": FunctionFragment;
    "isLockingPeriodOver(address,uint256)": FunctionFragment;
    "realTimePrice(address)": FunctionFragment;
    "setAssetPricer(address,address)": FunctionFragment;
    "setChainlinkRoundData(address,uint80,uint256,uint256)": FunctionFragment;
    "setDisputePeriod(address,uint256)": FunctionFragment;
    "setExpiryPrice(address,uint256,uint256)": FunctionFragment;
    "setExpiryPriceFinalizedAllPeiodOver(address,uint256,uint256,bool)": FunctionFragment;
    "setIsDisputePeriodOver(address,uint256,bool)": FunctionFragment;
    "setIsFinalized(address,uint256,bool)": FunctionFragment;
    "setIsLockingPeriodOver(address,uint256,bool)": FunctionFragment;
    "setLockingPeriod(address,uint256)": FunctionFragment;
    "setRealTimePrice(address,uint256)": FunctionFragment;
    "setStablePrice(address,uint256)": FunctionFragment;
    "storedPrice(address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getChainlinkRoundData",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getExpiryPrice",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "getPrice", values: [string]): string;
  encodeFunctionData(functionFragment: "getPricer", values: [string]): string;
  encodeFunctionData(
    functionFragment: "getPricerDisputePeriod",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "getPricerLockingPeriod",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "isDisputePeriodOver",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isFinalized",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "isLockingPeriodOver",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "realTimePrice",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "setAssetPricer",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "setChainlinkRoundData",
    values: [string, BigNumberish, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setDisputePeriod",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setExpiryPrice",
    values: [string, BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setExpiryPriceFinalizedAllPeiodOver",
    values: [string, BigNumberish, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setIsDisputePeriodOver",
    values: [string, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setIsFinalized",
    values: [string, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setIsLockingPeriodOver",
    values: [string, BigNumberish, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setLockingPeriod",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setRealTimePrice",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setStablePrice",
    values: [string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "storedPrice",
    values: [string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "getChainlinkRoundData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getExpiryPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getPrice", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getPricer", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getPricerDisputePeriod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPricerLockingPeriod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isDisputePeriodOver",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isFinalized",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "isLockingPeriodOver",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "realTimePrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAssetPricer",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setChainlinkRoundData",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDisputePeriod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setExpiryPrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setExpiryPriceFinalizedAllPeiodOver",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setIsDisputePeriodOver",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setIsFinalized",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setIsLockingPeriodOver",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setLockingPeriod",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setRealTimePrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setStablePrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "storedPrice",
    data: BytesLike
  ): Result;

  events: {};
}

export interface MockOracle extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: MockOracleInterface;

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
    getChainlinkRoundData(
      _asset: string,
      _roundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    getExpiryPrice(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, boolean]>;

    getPrice(_asset: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    getPricer(_asset: string, overrides?: CallOverrides): Promise<[string]>;

    getPricerDisputePeriod(
      _pricer: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    getPricerLockingPeriod(
      _pricer: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    isDisputePeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isFinalized(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    isLockingPeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    realTimePrice(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    setAssetPricer(
      _asset: string,
      _pricer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setChainlinkRoundData(
      _asset: string,
      _roundId: BigNumberish,
      _price: BigNumberish,
      _timestamp: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setDisputePeriod(
      _pricer: string,
      _disputePeriod: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setExpiryPrice(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setExpiryPriceFinalizedAllPeiodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _price: BigNumberish,
      _isFinalized: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setIsDisputePeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _result: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setIsFinalized(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _isFinalized: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setIsLockingPeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _result: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setLockingPeriod(
      _pricer: string,
      _lockingPeriod: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setRealTimePrice(
      _asset: string,
      _price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setStablePrice(
      _asset: string,
      _price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    storedPrice(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;
  };

  getChainlinkRoundData(
    _asset: string,
    _roundId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[BigNumber, BigNumber]>;

  getExpiryPrice(
    _asset: string,
    _expiryTimestamp: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[BigNumber, boolean]>;

  getPrice(_asset: string, overrides?: CallOverrides): Promise<BigNumber>;

  getPricer(_asset: string, overrides?: CallOverrides): Promise<string>;

  getPricerDisputePeriod(
    _pricer: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  getPricerLockingPeriod(
    _pricer: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  isDisputePeriodOver(
    _asset: string,
    _expiryTimestamp: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isFinalized(
    arg0: string,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  isLockingPeriodOver(
    _asset: string,
    _expiryTimestamp: BigNumberish,
    overrides?: CallOverrides
  ): Promise<boolean>;

  realTimePrice(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  setAssetPricer(
    _asset: string,
    _pricer: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setChainlinkRoundData(
    _asset: string,
    _roundId: BigNumberish,
    _price: BigNumberish,
    _timestamp: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setDisputePeriod(
    _pricer: string,
    _disputePeriod: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setExpiryPrice(
    _asset: string,
    _expiryTimestamp: BigNumberish,
    _price: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setExpiryPriceFinalizedAllPeiodOver(
    _asset: string,
    _expiryTimestamp: BigNumberish,
    _price: BigNumberish,
    _isFinalized: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setIsDisputePeriodOver(
    _asset: string,
    _expiryTimestamp: BigNumberish,
    _result: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setIsFinalized(
    _asset: string,
    _expiryTimestamp: BigNumberish,
    _isFinalized: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setIsLockingPeriodOver(
    _asset: string,
    _expiryTimestamp: BigNumberish,
    _result: boolean,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setLockingPeriod(
    _pricer: string,
    _lockingPeriod: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setRealTimePrice(
    _asset: string,
    _price: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setStablePrice(
    _asset: string,
    _price: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  storedPrice(
    arg0: string,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  callStatic: {
    getChainlinkRoundData(
      _asset: string,
      _roundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    getExpiryPrice(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, boolean]>;

    getPrice(_asset: string, overrides?: CallOverrides): Promise<BigNumber>;

    getPricer(_asset: string, overrides?: CallOverrides): Promise<string>;

    getPricerDisputePeriod(
      _pricer: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPricerLockingPeriod(
      _pricer: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isDisputePeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isFinalized(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    isLockingPeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<boolean>;

    realTimePrice(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    setAssetPricer(
      _asset: string,
      _pricer: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setChainlinkRoundData(
      _asset: string,
      _roundId: BigNumberish,
      _price: BigNumberish,
      _timestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[BigNumber, BigNumber]>;

    setDisputePeriod(
      _pricer: string,
      _disputePeriod: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setExpiryPrice(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _price: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setExpiryPriceFinalizedAllPeiodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _price: BigNumberish,
      _isFinalized: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    setIsDisputePeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _result: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    setIsFinalized(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _isFinalized: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    setIsLockingPeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _result: boolean,
      overrides?: CallOverrides
    ): Promise<void>;

    setLockingPeriod(
      _pricer: string,
      _lockingPeriod: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setRealTimePrice(
      _asset: string,
      _price: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    setStablePrice(
      _asset: string,
      _price: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    storedPrice(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  filters: {};

  estimateGas: {
    getChainlinkRoundData(
      _asset: string,
      _roundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getExpiryPrice(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPrice(_asset: string, overrides?: CallOverrides): Promise<BigNumber>;

    getPricer(_asset: string, overrides?: CallOverrides): Promise<BigNumber>;

    getPricerDisputePeriod(
      _pricer: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getPricerLockingPeriod(
      _pricer: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isDisputePeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isFinalized(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    isLockingPeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    realTimePrice(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    setAssetPricer(
      _asset: string,
      _pricer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setChainlinkRoundData(
      _asset: string,
      _roundId: BigNumberish,
      _price: BigNumberish,
      _timestamp: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setDisputePeriod(
      _pricer: string,
      _disputePeriod: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setExpiryPrice(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setExpiryPriceFinalizedAllPeiodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _price: BigNumberish,
      _isFinalized: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setIsDisputePeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _result: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setIsFinalized(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _isFinalized: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setIsLockingPeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _result: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setLockingPeriod(
      _pricer: string,
      _lockingPeriod: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setRealTimePrice(
      _asset: string,
      _price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setStablePrice(
      _asset: string,
      _price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    storedPrice(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getChainlinkRoundData(
      _asset: string,
      _roundId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getExpiryPrice(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPrice(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPricer(
      _asset: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPricerDisputePeriod(
      _pricer: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getPricerLockingPeriod(
      _pricer: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isDisputePeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isFinalized(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    isLockingPeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    realTimePrice(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setAssetPricer(
      _asset: string,
      _pricer: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setChainlinkRoundData(
      _asset: string,
      _roundId: BigNumberish,
      _price: BigNumberish,
      _timestamp: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setDisputePeriod(
      _pricer: string,
      _disputePeriod: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setExpiryPrice(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setExpiryPriceFinalizedAllPeiodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _price: BigNumberish,
      _isFinalized: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setIsDisputePeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _result: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setIsFinalized(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _isFinalized: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setIsLockingPeriodOver(
      _asset: string,
      _expiryTimestamp: BigNumberish,
      _result: boolean,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setLockingPeriod(
      _pricer: string,
      _lockingPeriod: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setRealTimePrice(
      _asset: string,
      _price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setStablePrice(
      _asset: string,
      _price: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    storedPrice(
      arg0: string,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}