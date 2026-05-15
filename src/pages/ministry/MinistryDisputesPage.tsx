import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { listDisputes, getDispute, updateDisputeStatus, addDisputeNote, getDisputeStats } from '../../lib/api'
import { toast } from '../../lib/toast'

interface Dispute {
  id: string
  lotId: string
  reportedBy: string
  reportedAgainst: string
  reason: string
  status: string
  evidence?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  resolution?: string
  lot?: { lotCode: string; product: string }
  reporter?: { name: string }
  accused?: { name: string }
}

interface DisputeStats {
  total: number
  ouvert: number
  en_investigation: number
  resolu: number
  clos: number
}

export const MinistryDisputesPage = () => {
  const { token } = useAuth()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [stats, setStats] = useState<DisputeStats | null>(null)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [resolution, setResolution] = useState('')

  useEffect(() => {
    if (token) {
      loadDisputes()
      loadStats()
    }
  }, [token, filterStatus])

  const loadDisputes = async () => {
    if (!token) return
    setLoading(true)
    try {
      const filters = filterStatus !== 'all' ? { status: filterStatus } : {}
      const data = await listDisputes(token, filters)
      setDisputes((data.items || []) as unknown as Dispute[])
    } catch (error) {
      console.error('Failed to load disputes:', error)
      toast.error('Échec du chargement des litiges')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!token) return
    try {
      const data = await getDisputeStats(token)
      setStats(data as unknown as DisputeStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSelectDispute = async (disputeId: string) => {
    if (!token) return
    try {
      const data = await getDispute(token, disputeId)
      const dispute = data as unknown as Dispute
      setSelectedDispute(dispute)
      setResolution(dispute.resolution || '')
    } catch (error) {
      console.error('Failed to load dispute:', error)
      toast.error('Échec du chargement du litige')
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!token || !selectedDispute) return
    try {
      await updateDisputeStatus(token, selectedDispute.id, { status, resolution: resolution || undefined })
      toast.success('Statut mis à jour avec succès')
      setSelectedDispute({ ...selectedDispute, status, resolution })
      loadDisputes()
      loadStats()
    } catch (error) {
      console.error('Failed to update status:', error)
      toast.error('Échec de la mise à jour du statut')
    }
  }

  const handleAddNote = async () => {
    if (!token || !selectedDispute || !note.trim()) return
    try {
      await addDisputeNote(token, selectedDispute.id, note)
      toast.success('Note ajoutée avec succès')
      setNote('')
    } catch (error) {
      console.error('Failed to add note:', error)
      toast.error('Échec de l\'ajout de la note')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'ouvert': 'bg-red-100 text-red-700',
      'en_investigation': 'bg-yellow-100 text-yellow-700',
      'resolu': 'bg-green-100 text-green-700',
      'clos': 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactElement> = {
      'ouvert': <AlertTriangle className="h-4 w-4" />,
      'en_investigation': <Clock className="h-4 w-4" />,
      'resolu': <CheckCircle className="h-4 w-4" />,
      'clos': <XCircle className="h-4 w-4" />,
    }
    return icons[status] || <AlertTriangle className="h-4 w-4" />
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'ouvert': 'Ouvert',
      'en_investigation': 'En investigation',
      'resolu': 'Résolu',
      'clos': 'Clos',
      'prouve': 'Prouvé',
    }
    return labels[status] || status
  }

  return (
    <div className="p-4">
      <h1 className="mb-6 text-2xl font-bold text-cocoa-700">Gestion des Litiges</h1>

      {/* Stats Cards */}
      {stats && (
        <div className="mb-6 grid grid-cols-5 gap-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-cocoa-700">{stats.total}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Ouverts</p>
            <p className="text-2xl font-bold text-red-600">{stats.ouvert}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">En investigation</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.en_investigation}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Résolus</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolu}</p>
          </div>
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm text-gray-500">Clos</p>
            <p className="text-2xl font-bold text-gray-600">{stats.clos}</p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-4 flex gap-2">
        {['all', 'ouvert', 'en_investigation', 'resolu', 'clos'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              filterStatus === status
                ? 'bg-cocoa-600 text-white'
                : 'bg-white text-cocoa-600 hover:bg-cocoa-50'
            } border border-cocoa-600`}
          >
            {status === 'all' ? 'Tous' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Disputes List */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-gray-500">Chargement...</p>
          ) : disputes.length === 0 ? (
            <p className="text-center text-gray-500">Aucun litige trouvé</p>
          ) : (
            disputes.map((dispute) => (
              <div
                key={dispute.id}
                onClick={() => handleSelectDispute(dispute.id)}
                className={`cursor-pointer rounded-lg border bg-white p-4 hover:shadow-md ${
                  selectedDispute?.id === dispute.id ? 'border-cocoa-600 ring-2 ring-cocoa-200' : ''
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(dispute.status)}`}>
                    {getStatusIcon(dispute.status)}
                    {getStatusLabel(dispute.status)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(dispute.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="mb-1 text-sm font-semibold text-cocoa-700">
                  Lot: {dispute.lot?.lotCode || dispute.lotId}
                </p>
                <p className="text-xs text-gray-600">
                  Signalé par: {dispute.reporter?.name || dispute.reportedBy}
                </p>
                <p className="text-xs text-gray-600">
                  Contre: {dispute.accused?.name || dispute.reportedAgainst}
                </p>
                <p className="mt-2 line-clamp-2 text-sm text-gray-700">{dispute.reason}</p>
              </div>
            ))
          )}
        </div>

        {/* Dispute Detail */}
        <div className="rounded-lg border bg-white p-6">
          {selectedDispute ? (
            <div className="space-y-4">
              <div>
                <h2 className="mb-2 text-xl font-bold text-cocoa-700">Détails du Litige</h2>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(selectedDispute.status)}`}>
                  {getStatusIcon(selectedDispute.status)}
                  {getStatusLabel(selectedDispute.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <p><strong>ID:</strong> {selectedDispute.id}</p>
                <p><strong>Lot:</strong> {selectedDispute.lot?.lotCode || selectedDispute.lotId}</p>
                <p><strong>Signalé par:</strong> {selectedDispute.reporter?.name || selectedDispute.reportedBy}</p>
                <p><strong>Contre:</strong> {selectedDispute.accused?.name || selectedDispute.reportedAgainst}</p>
                <p><strong>Date:</strong> {new Date(selectedDispute.createdAt).toLocaleString('fr-FR')}</p>
              </div>

              <div>
                <h3 className="mb-1 font-semibold text-cocoa-700">Raison:</h3>
                <p className="text-sm text-gray-700">{selectedDispute.reason}</p>
              </div>

              {selectedDispute.evidence && (
                <div>
                  <h3 className="mb-1 font-semibold text-cocoa-700">Preuves:</h3>
                  <pre className="max-h-32 overflow-auto rounded-lg bg-gray-50 p-2 text-xs">
                    {JSON.stringify(selectedDispute.evidence, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-semibold text-cocoa-700">Résolution:</label>
                <textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full rounded-lg border p-2 text-sm"
                  rows={3}
                  placeholder="Décrivez la résolution..."
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus('en_investigation')}
                  disabled={selectedDispute.status === 'en_investigation'}
                  className="flex-1 rounded-lg bg-yellow-600 px-4 py-2 text-sm text-white hover:bg-yellow-700 disabled:opacity-50"
                >
                  Enquêter
                </button>
                <button
                  onClick={() => handleUpdateStatus('resolu')}
                  disabled={selectedDispute.status === 'resolu'}
                  className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Résoudre
                </button>
                <button
                  onClick={() => handleUpdateStatus('prouve')}
                  className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                >
                  Prouver
                </button>
                <button
                  onClick={() => handleUpdateStatus('clos')}
                  disabled={selectedDispute.status === 'clos'}
                  className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
                >
                  Clore
                </button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-cocoa-700">Ajouter une note:</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full rounded-lg border p-2 text-sm"
                  rows={2}
                  placeholder="Ajoutez une note interne..."
                />
                <button
                  onClick={handleAddNote}
                  disabled={!note.trim()}
                  className="mt-2 w-full rounded-lg bg-cocoa-600 px-4 py-2 text-sm text-white hover:bg-cocoa-700 disabled:opacity-50"
                >
                  Ajouter la note
                </button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              Sélectionnez un litige pour voir les détails
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
