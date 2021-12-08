/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type {
  TypedEventFilter,
  TypedEvent,
  TypedListener,
  OnEvent,
} from "./common";

export interface OwnedUpgradeabilityProxyInterface
  extends ethers.utils.Interface {
  functions: {
    "implementation()": FunctionFragment;
    "proxyOwner()": FunctionFragment;
    "transferProxyOwnership(address)": FunctionFragment;
    "upgradeTo(address)": FunctionFragment;
    "upgradeToAndCall(address,bytes)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "implementation",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "proxyOwner",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferProxyOwnership",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "upgradeTo", values: [string]): string;
  encodeFunctionData(
    functionFragment: "upgradeToAndCall",
    values: [string, BytesLike]
  ): string;

  decodeFunctionResult(
    functionFragment: "implementation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "proxyOwner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "transferProxyOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "upgradeTo", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "upgradeToAndCall",
    data: BytesLike
  ): Result;

  events: {
    "ProxyOwnershipTransferred(address,address)": EventFragment;
    "Upgraded(address)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "ProxyOwnershipTransferred"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Upgraded"): EventFragment;
}

export type ProxyOwnershipTransferredEvent = TypedEvent<
  [string, string],
  { previousOwner: string; newOwner: string }
>;

export type ProxyOwnershipTransferredEventFilter =
  TypedEventFilter<ProxyOwnershipTransferredEvent>;

export type UpgradedEvent = TypedEvent<[string], { implementation: string }>;

export type UpgradedEventFilter = TypedEventFilter<UpgradedEvent>;

export interface OwnedUpgradeabilityProxy extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  interface: OwnedUpgradeabilityProxyInterface;

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
    implementation(
      overrides?: CallOverrides
    ): Promise<[string] & { impl: string }>;

    proxyOwner(
      overrides?: CallOverrides
    ): Promise<[string] & { owner: string }>;

    transferProxyOwnership(
      _newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    upgradeTo(
      _implementation: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    upgradeToAndCall(
      _implementation: string,
      _data: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  implementation(overrides?: CallOverrides): Promise<string>;

  proxyOwner(overrides?: CallOverrides): Promise<string>;

  transferProxyOwnership(
    _newOwner: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  upgradeTo(
    _implementation: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  upgradeToAndCall(
    _implementation: string,
    _data: BytesLike,
    overrides?: PayableOverrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    implementation(overrides?: CallOverrides): Promise<string>;

    proxyOwner(overrides?: CallOverrides): Promise<string>;

    transferProxyOwnership(
      _newOwner: string,
      overrides?: CallOverrides
    ): Promise<void>;

    upgradeTo(
      _implementation: string,
      overrides?: CallOverrides
    ): Promise<void>;

    upgradeToAndCall(
      _implementation: string,
      _data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {
    "ProxyOwnershipTransferred(address,address)"(
      previousOwner?: null,
      newOwner?: null
    ): ProxyOwnershipTransferredEventFilter;
    ProxyOwnershipTransferred(
      previousOwner?: null,
      newOwner?: null
    ): ProxyOwnershipTransferredEventFilter;

    "Upgraded(address)"(implementation?: string | null): UpgradedEventFilter;
    Upgraded(implementation?: string | null): UpgradedEventFilter;
  };

  estimateGas: {
    implementation(overrides?: CallOverrides): Promise<BigNumber>;

    proxyOwner(overrides?: CallOverrides): Promise<BigNumber>;

    transferProxyOwnership(
      _newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    upgradeTo(
      _implementation: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    upgradeToAndCall(
      _implementation: string,
      _data: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    implementation(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    proxyOwner(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    transferProxyOwnership(
      _newOwner: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    upgradeTo(
      _implementation: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    upgradeToAndCall(
      _implementation: string,
      _data: BytesLike,
      overrides?: PayableOverrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}
