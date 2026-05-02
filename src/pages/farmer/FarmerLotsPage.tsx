import { Clock3, Link2, Truck } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BlockchainBadge } from '../../components/BlockchainBadge'
import { LotStatusBadge } from '../../components/LotStatusBadge'
import { SafeImage } from '../../components/SafeImage'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { useToast } from '../../context/ToastContext'
import type { LotStatus } from '../../types'
import { formatDate } from '../../utils/formatters'

const filters: Array<{ id: 'all' | LotStatus; icon: typeof Clock3 }> = [
  { id: 'all', icon: Clock3 },
  { id: 'in_transit', icon: Truck },
  { id: 'exported', icon: Link2 },
  { id: 'pending', icon: Clock3 },
]

export const FarmerLotsPage = () => {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const { lots, loading, error } = useLots()
  const { showToast } = useToast()
  const [activeFilter, setActiveFilter] = useState<'all' | LotStatus>('all')

  useEffect(() => {
    if (error) {
      showToast(`Erreur lors du chargement des lots: ${error}`, 'error')
    }
  }, [error, showToast])

  const filteredLots = useMemo(() => {
    // Filter lots owned by the current user
    const ownedLots = lots.filter((lot) => lot.ownerId === user?.id)

    if (activeFilter === 'all') {
      return ownedLots
    }

    return ownedLots.filter((lot) => (lot.status as LotStatus) === activeFilter)
  }, [activeFilter, user?.id, lots])

  return (
    <div className="space-y-4">
      <header className="overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
          {filters.map((filter) => {
            const Icon = filter.icon
            const active = activeFilter === filter.id
            const label =
              filter.id === 'all'
                ? t('farmer.allFilter')
                : t(`status.${filter.id}`)

            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`inline-flex min-h-12 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${
                  active
                    ? 'border-brandGreen-500 bg-brandGreen-50 text-brandGreen-700'
                    : 'border-[rgba(0,0,0,0.1)] bg-white text-cocoa-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            )
          })}
        </div>
      </header>

      {loading ? (
        <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-6 text-center">
          <p className="text-sm text-cocoa-500">Chargement de vos lots...</p>
        </section>
      ) : filteredLots.length === 0 ? (
        <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-6 text-center">
          <p className="mb-3 text-sm text-cocoa-500">
            {t('farmer.noLotsYet')}
          </p>
          <p className="text-xs text-cocoa-500">{t('farmer.oneAction')}</p>
          <p className="mt-2 text-xs text-cocoa-400">({lots.length} total, {filteredLots.length} filtrés)</p>
        </section>
      ) : (
        <section className="space-y-3">
          {filteredLots.map((lot) => (
            <article
              key={lot.id}
              className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-3"
            >
              <div className="flex gap-3">
                <SafeImage
                  src={lot.images?.[0]?.url || ''}
                  alt={lot.product || 'Lot image'}
                  className="h-[60px] w-[60px] rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-cocoa-700">{lot.lotCode || lot.id}</p>
                    <LotStatusBadge status={lot.status as LotStatus} />
                  </div>
                  <p className="text-xs text-cocoa-500">
                    {lot.product} · {lot.weightKg} kg
                  </p>
                  <p className="mb-2 text-xs text-cocoa-500">
                    {lot.harvestDate && formatDate(lot.harvestDate, i18n.language.startsWith('fr') ? 'fr' : 'en')}
                  </p>
                  <BlockchainBadge 
                    hash={lot.blockchainProofHash || undefined}
                    txHash={lot.blockchainTxHash || undefined}
                    status={lot.status as string}
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  )
}
