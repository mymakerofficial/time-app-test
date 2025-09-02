import { MaybePromise } from '@/types.ts'
import { isPromise } from '@/guards.ts'

export function toPromise<T>(value: MaybePromise<T>): Promise<T> {
  if (isPromise(value)) {
    return value
  }
  return Promise.resolve(value)
}
