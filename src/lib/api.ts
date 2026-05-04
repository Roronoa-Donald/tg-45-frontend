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
  return request<{ id: string; name: string; cooperativeId?: string }>(`/farmers/profile?_t=${Date.now()}`, {
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
  search.set('_t', Date.now().toString())

  const suffix = `?${search.toString()}`
  return request<{ items: unknown[]; meta?: Record<string, unknown> }>(`/lots${suffix}`, {
    headers: authHeaders(token),
  })
}

export async function getLot(token: string, id: string) {
  return request<Record<string, unknown>>(`/lots/${id}?_t=${Date.now()}`, {
    headers: authHeaders(token),
  })
}

export async function createLot(token: string, payload: Record<string, unknown>, idempotencyKey: string) {
  // Strip photoDataUrl from register payload — it's uploaded separately via uploadLotImage
  const { photoDataUrl: _photo, ...cleanPayload } = payload
  return request<Record<string, unknown>>('/lots/register', {
    method: 'POST',
    headers: authHeaders(token, idempotencyKey),
    body: JSON.stringify(cleanPayload),
  })
}

function dataURLtoBlob(dataurl: string) {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

export async function uploadLotImage(token: string, lotId: string, photoDataUrl: string) {
  const blob = dataURLtoBlob(photoDataUrl)
  const formData = new FormData()
  formData.append('file', blob, 'lot-image.jpg')

  const response = await fetch(buildUrl(`/lots/${lotId}/images`), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }, // Do not set Content-Type so browser can set boundaries
    body: formData,
  })
  return parseResponse<Record<string, unknown>>(response)
}

export async function transferLot(token: string, lotId: string, payload: Record<string, unknown>) {
  return request<Record<string, unknown>>(`/lots/${lotId}/transfer`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export async function loadLotEvents(token: string, lotId: string) {
  return request<Record<string, unknown>[]>(`/lots/${lotId}/events?_t=${Date.now()}`, {
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
  return request<Record<string, unknown>>(`/public/verify/${lotCode}?_t=${Date.now()}`)
}

export async function enqueueSyncBatch(token: string, actions: Array<{ actionType: string; clientRequestId: string; payload: Record<string, unknown> }>) {
  return request<Array<{ clientRequestId: string; status: string }>>('/sync/batch', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ actions }),
  })
}

export async function loadSyncStatus(token: string) {
  return request<Record<string, unknown>[]>(`/sync/status?_t=${Date.now()}`, {
    headers: authHeaders(token),
  })
}

export async function loadCooperativeMembers(token: string, cooperativeId: string) {
  return request<Record<string, unknown>[]>(`/cooperatives/${cooperativeId}/members?_t=${Date.now()}`, {
    headers: authHeaders(token),
  })
}

export async function fetchLogs(token: string, filters: { date?: string; search?: string; role?: string }) {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(filters)) {
    if (value) {
      search.set(key, String(value))
    }
  }
  search.set('_t', Date.now().toString())

  return request<{ items: any[]; meta?: Record<string, unknown> }>(`/audit?${search.toString()}`, {
    headers: authHeaders(token),
  })
}

export async function createUser(token: string, payload: Record<string, unknown>) {
  return request<Record<string, unknown>>(`/admin/users`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  })
}

export async function listUsers(token: string) {
  return request<Record<string, unknown>[]>(`/admin/users?_t=${Date.now()}`, {
    headers: authHeaders(token),
  })
}

// ─── COOPERATIVE FARMERS & EXPORT ───

export async function loadPendingFarmers(token: string, cooperativeId: string) {
  return request<any[]>(`/cooperatives/${cooperativeId}/farmers/pending?_t=${Date.now()}`, {
    headers: authHeaders(token),
  })
}

export async function approveFarmer(token: string, cooperativeId: string, farmerId: string) {
  return request<any>(`/cooperatives/${cooperativeId}/farmers/${farmerId}/approve`, {
    method: 'PUT',
    headers: authHeaders(token),
  })
}

export async function loadActiveExporters(token: string) {
  return request<any[]>(`/cooperatives/exporters?_t=${Date.now()}`, {
    headers: authHeaders(token),
  })
}

export async function exportLots(token: string, cooperativeId: string, exporterId: string, lots: { id: string, weightKg?: number }[]) {
  return request<any>(`/cooperatives/${cooperativeId}/exports`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ exporterId, lots }),
  })
}

// ─── EXPORTER ───

export async function loadIncomingExports(token: string) {
  return request<any[]>(`/exports/incoming?_t=${Date.now()}`, {
    headers: authHeaders(token),
  })
}

export async function acceptExport(token: string, exportId: string, gps?: { lat: number, lng: number }) {
  return request<any>(`/exports/${exportId}/accept`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ gps }),
  })
}

export async function rejectExport(token: string, exportId: string, reason?: string) {
  return request<any>(`/exports/${exportId}/reject`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ reason }),
  })
}

// ─── MINISTRY ───

export async function loadMinistryKpis(token: string) {
  return request<any>(`/ministry/kpis?_t=${Date.now()}`, {
    headers: authHeaders(token),
  })
}

export async function loadPendingMinistryApprovals(token: string) {
  return request<any[]>(`/ministry/pending-approvals?_t=${Date.now()}`, {
    headers: authHeaders(token),
  })
}

export async function approveUserAsMinistry(token: string, userId: string) {
  return request<any>(`/ministry/approve-user/${userId}`, {
    method: 'POST',
    headers: authHeaders(token),
  })
}
