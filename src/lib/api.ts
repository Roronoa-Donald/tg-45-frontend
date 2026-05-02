import { apiEnvelopeSchema } from './schemas'

const DEFAULT_BASE_URL = 'https://tg-45-backend.onrender.com'

export class ApiError extends Error {
  status: number
  code: string

  constructor(message: string, status = 0, code = 'network_error') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

function getBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL
}

function buildUrl(path: string) {
  return `${getBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const message = payload?.error?.message || 'La requête a échoué.'
    throw new ApiError(message, response.status, payload?.error?.code || 'api_error')
  }

  const envelope = apiEnvelopeSchema.safeParse(payload)

  if (envelope.success) {
    return envelope.data.data as T
  }

  return payload?.data ?? payload
}

async function request<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {})

  if (!headers.has('Content-Type') && !headers.has('content-type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  })

  return parseResponse<T>(response)
}

function authHeaders(token?: string | null, idempotencyKey?: string) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
  }
}

export async function login(identifier: string, secret: string) {
  return request<{ token: string; role: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, secret }),
  })
}

export async function register(payload: { name: string; identifier?: string; phone?: string; email?: string; secret: string; role?: string; farmName?: string; location?: string; language?: string }) {
  return request<{ id: string; role: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function loadFarmerProfile(token: string) {
  return request<{ id: string; name: string; cooperativeId?: string }>('/farmers/profile', {
    headers: authHeaders(token),
  })
}

export async function listLots(token: string, query: Record<string, string | number | undefined> = {}) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      search.set(key, String(value))
    }
  }

  const suffix = search.toString() ? `?${search.toString()}` : ''
  return request<{ items: unknown[]; meta?: Record<string, unknown> }>(`/lots${suffix}`, {
    headers: authHeaders(token),
  })
}

export async function getLot(token: string, id: string) {
  return request<Record<string, unknown>>(`/lots/${id}`, {
    headers: authHeaders(token),
  })
}

export async function createLot(token: string, payload: Record<string, unknown>, idempotencyKey: string) {
  return request<Record<string, unknown>>('/lots/register', {
    method: 'POST',
    headers: authHeaders(token, idempotencyKey),
    body: JSON.stringify(payload),
  })
}

export async function transferLot(token: string, lotId: string, payload: Record<string, unknown>) {
  return request<Record<string, unknown>>(`/lots/${lotId}/transfer`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export async function loadLotEvents(token: string, lotId: string) {
  return request<Record<string, unknown>[]>(`/lots/${lotId}/events`, {
    headers: authHeaders(token),
  })
}

export async function verifyLotStatus(token: string, lotId: string, payload: Record<string, unknown>) {
  return request<Record<string, unknown>>(`/verification/${lotId}/status`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export async function submitVerificationProof(token: string, lotId: string, payload: Record<string, unknown>) {
  return request<Record<string, unknown>>(`/verification/${lotId}/proof`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export async function certifyLot(token: string, lotId: string, payload: Record<string, unknown>) {
  return request<Record<string, unknown>>(`/verification/${lotId}/certify`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export async function publicVerify(lotCode: string) {
  return request<Record<string, unknown>>(`/public/verify/${lotCode}`)
}

export async function enqueueSyncBatch(token: string, actions: Array<{ actionType: string; clientRequestId: string; payload: Record<string, unknown> }>) {
  return request<Array<{ clientRequestId: string; status: string }>>('/sync/batch', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ actions }),
  })
}

export async function loadSyncStatus(token: string) {
  return request<Record<string, unknown>[]>('/sync/status', {
    headers: authHeaders(token),
  })
}

export async function loadCooperativeMembers(token: string, cooperativeId: string) {
  return request<Record<string, unknown>[]>(`/cooperatives/${cooperativeId}/members`, {
    headers: authHeaders(token),
  })
}
