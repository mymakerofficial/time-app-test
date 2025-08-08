import { createFileRoute } from '@tanstack/react-router'
import { useTimeEntries } from '@/lib/hooks/useTimeEntries.ts'
import { useLiveQuery } from '@tanstack/react-db'
import { timeEntriesCollection } from '@/lib/collections'
import { Button } from '@/lib/components/ui/button.tsx'
import { Input } from '@/lib/components/ui/input.tsx'
import { useState } from 'react'
import { dateToLookupKey } from '@/lib/utils.ts'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const [start, setStart] = useState(
    dateToLookupKey(new Date('2025-10-11T08:00:00Z')),
  )
  const [end, setEnd] = useState(
    dateToLookupKey(new Date('2025-10-21T10:00:00Z')),
  )

  const { createDummyData } = useTimeEntries({
    start,
    end,
  })

  const { data } = useLiveQuery(timeEntriesCollection)

  return (
    <div className="text-center">
      <Button onClick={createDummyData}>Create Dummy Data</Button>
      <Input
        type="number"
        value={start}
        onChange={(e) => setStart(parseInt(e.target.value, 10))}
        placeholder="Start"
        className="mt-4 mb-2 w-1/3 mx-auto"
      />
      <Input
        type="number"
        value={end}
        onChange={(e) => setEnd(parseInt(e.target.value, 10))}
        placeholder="End"
        className="mb-4 w-1/3 mx-auto"
      />
      <p className="text-muted-foreground">Entries loaded: {data.length}</p>
      {data.map((entry) => (
        <div key={entry.id}>
          <p>{entry.message}</p>
          <p>Started at: {entry.startedAt.toLocaleString()}</p>
          <p>Ended at: {entry.endedAt?.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}
