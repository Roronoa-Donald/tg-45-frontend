export type Role = 'farmer' | 'cooperative' | 'verifier' | 'exporter' | 'support' | 'admin' | 'ministry'

export type LotStatus =
  | 'registered'
  | 'pending'
  | 'validated'
  | 'certified'
  | 'shipped'
  | 'in_transit'
  | 'rejected'

export type SyncMutationType =
  | 'registerLot'
  | 'transferLot'
  | 'updateVerificationStatus'
  | 'submitVerificationProof'
  | 'certifyLot'
  | 'updateLotDetails'

export interface SessionUser {
  id: string
  role: Role
  displayName: string
  identifier: string
  cooperativeId?: string
}

export interface LotEvent {
  eventType?: string
  occurredAt?: string
  metadata?: Record<string, unknown>
  actorId?: string
  actorName?: string
  action?: string
  createdAt?: string
  status?: string
  note?: string
}

export interface LotImage {
  url?: string
  isPrimary?: boolean
  checksum?: string
}

export interface LotRecord {
  id: string
  lotCode?: string
  ownerId?: string
  ownerName?: string
  cooperativeId?: string | null
  product?: string
  variety?: string | null
  weightKg?: number
  harvestDate?: string | null
  gpsOriginLat?: number
  gpsOriginLng?: number
  gpsPrecisionM?: number
  gpsAreaRadiusM?: number
  status: LotStatus | string
  blockchainTxHash?: string | null
  blockchainProofHash?: string | null
  blockchainConfirmed?: boolean
  createdAt?: string
  updatedAt?: string
  certification?: {
    status?: string
    signature?: string | null
    signedBy?: string | null
    signedAt?: string | null
  } | null
  events?: LotEvent[]
  images?: LotImage[]
  proof?: {
    txHash?: string | null
    proofHash?: string | null
  }
  verificationStatus?: string
  verificationNote?: string
}

export interface PublicLotRecord {
  lotCode: string
  status: string
  gps?: {
    lat?: number
    lng?: number
    precisionM?: number
  }
  proof?: {
    txHash?: string | null
    proofHash?: string | null
  }
  events?: LotEvent[]
  images?: LotImage[]
}

export interface LotDraft {
  id: string
  title: string
  product: string
  variety: string
  weightKg: number
  harvestDate: string
  gpsOriginLat: number
  gpsOriginLng: number
  gpsPrecisionM: number
  cooperativeId?: string
  photoDataUrl?: string
  notes?: string
  idempotencyKey: string
  createdAt: string
  updatedAt: string
}

export interface OfflineMutation {
  id: string
  type: SyncMutationType
  payload: Record<string, unknown>
  idempotencyKey: string
  status: 'pending' | 'failed' | 'synced'
  attempts: number
  lastError?: string
  createdAt: string
  updatedAt: string
}

export interface DashboardSummary {
  lotsCount: number
  validatedCount: number
  pendingCount: number
  offlineCount: number
  lastSyncLabel: string
}
