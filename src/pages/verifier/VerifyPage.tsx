import {
  DEMO_RESET_EVENT,
  VERIFY_QUERY_STORAGE_KEY,
} from '../../constants/storageKeys'
import {
  AlertTriangle,
  Download,
  QrCode,
  Search,
  Shield,
  Sprout,
  Building2,
  Factory,
  Ship,
} from 'lucide-react'
import { Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { useEffect, useMemo, useState } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  Polyline,
  TileLayer,
} from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import { BlockchainBadge } from '../../components/BlockchainBadge'
import { DesktopTopBar } from '../../components/DesktopTopBar'
import { LanguageToggle } from '../../components/LanguageToggle'
import { SafeImage } from '../../components/SafeImage'
import { SafeQrCode } from '../../components/SafeQrCode'
import { useAppData } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatters'
import { getStorageJson, setStorageJson } from '../../utils/localStorage'

const roleIcons = [Sprout, Building2, Factory, Ship]

const translateJourneyRole = (role: string, t: (key: string) => string) => {
  if (role === 'Agriculteur' || role === 'farmer') {
    return t('journey.roles.farmer')
  }

  if (role === 'Cooperative' || role === 'cooperative') {
    return t('journey.roles.cooperative')
  }

  if (role === 'Transformateur' || role === 'processor') {
    return t('journey.roles.processor')
  }

  if (role === 'Exportateur' || role === 'exporter') {
    return t('journey.roles.exporter')
  }

  return role
}

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

