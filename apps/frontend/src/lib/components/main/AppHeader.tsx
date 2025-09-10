import { Button } from '@/lib/components/ui/button.tsx'
import { Link } from '@tanstack/react-router'
import { useMe } from '@/lib/hooks/useMe.ts'
import { useLogout } from '@/lib/hooks/auth/useLogout.ts'
import { UserIcon } from 'lucide-react'

export function AppHeader() {
  const { data: me } = useMe()
  const { mutate: logout } = useLogout()

  return (
    <nav className="flex min-h-16 items-center justify-between px-6 border-b border-accent">
      <div className="flex gap-3 items-center">
        <UserIcon />
        <h1 aria-label="Username" className="font-bold">
          {me?.username}
        </h1>
      </div>
      <div className="flex gap-3 items-center">
        {me ? (
          <Button variant="secondary" onClick={() => logout()}>
            Logout
          </Button>
        ) : (
          <Link to="/auth/login" className="text-blue-500 hover:underline">
            <Button variant="secondary">Login</Button>
          </Link>
        )}
        <Link to="/auth/add" className="text-blue-500 hover:underline">
          <Button variant="secondary">Settings</Button>
        </Link>
      </div>
    </nav>
  )
}
