export type Role = 'farmer' | 'cooperative' | 'verifier' | 'exporter' | 'support' | 'admin' | 'ministry' | 'compliance'

export type LotStatus =
  | 'registered'
  | 'pending'
  | 'validated'
  | 'certified'
  | 'shipped'
  | 'exported'
  | 'delivered'
  | 'in_transit'
  | 'rejected'

export type SyncMutationType =
  | 'registerLot'
  | 'transferLot'
  | 'updateVerificationStatus'
  | 'submitVerificationProof'
  | 'certifyLot'
  | 'updateLotDetails'
  | 'createParcel'
  | 'updateParcel'
  | 'linkLotParcel'
  | 'createEudrDdr'
  | 'updateEudrDdr'

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
  hsCode?: string | null
  originCountry?: string | null
  originRegion?: string | null
  weightKg?: number
  harvestDate?: string | null
  productionStartDate?: string | null
  productionEndDate?: string | null
  gpsOriginLat?: number
  gpsOriginLng?: number
  gpsPrecisionM?: number
  gpsAreaRadiusM?: number
  status: LotStatus | string
  eudrStatus?: string | null
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
  parcels?: LotParcelRecord[]
  eudrDueDiligence?: EudrDueDiligence | null
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
  eudrStatus?: string | null
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
  parcels?: Array<{ id?: string; geometryType?: string; areaHa?: number | null }>
}

export interface LotDraft {
  id: string
  title: string
  product: string
  variety: string
  hsCode?: string
  originCountry?: string
  originRegion?: string
  weightKg: number
  harvestDate: string
  productionStartDate?: string
  productionEndDate?: string
  parcelIds?: string[]
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

export interface ParcelRecord {
  id: string
  ownerId?: string
  cooperativeId?: string | null
  name?: string | null
  countryCode?: string | null
  region?: string | null
  district?: string | null
  locality?: string | null
  geometryType: 'point' | 'polygon'
  geometry: { type: 'Point' | 'Polygon'; coordinates: unknown }
  areaHa?: number | null
  createdAt?: string
  updatedAt?: string
}

export interface LotParcelRecord {
  id?: string
  lotId?: string
  parcelId?: string
  sharePct?: number | null
  parcel?: ParcelRecord
}

export interface EudrDocument {
  id?: string
  docType: string
  url: string
  checksum?: string | null
  issuedAt?: string | null
  metadata?: Record<string, unknown> | null
  createdAt?: string
}

export interface EudrDeforestationCheck {
  id?: string
  parcelId: string
  source: string
  checkDate: string
  result: 'pass' | 'fail' | 'unknown'
  confidence?: number | null
  evidenceUrl?: string | null
  metadata?: Record<string, unknown> | null
}

export interface EudrLegalityCheck {
  id?: string
  ddId: string
  checkType: string
  status: 'pass' | 'fail' | 'unknown'
  evidenceUrl?: string | null
  metadata?: Record<string, unknown> | null
}

export interface EudrDeclaration {
  id?: string
  ddId: string
  payloadJson?: Record<string, unknown>
  referenceNo?: string | null
  submittedBy?: string | null
  submittedAt?: string | null
  status?: string | null
}

export interface EudrDueDiligence {
  id: string
  lotId?: string | null
  exportId?: string | null
  status: string
  riskLevel?: string | null
  assessmentSummary?: string | null
  mitigationSummary?: string | null
  declarationRef?: string | null
  createdAt?: string
  updatedAt?: string
  documents?: EudrDocument[]
  legalityChecks?: EudrLegalityCheck[]
  declarations?: EudrDeclaration[]
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
