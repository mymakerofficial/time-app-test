export type MaybePromise<T> = T | Promise<T>

export type MaybeFunction<TRes, TArgs extends any[] = any[]> =
  | TRes
  | ((...args: TArgs) => TRes)

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type Prettify2<T> = {
  [K in keyof T]: T extends {
    [key in keyof any]: unknown
  }
    ? Prettify<T[K]>
    : T[K]
} & {}

export type PromiseIf<T, TPromise extends boolean> = TPromise extends true
  ? Promise<T>
  : T
export type NeverIf<T, TNever extends boolean> = TNever extends true ? never : T
export type NeverIfNot<T, TNever extends boolean> = TNever extends false
  ? never
  : T
