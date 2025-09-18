import { MaybePromise, NeverIf, Prettify } from '@/types.ts'
import { toPromise } from '@/helper/promise.ts'
import { isPromise } from '@/guards.ts'

export class IllegalAsyncServiceError extends Error {
  constructor(key: string | number | symbol) {
    super(
      `Tried to build container but '${String(key)}' returned a Promise. Use buildAsync instead.`,
    )
    this.name = 'IllegalAsyncServiceError'
  }
}

function ensureSync<T>(
  key: string | number | symbol,
  maybePromise: MaybePromise<T>,
): T {
  if (isPromise(maybePromise)) {
    throw new IllegalAsyncServiceError(key)
  }
  return maybePromise
}

type AddService<
  TShape extends { [K: string]: unknown },
  TName extends string,
  TService,
> = Prettify<TShape & { [K in TName]: Awaited<TService> }>
type CombineIsPromise<TPromise, TService> =
  TService extends Promise<unknown> ? true : TPromise

export class Container<
  TShape extends { [K: string]: unknown } = {},
  TIsPromise extends boolean = false,
> {
  private constructors = new Map<
    keyof TShape,
    (container: Readonly<object>) => MaybePromise<TShape[keyof TShape]>
  >()

  private entries() {
    return [...this.constructors.entries()] as [
      keyof TShape,
      (container: Readonly<object>) => MaybePromise<TShape[keyof TShape]>,
    ][]
  }

  add<TName extends Exclude<string, keyof TShape>, TService>(
    name: TName,
    fn: (container: Readonly<TShape>) => TService,
  ) {
    this.constructors.set(name, fn as any)
    return this as Container<
      AddService<TShape, TName, TService>,
      CombineIsPromise<TIsPromise, TService>
    >
  }

  async buildAsync(logCallback?: (key: string) => void) {
    const items = {} as TShape
    for (const [key, constructor] of this.entries()) {
      logCallback?.(String(key))
      items[key] = await toPromise(constructor(items))
    }
    return items as Readonly<TShape>
  }

  build(logCallback?: (key: string) => void) {
    const items = {} as TShape
    for (const [key, constructor] of this.entries()) {
      logCallback?.(String(key))
      items[key] = ensureSync(key, constructor(items))
    }
    return items as NeverIf<Readonly<TShape>, TIsPromise>
  }
}
