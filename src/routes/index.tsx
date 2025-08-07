"use client";

import { createFileRoute } from '@tanstack/react-router'
import { useTimeEntries } from '@/lib/hooks/useStreamConnection.ts'
import { useLiveQuery } from '@tanstack/react-db'
import { timeEntriesCollection } from '@/lib/collections'
import { Button } from '@/lib/components/ui/button.tsx'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { createDummyData } = useTimeEntries()

  const { data } = useLiveQuery(timeEntriesCollection)

  return <div className="text-center">
    <Button onClick={createDummyData}>Create Dummy Data</Button>
    <p className="text-muted-foreground">Entries loaded: {data.length}</p>
    {data.map((entry) => (
      <div key={entry.id}>
        <p>{entry.message}</p>
        <p>Started at: {entry.startedAt.toLocaleString()}</p>
        <p>Ended at: {entry.endedAt?.toLocaleString()}</p>
      </div>
    ))}
  </div>
}
