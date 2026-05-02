/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react'
import { ApiError, login as loginRequest, loadFarmerProfile } from '../lib/api'
import { clearKey, clearSessionKey, readJson, readSessionJson, writeJson, writeSessionJson } from '../lib/storage'
import type { Role, SessionUser } from '../domain/types'
import { seedUsers } from '../data/seed'

const AUTH_STORAGE_KEY = 'chaincacao.auth'
const ALLOW_OFFLINE_LOGIN = import.meta.env.VITE_ALLOW_OFFLINE_LOGIN === 'true'

interface AuthSession {
  token: string
  user: SessionUser
}

interface LoginInput {
  identifier: string
  secret: string
  roleHint?: Role
  displayName?: string
}

interface AuthContextValue {
  user: SessionUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (input: LoginInput) => Promise<SessionUser>
  logout: () => void
  hasRole: (role: Role | Role[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getSeedUser(role: Role | undefined, identifier: string) {
  if (role && seedUsers[role]) {
    return seedUsers[role]
  }

  return {
    id: `user-${identifier.toLowerCase()}`,
    role: role ?? 'farmer',
    displayName: identifier,
    identifier,
  } satisfies SessionUser
}

function normalizeUuid(value: string | null | undefined) {
  if (!value) {
    return undefined
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : undefined
}

function readJwtSubject(token: string) {
  const parts = token.split('.')

  if (parts.length < 2) {
    return undefined
  }

  try {
    const payload = JSON.parse(atob(parts[1])) as { sub?: string }
    return normalizeUuid(payload.sub)
  } catch {
    return undefined
  }
}

function sanitizeSession(session: AuthSession | null) {
  if (!session) {
    return null
  }

  const tokenSubject = readJwtSubject(session.token)

  return {
    ...session,
    user: {
      ...session.user,
      id: tokenSubject || session.user.id,
      cooperativeId: normalizeUuid(session.user.cooperativeId),
    },
  }
}

function loadStoredSession() {
  const localSession = sanitizeSession(readJson<AuthSession | null>(AUTH_STORAGE_KEY, null))
  if (localSession) {
    return localSession
  }

  return sanitizeSession(readSessionJson<AuthSession | null>(AUTH_STORAGE_KEY, null))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadStoredSession())
  const [loading] = useState(false)

  useEffect(() => {
    if (session) {
      writeJson(AUTH_STORAGE_KEY, session)
      writeSessionJson(AUTH_STORAGE_KEY, session)
    } else {
      clearKey(AUTH_STORAGE_KEY)
      clearSessionKey(AUTH_STORAGE_KEY)
    }
  }, [session])

  const login = async ({ identifier, secret, roleHint, displayName }: LoginInput) => {
    try {
      const response = await loginRequest(identifier, secret)
      const baseUser = getSeedUser((response.role as Role) || roleHint, identifier)
      const tokenSubject = readJwtSubject(response.token)
      let nextUser: SessionUser = {
        ...baseUser,
        role: (response.role as Role) || baseUser.role,
        displayName: displayName || baseUser.displayName,
        id: tokenSubject || baseUser.id,
      }

      if (nextUser.role === 'farmer') {
        try {
          const profile = await loadFarmerProfile(response.token)
          nextUser = {
            ...nextUser,
            displayName: profile.name,
            cooperativeId: normalizeUuid(profile.cooperativeId) || normalizeUuid(nextUser.cooperativeId),
          }
        } catch {
          // Fallback to the local seed when the profile endpoint is unavailable.
        }
      }

      setSession({ token: response.token, user: nextUser })
      return nextUser
    } catch (error) {
      const canUseOfflineFallback =
        ALLOW_OFFLINE_LOGIN &&
        error instanceof ApiError &&
        error.status === 0

      if (!canUseOfflineFallback) {
        throw error
      }

      const fallbackUser = getSeedUser(roleHint, identifier)
      const nextUser = {
        ...fallbackUser,
        displayName: displayName || fallbackUser.displayName,
        cooperativeId: normalizeUuid(fallbackUser.cooperativeId),
      }

      setSession({ token: `offline-${Date.now()}`, user: nextUser })
      return nextUser
    }
  }

  const logout = () => setSession(null)

  const hasRole = (role: Role | Role[]) => {
    if (!session) {
      return false
    }

    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(session.user.role)
  }

  const value: AuthContextValue = {
    user: session?.user ?? null,
    token: session?.token ?? null,
    isAuthenticated: Boolean(session?.token),
    loading,
    login,
    logout,
    hasRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
