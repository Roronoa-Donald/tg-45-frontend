import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import type { Role } from '../domain/types'
import { useAuth } from '../hooks/useAuth'

export function RequireRole({
  role,
  children,
}: {
  role: Role | Role[]
  children: ReactNode
}) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const allowed = Array.isArray(role) ? role : [role]

  if (!allowed.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />
  }

  return children
}
