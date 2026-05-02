export type LanguageCode = 'fr' | 'en'

export type LotStatus =
  | 'registered'
  | 'in_transit'
  | 'validated'
  | 'exported'
  | 'rejected'
  | 'pending'

export interface GpsPoint {
  lat: number
  lng: number
}

export interface Farmer {
  id: string
  name: string
  region: string
  cooperative: string
  gps: GpsPoint
  lotsTotal: number
  revenusAnnuelsFcfa: number
  avatarUrl: string
}

export interface Cooperative {
  id: string
  name: string
  region: string
  members: number
  lotsPending: number
  lotsValidated: number
}

export interface JourneyStep {
  step: number
  actor: string
  role: string
  action: string
  location: string
  date: string
  gps: GpsPoint
  status: 'validated' | 'in_progress' | 'rejected'
}

export interface Lot {
  id: string
  qrData: string
  farmerId: string
  farmerName: string
  product: 'Cacao' | 'Café'
  variety: string
  weightKg: number
  gpsOrigin: GpsPoint
  dateHarvest: string
  status: LotStatus
  blockchainHash: string
  blockchainConfirmed: boolean
  certifications: string[]
  eudrCompliant: boolean
  imageUrl: string
  journey: JourneyStep[]
}

export interface DashboardStats {
  totalLots: number
  totalFarmers: number
  totalWeightTons: number
  eudrCompliantPercent: number
  certifieFairtrade: number
  certifieBio: number
  exportValueFcfa: number
  fraudesEviteesUsd: number
}

export interface MonthlyExport {
  month: string
  volumeTons: number
}
