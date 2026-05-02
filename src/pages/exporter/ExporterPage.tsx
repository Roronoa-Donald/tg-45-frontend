import {
  BarChart2,
  FileText,
  LayoutDashboard,
  Link2,
  type LucideIcon,
  Package,
  Settings,
  Shield,
  TrendingUp,
  Weight,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DesktopTopBar } from '../../components/DesktopTopBar'
import { LanguageToggle } from '../../components/LanguageToggle'
import { LotStatusBadge } from '../../components/LotStatusBadge'
import {
  DEMO_RESET_EVENT,
  EXPORTER_UI_STORAGE_KEY,
} from '../../constants/storageKeys'
import { monthlyExports, statsDashboard } from '../../data/mockData'
import { useAppData } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { formatFcfa } from '../../utils/formatters'
import { getStorageJson, setStorageJson } from '../../utils/localStorage'

interface ExporterUiState {
  showMoreMobile: boolean
  fromDate: string
  toDate: string
  selectedLotFilter: string
}

const defaultExporterUiState: ExporterUiState = {
  showMoreMobile: false,
  fromDate: '2026-01-01',
  toDate: '2026-12-31',
  selectedLotFilter: 'all',
}

interface ExporterNavItem {
  id: 'dashboard' | 'lots' | 'reports' | 'analytics' | 'settings'
  sectionId: string
  icon: LucideIcon
  labelFr: string
  labelEn: string
}

const exporterNav: ExporterNavItem[] = [
  {
    id: 'dashboard',
    sectionId: 'exporter-dashboard',
    icon: LayoutDashboard,
    labelFr: 'Tableau de bord',
    labelEn: 'Dashboard',
  },
  {
    id: 'lots',
    sectionId: 'exporter-lots',
    icon: Package,
    labelFr: 'Gestion des lots',
    labelEn: 'Batches',
  },
  {
    id: 'reports',
    sectionId: 'exporter-reports',
    icon: FileText,
    labelFr: 'Rapports EUDR',
    labelEn: 'EUDR reports',
  },
  {
    id: 'analytics',
    sectionId: 'exporter-analytics',
    icon: BarChart2,
    labelFr: 'Analytiques',
    labelEn: 'Analytics',
  },
  {
    id: 'settings',
    sectionId: 'exporter-settings',
    icon: Settings,
    labelFr: 'Parametres',
    labelEn: 'Settings',
  },
]

