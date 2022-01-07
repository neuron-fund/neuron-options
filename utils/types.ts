export type FixedSizeArray<N extends number, T, M extends string = '0'> = {
  readonly [k in M]: any
} & { length: N } & ReadonlyArray<T>

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
