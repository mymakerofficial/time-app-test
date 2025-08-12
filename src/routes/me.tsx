import { createFileRoute } from '@tanstack/react-router'
import { useMe } from '@/lib/hooks/useMe.ts'

export const Route = createFileRoute('/me')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useMe()

  return <div>{JSON.stringify(data)}</div>
}
