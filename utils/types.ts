export type FixedSizeArray<N extends number, T, M extends string = '0'> = {
  readonly [k in M]: any
} & { length: N } & ReadonlyArray<T>

export type Await<T> = T extends {
  then(onfulfilled?: (value: infer U) => unknown): unknown
}
  ? U
  : T
