import type { LotDraft, LotRecord, PublicLotRecord, SessionUser } from '../domain/types'

export const seedUsers: Record<string, SessionUser> = {
  farmer: {
    id: 'user-farmer-001',
    role: 'farmer',
    displayName: 'Kossi Amegboh',
    identifier: 'kossi',
    cooperativeId: 'coop-kloto',
  },
  cooperative: {
    id: 'user-coop-001',
    role: 'cooperative',
    displayName: 'Adjoa Mensah',
    identifier: 'adjoa',
    cooperativeId: 'coop-kloto',
  },
  verifier: {
    id: 'user-verifier-001',
    role: 'verifier',
    displayName: 'Paul Koffi',
    identifier: 'paul',
  },
}

export const seedLots: LotRecord[] = [
  {
    id: 'lot-2026-001',
    lotCode: 'LOT-2026-001',
    ownerId: 'user-farmer-001',
    ownerName: 'Kossi Amegboh',
    cooperativeId: 'coop-kloto',
    product: 'Cacao',
    variety: 'Forastero',
    weightKg: 248,
    harvestDate: '2026-01-15',
    gpsOriginLat: 6.901,
    gpsOriginLng: 0.629,
    gpsPrecisionM: 24,
    status: 'validated',
    blockchainTxHash: '0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c',
    blockchainProofHash: '0xabc123def456',
    blockchainConfirmed: true,
    createdAt: '2026-01-15T08:40:00Z',
    updatedAt: '2026-01-17T10:10:00Z',
    certification: {
      status: 'approved',
      signedBy: 'Paul Koffi',
      signedAt: '2026-02-01T11:00:00Z',
    },
    events: [
      {
        eventType: 'register_lot',
        occurredAt: '2026-01-15T08:40:00Z',
        metadata: { actor: 'Kossi Amegboh' },
      },
      {
        eventType: 'validate_lot',
        occurredAt: '2026-01-17T10:10:00Z',
        metadata: { actor: 'Coop Kloto' },
      },
    ],
    images: [{ url: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=1200', isPrimary: true }],
  },
  {
    id: 'lot-2026-002',
    lotCode: 'LOT-2026-002',
    ownerId: 'user-farmer-001',
    ownerName: 'Kossi Amegboh',
    cooperativeId: 'coop-kloto',
    product: 'Cacao',
    variety: 'Trinitario',
    weightKg: 116,
    harvestDate: '2026-02-04',
    gpsOriginLat: 6.905,
    gpsOriginLng: 0.635,
    gpsPrecisionM: 18,
    status: 'in_transit',
    blockchainTxHash: '0x2c4d6e8f0a1b3c5d7e9f1a2b3c4d5e6f',
    blockchainProofHash: '0xdef789abc123',
    blockchainConfirmed: true,
    createdAt: '2026-02-04T07:10:00Z',
    updatedAt: '2026-02-12T09:30:00Z',
    events: [
      {
        eventType: 'register_lot',
        occurredAt: '2026-02-04T07:10:00Z',
        metadata: { actor: 'Kossi Amegboh' },
      },
      {
        eventType: 'transfer_lot',
        occurredAt: '2026-02-12T09:30:00Z',
        metadata: { newOwnerId: 'coop-kloto' },
      },
    ],
    images: [{ url: 'https://images.pexels.com/photos/733535/pexels-photo-733535.jpeg?auto=compress&cs=tinysrgb&w=1400', isPrimary: true }],
  },
  {
    id: 'lot-2026-003',
    lotCode: 'LOT-2026-003',
    ownerId: 'user-farmer-001',
    ownerName: 'Kossi Amegboh',
    cooperativeId: 'coop-kloto',
    product: 'Cacao',
    variety: 'Forastero',
    weightKg: 92,
    harvestDate: '2026-03-07',
    gpsOriginLat: 6.897,
    gpsOriginLng: 0.643,
    gpsPrecisionM: 31,
    status: 'registered',
    blockchainTxHash: null,
    blockchainProofHash: null,
    blockchainConfirmed: false,
    createdAt: '2026-03-07T07:45:00Z',
    updatedAt: '2026-03-07T07:45:00Z',
    events: [{ eventType: 'register_lot', occurredAt: '2026-03-07T07:45:00Z' }],
    images: [{ url: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=1200', isPrimary: true }],
  },
]

export const seedPublicLots: Record<string, PublicLotRecord> = {
  'LOT-2026-001': {
    lotCode: 'LOT-2026-001',
    status: 'validated',
    gps: { lat: 6.901, lng: 0.629, precisionM: 24 },
    proof: { txHash: '0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c', proofHash: '0xabc123def456' },
    events: seedLots[0].events,
    images: seedLots[0].images,
  },
  'LOT-2026-002': {
    lotCode: 'LOT-2026-002',
    status: 'in_transit',
    gps: { lat: 6.905, lng: 0.635, precisionM: 18 },
    proof: { txHash: '0x2c4d6e8f0a1b3c5d7e9f1a2b3c4d5e6f', proofHash: '0xdef789abc123' },
    events: seedLots[1].events,
    images: seedLots[1].images,
  },
}

export const seedDraftLots: LotDraft[] = []

export const roleRoutes = {
  farmer: '/farmer',
  cooperative: '/cooperative',
  verifier: '/verifier',
  public: '/public/verify',
  login: '/login',
}
