import { ActionArgsStruct } from '../../typechain-types/Controller'
import { AddressZero } from '../../utils/ethers'

export enum ActionType {
  OpenVault,
  MintShortOption,
  BurnShortOption,
  DepositLongOption,
  WithdrawLongOption,
  DepositCollateral,
  WithdrawCollateral,
  SettleVault,
  Redeem,
  Call,
}

export type ActionArgsKeys = keyof ActionArgsStruct

export const ActionDefaults = {
  amounts: [],
  assets: [],
  data: AddressZero,
  index: 0,
  owner: AddressZero,
  secondAddress: AddressZero,
  vaultId: 0,
} as const

export type ActionParamsMapping = {
  readonly [key: string]: ActionArgsKeys
}

export type GetActionArgsParams<T extends ActionParamsMapping> = {
  [K in keyof T]: ActionArgsStruct[T[K]]
}
export type MappedActionKeys<T extends ActionParamsMapping> = T[keyof T]
export type UnMappedActionKeys<T extends ActionParamsMapping> = keyof Omit<typeof ActionDefaults, MappedActionKeys<T>>
export type ActionDefaults<T extends ActionParamsMapping> = Pick<typeof ActionDefaults, UnMappedActionKeys<T>>
export const mapActionParams = <T extends ActionParamsMapping>(
  mapping: T,
  values: GetActionArgsParams<T>
): Pick<ActionArgsStruct, T[keyof T]> =>
  Object.keys(mapping).reduce((acc, key) => {
    acc[mapping[key]] = values[key]
    return acc
  }, {}) as Pick<ActionArgsStruct, T[keyof T]>

export const getActionFactory =
  <T extends ActionParamsMapping>(
    actionType: ActionType,
    mappings: T
  ): ((values: GetActionArgsParams<T>) => ActionArgsStruct) =>
  (values: GetActionArgsParams<T>) => ({
    actionType: actionType,
    ...ActionDefaults,
    assets: [...ActionDefaults.assets],
    amounts: [...ActionDefaults.amounts],
    ...mapActionParams(mappings, values),
  })

export const getAction = <T extends keyof DefinedActionsMappings>(
  actionType: T,
  values: GetActionArgsParams<DefinedActionsMappings[T]>
) => getActionFactory(actionType, ActionTypeToMappings[actionType])(values)

export const OpenVaultArgsMappings = {
  shortOtoken: 'secondAddress',
  owner: 'owner',
  vaultId: 'vaultId',
} as const

export const DepositCollateralArgsMappings = {
  // address of the account owner
  owner: 'owner',
  // index of the vault to which the asset will be added
  vaultId: 'vaultId',
  // address from which we transfer the asset
  from: 'secondAddress',
  // asset that is to be deposited
  assets: 'assets',
  // amount of asset that is to be deposited
  amounts: 'amounts',
} as const

export const MintShortOptionArgsMappings = {
  owner: 'owner',
  vaultId: 'vaultId',
  to: 'secondAddress',
  otoken: 'assets',
  amount: 'amounts',
} as const

export const RedeemArgsMappings = {
  receiver: 'secondAddress',
  otoken: 'assets',
  amount: 'amounts',
} as const

export const SettleVaultsArgsMappings = {
  owner: 'owner',
  vaultId: 'vaultId',
  to: 'secondAddress',
} as const

export const BurnShortOptionArgsMappings = {
  owner: 'owner',
  vaultId: 'vaultId',
  otoken: 'assets',
  amount: 'amounts',
} as const

export const DepositLongOptionArgsMappings = {
  owner: 'owner',
  vaultId: 'vaultId',
  from: 'secondAddress',
  longOtoken: 'assets',
  amount: 'amounts',
} as const

export const ActionTypeToMappings = {
  [ActionType.OpenVault]: OpenVaultArgsMappings,
  [ActionType.DepositCollateral]: DepositCollateralArgsMappings,
  [ActionType.DepositLongOption]: DepositLongOptionArgsMappings,
  [ActionType.MintShortOption]: MintShortOptionArgsMappings,
  [ActionType.Redeem]: RedeemArgsMappings,
  [ActionType.SettleVault]: SettleVaultsArgsMappings,
  [ActionType.BurnShortOption]: BurnShortOptionArgsMappings,
} as const

export type DefinedActionsMappings = typeof ActionTypeToMappings
