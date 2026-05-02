import { CheckCircle, Link2, MapPin, Pencil, Share2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer } from 'react-leaflet'
import { useTranslation } from 'react-i18next'
import { SafeQrCode } from '../../components/SafeQrCode'
import { SafeImage } from '../../components/SafeImage'
import { imageBank } from '../../data/mockData'
import { useAppData } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import type { Lot } from '../../types'

const varieties = ['Forastero', 'Trinitario', 'Robusta', 'Arabica']

export const FarmerNewLotPage = () => {
  const { t } = useTranslation()
  const { farmers, lots, addLot } = useAppData()
  const { showToast } = useToast()
  const farmer = farmers[0]

  const [currentStep, setCurrentStep] = useState(1)
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoCaptured, setPhotoCaptured] = useState(false)
  const [createdLotId, setCreatedLotId] = useState('')
  const [createdLotQr, setCreatedLotQr] = useState('')

  const [form, setForm] = useState({
    product: 'Cacao' as 'Cacao' | 'Café',
    weightKg: 120,
    harvestDate: new Date().toISOString().slice(0, 10),
    variety: 'Forastero',
    quality: 'A',
    gps: farmer.gps,
  })

  const progressPercent = useMemo(() => (currentStep / 4) * 100, [currentStep])

  const capturePhoto = () => {
    setPhotoCaptured(false)
    setIsAnalyzingPhoto(true)

    window.setTimeout(() => {
      setPhotoCaptured(true)
      setForm((previousForm) => ({
        ...previousForm,
        product: 'Cacao',
        weightKg: 120,
        quality: 'A',
      }))
      setIsAnalyzingPhoto(false)
    }, 1500)
  }

  const adjustLocation = () => {
    setForm((previousForm) => ({
      ...previousForm,
      gps: {
        lat: Number((previousForm.gps.lat + 0.004).toFixed(4)),
        lng: Number((previousForm.gps.lng + 0.003).toFixed(4)),
      },
    }))
  }

  const submitLot = () => {
    setIsSubmitting(true)

    window.setTimeout(() => {
      let lotId = ''

      do {
        lotId = `LOT-${new Date().getFullYear()}-${String(
          Math.floor(100 + Math.random() * 900),
        )}`
      } while (lots.some((lot) => lot.id === lotId))

      const qrData = `https://chaincacao.tg/verify/${lotId}`

      const newLot: Lot = {
        id: lotId,
        qrData,
        farmerId: farmer.id,
        farmerName: farmer.name,
        product: form.product,
        variety: form.variety,
        weightKg: form.weightKg,
        gpsOrigin: form.gps,
        dateHarvest: form.harvestDate,
        status: 'registered',
        blockchainHash: `0x${Math.random().toString(16).slice(2, 34)}`,
        blockchainConfirmed: true,
        certifications: form.product === 'Cacao' ? ['Fairtrade'] : ['Rainforest Alliance'],
        eudrCompliant: true,
        imageUrl: form.product === 'Cacao' ? imageBank.lotCacao : imageBank.lotCoffee,
        journey: [
          {
            step: 1,
            actor: farmer.name,
            role: 'Agriculteur',
            action: 'Recolte enregistree',
            location: farmer.region,
            date: `${form.harvestDate}T08:30:00`,
            gps: form.gps,
            status: 'validated',
          },
        ],
      }

      addLot(newLot)
      setCreatedLotId(lotId)
      setCreatedLotQr(qrData)
      setIsSubmitting(false)

      showToast(t('farmer.blockchainRecorded'))
    }, 2300)
  }

  const shareCreatedLot = () => {
    if (navigator.clipboard && createdLotQr) {
      void navigator.clipboard.writeText(createdLotQr)
    }

    showToast(t('farmer.linkCopied'))
  }

  if (createdLotId) {
    return (
      <section className="rounded-xl border border-brandGreen-100 bg-brandGreen-50 p-5 text-center">
        <CheckCircle className="mx-auto mb-4 h-20 w-20 text-brandGreen-600" />
        <h2 className="mb-2 text-2xl font-semibold text-brandGreen-700">{t('farmer.lotRegistered')}</h2>
        <p className="mb-4 text-sm text-cocoa-700">{createdLotId}</p>
        <div className="mx-auto mb-5 w-fit rounded-lg border border-[rgba(0,0,0,0.1)] bg-white p-3">
          <SafeQrCode value={createdLotQr} size={128} />
        </div>
        <button
          type="button"
          onClick={shareCreatedLot}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-brandGreen-500 px-5 py-2 text-base font-semibold text-white"
        >
          <Share2 className="h-5 w-5" />
          {t('farmer.share')}
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-5">
      <header className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
        <div className="mb-4 h-2 rounded-full bg-cream-light">
          <div
            className="h-full rounded-full bg-brandGreen-500 transition-all duration-150 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold ${
                  currentStep >= step
                    ? 'border-brandGreen-500 bg-brandGreen-500 text-white'
                    : 'border-[rgba(0,0,0,0.1)] bg-white text-cocoa-500'
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>
      </header>

      {currentStep === 1 ? (
        <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
          <h2 className="mb-4 text-lg font-semibold text-cocoa-700">{t('farmer.step1')}</h2>
          <button
            type="button"
            onClick={capturePhoto}
            className="flex h-[250px] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-brandGreen-300 bg-brandGreen-50 text-brandGreen-700"
          >
            <MapPin className="mb-3 h-12 w-12" />
            <span className="text-base font-medium">{t('farmer.tapToCapture')}</span>
          </button>

          {isAnalyzingPhoto ? (
            <p className="mt-4 rounded-lg border border-[rgba(0,0,0,0.1)] bg-cream-light p-3 text-sm text-cocoa-700">
              {t('farmer.photoAnalysing')}
            </p>
          ) : null}

          {photoCaptured ? (
            <div className="mt-4 space-y-2 rounded-lg border border-brandGreen-100 bg-brandGreen-50 p-3 text-sm text-cocoa-700">
              <p>
                {t('farmer.detectedProduct')}: <strong>{form.product}</strong>
              </p>
              <p>
                {t('farmer.estimatedWeight')}: <strong>~{form.weightKg} kg</strong>
              </p>
              <p>
                {t('farmer.quality')}: <strong>{form.quality}</strong>
              </p>
              <p className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                GPS: {form.gps.lat.toFixed(4)}°N, {form.gps.lng.toFixed(4)}°E
              </p>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="inline-flex items-center gap-1 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-3 py-1 text-xs"
              >
                <Pencil className="h-4 w-4" /> {t('farmer.edit')}
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {currentStep === 2 ? (
        <section className="space-y-4 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
          <h2 className="text-lg font-semibold text-cocoa-700">{t('farmer.step2')}</h2>

          <div>
            <p className="mb-2 text-sm font-medium text-cocoa-700">{t('farmer.productLabel')}</p>
            <div className="grid grid-cols-2 gap-2">
              {(['Cacao', 'Café'] as const).map((product) => (
                <button
                  key={product}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, product }))}
                  className={`min-h-12 rounded-full border px-4 text-base font-semibold ${
                    form.product === product
                      ? 'border-brandGreen-500 bg-brandGreen-50 text-brandGreen-700'
                      : 'border-[rgba(0,0,0,0.1)] bg-white text-cocoa-700'
                  }`}
                >
                  {product}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-cocoa-700">{t('farmer.weightKgLabel')}</span>
            <input
              type="number"
              value={form.weightKg}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, weightKg: Number(event.target.value) || 0 }))
              }
              className="h-12 w-full rounded-lg border border-[rgba(0,0,0,0.1)] px-3 text-2xl font-semibold text-cocoa-700"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-cocoa-700">{t('farmer.harvestDateLabel')}</span>
            <input
              type="date"
              value={form.harvestDate}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, harvestDate: event.target.value }))
              }
              className="h-12 w-full rounded-lg border border-[rgba(0,0,0,0.1)] px-3 text-base text-cocoa-700"
            />
          </label>

          <div>
            <p className="mb-2 text-sm font-medium text-cocoa-700">{t('farmer.varietyLabel')}</p>
            <div className="grid grid-cols-2 gap-2">
              {varieties.map((variety) => (
                <button
                  key={variety}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, variety }))}
                  className={`min-h-12 rounded-full border px-4 text-sm font-semibold ${
                    form.variety === variety
                      ? 'border-brandGreen-500 bg-brandGreen-50 text-brandGreen-700'
                      : 'border-[rgba(0,0,0,0.1)] bg-white text-cocoa-700'
                  }`}
                >
                  {variety}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {currentStep === 3 ? (
        <section className="space-y-4 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
          <h2 className="text-lg font-semibold text-cocoa-700">{t('farmer.step3')}</h2>
          <div className="h-[250px] overflow-hidden rounded-lg border border-[rgba(0,0,0,0.1)]">
            <MapContainer
              center={[form.gps.lat, form.gps.lng]}
              zoom={12}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[form.gps.lat, form.gps.lng]} />
            </MapContainer>
          </div>
          <p className="rounded-lg border border-[rgba(0,0,0,0.1)] bg-cream-light p-3 text-sm text-cocoa-700">
            GPS: {form.gps.lat.toFixed(4)}°N, {form.gps.lng.toFixed(4)}°E · {farmer.region}
          </p>
          <button
            type="button"
            onClick={adjustLocation}
            className="min-h-12 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-semibold text-cocoa-700"
          >
            {t('farmer.adjust')}
          </button>
        </section>
      ) : null}

      {currentStep === 4 ? (
        <section className="space-y-4 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
          <h2 className="text-lg font-semibold text-cocoa-700">{t('farmer.step4')}</h2>
          <div className="rounded-lg border border-[rgba(0,0,0,0.1)] p-3">
            <SafeImage
              src={form.product === 'Cacao' ? imageBank.lotCacao : imageBank.lotCoffee}
              alt={form.product}
              className="mb-3 h-24 w-full rounded-lg object-cover"
            />
            <ul className="space-y-2 text-sm text-cocoa-700">
              <li>{t('common.product')}: {form.product}</li>
              <li>{t('common.weight')}: {form.weightKg} kg</li>
              <li>{t('common.date')}: {form.harvestDate}</li>
              <li>{t('farmer.varietyLabel')}: {form.variety}</li>
              <li>
                GPS: {form.gps.lat.toFixed(4)}°N, {form.gps.lng.toFixed(4)}°E
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-brandGreen-100 bg-brandGreen-50 p-3 text-sm text-brandGreen-700">
            <p className="mb-1 inline-flex items-center gap-2 font-semibold">
              <Link2 className="h-4 w-4" /> {t('common.blockchain')}
            </p>
            <p>{t('farmer.blockchainExplain')}</p>
          </div>

          <button
            type="button"
            onClick={submitLot}
            disabled={isSubmitting}
            className="flex min-h-16 w-full items-center justify-center rounded-xl bg-brandGreen-500 px-4 text-lg font-semibold text-white disabled:opacity-70"
          >
            {isSubmitting ? t('farmer.submittingLot') : t('farmer.submitLot')}
          </button>
        </section>
      ) : null}

      {!createdLotId ? (
        <footer className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentStep((step) => Math.max(1, step - 1))}
            disabled={currentStep === 1}
            className="min-h-12 flex-1 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-4 text-sm font-semibold text-cocoa-700 disabled:opacity-50"
          >
            {t('farmer.previous')}
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep((step) => Math.min(4, step + 1))}
            disabled={currentStep === 4 || (currentStep === 1 && !photoCaptured)}
            className="min-h-12 flex-1 rounded-lg bg-brandGreen-500 px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {t('farmer.next')}
          </button>
        </footer>
      ) : null}
    </div>
  )
}
