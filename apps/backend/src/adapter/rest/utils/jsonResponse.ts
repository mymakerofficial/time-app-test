import { isDate, isPlainObject } from '@time-app-test/shared/guards.ts'

function mapObjectRecursive<
  T extends object,
  G extends { [K in keyof T]: unknown },
>(obj: T, callbackfn: (value: unknown) => unknown): G {
  // @ts-expect-error
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (isPlainObject(value)) {
        return [key, mapObjectRecursive(value, callbackfn)]
      }
      return [key, callbackfn(value)]
    }),
  )
}

type MappedResponse<T extends object> = {
  [K in keyof T]: T[K] extends object
    ? MappedResponse<T[K]>
    : T[K] extends Date
      ? string
      : T[K]
}

export function mapJsonResponse<T extends object>(obj: T) {
  return mapObjectRecursive<T, MappedResponse<T>>(obj, (value) => {
    if (isDate(value)) {
      return value.toISOString()
    }
    return value
  })
}