export const VerifyPage = () => {
  const { t, i18n } = useTranslation()
  const { findLotById } = useAppData()
  const { showToast } = useToast()

  const [query, setQuery] = useState(() =>
    getStorageJson<string>(VERIFY_QUERY_STORAGE_KEY, ''),
  )
  const [searchedId, setSearchedId] = useState(() =>
    getStorageJson<string>(VERIFY_QUERY_STORAGE_KEY, ''),
  )
  const [isSimulatingScan, setIsSimulatingScan] = useState(false)

  useEffect(() => {
    setStorageJson(VERIFY_QUERY_STORAGE_KEY, searchedId)
  }, [searchedId])

  useEffect(() => {
    const handleDemoReset = () => {
      setQuery('')
      setSearchedId('')
    }

    window.addEventListener(DEMO_RESET_EVENT, handleDemoReset)

    return () => {
      window.removeEventListener(DEMO_RESET_EVENT, handleDemoReset)
    }
  }, [])

  const lot = useMemo(() => {
    if (!searchedId) {
      return undefined
    }

    return findLotById(searchedId)
  }, [findLotById, searchedId])

  const performSearch = (nextId: string) => {
    setSearchedId(nextId.trim().toUpperCase())
  }

  const simulateScan = () => {
    setIsSimulatingScan(true)

    window.setTimeout(() => {
      const scannedId = 'LOT-2026-001'
      setQuery(scannedId)
      setSearchedId(scannedId)
      setIsSimulatingScan(false)
    }, 1200)
  }

  const trajectory = lot?.journey.map((step) => [step.gps.lat, step.gps.lng] as [number, number])
  const mapCenter = lot
    ? ([lot.gpsOrigin.lat, lot.gpsOrigin.lng] as [number, number])
    : ([8.6195, 0.8248] as [number, number])

  return (
    <div className="min-h-screen bg-cream-light text-cocoa-700">
      <div className="fixed right-3 top-3 z-50 lg:hidden">
        <LanguageToggle />
      </div>

      <DesktopTopBar title={t('common.verifier')} roleLabel={t('common.verifier')} />

      <main className="mx-auto w-full max-w-[800px] space-y-5 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-5 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-cocoa-700">{t('verify.title')}</h1>
          <p className="mb-5 text-sm text-cocoa-500">{t('verify.subtitle')}</p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('verify.placeholder')}
                className="h-[52px] w-full rounded-lg border border-[rgba(0,0,0,0.1)] bg-white pl-10 pr-3 text-sm"
              />
            </label>
            <button
              type="button"
              onClick={() => performSearch(query)}
              className="h-[52px] rounded-lg bg-brandGreen-500 px-6 text-sm font-semibold text-white"
            >
              {t('common.verifyBatch')}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={simulateScan}
              disabled={isSimulatingScan}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-semibold text-cocoa-700"
            >
              <QrCode className="h-4 w-4" />
              {isSimulatingScan ? t('common.loading') : t('verify.scanQr')}
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('LOT-2026-001')
                performSearch('LOT-2026-001')
              }}
              className="text-xs text-brandGreen-700 underline"
            >
              {t('verify.tryExample')}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-cocoa-500">
            {t('verify.simulatedFormat')}: {Html5QrcodeSupportedFormats.QR_CODE}
          </p>
        </section>

        {searchedId ? (
          lot ? (
            <>
              <section className="rounded-xl border border-brandGreen-100 bg-brandGreen-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-brandGreen-700">
                    <Shield className="h-5 w-5" />
                    {t('verify.authentic')}
                  </p>
                  <BlockchainBadge hash={lot.blockchainHash} />
                </div>
              </section>

              <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <SafeImage
                    src={lot.imageUrl}
                    alt={lot.product}
                    className="h-32 w-full rounded-lg object-cover sm:w-48"
                  />
                  <div className="flex-1 space-y-1 text-sm">
                    <p className="text-lg font-semibold text-cocoa-700">{lot.id}</p>
                    <p>
                      {lot.product} · {lot.weightKg} kg
                    </p>
                    <p>
                      {t('common.farmer')}: {lot.farmerName}
                    </p>
                    <p>
                      {formatDate(lot.dateHarvest, i18n.language.startsWith('fr') ? 'fr' : 'en')}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {lot.certifications.map((certification) => (
                        <span
                          key={certification}
                          className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                            certification === 'Fairtrade'
                              ? 'border-ochre-100 bg-ochre-50 text-ochre-700'
                              : certification === 'Bio'
                                ? 'border-brandGreen-100 bg-brandGreen-50 text-brandGreen-700'
                                : 'border-cocoa-100 bg-cocoa-50 text-cocoa-700'
                          }`}
                        >
                          {certification}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl border border-[rgba(0,0,0,0.1)] bg-white">
                <div className="h-[350px] w-full md:h-[400px]">
                  <MapContainer center={mapCenter} zoom={7} className="h-full w-full">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {lot.journey.map((step) => (
                      <Marker
                        key={`${step.step}-${step.date}`}
                        position={[step.gps.lat, step.gps.lng]}
                      >
                        <Popup>
                          <strong>{step.actor}</strong>
                          <br />
                          {step.action}
                          <br />
                          {step.location}
                        </Popup>
                      </Marker>
                    ))}
                    {trajectory ? <Polyline pathOptions={{ color: '#1B6B3A' }} positions={trajectory} /> : null}
                  </MapContainer>
                </div>
              </section>

              <section className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                  <h2 className="mb-3 text-sm font-semibold text-cocoa-700">{t('verify.timeline')}</h2>
                  <ol className="space-y-3">
                    {lot.journey.map((step, index) => {
                      const Icon = roleIcons[index] ?? Ship

                      return (
                        <li
                          key={`${step.step}-${step.date}`}
                          className="reveal-item rounded-lg border border-[rgba(0,0,0,0.1)] p-3"
                          style={{ animationDelay: `${index * 80}ms` }}
                        >
                          <p className="mb-1 inline-flex items-center gap-2 text-xs font-semibold text-brandGreen-700">
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-brandGreen-500 text-[10px] text-white">
                              {step.step}
                            </span>
                            <Icon className="h-4 w-4" />
                            {translateJourneyRole(step.role, t)}
                          </p>
                          <p className="text-sm font-semibold text-cocoa-700">{step.actor}</p>
                          <p className="text-sm text-cocoa-500">{translateJourneyAction(step.action, t)}</p>
                          <p className="text-xs text-cocoa-500">
                            {formatDate(step.date, i18n.language.startsWith('fr') ? 'fr' : 'en')} · {step.location}
                          </p>
                        </li>
                      )
                    })}
                  </ol>
                </article>

                <article className="space-y-4">
                  <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                    <h2 className="mb-2 text-sm font-semibold text-cocoa-700">{t('verify.eudrCertificate')}</h2>
                    <p className="mb-3 text-sm text-cocoa-500">{t('verify.eudrBody')}</p>
                    <div className="mb-3 rounded-lg border border-brandGreen-100 bg-brandGreen-50 p-3 text-xs text-brandGreen-700">
                      {t('verify.originGps')}: {lot.gpsOrigin.lat.toFixed(4)}, {lot.gpsOrigin.lng.toFixed(4)}
                      <br />
                      {t('verify.deforestation')}: {t('verify.none')}
                    </div>
                    <button
                      type="button"
                      className="inline-flex min-h-12 items-center gap-2 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-semibold text-cocoa-700"
                    >
                      <Download className="h-4 w-4" />
                      {t('verify.download')}
                    </button>
                  </section>

                  <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                    <p className="mb-3 text-sm font-semibold text-cocoa-700">{t('farmer.share')}</p>
                    <div className="mb-3 inline-block rounded-lg border border-[rgba(0,0,0,0.1)] p-2">
                      <SafeQrCode value={lot.qrData} size={96} />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (navigator.clipboard) {
                            void navigator.clipboard.writeText(lot.qrData)
                          }

                          showToast(t('verify.linkCopied'))
                        }}
                        className="rounded-lg border border-[rgba(0,0,0,0.1)] px-3 py-2 text-xs font-semibold"
                      >
                        {t('common.copyLink')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showToast(t('verify.qrReady'))
                        }}
                        className="rounded-lg border border-[rgba(0,0,0,0.1)] px-3 py-2 text-xs font-semibold"
                      >
                        {t('common.printQr')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          showToast(t('verify.reportGenerated'))
                        }}
                        className="rounded-lg border border-[rgba(0,0,0,0.1)] px-3 py-2 text-xs font-semibold"
                      >
                        {t('common.reportPdf')}
                      </button>
                    </div>
                  </section>
                </article>
              </section>
            </>
          ) : (
            <section className="rounded-xl border border-errorRed-200 bg-errorRed-50 p-5 text-center">
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-errorRed-700" />
              <p className="text-sm font-semibold text-errorRed-700">{t('verify.invalid')}</p>
            </section>
          )
        ) : null}
      </main>
    </div>
  )
}
