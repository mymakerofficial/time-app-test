import { timeEntriesCollection, TimeEntry } from '@/lib/collections'
import { timeEntriesSelectSchema } from '@/lib/db/schema/schema.ts'
import { useEffect } from 'react'
import { CryptoManager, uInt8Array2ab } from '@/lib/crypt.ts'
import { createData } from '@/lib/utils.ts'
import { z } from 'zod'
import msgpack from '@ygoe/msgpack'

export function useTimeEntries() {
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
    encryptedData: z.Infer<typeof timeEntriesSelectSchema>,
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

  useEffect(() => {
    void (async () => {
      await loadKey()

      const response = await fetch('/api/time-entries')

      if (!response.body) {
        throw new Error('No response body from API')
      }

      const decodeStream = new TransformStream({
        transform: (chunk, controller) => {
          const decoded = msgpack.decode(chunk, { multiple: true }) as unknown[]
          decoded.forEach((entry) =>
            controller.enqueue(timeEntriesSelectSchema.parse(entry)))
        }
      })

      const decryptStream = new TransformStream<z.Infer<typeof timeEntriesSelectSchema>, TimeEntry>({
        transform: async (entry, controller) => {
          const decryptedEntry = await decryptData(entry)
          controller.enqueue(decryptedEntry)
        },
      })

      const collectionInsertStream = new WritableStream<TimeEntry>({
        write: async (entry) => {
          timeEntriesCollection.insert(entry)
        },
      })

      await response.body
        .pipeThrough(decodeStream)
        .pipeThrough(decryptStream)
        .pipeTo(collectionInsertStream)
    })()
  }, [])

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

    await fetch(
      '/api/time-entries',
      {
        method: 'POST',
        body: encodedData,
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      },
    )
  }

  return {
    createDummyData,
  }
}