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

interface ContainerBuildConfig {
  logger: (name: string) => void
}

type AddService<
  TShape extends { [K: string]: unknown },
  TName extends string,
  TService,
  TOptional extends boolean = false,
> = Prettify<
  TShape & {
    [K in TName]: TOptional extends true
      ? Awaited<TService> | undefined
      : Awaited<TService>
  }
>
type CombineIsPromise<TParentIsPromise, TIsPromise, TService> =
  TParentIsPromise extends true
    ? true
    : TService extends Promise<unknown>
      ? true
      : TIsPromise

export type InferContainerShape<T> =
  T extends Container<{}, boolean, infer U> ? U : never

type ConstructorEntry<TShape> = {
  predicate?: (container: Readonly<object>) => boolean
  constructor: (
    container: Readonly<object>,
  ) => MaybePromise<TShape[keyof TShape]>
}

export class Container<
  TParentShape extends { [K: string]: unknown } = {},
  TParentIsPromise extends boolean = false,
  TShape extends { [K: string]: unknown } = {},
  TIsPromise extends TParentIsPromise extends true
    ? true
    : boolean = TParentIsPromise extends true ? true : false,
> {
  private constructors = new Map<keyof TShape, ConstructorEntry<TShape>>()

  private cache = {} as TShape

  constructor(private parent?: Container<TParentShape, TParentIsPromise>) {}

  private entries() {
    return [...this.constructors.entries()] as [
      keyof TShape,
      ConstructorEntry<TShape>,
    ][]
  }

  register<TName extends string, TService>(
    name: TName,
    constructor: (container: Readonly<TParentShape & TShape>) => TService,
  ) {
    this.constructors.set(name, { constructor: constructor as any })
    return this as Container<
      TParentShape,
      TParentIsPromise,
      AddService<TShape, TName, TService>,
      CombineIsPromise<TParentIsPromise, TIsPromise, TService>
    >
  }

  registerIf<TName extends string, TPredicate extends boolean, TService>(
    name: TName,
    predicate: (container: Readonly<TParentShape & TShape>) => TPredicate,
    constructor: (container: Readonly<TParentShape & TShape>) => TService,
  ) {
    this.constructors.set(name, {
      predicate: predicate as any,
      constructor: constructor as any,
    })
    return this as Container<
      TParentShape,
      TParentIsPromise,
      AddService<TShape, TName, TService>,
      CombineIsPromise<TParentIsPromise, TIsPromise, TService>
    >
  }

  /**
   * Creates a new container that has access to this containers services.
   *  Building the new container won't include services from this container.
   */
  extend() {
    return new Container(this) as unknown as Container<
      TShape,
      TIsPromise,
      {},
      TIsPromise extends true ? true : false
    >
  }

  async buildAsync(config?: ContainerBuildConfig) {
    const parentServices = (await this.parent?.buildAsync(config)) ?? {}
    const constructors = this.entries()
    for (const [key, { predicate, constructor }] of constructors) {
      if (predicate?.({ ...parentServices, ...this.cache }) === false) {
        continue
      }
      config?.logger?.(String(key))
      this.cache[key] = await toPromise(
        constructor({ ...parentServices, ...this.cache }),
      )
      this.constructors.delete(key)
    }
    return this.cache as Readonly<TShape>
  }

  build(config?: ContainerBuildConfig) {
    const parentServices = this.parent?.build(config) ?? {}
    const constructors = this.entries()
    for (const [key, { predicate, constructor }] of constructors) {
      if (predicate?.({ ...parentServices, ...this.cache }) === false) {
        continue
      }
      config?.logger?.(String(key))
      this.cache[key] = ensureSync(
        key,
        constructor({ ...parentServices, ...this.cache }),
      )
      this.constructors.delete(key)
    }
    return this.cache as NeverIf<Readonly<TShape>, TIsPromise>
  }

  async prepareAsync(config?: ContainerBuildConfig) {
    await this.buildAsync(config)
    return this as Container<TParentShape, false, TShape, false>
  }

  prepare(config?: ContainerBuildConfig) {
    this.build(config)
    return this as unknown as NeverIf<
      Container<TParentShape, false, TShape, false>,
      TIsPromise
    >
  }
}
