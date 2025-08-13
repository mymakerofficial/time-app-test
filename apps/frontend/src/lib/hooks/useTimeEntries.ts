import { timeEntriesCollection } from '../collections'
import {
  TimeEntriesSelect,
  TimeEntriesSelectSchema,
} from '../db/schema/schema.ts'
import { useEffect, useState } from 'react'
import { CryptoManager, uInt8Array2ab } from '../crypt.ts'
import { createData } from '../utils.ts'
import { z } from 'zod'
import msgpack from '@ygoe/msgpack'
import {
  StreamingResponseRowType,
  GetTimeEntriesResponseSchema,
  TimeEntry,
} from '../schema/timeEntries.ts'

const crypto = new CryptoManager()

async function loadKey() {
  const existing = localStorage.getItem('encryption_key')

  if (existing) {
    await crypto.importKey(existing)
  } else {
    await crypto.generateKey()
    const key = await crypto.exportKey()
    localStorage.setItem('encryption_key', key)
  }
}

async function decryptData(
  encryptedData: z.Infer<typeof TimeEntriesSelectSchema>,
): Promise<TimeEntry> {
  const createdAt = await crypto.decrypt(encryptedData.createdAt)
  const updatedAt = await crypto.decrypt(encryptedData.updatedAt)
  const startedAt = await crypto.decrypt(encryptedData.startedAt)
  const endedAt = encryptedData.endedAt
    ? await crypto.decrypt(encryptedData.endedAt)
    : null
  const message = await crypto.decrypt(encryptedData.message)

  return {
    id: encryptedData.id,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    syncStatus: 'synced',
    lookupKey: encryptedData.lookupKey,
    startedAt: new Date(startedAt),
    endedAt: endedAt ? new Date(endedAt) : null,
    message: message,
  }
}

async function fetchStreaming({
  start,
  end,
  signal,
  onProgress,
}: {
  start: number
  end: number
  signal?: AbortSignal
  onProgress?: (progress: number) => void
}) {
  const response = await fetch(`/api/time-entries?start=${start}&end=${end}`, {
    signal,
  })

  if (!response.body) {
    throw new Error('No response body from API')
  }

  let totalCount = 0
  const newEntries = new Map<string, TimeEntry>()
  const oldIdsSet = new Set<string>()

  const iterator = timeEntriesCollection.values()
  for (const entry of iterator) {
    if (entry.lookupKey > start && entry.lookupKey < end) {
      oldIdsSet.add(entry.id)
    }
  }

  const decodeStream = new TransformStream({
    transform: (chunk, controller) => {
      const decoded = msgpack.decode(chunk, { multiple: true }) as unknown[]
      decoded.forEach((row) => controller.enqueue(row))
    },
  })

  const parseStream = new TransformStream<unknown, TimeEntriesSelect>({
    transform: (chunk, controller) => {
      const parsed = GetTimeEntriesResponseSchema.parse(chunk)

      if (parsed.t === StreamingResponseRowType.HEADER) {
        totalCount = parsed.data.count
        console.log(`Total entries to process: ${totalCount}`)
      } else if (parsed.t === StreamingResponseRowType.ROW) {
        controller.enqueue(parsed.data)
      }
    },
  })

  const decryptStream = new TransformStream<TimeEntriesSelect, TimeEntry>({
    transform: async (entry, controller) => {
      const decryptedEntry = await decryptData(entry)
      controller.enqueue(decryptedEntry)
    },
  })

  const insertStream = new WritableStream<TimeEntry>({
    write: (entry) => {
      // entries left in oldIdsSet after processing are to be deleted
      oldIdsSet.delete(entry.id)

      newEntries.set(entry.id, entry)

      if (onProgress) {
        const progress = Math.round((newEntries.size / totalCount) * 100)
        onProgress(progress)
      }
    },
  })

  await response.body
    .pipeThrough(decodeStream)
    .pipeThrough(parseStream)
    .pipeThrough(decryptStream)
    .pipeTo(insertStream)

  const idsToDelete = Array.from(oldIdsSet)
  const entriesToInsert = Array.from(newEntries.values())

  console.log('deleting:', idsToDelete)
  console.log('inserting:', entriesToInsert)

  // Important: deleting needs to be done before inserting new entries
  if (idsToDelete.length) timeEntriesCollection.delete(idsToDelete)
  if (entriesToInsert.length) timeEntriesCollection.insert(entriesToInsert)
}

export function useTimeEntries({ start, end }: { start: number; end: number }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    void (async () => {
      await loadKey()

      await fetchStreaming({
        start,
        end,
        signal: controller.signal,
        onProgress: setProgress,
      })
    })()

    return () => {
      controller.abort('Component unmounted, aborting fetch')
    }
  }, [start, end])

  async function createDummyData() {
    const data = createData(
      new Date('2025-10-01T08:00:00Z'),
      new Date('2025-11-21T10:00:00Z'),
    )

    const encryptedData = await Promise.all(
      data.map(async (entry) => {
        return {
          id: entry.id,
          createdAt: await crypto.encrypt(entry.startedAt.toISOString()),
          updatedAt: await crypto.encrypt(entry.updatedAt.toISOString()),
          lookupKey: entry.lookupKey,
          startedAt: await crypto.encrypt(entry.startedAt.toISOString()),
          endedAt: entry.endedAt
            ? await crypto.encrypt(entry.endedAt?.toISOString())
            : null,
          message: await crypto.encrypt(entry.message),
        }
      }),
    )

    const encodedData = uInt8Array2ab(msgpack.encode(encryptedData))

    await fetch('/api/time-entries', {
      method: 'POST',
      body: encodedData,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    })
  }

  return {
    progress,
    createDummyData,
  }
}
