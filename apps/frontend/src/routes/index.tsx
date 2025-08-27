import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  return (
    <div className="text-center">
        data.map((entry) => (
          <div key={entry.id}>
            <p>{entry.message}</p>
            <p>Started at: {entry.startedAt.toLocaleString()}</p>
            <p>Ended at: {entry.endedAt?.toLocaleString()}</p>
          </div>
        ))}
    </div>
  )
}
