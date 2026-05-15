import { useState, useEffect } from 'react'
import { MapPin, Star, QrCode, Download, RefreshCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { getReputationScore, getReputationHistory, generateFarmerQR } from '../../lib/api'
import { toast } from '../../lib/toast'

interface ReputationScore {
  userId: string
  score: number
  level: string
  updatedAt: string
}

interface ReputationEvent {
  id: string
  eventType: string
  points: number
  reason: string
  createdAt: string
}

export const FarmerProfilePageV2 = () => {
  const { t } = useTranslation()
  const { user, token } = useAuth()
  const [reputation, setReputation] = useState<ReputationScore | null>(null)
  const [reputationHistory, setReputationHistory] = useState<ReputationEvent[]>([])
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [loadingReputation, setLoadingReputation] = useState(false)
  const [loadingQR, setLoadingQR] = useState(false)

  useEffect(() => {
    if (token && user?.role === 'farmer') {
      loadReputation()
    }
  }, [token, user])

  const loadReputation = async () => {
    if (!token) return
    setLoadingReputation(true)
    try {
      const scoreData = await getReputationScore(token)
      setReputation(scoreData)

      const historyData = await getReputationHistory(token, undefined, 10)
      setReputationHistory((historyData.items || []) as unknown as ReputationEvent[])
    } catch (error) {
      console.error('Failed to load reputation:', error)
    } finally {
      setLoadingReputation(false)
    }
  }

  const handleGenerateQR = async () => {
    if (!token) return
    setLoadingQR(true)
    try {
      const result = await generateFarmerQR(token)
      setQrCodeUrl(result.qrCodeDataUrl)
      toast.success('Carte QR générée avec succès')
    } catch (error) {
      console.error('Failed to generate QR:', error)
      toast.error('Échec de la génération du QR code')
    } finally {
      setLoadingQR(false)
    }
  }

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `farmer-card-${user?.id}.png`
    link.click()
  }

  const getReputationColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      'lot_certified': 'Lot certifié',
      'lot_rejected_by_exporter': 'Lot rejeté par exportateur',
      'dispute_proven': 'Litige prouvé',
    }
    return labels[eventType] || eventType
  }

  return (
    <div className="space-y-4 p-4">
      {/* User Info Card */}
      <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-5">
        <div className="mb-4 flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cocoa-100 text-2xl font-bold text-cocoa-700">
            {user?.displayName?.charAt(0).toUpperCase() || 'F'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-cocoa-700">{user?.displayName || 'Agriculteur'}</h2>
            <p className="text-sm text-cocoa-500">{user?.identifier}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-cocoa-700">
          <p className="inline-flex items-center gap-2">
            <MapPin className="h-5 w-5 text-brandGreen-700" />
            Rôle: {user?.role}
          </p>
        </div>
      </section>

      {/* Reputation Card */}
      <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-cocoa-700">
            <Star className="h-5 w-5 text-yellow-500" />
            Score de Réputation
          </h3>
          <button
            onClick={loadReputation}
            disabled={loadingReputation}
            className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loadingReputation ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {reputation ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${getReputationColor(reputation.score)}`}>
                {reputation.score}
              </div>
              <div>
                <p className="text-sm text-gray-500">Niveau</p>
                <p className="font-semibold capitalize text-cocoa-700">{reputation.level}</p>
              </div>
            </div>

            {reputation.score < 50 && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                ⚠️ Votre score est critique. Contactez votre coopérative.
              </div>
            )}

            {/* History */}
            {reputationHistory.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="mb-2 text-sm font-semibold text-cocoa-700">Historique récent</h4>
                <div className="space-y-2">
                  {reputationHistory.map((event) => (
                    <div key={event.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-cocoa-700">{getEventTypeLabel(event.eventType)}</p>
                        {event.reason && <p className="text-xs text-gray-500">{event.reason}</p>}
                      </div>
                      <div className={`font-bold ${event.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {event.points > 0 ? '+' : ''}{event.points}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            {loadingReputation ? 'Chargement...' : 'Aucune donnée de réputation disponible'}
          </p>
        )}
      </section>

      {/* QR Card Section */}
      <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-5">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-cocoa-700">
          <QrCode className="h-5 w-5 text-cocoa-600" />
          Carte QR d'Identification
        </h3>

        {qrCodeUrl ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img src={qrCodeUrl} alt="QR Code Agriculteur" className="h-64 w-64 rounded-lg border" />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDownloadQR}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cocoa-600 px-4 py-2 text-white hover:bg-cocoa-700"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </button>
              <button
                onClick={handleGenerateQR}
                disabled={loadingQR}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-cocoa-600 px-4 py-2 text-cocoa-600 hover:bg-cocoa-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loadingQR ? 'animate-spin' : ''}`} />
                Régénérer
              </button>
            </div>
            <p className="text-xs text-gray-500">
              💡 Utilisez ce QR code pour vous connecter rapidement sans saisir vos identifiants.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Générez votre carte QR pour une identification rapide lors des livraisons.
            </p>
            <button
              onClick={handleGenerateQR}
              disabled={loadingQR}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-cocoa-600 px-4 py-3 text-white hover:bg-cocoa-700 disabled:opacity-50"
            >
              <QrCode className="h-5 w-5" />
              {loadingQR ? 'Génération...' : 'Générer ma carte QR'}
            </button>
          </div>
        )}
      </section>

      {/* Traceability Note */}
      <section className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-5">
        <p className="text-sm text-cocoa-500">
          {t('farmer.profileTraceabilityNote') || 'Toutes vos données sont enregistrées sur la blockchain pour garantir la traçabilité.'}
        </p>
      </section>
    </div>
  )
}
