import type {
  Cooperative,
  DashboardStats,
  Farmer,
  Lot,
  MonthlyExport,
} from '../types'

export const imageBank = {
  hero:
    'https://images.pexels.com/photos/733535/pexels-photo-733535.jpeg?auto=compress&cs=tinysrgb&w=1400',
  lotCacao:
    'https://images.pexels.com/photos/65882/cocoa-beans-cocoa-cocoa-fruit-65882.jpeg?auto=compress&cs=tinysrgb&w=1200',
  lotCoffee:
    'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=1200',
  farmerPortrait:
    'https://images.pexels.com/photos/2381069/pexels-photo-2381069.jpeg?auto=compress&cs=tinysrgb&w=700',
  cooperativeTeam:
    'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=900',
}

export const projectMeta = {
  name: 'ChainCacao',
  taglineFr: 'La tracabilite blockchain du cacao togolais',
  taglineEn: 'Blockchain traceability for Togolese cocoa',
  hackathon: 'MIABE Hackathon 2026',
  phase: 'Phase 1 - Preselection',
  deliverable: 'Maquettes visuelles React (5 interfaces completes)',
  context:
    'Filiere cafe-cacao togolaise - 40 000+ familles rurales, contrainte EUDR 2025, fraudes estimees a 30-40M USD/an',
  sdgAlignment: [
    'ODD 1 - Fin de la pauvrete',
    'ODD 2 - Faim zero',
    'ODD 8 - Travail decent',
    'ODD 12 - Consommation responsable',
  ],
}

export const regionsTogo = [
  'Kpalime',
  'Badou',
  'Amlame',
  'Tsevie',
  'Notse',
  'Atakpame',
  'Sokode',
  'Kara',
]

