import { Camera, Package, Shield, Sun, Weight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LotStatusBadge } from '../../components/LotStatusBadge'
import { useAppData } from '../../context/AppContext'
import { formatDate } from '../../utils/formatters'

export const FarmerHomePage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { farmers, lots } = useAppData()

  const farmer = farmers[0]
  const ownedLots = lots.filter((lot) => lot.farmerId === farmer.id)
  const recentLots = [...ownedLots]
    .sort((left, right) => (left.dateHarvest < right.dateHarvest ? 1 : -1))
    .slice(0, 3)
  const now = new Date()
  const monthlyWeight = ownedLots
    .filter((lot) => {
      const harvestDate = new Date(lot.dateHarvest)
      return (
        harvestDate.getFullYear() === now.getFullYear() &&
        harvestDate.getMonth() === now.getMonth()
      )
    })
    .reduce((total, lot) => total + lot.weightKg, 0)
  const compliantPercent = ownedLots.length
    ? Math.round(
        (ownedLots.filter((lot) => lot.eudrCompliant).length / ownedLots.length) * 100,
      )
    : 0

  const statCards = [
    {
      id: 'lots',
      icon: Package,
      value: String(ownedLots.length),
      label: t('farmer.registeredBatches'),
    },
    {
      id: 'weight',
      icon: Weight,
      value: `${monthlyWeight} kg`,
      label: t('farmer.thisMonth'),
    },
    {
      id: 'compliance',
      icon: Shield,
      value: `${compliantPercent}%`,
      label: t('farmer.compliance'),
    },
  ]

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-brandGreen-100 bg-brandGreen-50 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-lg font-semibold text-cocoa-700">{t('farmer.greeting', { name: farmer.name.split(' ')[0] })}</p>
            <p className="text-sm text-cocoa-500">
              {formatDate(new Date().toISOString(), i18n.language.startsWith('fr') ? 'fr' : 'en')} · {farmer.region}
            </p>
          </div>
          <Sun className="h-8 w-8 text-brandGreen-700" />
        </div>
        <span className="inline-flex rounded-full border border-ochre-100 bg-ochre-50 px-3 py-1 text-xs font-medium text-ochre-700">
          {t('common.modeOffline')}
        </span>
      </section>

      <button
        type="button"
        onClick={() => navigate('/farmer/new')}
        className="flex min-h-16 w-full items-center justify-center gap-3 rounded-xl bg-brandGreen-500 px-4 text-lg font-semibold text-white transition-all duration-150 ease-out hover:scale-[1.02]"
      >
        <Camera className="h-6 w-6" />
        {t('farmer.registerHarvest')}
      </button>

      <section className="grid gap-3 sm:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <article
              key={card.id}
              className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4"
            >
              <Icon className="mb-2 h-8 w-8 text-brandGreen-700" />
              <p className="text-2xl font-semibold text-cocoa-700">{card.value}</p>
              <p className="text-sm text-cocoa-500">{card.label}</p>
            </article>
          )
        })}
      </section>

      <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
        <h2 className="mb-4 text-base font-semibold text-cocoa-700">{t('farmer.recentLots')}</h2>
        <div className="space-y-3">
          {recentLots.map((lot) => (
            <article
              key={lot.id}
              className="flex items-center justify-between rounded-lg border border-[rgba(0,0,0,0.1)] p-3"
            >
              <div>
                <p className="text-sm font-semibold text-cocoa-700">{lot.id}</p>
                <p className="text-xs text-cocoa-500">
                  {formatDate(lot.dateHarvest, i18n.language.startsWith('fr') ? 'fr' : 'en')} · {lot.weightKg} kg
                </p>
              </div>
              <LotStatusBadge status={lot.status} />
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
