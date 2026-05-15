import { Box, Flex, Heading, Stack, Text, Tabs, Input, Badge } from '@chakra-ui/react'
import { useState, useEffect, useCallback } from 'react'
import { LotCard } from '../../components/LotCard'
import { StatusPill } from '../../components/StatusPill'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import type { LotRecord } from '../../domain/types'
import {
  getPendingParcels,
  getPendingVerificationLots,
  getAutoValidatedLots,
  getSpotCheckLots,
  voteLot,
  contestLot,
} from '../../lib/api'

type ParcelValidation = {
  id: string
  parcelId: string
  status: string
  validUntil?: string
  parcel?: {
    id: string
    name?: string
    geometry?: unknown
    owner?: { name?: string }
  }
  photos?: Array<{
    id: string
    url: string
    gpsLat: number
    gpsLng: number
    isInsideParcel?: boolean
  }>
}

type VerificationLot = LotRecord & {
  verifications?: Array<{
    id: string
    vote: string
    verifierId: string
  }>
  voteDeadline?: string
  autoValidated?: boolean
  spotCheck?: boolean
}

const getGpsLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('GPS non supporté'))
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  })
}

export function VerifierWorkspacePage() {
  const { user, token } = useAuth()
  const { showToast } = useToast()

  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [acquiringGps, setAcquiringGps] = useState(false)

  // Data state
  const [pendingParcels, setPendingParcels] = useState<ParcelValidation[]>([])
  const [pendingVoteLots, setPendingVoteLots] = useState<VerificationLot[]>([])
  const [autoValidatedLots, setAutoValidatedLots] = useState<VerificationLot[]>([])
  const [spotCheckLots, setSpotCheckLots] = useState<VerificationLot[]>([])
  const [loading, setLoading] = useState(true)

  // Form state
  const [reasonByLot, setReasonByLot] = useState<Record<string, string>>({})
  const [contestReasonByLot, setContestReasonByLot] = useState<Record<string, string>>({})

  // Helper to normalize API response to array
  const normalizeApiResponse = <T,>(response: unknown): T[] => {
    if (Array.isArray(response)) return response as T[]
    if (response && typeof response === 'object') {
      const res = response as Record<string, unknown>
      if (Array.isArray(res.items)) return res.items as T[]
      if (res.data && typeof res.data === 'object') {
        const data = res.data as Record<string, unknown>
        if (Array.isArray(data.items)) return data.items as T[]
        if (Array.isArray(data)) return data as T[]
      }
    }
    return []
  }

  const refreshAll = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [parcelsRes, pendingRes, autoRes, spotRes] = await Promise.all([
        getPendingParcels(token),
        getPendingVerificationLots(token),
        getAutoValidatedLots(token),
        getSpotCheckLots(token),
      ])

      setPendingParcels(normalizeApiResponse<ParcelValidation>(parcelsRes))
      setPendingVoteLots(normalizeApiResponse<VerificationLot>(pendingRes))
      setAutoValidatedLots(normalizeApiResponse<VerificationLot>(autoRes))
      setSpotCheckLots(normalizeApiResponse<VerificationLot>(spotRes))
    } catch {
      showToast('Erreur lors du chargement des données.', 'error')
    } finally {
      setLoading(false)
    }
  }, [token, showToast])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  const handleVote = async (lotId: string, vote: 'approve' | 'reject') => {
    if (!token) return
    const reason = reasonByLot[lotId]?.trim()

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir ${vote === 'approve' ? 'approuver' : 'rejeter'} ce lot ?${reason ? `\n\nRaison: ${reason}` : ''}`
    )
    if (!confirmed) return

    try {
      setLoadingAction(lotId)
      setAcquiringGps(true)
      const gps = await getGpsLocation().catch(() => null)
      setAcquiringGps(false)

      if (!gps) {
        showToast('GPS indisponible — le vote continue sans coordonnées.', 'warning')
      }

      await voteLot(token, lotId, { vote, reason: reason || undefined })
      showToast(`Vote "${vote}" enregistré avec succès.`, 'success')
      await refreshAll()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors du vote.', 'error')
    } finally {
      setLoadingAction(null)
      setAcquiringGps(false)
    }
  }

  const handleContest = async (lotId: string) => {
    if (!token) return
    const reason = contestReasonByLot[lotId]?.trim()

    if (!reason || reason.length < 10) {
      showToast('La raison de contestation doit contenir au moins 10 caractères.', 'warning')
      return
    }

    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir contester ce lot auto-validé ?\n\nIl sera renvoyé au vote 51%.\n\nRaison: ${reason}`
    )
    if (!confirmed) return

    try {
      setLoadingAction(lotId)
      await contestLot(token, lotId, { reason })
      showToast('Lot contesté. Il sera soumis au vote.', 'success')
      await refreshAll()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la contestation.', 'error')
    } finally {
      setLoadingAction(null)
    }
  }

  const getVoteProgress = (lot: VerificationLot): { approve: number; reject: number; total: number } => {
    const verifications = lot.verifications || []
    const approve = verifications.filter((v) => v.vote === 'approve').length
    const reject = verifications.filter((v) => v.vote === 'reject').length
    return { approve, reject, total: verifications.length }
  }

  const getDeadlineStatus = (deadline?: string): 'ok' | 'warning' | 'danger' | null => {
    if (!deadline) return null
    const now = new Date()
    const dl = new Date(deadline)
    const hoursLeft = (dl.getTime() - now.getTime()) / (1000 * 60 * 60)
    if (hoursLeft < 0) return 'danger'
    if (hoursLeft < 24) return 'danger'
    if (hoursLeft < 48) return 'warning'
    return 'ok'
  }

  const handleDragStart = (e: React.DragEvent, lotId: string, action: string) => {
    e.dataTransfer.setData('lotId', lotId)
    e.dataTransfer.setData('action', action)
  }

  const handleDrop = (e: React.DragEvent, targetAction: string) => {
    e.preventDefault()
    const lotId = e.dataTransfer.getData('lotId')
    if (!lotId) return
    if (targetAction === 'approve') handleVote(lotId, 'approve')
    else if (targetAction === 'reject') handleVote(lotId, 'reject')
  }

  return (
    <Stack gap="8">
      {/* Header */}
      <Flex justify="space-between" align="flex-end" wrap="wrap" gap="4">
        <Stack gap="2">
          <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-cocoa)">
            Nouveau workflow
          </Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">
            Espace Vérificateur
          </Heading>
          <Text color="var(--cc-cocoa)" opacity="0.7">
            Validez les parcelles terrain et votez sur les lots.
          </Text>
        </Stack>
        <Flex gap="3" align="center">
          {acquiringGps && <span className="cc-gps-spinner">Acquisition GPS…</span>}
          <StatusPill value="idle" label={`Auditeur: ${user?.displayName || 'Anonyme'}`} />
        </Flex>
      </Flex>

      <Tabs.Root defaultValue="parcels" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="parcels">
            Parcelles terrain
            <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="var(--cc-gold)">
              ({pendingParcels.length})
            </Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="pending-vote">
            Lots en vote
            <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="var(--cc-primary)">
              ({pendingVoteLots.length})
            </Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="auto-validated">
            Auto-validés
            <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="cyan.500">
              ({autoValidatedLots.length})
            </Text>
          </Tabs.Trigger>
          <Tabs.Trigger value="spot-check">
            Spot-check
            <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="orange.500">
              ({spotCheckLots.length})
            </Text>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab: Parcelles terrain */}
        <Tabs.Content value="parcels" pt="6" px="0">
          <Stack className="cc-slide-up" gap="4">
            <Box p="4" bg="var(--cc-cream)" borderRadius="var(--cc-radius-md)" mb="4">
              <Heading size="md" color="var(--cc-cocoa-deep)" mb="2">
                Validation terrain des parcelles
              </Heading>
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.8">
                Déplacez-vous sur chaque parcelle assignée et prenez 3+ photos géolocalisées depuis l'intérieur.
                Cette fonctionnalité est optimisée pour l'application mobile.
              </Text>
            </Box>

            {loading ? (
              <Box p="8" textAlign="center">
                <Text color="var(--cc-cocoa)" opacity="0.5">Chargement...</Text>
              </Box>
            ) : pendingParcels.length === 0 ? (
              <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
                <Text fontSize="3xl" mb="2">🗺️</Text>
                <Text color="var(--cc-cocoa)" opacity="0.5">Aucune parcelle en attente de validation terrain</Text>
              </Box>
            ) : (
              <Stack gap="4">
                {pendingParcels.map((pv) => (
                  <Box
                    key={pv.id}
                    p="4"
                    bg="white"
                    borderRadius="var(--cc-radius-md)"
                    border="1px solid var(--cc-line)"
                  >
                    <Flex justify="space-between" align="center" mb="2">
                      <Text fontWeight="700" color="var(--cc-cocoa-deep)">
                        {pv.parcel?.name || `Parcelle ${pv.parcelId.slice(0, 8)}`}
                      </Text>
                      <Badge colorScheme="yellow">En attente</Badge>
                    </Flex>
                    <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">
                      Propriétaire: {pv.parcel?.owner?.name || 'Inconnu'}
                    </Text>
                    <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">
                      Photos: {pv.photos?.length || 0}/3 minimum
                    </Text>
                    <Text fontSize="xs" color="var(--cc-gold)" mt="2">
                      Utilisez l'application mobile pour la validation terrain
                    </Text>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </Tabs.Content>

        {/* Tab: Lots en vote 51% */}
        <Tabs.Content value="pending-vote" pt="6" px="0">
          <Flex gap="6" overflowX="auto" pb="4" className="cc-slide-up">
            {/* Colonne lots en attente */}
            <Stack className="cc-kanban-col" flex="1" minW="300px" onDragOver={(e) => e.preventDefault()}>
              <Flex justify="space-between" align="center" mb="4">
                <Heading size="md" color="var(--cc-cocoa-deep)">Lots en vote</Heading>
                <StatusPill value="pending" label={String(pendingVoteLots.length)} />
              </Flex>

              {loading ? (
                <Box p="8" textAlign="center">
                  <Text color="var(--cc-cocoa)" opacity="0.5">Chargement...</Text>
                </Box>
              ) : pendingVoteLots.length === 0 ? (
                <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
                  <Text fontSize="3xl" mb="2">🗳️</Text>
                  <Text color="var(--cc-cocoa)" opacity="0.5">Aucun lot en attente de vote</Text>
                </Box>
              ) : (
                <Stack gap="4">
                  {pendingVoteLots.map((lot) => {
                    const voteProgress = getVoteProgress(lot)
                    const deadlineStatus = getDeadlineStatus(lot.voteDeadline)

                    return (
                      <Box
                        key={lot.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lot.id, 'vote')}
                        cursor="grab"
                        _active={{ cursor: 'grabbing' }}
                        position="relative"
                        transition="transform 0.2s"
                        _hover={{ transform: 'translateY(-2px)' }}
                      >
                        {deadlineStatus && (
                          <Badge
                            position="absolute"
                            top="-8px"
                            right="8px"
                            colorScheme={deadlineStatus === 'danger' ? 'red' : deadlineStatus === 'warning' ? 'orange' : 'green'}
                            fontSize="10px"
                          >
                            {deadlineStatus === 'danger' ? 'URGENT' : deadlineStatus === 'warning' ? '48h' : 'OK'}
                          </Badge>
                        )}
                        <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
                        <Box mt="2" p="2" bg="var(--cc-cream)" borderRadius="var(--cc-radius-sm)">
                          <Text fontSize="xs" color="purple.600" fontWeight="600">
                            Votes: {voteProgress.approve} approuvé / {voteProgress.reject} rejeté
                          </Text>
                        </Box>
                        <Input
                          mt="2"
                          size="sm"
                          placeholder="Raison (optionnel)"
                          value={reasonByLot[lot.id] || ''}
                          onChange={(e) => setReasonByLot((prev) => ({ ...prev, [lot.id]: e.target.value }))}
                        />
                        <Flex mt="2" gap="2">
                          <button
                            className="cc-btn-outline"
                            style={{ flex: 1, padding: '8px', fontSize: '13px', background: '#10b981', color: 'white', border: 'none' }}
                            onClick={() => handleVote(lot.id, 'approve')}
                            disabled={loadingAction !== null}
                          >
                            {loadingAction === lot.id ? '...' : '✓ Approuver'}
                          </button>
                          <button
                            className="cc-btn-outline"
                            style={{ flex: 1, padding: '8px', fontSize: '13px', borderColor: 'var(--cc-danger)', color: 'var(--cc-danger)' }}
                            onClick={() => handleVote(lot.id, 'reject')}
                            disabled={loadingAction !== null}
                          >
                            {loadingAction === lot.id ? '...' : '✗ Rejeter'}
                          </button>
                        </Flex>
                      </Box>
                    )
                  })}
                </Stack>
              )}
            </Stack>

            {/* Zone de dépôt Approuver */}
            <Stack
              className="cc-kanban-col"
              flex="1"
              minW="200px"
              style={{ borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.04)' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'approve')}
            >
              <Heading size="md" color="#10b981" mb="4">Zone Approuver</Heading>
              <Box p="8" textAlign="center" border="2px dashed #10b981" borderRadius="var(--cc-radius-md)">
                <Text fontSize="3xl" mb="2">✓</Text>
                <Text color="#10b981" opacity="0.7">Glissez un lot ici pour l'approuver</Text>
              </Box>
            </Stack>

            {/* Zone de dépôt Rejeter */}
            <Stack
              className="cc-kanban-col"
              flex="1"
              minW="200px"
              style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.04)' }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, 'reject')}
            >
              <Heading size="md" color="#ef4444" mb="4">Zone Rejeter</Heading>
              <Box p="8" textAlign="center" border="2px dashed #ef4444" borderRadius="var(--cc-radius-md)">
                <Text fontSize="3xl" mb="2">✗</Text>
                <Text color="#ef4444" opacity="0.7">Glissez un lot ici pour le rejeter</Text>
              </Box>
            </Stack>
          </Flex>
        </Tabs.Content>

        {/* Tab: Auto-validés */}
        <Tabs.Content value="auto-validated" pt="6" px="0">
          <Stack className="cc-slide-up" gap="4">
            <Box p="4" bg="cyan.50" borderRadius="var(--cc-radius-md)" mb="4" borderLeft="4px solid" borderColor="cyan.500">
              <Heading size="md" color="var(--cc-cocoa-deep)" mb="2">
                Lots auto-validés
              </Heading>
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.8">
                Ces lots sont sur des parcelles déjà validées. Vous pouvez les contester si vous suspectez un problème.
              </Text>
            </Box>

            {loading ? (
              <Box p="8" textAlign="center">
                <Text color="var(--cc-cocoa)" opacity="0.5">Chargement...</Text>
              </Box>
            ) : autoValidatedLots.length === 0 ? (
              <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
                <Text fontSize="3xl" mb="2">✓</Text>
                <Text color="var(--cc-cocoa)" opacity="0.5">Aucun lot auto-validé</Text>
              </Box>
            ) : (
              <Stack gap="4">
                {autoValidatedLots.map((lot) => (
                  <Box
                    key={lot.id}
                    position="relative"
                    transition="transform 0.2s"
                    _hover={{ transform: 'translateY(-2px)' }}
                  >
                    <Badge position="absolute" top="-8px" right="8px" colorScheme="cyan" fontSize="10px">
                      AUTO-VALIDÉ
                    </Badge>
                    <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
                    <Input
                      mt="2"
                      size="sm"
                      placeholder="Raison de contestation (min 10 car.)"
                      value={contestReasonByLot[lot.id] || ''}
                      onChange={(e) => setContestReasonByLot((prev) => ({ ...prev, [lot.id]: e.target.value }))}
                    />
                    <Flex mt="2">
                      <button
                        className="cc-btn-outline"
                        style={{ flex: 1, padding: '8px', fontSize: '13px', background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b' }}
                        onClick={() => handleContest(lot.id)}
                        disabled={loadingAction !== null}
                      >
                        {loadingAction === lot.id ? '...' : '⚠ Contester ce lot'}
                      </button>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </Tabs.Content>

        {/* Tab: Spot-check */}
        <Tabs.Content value="spot-check" pt="6" px="0">
          <Stack className="cc-slide-up" gap="4">
            <Box p="4" bg="orange.50" borderRadius="var(--cc-radius-md)" mb="4" borderLeft="4px solid" borderColor="orange.500">
              <Heading size="md" color="var(--cc-cocoa-deep)" mb="2">
                Vérification spot-check (15%)
              </Heading>
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.8">
                Ces lots ont été sélectionnés aléatoirement pour une vérification obligatoire, même s'ils sont sur des parcelles validées.
              </Text>
            </Box>

            {loading ? (
              <Box p="8" textAlign="center">
                <Text color="var(--cc-cocoa)" opacity="0.5">Chargement...</Text>
              </Box>
            ) : spotCheckLots.length === 0 ? (
              <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
                <Text fontSize="3xl" mb="2">🔍</Text>
                <Text color="var(--cc-cocoa)" opacity="0.5">Aucun spot-check en attente</Text>
              </Box>
            ) : (
              <Stack gap="4">
                {spotCheckLots.map((lot) => (
                  <Box
                    key={lot.id}
                    position="relative"
                    transition="transform 0.2s"
                    _hover={{ transform: 'translateY(-2px)' }}
                    border="2px solid"
                    borderColor="orange.400"
                    borderRadius="var(--cc-radius-md)"
                    p="2"
                    bg="white"
                  >
                    <Badge colorScheme="orange" fontSize="10px" mb="2">
                      SPOT-CHECK OBLIGATOIRE
                    </Badge>
                    <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
                    <Input
                      mt="2"
                      size="sm"
                      placeholder="Raison (optionnel)"
                      value={reasonByLot[lot.id] || ''}
                      onChange={(e) => setReasonByLot((prev) => ({ ...prev, [lot.id]: e.target.value }))}
                    />
                    <Flex mt="2" gap="2">
                      <button
                        className="cc-btn-outline"
                        style={{ flex: 1, padding: '8px', fontSize: '13px', background: '#10b981', color: 'white', border: 'none' }}
                        onClick={() => handleVote(lot.id, 'approve')}
                        disabled={loadingAction !== null}
                      >
                        {loadingAction === lot.id ? '...' : '✓ Valider'}
                      </button>
                      <button
                        className="cc-btn-outline"
                        style={{ flex: 1, padding: '8px', fontSize: '13px', borderColor: 'var(--cc-danger)', color: 'var(--cc-danger)' }}
                        onClick={() => handleVote(lot.id, 'reject')}
                        disabled={loadingAction !== null}
                      >
                        {loadingAction === lot.id ? '...' : '✗ Rejeter'}
                      </button>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  )
}
