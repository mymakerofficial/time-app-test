import { createFileRoute } from '@tanstack/react-router'
import { useMe } from '@/lib/hooks/useMe.ts'
import { useLogout } from '@/lib/hooks/auth/useLogout.ts'
import { Button } from '@/lib/components/ui/button.tsx'

export const Route = createFileRoute('/me')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useMe()
  const { mutate: logout } = useLogout()

  return (
    <div className="max-w-md mx-auto mt-10 p-6 space-y-6">
      <h1 className="text-2xl font-bold">You are</h1>
      <pre>{JSON.stringify(data)}</pre>
      <Button onClick={() => logout()}>Logout</Button>
    </div>
  )
}
