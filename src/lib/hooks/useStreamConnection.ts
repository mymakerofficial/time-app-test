import { timeEntriesCollection, TimeEntry } from '@/lib/collections'
import { timeEntriesSelectSchema } from '@/lib/db/schema/schema.ts'
import { useEffect } from 'react'
import { CryptoManager } from '@/lib/crypt.ts'
import { createData } from '@/lib/utils.ts'
import { z } from 'zod'

export async function fetchStream({
  url,
  onRow,
}: {
  url: string
  onRow: (row: Record<string, any>) => void
}) {
  const response = await fetch(url)
  const reader = response.body?.getReader()
  if (!reader) {
    return
  }

  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()

    if (done) {
      break
    }

    const chunks = decoder
      .decode(value, { stream: true })
      .split('\n')
      .filter((chunk) => chunk.length > 0)

    for (const chunk of chunks) {
      onRow(JSON.parse(chunk))
    }
  }
}

export function useTimeEntries() {
  const crypto = new CryptoManager()

  async function loadKey() {
    const existing = localStorage.getItem('encryption_key')

    if (existing) {
      await crypto.importKey(existing)
    } else {
      await crypto.generateKey()
      const key = await crypto.exportKey()
      if (key) {
        localStorage.setItem('encryption_key', key)
      }
    }
  }

  async function decryptData(encryptedData: z.Infer<typeof timeEntriesSelectSchema>): Promise<TimeEntry> {
    const validated = timeEntriesSelectSchema.parse(encryptedData)

    const createdAt = await crypto.decrypt(validated.createdAt)
    const updatedAt = await crypto.decrypt(validated.updatedAt)
    const startedAt = await crypto.decrypt(validated.startedAt)
    const endedAt = validated.endedAt ? await crypto.decrypt(validated.endedAt) : null
    const message = await crypto.decrypt(validated.message)

    return {
      id: validated.id,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      syncStatus: 'synced',
      lookupKey: validated.lookupKey,
      startedAt: new Date(startedAt),
      endedAt: endedAt ? new Date(endedAt) : null,
      message: message,
    }
  }

  useEffect(() => {
    void (async () => {
      await loadKey()
      console.log('Encryption key loaded successfully')

      const response = await fetch('/api/time-entries')

      response.body?.pipeThrough(new TextDecoderStream()).pipeTo(new WritableStream({
        write: async (chunk) => {
            console.log('Received chunk:', chunk)

            const rows = chunk.split('\n').filter((row) => row.length > 0)
            for (const row of rows) {
              const parsed = await decryptData(JSON.parse(row))

              console.log('Parsed row:', parsed)

              timeEntriesCollection.insert(parsed)
            }
        },
      }))
    })()
  }, [])

  async function createDummyData() {
    const data = createData(
      new Date('2025-10-01T08:00:00Z'),
      new Date('2025-10-01T10:00:00Z'),
    )
    const encryptedData = await Promise.all(data.map(async (entry) => {
      return {
        id: entry.id,
        createdAt: await crypto.encrypt(entry.startedAt.toISOString()),
        updatedAt: await crypto.encrypt(entry.updatedAt.toISOString()),
        lookupKey: entry.lookupKey,
        startedAt: await crypto.encrypt(entry.startedAt.toISOString()),
        endedAt: entry.endedAt ? await crypto.encrypt(entry.endedAt?.toISOString()) : null,
        message: await crypto.encrypt(entry.message),
      }
    }))

    await fetch(new Request('/api/time-entries', {
      method: 'POST',
      body: JSON.stringify(encryptedData),
      headers: {
        'Content-Type': 'application/json',
      },
    })).then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to create dummy data')
      }
      console.log('Dummy data created successfully')
      console.log(data[0], await decryptData((await response.json())[0]))
    }).catch((error) => {
      console.error('Error creating dummy data:', error)
    })
  }

  return {
    createDummyData
  }
}