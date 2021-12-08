/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  BaseContract,
  BigNumber,
  BytesLike,
  CallOverrides,
  PopulatedTransaction,
  Signer,
  utils,
} from "ethers";
import { FunctionFragment, Result } from "@ethersproject/abi";
import { Listener, Provider } from "@ethersproject/providers";
import { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "./common";

export interface ConstantsInterface extends utils.Interface {
  functions: {
    "MAX_COLLATERAL_ASSETS()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "MAX_COLLATERAL_ASSETS",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "MAX_COLLATERAL_ASSETS",
    data: BytesLike
  ): Result;

  events: {};
}

export interface Constants extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: ConstantsInterface;

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
    MAX_COLLATERAL_ASSETS(overrides?: CallOverrides): Promise<[number]>;
  };

  MAX_COLLATERAL_ASSETS(overrides?: CallOverrides): Promise<number>;

  callStatic: {
    MAX_COLLATERAL_ASSETS(overrides?: CallOverrides): Promise<number>;
  };

  filters: {};

  estimateGas: {
    MAX_COLLATERAL_ASSETS(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    MAX_COLLATERAL_ASSETS(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
