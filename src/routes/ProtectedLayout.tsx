import { Outlet } from 'react-router-dom'
import { AppShell } from '../components/AppShell'

export function ProtectedLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
