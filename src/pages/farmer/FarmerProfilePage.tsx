import { MapPin, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SafeImage } from '../../components/SafeImage'
import { useAppData } from '../../context/AppContext'
import { formatFcfa } from '../../utils/formatters'

export const FarmerProfilePage = () => {
  const { t, i18n } = useTranslation()
  const { farmers } = useAppData()

  const farmer = farmers[0]

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-5">
        <div className="mb-4 flex items-center gap-4">
          <SafeImage
            src={farmer.avatarUrl}
            alt={farmer.name}
            className="h-20 w-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-xl font-semibold text-cocoa-700">{farmer.name}</h2>
            <p className="text-sm text-cocoa-500">{farmer.id}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-cocoa-700">
          <p className="inline-flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brandGreen-700" />
            {farmer.region} · {farmer.cooperative}
          </p>
          <p className="inline-flex items-center gap-2">
            <Wallet className="h-5 w-5 text-brandGreen-700" />
            {formatFcfa(farmer.revenusAnnuelsFcfa, i18n.language.startsWith('fr') ? 'fr' : 'en')}
          </p>
          <p>GPS: {farmer.gps.lat.toFixed(4)} / {farmer.gps.lng.toFixed(4)}</p>
        </div>
      </section>

      <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-5">
        <p className="text-sm text-cocoa-500">
          {t('farmer.profileTraceabilityNote')}
        </p>
      </section>
    </div>
  )
}
