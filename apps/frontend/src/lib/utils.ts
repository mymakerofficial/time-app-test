import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { nanoid } from 'nanoid'
import { faker } from '@faker-js/faker/locale/en'
import { TimeEntry } from './schema/timeEntries.ts'
import { z } from 'zod'
import { ApiErrorResponseSchema } from './schema/error.ts'
import { ApiError } from './error.ts'
import { MaybeFunction } from './types.ts'
import { isError, isFunction } from './guards.ts'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function dateToLookupKey(date: Date): number {
  return Math.round(date.getTime() / 60000000)
}

function createDay(start: Date, end: Date): TimeEntry[] {
  const entries: TimeEntry[] = []
  let current = new Date(start)

  while (current <= end) {
    const lengthMinutes = Math.floor(Math.random() * 120) + 1 // Random length between 1 and 60 minutes
    const endedAt = new Date(current.getTime() + lengthMinutes * 60000) // Add minutes to current time
    const lookupKey = dateToLookupKey(current)
    entries.push({
      id: nanoid(),
      createdAt: current,
      updatedAt: endedAt,
      syncStatus: 'pending',
      lookupKey,
      startedAt: current,
      endedAt: endedAt,
      message: faker.lorem.lines(1),
    })
    current = endedAt
  }

  return entries
}

export function createData(start: Date, end: Date): TimeEntry[] {
  const entries: TimeEntry[] = []
  let current = new Date(start)

  while (current <= end) {
    current.setHours(8, Math.floor(Math.random() * 30) + 1, 0, 0)
    const end = new Date(current)
    end.setDate(end.getDate() + 1)
    current.setHours(16, Math.floor(Math.random() * 30) + 1, 0, 0)
    entries.push(...createDay(current, end))
    current = end
  }

  return entries
}

export function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => resolve(), ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId)
      reject(new Error('Operation aborted'))
    })
  })
}

export async function getResponseBody<T extends z.ZodTypeAny>({
  response,
  schema,
}: {
  response: Response
  schema: T
}): Promise<z.infer<T>> {
  const data = await response.json()
  if (!response.ok) {
    const apiError = ApiErrorResponseSchema.safeParse(data)
    if (apiError.success) {
      throw ApiError.from({
        ...apiError.data,
        statusCode: response.status,
      })
    } else {
      throw new Error('Invalid API error response')
    }
  }
  return schema.parse(data)
}

export function resolve<TRes, TArgs extends any[] = any[]>(
  maybeFn: MaybeFunction<TRes>,
  ...args: TArgs
): TRes {
  return isFunction(maybeFn) ? maybeFn(...args) : maybeFn
}

export function toError<
  TError extends Error,
  TErrorVal = TError | any,
  TRes = TError extends TError ? TError : Error,
>(maybeError: TErrorVal) {
  return (
    isError(maybeError) ? maybeError : new Error(String(maybeError))
  ) as TRes
}
