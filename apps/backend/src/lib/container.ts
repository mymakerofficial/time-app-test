import { Prettify } from '@time-app-test/shared/types.ts'

export class Container<T extends { [K: string]: unknown } = {}> {
  private items = {} as T

  add<TName extends Exclude<string, keyof T>, TRet>(
    name: TName,
    fn: (container: Readonly<T>) => TRet,
  ) {
    // @ts-expect-error
    this.items[name] = fn(this.items)
    return this as Container<Prettify<T & { [K in TName]: TRet }>>
  }

  build() {
    return this.items as Readonly<T>
  }
}
