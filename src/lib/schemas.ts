import { z } from 'zod'

export const apiEnvelopeSchema = z.object({
  success: z.literal(true),
  data: z.unknown(),
  meta: z.record(z.string(), z.unknown()).optional(),
})

export const loginSchema = z.object({
  identifier: z.string().min(3),
  secret: z.string().min(4),
})

export const lotRegisterSchema = z.object({
  product: z.string().min(2),
  variety: z.string().optional(),
  hsCode: z.string().optional(),
  originCountry: z.string().optional(),
  originRegion: z.string().optional(),
  weightKg: z.number().positive(),
  harvestDate: z.string().optional(),
  productionStartDate: z.string().optional(),
  productionEndDate: z.string().optional(),
  gpsOriginLat: z.number(),
  gpsOriginLng: z.number(),
  gpsPrecisionM: z.number().int().positive(),
  cooperativeId: z.string().optional(),
})

export const parcelSchema = z.object({
  name: z.string().optional(),
  cooperativeId: z.string().uuid().optional(),
  countryCode: z.string().optional(),
  region: z.string().optional(),
  district: z.string().optional(),
  locality: z.string().optional(),
  geometryType: z.enum(['point', 'polygon']),
  geometry: z.object({
    type: z.enum(['Point', 'Polygon']),
    coordinates: z.any(),
  }),
  areaHa: z.number().optional(),
})

export const ddrSchema = z.object({
  lotId: z.string().uuid().optional(),
  exportId: z.string().uuid().optional(),
  riskLevel: z.enum(['low', 'standard', 'high']).optional(),
  assessmentSummary: z.string().optional(),
  mitigationSummary: z.string().optional(),
})

export const ddrDocumentSchema = z.object({
  docType: z.string().min(2),
  url: z.string().url(),
  checksum: z.string().optional(),
  issuedAt: z.string().optional(),
})

export const deforestationCheckSchema = z.object({
  parcelId: z.string().uuid(),
  source: z.string().min(2),
  checkDate: z.string(),
  result: z.enum(['pass', 'fail', 'unknown']),
  confidence: z.number().optional(),
  evidenceUrl: z.string().optional(),
})

export const legalityCheckSchema = z.object({
  ddId: z.string().uuid(),
  checkType: z.string().min(2),
  status: z.enum(['pass', 'fail', 'unknown']),
  evidenceUrl: z.string().optional(),
})

export const lotTransferSchema = z.object({
  newOwnerId: z.string().min(2),
})

export const verificationStatusSchema = z.object({
  status: z.string().min(3),
  reason: z.string().optional(),
  gps: z.object({ lat: z.number(), lng: z.number() }).optional(),
})

export const verificationProofSchema = z.object({
  signature: z.string().min(8),
  payloadHash: z.string().min(8),
})

export const certificationSchema = z.object({
  signature: z.string().min(8).optional(),
  gps: z.object({ lat: z.number(), lng: z.number() }).optional(),
})

export const syncActionSchema = z.object({
  actionType: z.string().min(2),
  clientRequestId: z.string().min(4),
  payload: z.record(z.string(), z.unknown()),
})

export const syncBatchSchema = z.object({
  actions: z.array(syncActionSchema).min(1),
})

export const publicLotSchema = z.object({
  lotCode: z.string(),
  status: z.string(),
  gps: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      precisionM: z.number().optional(),
    })
    .optional(),
  proof: z
    .object({
      txHash: z.string().nullable().optional(),
      proofHash: z.string().nullable().optional(),
    })
    .optional(),
  events: z.array(z.record(z.string(), z.unknown())).optional(),
  images: z.array(z.record(z.string(), z.unknown())).optional(),
})
