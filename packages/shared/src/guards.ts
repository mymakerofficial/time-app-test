export function isPromise<T>(value: unknown): value is Promise<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Promise<T>).then === 'function' &&
    typeof (value as Promise<T>).catch === 'function' &&
    typeof (value as Promise<T>).finally === 'function'
  )
}

export function isFunction(value: unknown): value is (...args: any[]) => any {
  return typeof value === 'function'
}

export function isError(value: unknown): value is Error {
  return value instanceof Error
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}

export function isNull(value: unknown): value is null {
  return value === null
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value)
}
