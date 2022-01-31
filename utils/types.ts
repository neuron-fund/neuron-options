export type FixedSizeArray<N extends number, T> = {} & { length: N } & ReadonlyArray<T>

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}
