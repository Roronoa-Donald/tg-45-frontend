/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { enqueueSyncBatch, createLot, certifyLot, submitVerificationProof, transferLot, verifyLotStatus } from '../lib/api'
import { deleteRecord, offlineStores, readAllRecords, writeRecord } from '../lib/idb'
import { useAuth } from './AuthContext'
import type { OfflineMutation, SyncMutationType } from '../domain/types'

interface SyncContextValue {
  isOnline: boolean
  syncStatus: 'idle' | 'syncing' | 'error'
  queue: OfflineMutation[]
  queueLength: number
  failedCount: number
  lastSyncedAt: string | null
  enqueueMutation: (input: { type: SyncMutationType; payload: Record<string, unknown>; idempotencyKey?: string }) => Promise<OfflineMutation>
  retryFailed: () => Promise<void>
  retrySingleMutation: (id: string) => Promise<void>
  flushQueue: () => Promise<void>
  removeMutation: (id: string) => Promise<void>
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined)

function randomId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

function makeIdempotencyKey() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

async function runMutation(token: string, mutation: OfflineMutation, overrideIdempotencyKey?: string) {
  const idempotencyKey = overrideIdempotencyKey || mutation.idempotencyKey
  switch (mutation.type) {
    case 'registerLot':
      return createLot(token, mutation.payload, idempotencyKey)
    case 'transferLot':
      return transferLot(token, String(mutation.payload.lotId || mutation.payload.id), mutation.payload)
    case 'updateVerificationStatus':
      return verifyLotStatus(token, String(mutation.payload.lotId || mutation.payload.id), mutation.payload)
    case 'submitVerificationProof':
      return submitVerificationProof(token, String(mutation.payload.lotId || mutation.payload.id), mutation.payload)
    case 'certifyLot':
      return certifyLot(token, String(mutation.payload.lotId || mutation.payload.id), mutation.payload)
    default:
      return null
  }
}