export const farmers: Farmer[] = [
  {
    id: 'AGR-001',
    name: 'Kossi Amegboh',
    region: 'Kpalime',
    cooperative: 'COOP-Kloto',
    gps: { lat: 6.901, lng: 0.629 },
    lotsTotal: 12,
    revenusAnnuelsFcfa: 850000,
    avatarUrl: imageBank.farmerPortrait,
  },
  {
    id: 'AGR-002',
    name: 'Afua Mensah',
    region: 'Badou',
    cooperative: 'COOP-Wawa',
    gps: { lat: 7.5833, lng: 0.6 },
    lotsTotal: 8,
    revenusAnnuelsFcfa: 620000,
    avatarUrl:
      'https://images.pexels.com/photos/3768166/pexels-photo-3768166.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
  {
    id: 'AGR-003',
    name: 'Kofi Gbetoglo',
    region: 'Amlame',
    cooperative: 'COOP-Kloto',
    gps: { lat: 7.0667, lng: 0.6333 },
    lotsTotal: 15,
    revenusAnnuelsFcfa: 1100000,
    avatarUrl:
      'https://images.pexels.com/photos/2381072/pexels-photo-2381072.jpeg?auto=compress&cs=tinysrgb&w=700',
  },
]

export const cooperatives: Cooperative[] = [
  {
    id: 'COOP-Kloto',
    name: 'Cooperative Agricole de Kloto',
    region: 'Kpalime',
    members: 287,
    lotsPending: 12,
    lotsValidated: 203,
  },
  {
    id: 'COOP-Wawa',
    name: 'Cooperative Wawa-Cafe',
    region: 'Badou',
    members: 145,
    lotsPending: 7,
    lotsValidated: 98,
  },
]

export const lots: Lot[] = [
  {
    id: 'LOT-2026-001',
    qrData: 'https://chaincacao.tg/verify/LOT-2026-001',
    farmerId: 'AGR-001',
    farmerName: 'Kossi Amegboh',
    product: 'Cacao',
    variety: 'Forastero',
    weightKg: 250,
    gpsOrigin: { lat: 6.901, lng: 0.629 },
    dateHarvest: '2026-01-15',
    status: 'exported',
    blockchainHash: '0x7f3a9b2c1d4e5f6a7b8c9d0e1f2a3b4c',
    blockchainConfirmed: true,
    certifications: ['Fairtrade', 'Bio'],
    eudrCompliant: true,
    imageUrl: imageBank.lotCacao,
    journey: [
      {
        step: 1,
        actor: 'Kossi Amegboh',
        role: 'Agriculteur',
        action: 'Recolte enregistree',
        location: 'Kpalime',
        date: '2026-01-15T08:30:00',
        gps: { lat: 6.901, lng: 0.629 },
        status: 'validated',
      },
      {
        step: 2,
        actor: 'COOP-Kloto',
        role: 'Cooperative',
        action: 'Reception et pesee',
        location: 'Kpalime Centre',
        date: '2026-01-17T10:00:00',
        gps: { lat: 6.9, lng: 0.64 },
        status: 'validated',
      },
      {
        step: 3,
        actor: 'TransCacao SA',
        role: 'Transformateur',
        action: 'Fermentation et sechage',
        location: 'Tsevie',
        date: '2026-01-25T14:00:00',
        gps: { lat: 6.4265, lng: 1.2138 },
        status: 'validated',
      },
      {
        step: 4,
        actor: 'TogoExport SARL',
        role: 'Exportateur',
        action: 'Conditionnement et export UE',
        location: 'Port de Lome',
        date: '2026-02-10T09:00:00',
        gps: { lat: 6.1319, lng: 1.2768 },
        status: 'validated',
      },
    ],
  },
  {
    id: 'LOT-2026-002',
    qrData: 'https://chaincacao.tg/verify/LOT-2026-002',
    farmerId: 'AGR-002',
    farmerName: 'Afua Mensah',
    product: 'Café',
    variety: 'Robusta',
    weightKg: 120,
    gpsOrigin: { lat: 7.5833, lng: 0.6 },
    dateHarvest: '2026-02-03',
    status: 'in_transit',
    blockchainHash: '0x2c4d6e8f0a1b3c5d7e9f1a2b3c4d5e6f',
    blockchainConfirmed: true,
    certifications: ['Rainforest Alliance'],
    eudrCompliant: true,
    imageUrl: imageBank.lotCoffee,
    journey: [
      {
        step: 1,
        actor: 'Afua Mensah',
        role: 'Agriculteur',
        action: 'Recolte enregistree',
        location: 'Badou',
        date: '2026-02-03T07:00:00',
        gps: { lat: 7.5833, lng: 0.6 },
        status: 'validated',
      },
      {
        step: 2,
        actor: 'COOP-Wawa',
        role: 'Cooperative',
        action: 'Reception et pesee',
        location: 'Badou Centre',
        date: '2026-02-05T11:30:00',
        gps: { lat: 7.58, lng: 0.61 },
        status: 'validated',
      },
      {
        step: 3,
        actor: 'TransCacao SA',
        role: 'Transformateur',
        action: 'Traitement en cours',
        location: 'Atakpame',
        date: '2026-02-12T00:00:00',
        gps: { lat: 7.5333, lng: 1.1333 },
        status: 'in_progress',
      },
    ],
  },
]

export const statsDashboard: DashboardStats = {
  totalLots: 847,
  totalFarmers: 1243,
  totalWeightTons: 312,
  eudrCompliantPercent: 94,
  certifieFairtrade: 156,
  certifieBio: 89,
  exportValueFcfa: 2400000000,
  fraudesEviteesUsd: 180000,
}

export const monthlyExports: MonthlyExport[] = [
  { month: 'Jan', volumeTons: 18 },
  { month: 'Feb', volumeTons: 22 },
  { month: 'Mar', volumeTons: 25 },
  { month: 'Apr', volumeTons: 24 },
  { month: 'May', volumeTons: 26 },
  { month: 'Jun', volumeTons: 28 },
  { month: 'Jul', volumeTons: 24 },
  { month: 'Aug', volumeTons: 27 },
  { month: 'Sep', volumeTons: 29 },
  { month: 'Oct', volumeTons: 31 },
  { month: 'Nov', volumeTons: 30 },
  { month: 'Dec', volumeTons: 28 },
]

export const landingMetrics = [
  {
    value: '40 000+',
    labelFr: 'familles togolaises',
    labelEn: 'Togolese families',
  },
  { value: '94%', labelFr: 'conformite EUDR', labelEn: 'EUDR compliance' },
  { value: '847', labelFr: 'lots traces', labelEn: 'tracked batches' },
  {
    value: '0',
    labelFr: 'fraudes non detectees',
    labelEn: 'undetected fraud',
  },
]

export const roleRoutes = {
  farmer: '/farmer',
  cooperative: '/cooperative',
  exporter: '/exporter',
  verify: '/verify',
}
