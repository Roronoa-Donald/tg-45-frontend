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
  weightKg: z.number().positive(),
  harvestDate: z.string().optional(),
  gpsOriginLat: z.number(),
  gpsOriginLng: z.number(),
  gpsPrecisionM: z.number().int().positive(),
  cooperativeId: z.string().optional(),
})

export const lotTransferSchema = z.object({
  newOwnerId: z.string().min(2),
})

export const verificationStatusSchema = z.object({
  status: z.string().min(3),
  reason: z.string().optional(),
})

export const verificationProofSchema = z.object({
  signature: z.string().min(8),
  payloadHash: z.string().min(8),
})

export const certificationSchema = z.object({
  signature: z.string().min(8).optional(),
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