async function cleanupRelatedDraft(mutation: OfflineMutation) {
  if (mutation.type === 'registerLot') {
    const draftId = String(mutation.payload.draftId || '')
    if (draftId) {
      await deleteRecord(offlineStores.drafts, draftId)
    }
  }
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth()
  const [isOnline, setIsOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [queue, setQueue] = useState<OfflineMutation[]>([])
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    void readAllRecords<OfflineMutation>(offlineStores.mutations).then((records) => {
      if (mounted) {
        setQueue(records.sort((left, right) => left.createdAt.localeCompare(right.createdAt)))
      }
    })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const persistQueue = useCallback(async (nextQueue: OfflineMutation[]) => {
    setQueue(nextQueue)

    for (const item of nextQueue) {
      await writeRecord(offlineStores.mutations, item)
    }

    const staleIds = new Set(nextQueue.map((item) => item.id))
    const stored = await readAllRecords<OfflineMutation>(offlineStores.mutations)
    await Promise.all(stored.filter((item) => !staleIds.has(item.id)).map((item) => deleteRecord(offlineStores.mutations, item.id)))
  }, [])

  const removeMutation = useCallback(async (id: string) => {
    await deleteRecord(offlineStores.mutations, id)
    setQueue((current) => current.filter((item) => item.id !== id))
  }, [])

  const flushQueue = useCallback(async () => {
    if (!token || !isOnline || queue.length === 0) {
      return
    }

    setSyncStatus('syncing')

    try {
      const actions = queue.map((item) => ({
        actionType: item.type,
        clientRequestId: item.idempotencyKey,
        payload: item.payload,
      }))

      await enqueueSyncBatch(token, actions)

      for (const item of queue) {
        await runMutation(token, item)
        await cleanupRelatedDraft(item)
        await removeMutation(item.id)
      }

      setLastSyncedAt(new Date().toISOString())
      setSyncStatus('idle')
    } catch {
      setSyncStatus('error')
    }
  }, [isOnline, queue, removeMutation, token])

  useEffect(() => {
    if (isOnline && token && queue.length > 0) {
      const timerId = window.setTimeout(() => {
        void flushQueue()
      }, 0)

      return () => window.clearTimeout(timerId)
    }
  }, [flushQueue, isOnline, queue.length, token])

  const enqueueMutation = useCallback(
    async ({ type, payload, idempotencyKey }: { type: SyncMutationType; payload: Record<string, unknown>; idempotencyKey?: string }) => {
      const now = new Date().toISOString()
      const mutation: OfflineMutation = {
        id: randomId('mutation'),
        type,
        payload,
        idempotencyKey: idempotencyKey || makeIdempotencyKey(),
        status: 'pending',
        attempts: 0,
        createdAt: now,
        updatedAt: now,
      }

      const nextQueue = [...queue, mutation]
      await persistQueue(nextQueue)

      if (isOnline && token) {
        try {
          setSyncStatus('syncing')
          // Generate a unique idempotency key for the direct API call (different from the mutation's key)
          const apiIdempotencyKey = makeIdempotencyKey()
          await runMutation(token, mutation, apiIdempotencyKey)
          await cleanupRelatedDraft(mutation)
          await removeMutation(mutation.id)
          setLastSyncedAt(new Date().toISOString())
          setSyncStatus('idle')
        } catch (error) {
          console.error('[SyncContext] Mutation failed, will retry via batch:', mutation.id, error)
          mutation.status = 'failed'
          mutation.lastError = error instanceof Error ? error.message : 'Mutation hors ligne'
          mutation.attempts += 1
          mutation.updatedAt = new Date().toISOString()
          await writeRecord(offlineStores.mutations, mutation)
          setQueue((current) => current.map((item) => (item.id === mutation.id ? mutation : item)))
          setSyncStatus('error')
        }
      }

      return mutation
    },
    [isOnline, persistQueue, queue, removeMutation, token],
  )

  const retryFailed = useCallback(async () => {
    const failed = queue.filter((item) => item.status === 'failed')

    if (!token || failed.length === 0) {
      return
    }

    setSyncStatus('syncing')

    for (const item of failed) {
      try {
        await runMutation(token, item)
        await cleanupRelatedDraft(item)
        await removeMutation(item.id)
      } catch (error) {
        const updatedItem = {
          ...item,
          attempts: item.attempts + 1,
          lastError: error instanceof Error ? error.message : 'Echec de synchronisation',
          updatedAt: new Date().toISOString(),
          status: 'failed' as const,
        }
        await writeRecord(offlineStores.mutations, updatedItem)
        setQueue((current) => current.map((entry) => (entry.id === updatedItem.id ? updatedItem : entry)))
      }
    }

    setLastSyncedAt(new Date().toISOString())
    setSyncStatus('idle')
  }, [queue, removeMutation, token])

  const retrySingleMutation = useCallback(
    async (id: string) => {
      const item = queue.find((m) => m.id === id)
      if (!token || !item) {
        return
      }

      setSyncStatus('syncing')

      try {
        await runMutation(token, item)
        await cleanupRelatedDraft(item)
        await removeMutation(item.id)
      } catch (error) {
        const updatedItem = {
          ...item,
          attempts: item.attempts + 1,
          lastError: error instanceof Error ? error.message : 'Echec de synchronisation',
          updatedAt: new Date().toISOString(),
          status: 'failed' as const,
        }
        await writeRecord(offlineStores.mutations, updatedItem)
        setQueue((current) => current.map((entry) => (entry.id === updatedItem.id ? updatedItem : entry)))
      }

      setLastSyncedAt(new Date().toISOString())
      setSyncStatus('idle')
    },
    [queue, removeMutation, token],
  )

  const value: SyncContextValue = {
    isOnline,
    syncStatus,
    queue,
    queueLength: queue.length,
    failedCount: queue.filter((item) => item.status === 'failed').length,
    lastSyncedAt,
    enqueueMutation,
    retryFailed,
    retrySingleMutation,
    flushQueue,
    removeMutation,
  }

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>
}

export function useSync() {
  const context = useContext(SyncContext)

  if (!context) {
    throw new Error('useSync must be used within SyncProvider')
  }

  return context
}