export const ExporterPage = () => {
  const { t, i18n } = useTranslation()
  const { lots, updateLot } = useAppData()
  const { showToast } = useToast()
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 1024px)').matches
      : false,
  )
  const [activeNavId, setActiveNavId] = useState<ExporterNavItem['id']>('dashboard')

  const [uiState, setUiState] = useState<ExporterUiState>(() =>
    getStorageJson<ExporterUiState>(
      EXPORTER_UI_STORAGE_KEY,
      defaultExporterUiState,
    ),
  )

  useEffect(() => {
    setStorageJson(EXPORTER_UI_STORAGE_KEY, uiState)
  }, [uiState])

  useEffect(() => {
    const handleDemoReset = () => {
      setUiState(defaultExporterUiState)
    }

    window.addEventListener(DEMO_RESET_EVENT, handleDemoReset)

    return () => {
      window.removeEventListener(DEMO_RESET_EVENT, handleDemoReset)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches)
    }

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange)
      } else {
        mediaQuery.removeListener(handleChange)
      }
    }
  }, [])

  const locale = i18n.language.startsWith('fr') ? 'fr' : 'en'

  const complianceGauge = [
    { name: 'Compliant', value: statsDashboard.eudrCompliantPercent },
    { name: 'Gap', value: 100 - statsDashboard.eudrCompliantPercent },
  ]

  const kpis = [
    {
      id: 'weight',
      icon: Weight,
      value: `${statsDashboard.totalWeightTons} T`,
      label: t('exporter.cacaoExported'),
      trend: '+18% vs 2025',
    },
    {
      id: 'eudr',
      icon: Shield,
      value: `${statsDashboard.eudrCompliantPercent}%`,
      label: t('exporter.eudrLots'),
      trend: t('exporter.targetTrend'),
    },
    {
      id: 'value',
      icon: TrendingUp,
      value: formatFcfa(statsDashboard.exportValueFcfa, locale),
      label: t('exporter.exportValue'),
      trend: '+11.2%',
    },
    {
      id: 'lots',
      icon: Link2,
      value: String(statsDashboard.totalLots),
      label: t('exporter.trackedLots'),
      trend: '+67',
    },
  ]

  const showAdvancedSections = isDesktop || uiState.showMoreMobile

  const visibleLots = useMemo(() => {
    if (uiState.selectedLotFilter === 'all') {
      return lots
    }

    return lots.filter((lot) => lot.id === uiState.selectedLotFilter)
  }, [lots, uiState.selectedLotFilter])

  const handleLotExport = (lotId: string) => {
    const lot = lots.find((candidateLot) => candidateLot.id === lotId)

    if (!lot || lot.status === 'exported' || lot.status === 'rejected') {
      return
    }

    updateLot(lotId, {
      status: 'exported',
      journey: [
        ...lot.journey,
        {
          step: lot.journey.length + 1,
          actor: 'TogoExport SARL',
          role: 'exporter',
          action: 'marked_as_exported',
          location: 'Port de Lome',
          date: new Date().toISOString(),
          gps: lot.gpsOrigin,
          status: 'validated',
        },
      ],
    })

    showToast(t('exporter.batchMarkedExported'))
  }

  const handleNavClick = (item: ExporterNavItem) => {
    setActiveNavId(item.id)

    const targetSection = document.getElementById(item.sectionId)
    if (!targetSection) {
      return
    }

    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-cream-light text-cocoa-700">
      <div className="fixed right-3 top-3 z-50 lg:hidden">
        <LanguageToggle />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
        <aside className="hidden w-[240px] border-r border-[rgba(0,0,0,0.1)] bg-white p-4 lg:block">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-cocoa-500">
            TogoExport SARL
          </p>
          <nav className="space-y-2">
            {exporterNav.map((item) => {
              const Icon = item.icon
              const active = activeNavId === item.id
              return (
                <button
                  key={item.labelFr}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                    active
                      ? 'bg-brandGreen-50 font-semibold text-brandGreen-700'
                      : 'text-cocoa-700 hover:bg-cream-light'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {locale === 'fr' ? item.labelFr : item.labelEn}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <DesktopTopBar
            title={t('exporter.dashboard')}
            userName="TogoExport SARL"
            roleLabel={t('common.exporter')}
          />

          <main className="space-y-4 px-4 py-6 md:px-6 lg:px-8">
            <section
              id="exporter-dashboard"
              className="scroll-mt-24 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              {kpis.map((kpi) => {
                const Icon = kpi.icon
                return (
                  <article
                    key={kpi.id}
                    className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4"
                  >
                    <Icon className="mb-2 h-6 w-6 text-brandGreen-700" />
                    <p className="text-2xl font-semibold text-cocoa-700">{kpi.value}</p>
                    <p className="text-sm text-cocoa-500">{kpi.label}</p>
                    <p className="text-xs text-brandGreen-700">{kpi.trend}</p>
                  </article>
                )
              })}
            </section>

            <button
              type="button"
              onClick={() =>
                setUiState((previousState) => ({
                  ...previousState,
                  showMoreMobile: !previousState.showMoreMobile,
                }))
              }
              className="min-h-12 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-semibold text-cocoa-700 lg:hidden"
            >
              {uiState.showMoreMobile ? t('common.showLess') : t('common.showMore')}
            </button>

            {showAdvancedSections ? (
              <section
                id="exporter-analytics"
                className="scroll-mt-24 grid gap-4 xl:grid-cols-3"
              >
                <article className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4 xl:col-span-2">
                  <h2 className="mb-3 text-sm font-semibold text-cocoa-700">{t('exporter.monthlyVolume')}</h2>
                  <div className="h-[220px] w-full overflow-x-auto">
                    <BarChart width={640} height={220} data={monthlyExports}>
                      <XAxis dataKey="month" stroke="#5C3D2E" />
                      <YAxis stroke="#5C3D2E" />
                      <Tooltip />
                      <Bar dataKey="volumeTons" fill="#1B6B3A" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </div>
                </article>

                <article className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                  <h2 className="mb-3 text-sm font-semibold text-cocoa-700">{t('exporter.globalCompliance')}</h2>
                  <div className="mx-auto flex h-[210px] w-full max-w-[260px] items-center justify-center">
                    <PieChart width={240} height={200}>
                      <Pie
                        data={complianceGauge}
                        dataKey="value"
                        nameKey="name"
                        startAngle={180}
                        endAngle={0}
                        innerRadius={55}
                        outerRadius={80}
                      >
                        {complianceGauge.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={index === 0 ? '#1B6B3A' : '#E8D5B5'}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>
                  <p className="text-center text-3xl font-semibold text-brandGreen-700">
                    {statsDashboard.eudrCompliantPercent}%
                  </p>
                </article>
              </section>
            ) : null}

            {showAdvancedSections ? (
              <section
                id="exporter-lots"
                className="scroll-mt-24 overflow-hidden rounded-xl border border-[rgba(0,0,0,0.1)] bg-white"
              >
              <header className="border-b border-[rgba(0,0,0,0.1)] px-4 py-3">
                <h2 className="text-sm font-semibold text-cocoa-700">{t('exporter.lotsReady')}</h2>
              </header>
              <div className="overflow-x-auto">
                <table className="min-w-[960px] w-full text-left text-sm">
                  <thead className="bg-cream-light text-cocoa-500">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">{t('common.product')}</th>
                      <th className="px-4 py-3">{t('common.weight')}</th>
                      <th className="px-4 py-3">{t('common.farmer')}</th>
                      <th className="px-4 py-3">{t('common.cooperative')}</th>
                      <th className="px-4 py-3">EUDR</th>
                      <th className="px-4 py-3">{t('common.certifications')}</th>
                      <th className="px-4 py-3">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLots.map((lot) => (
                      <tr key={lot.id} className="border-t border-[rgba(0,0,0,0.1)]">
                        <td className="px-4 py-3 font-semibold text-cocoa-700">{lot.id}</td>
                        <td className="px-4 py-3">{lot.product}</td>
                        <td className="px-4 py-3">{lot.weightKg} kg</td>
                        <td className="px-4 py-3">{lot.farmerName}</td>
                        <td className="px-4 py-3">
                          {lot.farmerId === 'AGR-002' ? 'COOP-Wawa' : 'COOP-Kloto'}
                        </td>
                        <td className="px-4 py-3">
                          <LotStatusBadge status={lot.eudrCompliant ? 'validated' : 'rejected'} />
                        </td>
                        <td className="px-4 py-3">{lot.certifications.join(', ')}</td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => handleLotExport(lot.id)}
                            disabled={lot.status === 'exported' || lot.status === 'rejected'}
                            className="rounded-lg border border-[rgba(0,0,0,0.1)] px-3 py-1 text-xs font-semibold text-cocoa-700"
                          >
                            {lot.status === 'exported'
                              ? t('status.exported')
                              : lot.status === 'rejected'
                                ? t('status.rejected')
                                : t('exporter.exportAction')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </section>
            ) : null}

            {showAdvancedSections ? (
              <section
                id="exporter-reports"
                className="scroll-mt-24 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4"
              >
              <h2 className="mb-3 text-sm font-semibold text-cocoa-700">{t('exporter.reportGeneration')}</h2>
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block text-cocoa-500">{t('common.from')}</span>
                  <input
                    type="date"
                    className="h-11 w-full rounded-lg border border-[rgba(0,0,0,0.1)] px-3"
                    value={uiState.fromDate}
                    onChange={(event) =>
                      setUiState((previousState) => ({
                        ...previousState,
                        fromDate: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-cocoa-500">{t('common.to')}</span>
                  <input
                    type="date"
                    className="h-11 w-full rounded-lg border border-[rgba(0,0,0,0.1)] px-3"
                    value={uiState.toDate}
                    onChange={(event) =>
                      setUiState((previousState) => ({
                        ...previousState,
                        toDate: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className="mb-4 block text-sm">
                <span className="mb-1 block text-cocoa-500">{t('exporter.includedLots')}</span>
                <select
                  className="h-11 w-full rounded-lg border border-[rgba(0,0,0,0.1)] px-3"
                  value={uiState.selectedLotFilter}
                  onChange={(event) =>
                    setUiState((previousState) => ({
                      ...previousState,
                      selectedLotFilter: event.target.value,
                    }))
                  }
                >
                  <option value="all">{t('exporter.allTrackedLots')}</option>
                  {lots.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      {lot.id}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => showToast(t('exporter.pdfPreview'))}
                  className="min-h-12 rounded-lg bg-brandGreen-500 px-4 text-sm font-semibold text-white"
                >
                  {t('exporter.exportPdf')}
                </button>
                <button
                  type="button"
                  onClick={() => showToast(t('exporter.csvPreview'))}
                  className="min-h-12 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-semibold text-cocoa-700"
                >
                  {t('exporter.exportCsv')}
                </button>
                <button
                  type="button"
                  onClick={() => showToast(t('exporter.authoritySubmissionSimulated'))}
                  className="min-h-12 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-semibold text-cocoa-700"
                >
                  {t('exporter.sendAuthority')}
                </button>
              </div>
              </section>
            ) : null}

            <section
              id="exporter-settings"
              className="scroll-mt-24 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4"
            >
              <h2 className="mb-3 text-sm font-semibold text-cocoa-700">
                {locale === 'fr' ? 'Parametres rapides' : 'Quick settings'}
              </h2>
              <p className="mb-3 text-sm text-cocoa-500">
                {locale === 'fr'
                  ? 'Reinitialisez les filtres exportateur ou revenez a la vue compacte mobile.'
                  : 'Reset exporter filters or return to compact mobile view.'}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUiState(defaultExporterUiState)
                    showToast(
                      locale === 'fr' ? 'Filtres reinitialises' : 'Filters reset',
                      'info',
                    )
                  }}
                  className="min-h-12 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-semibold text-cocoa-700"
                >
                  {t('common.reset')}
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
