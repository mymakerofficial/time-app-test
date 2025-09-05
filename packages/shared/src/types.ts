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
