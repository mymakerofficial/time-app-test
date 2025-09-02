import { MaybePromise, Prettify } from '@time-app-test/shared/types.ts'
import { toPromise } from '@time-app-test/shared/helper/promise.ts'
import { isPromise } from '@time-app-test/shared/guards.ts'

export class Container<
  T extends { [K: string]: unknown } = {},
  TPromise extends boolean = false,
> {
  private constructors = new Map<
    keyof T,
    (container: Readonly<object>) => MaybePromise<T[keyof T]>
  >()

  add<TName extends Exclude<string, keyof T>, TRet>(
    name: TName,
    fn: (container: Readonly<T>) => TRet,
  ) {
    this.constructors.set(name, fn as any)
    return this as Container<
      Prettify<T & { [K in TName]: Awaited<TRet> }>,
      TRet extends Promise<unknown> ? true : TPromise
    >
  }

  async buildAsync(logCallback?: (key: string) => void) {
    const items = {} as T
    for (const [key, fn] of [...this.constructors.entries()] as [
      keyof T,
      (container: Readonly<object>) => MaybePromise<T[keyof T]>,
    ][]) {
      logCallback?.(String(key))
      items[key] = await toPromise(fn(items))
    }
    return items as Readonly<T>
  }

  build(logCallback?: (key: string) => void) {
    const items = {} as T
    for (const [key, fn] of [...this.constructors.entries()] as [
      keyof T,
      (container: Readonly<object>) => MaybePromise<T[keyof T]>,
    ][]) {
      logCallback?.(String(key))
      const res = fn(items)
      if (isPromise(res)) {
        throw new Error(
          `Tried to build container but '${String(key)}' returned a Promise. Use buildAsync instead.`,
        )
      }
      items[key] = res
    }
    return items as TPromise extends true ? never : Readonly<T>
  }
}
