export type MaybePromise<T> = T | Promise<T>

export type MaybeFunction<TRes, TArgs extends any[] = any[]> =
  | TRes
  | ((...args: TArgs) => TRes)

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}
