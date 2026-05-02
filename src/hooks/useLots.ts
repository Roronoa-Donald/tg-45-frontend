import { useCallback, useEffect, useMemo, useState } from 'react'
import type { LotDraft, LotRecord, PublicLotRecord } from '../domain/types'
import { seedPublicLots } from '../data/seed'
import { getLot, listLots, publicVerify } from '../lib/api'
import { deleteRecord, offlineStores, readAllRecords, writeRecord } from '../lib/idb'
import { useAuth } from './useAuth'
import { useSync } from './useSync'

const DRAFT_LOTS_KEY = 'chaincacao.draftLots'

function normalizeUuid(value?: string | null) {
  if (!value) {
    return undefined
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : undefined
}

function normalizeLot(lot: Record<string, unknown>): LotRecord {
  const gps = lot.gps as { lat?: number; lng?: number; precisionM?: number } | undefined

  return {
    id: String(lot.id ?? lot.lotCode ?? `lot-${Date.now()}`),
    lotCode: String(lot.lotCode ?? lot.code ?? lot.id ?? ''),
    ownerId: String(lot.ownerId ?? ''),
    ownerName: String(lot.ownerName ?? lot.farmerName ?? ''),
    cooperativeId: (lot.cooperativeId as string | null | undefined) ?? null,
    product: String(lot.product ?? 'Cacao'),
    variety: (lot.variety as string | null | undefined) ?? null,
    weightKg: Number(lot.weightKg ?? 0),
    harvestDate: (lot.harvestDate as string | null | undefined) ?? null,
    gpsOriginLat: Number(lot.gpsOriginLat ?? gps?.lat ?? 0),
    gpsOriginLng: Number(lot.gpsOriginLng ?? gps?.lng ?? 0),
    gpsPrecisionM: Number(lot.gpsPrecisionM ?? gps?.precisionM ?? 0),
    status: String(lot.status ?? 'registered'),
    blockchainTxHash: (lot.blockchainTxHash as string | null | undefined) ?? (lot.proof as { txHash?: string | null } | undefined)?.txHash ?? null,
    blockchainProofHash: (lot.blockchainProofHash as string | null | undefined) ?? (lot.proof as { proofHash?: string | null } | undefined)?.proofHash ?? null,
    blockchainConfirmed: Boolean(lot.blockchainConfirmed ?? lot.blockchainTxHash),
    createdAt: String(lot.createdAt ?? new Date().toISOString()),
    updatedAt: String(lot.updatedAt ?? new Date().toISOString()),
    certification: (lot.certification as LotRecord['certification']) ?? null,
    events: Array.isArray(lot.events) ? (lot.events as LotRecord['events']) : [],
    images: Array.isArray(lot.images) ? (lot.images as LotRecord['images']) : [],
    proof: lot.proof as LotRecord['proof'] | undefined,
    verificationStatus: lot.verificationStatus as string | undefined,
    verificationNote: lot.verificationNote as string | undefined,
  }
}

function normalizePublicLot(record: Record<string, unknown>): PublicLotRecord {
  return {
    lotCode: String(record.lotCode ?? ''),
    status: String(record.status ?? 'registered'),
    gps: record.gps as PublicLotRecord['gps'],
    proof: record.proof as PublicLotRecord['proof'],
    events: Array.isArray(record.events) ? (record.events as PublicLotRecord['events']) : [],
    images: Array.isArray(record.images) ? (record.images as PublicLotRecord['images']) : [],
  }
}

function buildOptimisticLot(draft: LotDraft, ownerId?: string, ownerName?: string, cooperativeId?: string | null): LotRecord {
  return {
    id: draft.id,
    lotCode: draft.title,
    ownerId: ownerId ?? '',
    ownerName: ownerName ?? '',
    cooperativeId: cooperativeId ?? null,
    product: draft.product,
    variety: draft.variety,
    weightKg: draft.weightKg,
    harvestDate: draft.harvestDate,
    gpsOriginLat: draft.gpsOriginLat,
    gpsOriginLng: draft.gpsOriginLng,
    gpsPrecisionM: draft.gpsPrecisionM,
    status: 'pending',
    blockchainConfirmed: false,
    blockchainTxHash: null,
    blockchainProofHash: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    events: [
      {
        eventType: 'register_lot',
        occurredAt: new Date().toISOString(),
        metadata: { offline: true },
      },
    ],
    images: draft.photoDataUrl ? [{ url: draft.photoDataUrl, isPrimary: true }] : [],
  }
}

function seedDraftsFromStorage() {
  if (typeof window === 'undefined') {
    return [] as LotDraft[]
  }

  const raw = window.localStorage.getItem(DRAFT_LOTS_KEY)
  if (!raw) {
    return [] as LotDraft[]
  }

  try {
    return JSON.parse(raw) as LotDraft[]
  } catch {
    return [] as LotDraft[]
  }
}

function mergePendingLots(remoteLots: LotRecord[], currentLots: LotRecord[]) {
  return [
    ...remoteLots,
    ...currentLots.filter((localLot) => {
      if (localLot.status !== 'pending') {
        return false
      }

      return !remoteLots.some((remoteLot) => remoteLot.id === localLot.id || remoteLot.lotCode === localLot.lotCode)
    }),
  ]
}

export function useLots() {
  const { token, user } = useAuth()
  const { enqueueMutation, isOnline, queue, lastSyncedAt } = useSync()
  const [lots, setLots] = useState<LotRecord[]>([])
  const [draftLots, setDraftLots] = useState<LotDraft[]>(seedDraftsFromStorage())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DRAFT_LOTS_KEY, JSON.stringify(draftLots))
    }
  }, [draftLots])

  const refreshLots = useCallback(async () => {
    if (!token) {
      setLots([])
      return []
    }

    setLoading(true)
    setError(null)

    try {
      const response = await listLots(token, { page: 1, pageSize: 50 })
      const rawItems = Array.isArray(response)
        ? response
        : Array.isArray(response.items)
          ? response.items
          : Array.isArray((response as { data?: unknown }).data)
            ? ((response as { data?: unknown[] }).data ?? [])
            : []

      const items = rawItems.length > 0
        ? rawItems.map((item) => normalizeLot(item as Record<string, unknown>))
        : []

      let mergedItems = items
      setLots((current) => {
        mergedItems = mergePendingLots(items, current)
        return mergedItems
      })

      return mergedItems
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Impossible de charger les lots.')
      setLots([])
      return []
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void refreshLots()
  }, [refreshLots])

  useEffect(() => {
    if (!token) {
      return
    }

    const loadOfflineDrafts = async () => {
      const storedDrafts = await readAllRecords<LotDraft>(offlineStores.drafts)
      if (storedDrafts.length > 0) {
        setDraftLots(storedDrafts)
      }
    }

    void loadOfflineDrafts()
  }, [token])

  const loadLot = useCallback(
    async (lotId: string) => {
      const localLot = lots.find((lot) => lot.id === lotId || lot.lotCode === lotId)
      if (localLot) {
        return localLot
      }

      if (!token) {
        return null
      }

      try {
        const response = await getLot(token, lotId)
        return normalizeLot(response)
      } catch {
        return null
      }
    },
    [lots, token],
  )

  const loadPublicLot = useCallback(async (lotCode: string) => {
    if (!lotCode) {
      return null
    }

    try {
      const response = await publicVerify(lotCode)
      return normalizePublicLot(response)
    } catch {
      return seedPublicLots[lotCode] ?? null
    }
  }, [])

  const saveDraft = useCallback(async (draft: LotDraft) => {
    setDraftLots((current) => {
      const withoutCurrentDraft = current.filter((item) => item.id !== draft.id)
      return [...withoutCurrentDraft, draft]
    })
    await writeRecord(offlineStores.drafts, draft)
  }, [])

  const removeDraft = useCallback(async (draftId: string) => {
    setDraftLots((current) => current.filter((draft) => draft.id !== draftId))
    await deleteRecord(offlineStores.drafts, draftId)
  }, [])

  const submitDraft = useCallback(
    async (draft: LotDraft) => {
      console.log('[useLots] submitDraft called', { draftId: draft.id, title: draft.title })

      const optimisticLot = buildOptimisticLot(draft, user?.id, user?.displayName, normalizeUuid(user?.cooperativeId) ?? null)
      setLots((current) => {
        const withoutCurrent = current.filter((lot) => lot.id !== optimisticLot.id && lot.lotCode !== optimisticLot.lotCode)
        return [optimisticLot, ...withoutCurrent]
      })
      
      const payload = {
        product: draft.product,
        variety: draft.variety,
        weightKg: draft.weightKg,
        harvestDate: new Date(draft.harvestDate).toISOString(),
        gpsOriginLat: draft.gpsOriginLat,
        gpsOriginLng: draft.gpsOriginLng,
        gpsPrecisionM: draft.gpsPrecisionM,
        cooperativeId: normalizeUuid(user?.cooperativeId),
        draftId: draft.id,
        title: draft.title,
      }

      await enqueueMutation({
        type: 'registerLot',
        payload,
        idempotencyKey: draft.idempotencyKey,
      })

      if (isOnline && token) {
        await refreshLots()
      }

      console.log('[useLots] Lot added to local state', { lotId: optimisticLot.id })

      return draft
    },
    [enqueueMutation, isOnline, user, token, refreshLots],
  )

  const searchLots = useCallback(
    (query: string, status?: string) => {
      const normalizedQuery = query.trim().toLowerCase()

      return lots.filter((lot) => {
        const matchesQuery =
          !normalizedQuery ||
          [lot.id, lot.lotCode, lot.ownerName, lot.product, lot.variety]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(normalizedQuery))

        const matchesStatus = !status || status === 'all' || lot.status === status

        return matchesQuery && matchesStatus
      })
    },
    [lots],
  )

  const syncSummary = useMemo(
    () => ({
      pending: queue.length,
      lastSyncedAt,
    }),
    [lastSyncedAt, queue.length],
  )

  return {
    lots,
    draftLots,
    loading,
    error,
    isOnline,
    refreshLots,
    loadLot,
    loadPublicLot,
    saveDraft,
    removeDraft,
    submitDraft,
    searchLots,
    syncSummary,
  }
}
