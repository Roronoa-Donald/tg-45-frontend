import {
  ArrowRightLeft,
  Building2,
  CheckCircle,
  Clock3,
  ListChecks,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import { DesktopTopBar } from '../../components/DesktopTopBar'
import { LanguageToggle } from '../../components/LanguageToggle'
import { LotStatusBadge } from '../../components/LotStatusBadge'
import { SafeImage } from '../../components/SafeImage'
import { useToast } from '../../context/ToastContext'
import { useAppData } from '../../context/AppContext'
import type { Lot } from '../../types'
import { formatDate } from '../../utils/formatters'

type CoopTab = 'dashboard' | 'validation' | 'transfer' | 'activity'
type TransferSelection = Record<string, boolean>

const translateJourneyAction = (action: string, t: (key: string) => string) => {
  if (action === 'Recolte enregistree' || action === 'harvest_registered') {
    return t('journey.actions.harvestRegistered')
  }

  if (action === 'Reception et pesee' || action === 'receipt_and_weight') {
    return t('journey.actions.receiptAndWeight')
  }

  if (action === 'Traitement en cours' || action === 'processing_in_progress') {
    return t('journey.actions.processingInProgress')
  }

  if (action === 'Fermentation et sechage' || action === 'fermentation_drying') {
    return t('journey.actions.fermentationDrying')
  }

  if (action === 'Conditionnement et export UE' || action === 'packaging_and_export') {
    return t('journey.actions.packagingAndExport')
  }

  if (action === 'cooperative_validation') {
    return t('journey.actions.cooperativeValidation')
  }

  if (action === 'lot_rejected') {
    return t('journey.actions.lotRejected')
  }

  if (action === 'transfer_to_processor') {
    return t('journey.actions.transferToProcessor')
  }

  if (action === 'marked_as_exported') {
    return t('journey.actions.markedAsExported')
  }

  return action
}

export const CooperativePage = () => {
  const { t, i18n } = useTranslation()
  const { cooperatives, lots, updateLot } = useAppData()
  const { showToast } = useToast()
  const cooperative = cooperatives[0]

  const [activeTab, setActiveTab] = useState<CoopTab>('dashboard')
  const [selectedLotId, setSelectedLotId] = useState('')
  const [quality, setQuality] = useState('A')
  const [officialWeightsByLot, setOfficialWeightsByLot] = useState<Record<string, number>>({})
  const [signed, setSigned] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [transferPartner] = useState('TransCacao SA')
  const [transferWeight, setTransferWeight] = useState(370)
  const [transferSelection, setTransferSelection] = useState<TransferSelection>({})

  const incomingLots = useMemo(
    () =>
      lots.filter((lot) =>
        ['registered', 'pending', 'in_transit'].includes(lot.status),
      ),
    [lots],
  )

  const transferableLots = useMemo(
    () => lots.filter((lot) => !['rejected', 'exported'].includes(lot.status)),
    [lots],
  )

  const effectiveSelectedLotId =
    selectedLotId && lots.some((lot) => lot.id === selectedLotId)
      ? selectedLotId
      : incomingLots[0]?.id ?? lots[0]?.id ?? ''

  const validationLot = useMemo(
    () =>
      lots.find((lot) => lot.id === effectiveSelectedLotId) ??
      incomingLots[0] ??
      lots[0],
    [effectiveSelectedLotId, incomingLots, lots],
  )

  const officialWeight = validationLot
    ? officialWeightsByLot[validationLot.id] ?? validationLot.weightKg
    : 0

  const pendingLotsCount = incomingLots.length
  const validatedLotsCount = lots.filter((lot) => lot.status === 'validated').length
  const eudrRate = lots.length
    ? ((lots.filter((lot) => lot.eudrCompliant).length / lots.length) * 100).toFixed(1)
    : '0.0'

  const recentActivity = useMemo(
    () =>
      lots
        .flatMap((lot) =>
          lot.journey.map((step) => ({
            ...step,
            lotId: lot.id,
          })),
        )
        .sort((left, right) => (left.date < right.date ? 1 : -1))
        .slice(0, 6),
    [lots],
  )

  const appendCooperativeJourneyStep = (
    lot: Lot,
    action: string,
    status: 'validated' | 'in_progress' | 'rejected',
  ) => [
    ...lot.journey,
    {
      step: lot.journey.length + 1,
      actor: cooperative.id,
      role: 'cooperative',
      action,
      location: cooperative.region,
      date: new Date().toISOString(),
      gps: lot.gpsOrigin,
      status,
    },
  ]

  const openValidationForLot = (lot: Lot) => {
    setSelectedLotId(lot.id)
    setOfficialWeightsByLot((previousWeights) => ({
      ...previousWeights,
      [lot.id]: previousWeights[lot.id] ?? lot.weightKg,
    }))
    setSigned(false)
    setActiveTab('validation')
  }

  const handleRejectLot = (lot: Lot) => {
    updateLot(lot.id, {
      status: 'rejected',
      journey: appendCooperativeJourneyStep(lot, 'lot_rejected', 'rejected'),
    })

    showToast(t('cooperative.lotRejected'), 'warning')
  }

  const kpis = [
    {
      id: 'members',
      icon: Users,
      value: cooperative.members,
      label: t('cooperative.members'),
      alert: false,
    },
    {
      id: 'pending',
      icon: Clock3,
      value: pendingLotsCount,
      label: t('cooperative.pendingLots'),
      alert: true,
    },
    {
      id: 'validated',
      icon: CheckCircle,
      value: validatedLotsCount,
      label: t('cooperative.validatedLots'),
      alert: false,
    },
    {
      id: 'eudr',
      icon: ListChecks,
      value: `${eudrRate}%`,
      label: t('cooperative.eudrRate'),
      alert: false,
    },
  ]

  const runValidation = () => {
    if (!validationLot) {
      showToast(t('common.noData'), 'warning')
      return
    }

    setIsValidating(true)

    window.setTimeout(() => {
      updateLot(validationLot.id, {
        status: 'validated',
        weightKg: officialWeight,
        journey: appendCooperativeJourneyStep(
          validationLot,
          'cooperative_validation',
          'validated',
        ),
      })

      setIsValidating(false)
      setSigned(false)
      showToast(t('cooperative.validationRecorded'))
    }, 1600)
  }

  const handleTransfer = () => {
    const selectedLots = transferableLots.filter(
      (lot) => transferSelection[lot.id],
    )

    if (selectedLots.length === 0) {
      showToast(t('cooperative.transferSelectionEmpty'), 'warning')
      return
    }

    selectedLots.forEach((lot) => {
      updateLot(lot.id, {
        status: 'in_transit',
        weightKg: transferWeight > 0 ? transferWeight : lot.weightKg,
        journey: appendCooperativeJourneyStep(
          lot,
          'transfer_to_processor',
          'validated',
        ),
      })
    })

    showToast(t('cooperative.transferRecorded'))
  }

  return (
    <div className="min-h-screen bg-cream-light text-cocoa-700">
      <div className="fixed right-3 top-3 z-50 lg:hidden">
        <LanguageToggle />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
        <aside className="hidden w-[240px] border-r border-[rgba(0,0,0,0.1)] bg-white p-4 lg:block">
          <div className="mb-6 rounded-xl border border-[rgba(0,0,0,0.1)] bg-cream-light p-3">
            <p className="text-xs text-cocoa-500">{cooperative.id}</p>
            <p className="font-semibold text-cocoa-700">{cooperative.name}</p>
            <p className="text-sm text-cocoa-500">{cooperative.region}</p>
          </div>

          <nav className="space-y-2">
            {([
              ['dashboard', t('cooperative.title')],
              ['validation', t('cooperative.incomingLots')],
              ['transfer', t('cooperative.transferLot')],
              ['activity', t('cooperative.recentActivity')],
            ] as Array<[CoopTab, string]>).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all duration-150 ease-out ${
                  activeTab === tab
                    ? 'bg-brandGreen-50 font-semibold text-brandGreen-700'
                    : 'text-cocoa-700 hover:bg-cream-light'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
          <DesktopTopBar
            title={t('cooperative.title')}
            userName={cooperative.name}
            roleLabel={t('common.cooperative')}
          />

          <main className="space-y-4 px-4 py-5 md:px-6 lg:px-8">
            {activeTab === 'dashboard' ? (
              <>
                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {kpis.map((kpi) => {
                    const Icon = kpi.icon
                    return (
                      <article
                        key={kpi.id}
                        className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4"
                      >
                        <Icon
                          className={`mb-2 h-6 w-6 ${
                            kpi.alert ? 'text-ochre-700' : 'text-brandGreen-700'
                          }`}
                        />
                        <p className="text-2xl font-semibold text-cocoa-700">{kpi.value}</p>
                        <p className="text-sm text-cocoa-500">{kpi.label}</p>
                      </article>
                    )
                  })}
                </section>

                <section className="overflow-hidden rounded-xl border border-[rgba(0,0,0,0.1)] bg-white">
                  <header className="border-b border-[rgba(0,0,0,0.1)] px-4 py-3">
                    <h2 className="text-sm font-semibold text-cocoa-700">{t('cooperative.incomingLots')}</h2>
                  </header>
                  <div className="overflow-x-auto">
                    <table className="min-w-[820px] w-full text-left text-sm">
                      <thead className="bg-cream-light text-cocoa-500">
                        <tr>
                          <th className="px-4 py-3">{t('cooperative.tableIdLot')}</th>
                          <th className="px-4 py-3">{t('common.farmer')}</th>
                          <th className="px-4 py-3">{t('common.product')}</th>
                          <th className="px-4 py-3">{t('common.weight')}</th>
                          <th className="px-4 py-3">{t('common.date')}</th>
                          <th className="px-4 py-3">{t('common.status')}</th>
                          <th className="px-4 py-3">{t('common.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {incomingLots.length === 0 ? (
                          <tr className="border-t border-[rgba(0,0,0,0.1)]">
                            <td className="px-4 py-5 text-center text-sm text-cocoa-500" colSpan={7}>
                              {t('cooperative.incomingEmpty')}
                            </td>
                          </tr>
                        ) : null}

                        {incomingLots.map((lot) => (
                          <tr key={lot.id} className="border-t border-[rgba(0,0,0,0.1)]">
                            <td className="px-4 py-3 font-semibold text-cocoa-700">{lot.id}</td>
                            <td className="px-4 py-3">{lot.farmerName}</td>
                            <td className="px-4 py-3">{lot.product}</td>
                            <td className="px-4 py-3">{lot.weightKg} kg</td>
                            <td className="px-4 py-3">
                              {formatDate(lot.dateHarvest, i18n.language.startsWith('fr') ? 'fr' : 'en')}
                            </td>
                            <td className="px-4 py-3">
                              <LotStatusBadge status={lot.status} />
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => openValidationForLot(lot)}
                                  className="rounded-lg border border-brandGreen-200 bg-brandGreen-50 px-2 py-1 text-xs font-semibold text-brandGreen-700"
                                >
                                  {t('common.validate')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectLot(lot)}
                                  className="rounded-lg border border-errorRed-200 bg-errorRed-50 px-2 py-1 text-xs font-semibold text-errorRed-700"
                                >
                                  {t('common.reject')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                  <h2 className="mb-3 text-sm font-semibold text-cocoa-700">{t('cooperative.recentActivity')}</h2>
                  <ul className="space-y-2 text-sm text-cocoa-500">
                    {recentActivity.slice(0, 4).map((activity) => (
                      <li key={`${activity.lotId}-${activity.step}`} className="rounded-lg border border-[rgba(0,0,0,0.1)] p-3">
                        <p className="font-medium text-cocoa-700">{activity.actor}</p>
                        <p>
                          {translateJourneyAction(activity.action, t)} · {activity.location}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            ) : null}

            {activeTab === 'validation' ? (
              validationLot ? (
                <section className="grid gap-4 xl:grid-cols-2">
                  <article className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                    <h2 className="mb-3 text-sm font-semibold text-cocoa-700">{t('cooperative.lotDetails')}</h2>
                    <SafeImage
                      src={validationLot.imageUrl}
                      alt={validationLot.product}
                      className="mb-3 h-40 w-full rounded-lg object-cover"
                    />
                    <p className="text-sm font-semibold text-cocoa-700">{validationLot.id}</p>
                    <p className="text-sm text-cocoa-500">{validationLot.farmerName}</p>
                    <p className="mb-3 text-sm text-cocoa-500">
                      {validationLot.product} · {validationLot.weightKg} kg
                    </p>
                    <div className="h-[180px] overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)]">
                      <MapContainer
                        center={[validationLot.gpsOrigin.lat, validationLot.gpsOrigin.lng]}
                        zoom={10}
                        className="h-full w-full"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker
                          position={[validationLot.gpsOrigin.lat, validationLot.gpsOrigin.lng]}
                        />
                      </MapContainer>
                    </div>
                  </article>

                  <article className="space-y-3 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                    <h2 className="text-sm font-semibold text-cocoa-700">{t('cooperative.officialValidation')}</h2>
                    <label className="block">
                      <span className="mb-1 block text-xs text-cocoa-500">{t('cooperative.officialWeightKg')}</span>
                      <input
                        type="number"
                        value={officialWeight}
                        onChange={(event) => {
                          if (!validationLot) {
                            return
                          }

                          setOfficialWeightsByLot((previousWeights) => ({
                            ...previousWeights,
                            [validationLot.id]: Number(event.target.value) || 0,
                          }))
                        }}
                        className="h-11 w-full rounded-lg border border-[rgba(0,0,0,0.1)] px-3"
                      />
                    </label>
                    <div>
                      <span className="mb-1 block text-xs text-cocoa-500">{t('cooperative.qualityLabel')}</span>
                      <div className="flex gap-2">
                        {['A', 'B', 'C'].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setQuality(option)}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                              quality === option
                                ? 'border-brandGreen-500 bg-brandGreen-50 text-brandGreen-700'
                                : 'border-[rgba(0,0,0,0.1)] bg-white text-cocoa-700'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-cocoa-700">
                      <input
                        type="checkbox"
                        checked={signed}
                        onChange={(event) => setSigned(event.target.checked)}
                      />
                      {t('cooperative.digitalSignature')}
                    </label>
                    <button
                      type="button"
                      onClick={runValidation}
                      disabled={!signed || isValidating}
                      className="min-h-12 w-full rounded-lg bg-brandGreen-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isValidating
                        ? t('cooperative.validatingBlockchain')
                        : t('cooperative.validateAndRecord')}
                    </button>
                  </article>
                </section>
              ) : (
                <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4 text-sm text-cocoa-500">
                  {t('common.noData')}
                </section>
              )
            ) : null}

            {activeTab === 'transfer' ? (
              <section className="space-y-4 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                <h2 className="text-sm font-semibold text-cocoa-700">{t('cooperative.transferLot')}</h2>
                <div className="grid gap-3 md:grid-cols-2">
                  {transferableLots.length === 0 ? (
                    <p className="text-sm text-cocoa-500">{t('common.noData')}</p>
                  ) : null}

                  {transferableLots.map((lot) => (
                    <label
                      key={lot.id}
                      className="flex items-center gap-2 rounded-lg border border-[rgba(0,0,0,0.1)] p-3"
                    >
                      <input
                        type="checkbox"
                        checked={
                          transferSelection[lot.id] ??
                          !['rejected', 'exported'].includes(lot.status)
                        }
                        onChange={(event) =>
                          setTransferSelection((previousSelection) => ({
                            ...previousSelection,
                            [lot.id]: event.target.checked,
                          }))
                        }
                      />
                      <span className="text-sm text-cocoa-700">
                        {lot.id} · {lot.weightKg} kg
                      </span>
                    </label>
                  ))}
                </div>

                <label className="block text-sm">
                  <span className="mb-1 block text-cocoa-500">{t('cooperative.partnerProcessor')}</span>
                  <select className="h-11 w-full rounded-lg border border-[rgba(0,0,0,0.1)] px-3">
                    <option>{transferPartner}</option>
                    <option>TogoBeans Industries</option>
                    <option>AgriProcess Togo</option>
                  </select>
                </label>

                <label className="block text-sm">
                  <span className="mb-1 block text-cocoa-500">{t('cooperative.departureWeightKg')}</span>
                  <input
                    type="number"
                    value={transferWeight}
                    onChange={(event) => setTransferWeight(Number(event.target.value) || 0)}
                    className="h-11 w-full rounded-lg border border-[rgba(0,0,0,0.1)] px-3"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleTransfer}
                  className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-cocoa-700 px-4 text-sm font-semibold text-white"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  {t('common.transfer')}
                </button>
              </section>
            ) : null}

            {activeTab === 'activity' ? (
              <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                <h2 className="mb-3 text-sm font-semibold text-cocoa-700">{t('cooperative.recentActivity')}</h2>
                <ul className="space-y-2">
                  {recentActivity.map((activity) => (
                    <li
                      key={`${activity.lotId}-${activity.step}`}
                      className="rounded-lg border border-[rgba(0,0,0,0.1)] p-3"
                    >
                      <p className="text-sm font-semibold text-cocoa-700">
                        {activity.actor} · {activity.lotId}
                      </p>
                      <p className="text-sm text-cocoa-500">{translateJourneyAction(activity.action, t)}</p>
                      <p className="text-xs text-cocoa-500">{formatDate(activity.date, i18n.language.startsWith('fr') ? 'fr' : 'en')}</p>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </main>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-4 border-t border-[rgba(0,0,0,0.1)] bg-white lg:hidden">
        {([
          ['dashboard', Building2],
          ['validation', CheckCircle],
          ['transfer', ArrowRightLeft],
          ['activity', Clock3],
        ] as Array<[CoopTab, typeof Building2]>).map(([tab, Icon]) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className="flex flex-col items-center justify-center gap-1"
          >
            <Icon
              className={`h-6 w-6 ${
                activeTab === tab ? 'text-brandGreen-500' : 'text-cocoa-700'
              }`}
            />
            <span
              className={`text-[11px] ${
                activeTab === tab
                  ? 'font-semibold text-brandGreen-700'
                  : 'text-cocoa-500'
              }`}
            >
              {tab === 'dashboard'
                ? t('cooperative.mobileDashboard')
                : tab === 'validation'
                  ? t('cooperative.mobileValidation')
                  : tab === 'transfer'
                    ? t('cooperative.mobileTransfer')
                    : t('cooperative.mobileActivity')}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}
