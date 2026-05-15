import { Box, Flex, Heading, Stack, Text, Tabs, Image, Input, Button, DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogBackdrop, DialogCloseTrigger } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { LotCard } from '../../components/LotCard'
import { StatusPill } from '../../components/StatusPill'
import { CooperativeFarmersTab } from './CooperativeFarmersTab'
import { CooperativeExportTab } from './CooperativeExportTab'

import { useLots } from '../../hooks/useLots'
import { useSync } from '../../hooks/useSync'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../hooks/useAuth'
import { loadActiveExporters } from '../../lib/api'
import type { LotRecord } from '../../domain/types'

type ExporterRecord = {
  id: string
  name?: string
  email?: string
}

const getGpsLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('GPS non supporté'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

export function CooperativeWorkspacePage() {
  const { lots, refreshLots, updateLotOptimistically } = useLots()
  const { enqueueMutation } = useSync()
  const { showToast } = useToast()
  const { token } = useAuth()
  const [transferTarget, setTransferTarget] = useState('')
  const [exporters, setExporters] = useState<ExporterRecord[]>([])
  const [loadingLotId, setLoadingLotId] = useState<string | null>(null)
  const [acquiringGps, setAcquiringGps] = useState(false)
  
  // Transcription Modal State
  const [isOpen, setIsOpen] = useState(false)
  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const [transcriptionLot, setTranscriptionLot] = useState<LotRecord | null>(null)
  const [transcriptionWeight, setTranscriptionWeight] = useState<string>('')

  const transcriptionPrimaryImage = transcriptionLot?.images?.find((image) => image.isPrimary)?.url
    || transcriptionLot?.images?.[0]?.url
  const transcriptionScaleImage = transcriptionLot?.images?.[1]?.url

  useEffect(() => {
    if (!token) return
    loadActiveExporters(token)
      .then((data) => setExporters(data as ExporterRecord[]))
      .catch(() => showToast('Erreur lors du chargement des exportateurs', 'error'))
  }, [token, showToast])

  const baseStatus = (status: string) => status.split(';')[0]
  const pendingWeighingLots = lots.filter((lot) => baseStatus(String(lot.status)) === 'registered' && lot.weightKg === 0)
  const registeredLots = lots.filter((lot) => baseStatus(String(lot.status)) === 'registered' && (lot.weightKg || 0) > 0)
  const validatedLots = lots.filter((lot) => ['validated', 'pending'].includes(baseStatus(String(lot.status))))
  const rejectedLots = lots.filter((lot) => baseStatus(String(lot.status)) === 'rejected')
  const certifiedLots = lots.filter((lot) => baseStatus(String(lot.status)) === 'certified')

  const openTranscription = (lot: LotRecord) => {
    setTranscriptionLot(lot)
    setTranscriptionWeight('')
    onOpen()
  }

  const submitTranscription = async () => {
    if (!transcriptionLot || !transcriptionWeight) return
    const weight = Number(transcriptionWeight)
    if (isNaN(weight) || weight <= 0) return showToast('Poids invalide', 'error')

    try {
      setLoadingLotId(transcriptionLot.id)
      updateLotOptimistically(transcriptionLot.id, { weightKg: weight })
      
      // En production, vous enverriez ceci via votre file de synchronisation (enqueueMutation)
      await enqueueMutation({ 
        type: 'updateLotDetails', 
        payload: { lotId: transcriptionLot.id, updates: { weightKg: weight } } 
      })
      
      showToast('Poids enregistré avec succès.', 'success')
      await refreshLots()
      onClose()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur.', 'error')
    } finally {
      setLoadingLotId(null)
    }
  }

  const validateLot = async (lotId: string) => {
    try {
      setLoadingLotId(lotId)
      const effectiveLot = lots.find((lot) => lot.id === lotId)

      if (!effectiveLot) return showToast('Lot introuvable.', 'warning')
      if (String(effectiveLot.status) === 'validated') return showToast('Lot déjà validé.', 'info')
      if (['certified', 'rejected'].includes(String(effectiveLot.status))) return showToast('Statut incompatible.', 'warning')

      setAcquiringGps(true)
      const gps = await getGpsLocation().catch(() => null);
      setAcquiringGps(false)

      if (!gps) {
        showToast('⚠️ GPS indisponible — la validation continue sans coordonnées.', 'warning')
      }

      updateLotOptimistically(lotId, { status: 'validated' })
      await enqueueMutation({ type: 'updateVerificationStatus', payload: { lotId, status: 'validated', reason: 'Conforme', ...(gps ? { gps } : {}) } })
      showToast('Validation effectuée.', 'success')
      await refreshLots()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur.', 'error')
    } finally {
      setLoadingLotId(null)
      setAcquiringGps(false)
    }
  }

  const rejectLot = async (lotId: string) => {
    try {
      setLoadingLotId(lotId)
      const effectiveLot = lots.find((lot) => lot.id === lotId)

      if (!effectiveLot) return showToast('Lot introuvable.', 'warning')
      if (['certified', 'rejected'].includes(String(effectiveLot.status))) return showToast('Statut incompatible.', 'warning')

      setAcquiringGps(true)
      const gps = await getGpsLocation().catch(() => null);
      setAcquiringGps(false)

      if (!gps) {
        showToast('⚠️ GPS indisponible — le refus continue sans coordonnées.', 'warning')
      }

      updateLotOptimistically(lotId, { status: 'rejected' })
      await enqueueMutation({ type: 'updateVerificationStatus', payload: { lotId, status: 'rejected', reason: 'Non conforme', ...(gps ? { gps } : {}) } })
      showToast('Lot refusé.', 'info')
      await refreshLots()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur.', 'error')
    } finally {
      setLoadingLotId(null)
      setAcquiringGps(false)
    }
  }

  const transferLotToPartner = async (lotId: string) => {
    if (!transferTarget.trim()) return showToast('Renseignez un destinataire.', 'warning')

    try {
      setLoadingLotId(lotId)
      updateLotOptimistically(lotId, { ownerId: transferTarget.trim() })
      await enqueueMutation({ type: 'transferLot', payload: { lotId, newOwnerId: transferTarget.trim() } })
      showToast('Transfert en cours.', 'success')
      await refreshLots()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur.', 'error')
    } finally {
      setLoadingLotId(null)
    }
  }

  const handleDragStart = (e: React.DragEvent, lotId: string) => {
    e.dataTransfer.setData('lotId', lotId)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    const lotId = e.dataTransfer.getData('lotId')
    if (!lotId) return

    if (targetStatus === 'validated') validateLot(lotId)
  }

  return (
    <Stack gap="8">
      {/* ─── Header ─── */}
      <Flex justify="space-between" align="flex-end" wrap="wrap" gap="4">
        <Stack gap="2">
          <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-gold)">Espace de travail</Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Coopérative</Heading>
          <Text color="var(--cc-cocoa)" opacity="0.7">Validez ou refusez les lots reçus. Glissez-déposez ou utilisez les boutons.</Text>
        </Stack>
        <Flex gap="3" align="center">
          {acquiringGps && <span className="cc-gps-spinner">Acquisition satellite…</span>}
          <select
            className="cc-input"
            value={transferTarget}
            onChange={(event) => setTransferTarget(event.target.value)}
            style={{ width: '280px', background: 'transparent' }}
          >
            <option value="">-- Choisir un exportateur --</option>
            {exporters.map(exp => (
              <option key={exp.id} value={exp.id}>{exp.name} ({exp.email})</option>
            ))}
          </select>
        </Flex>
      </Flex>

      <Tabs.Root defaultValue="pending-weighing" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="pending-weighing">Pesées en attente <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="red.500">({pendingWeighingLots.length})</Text></Tabs.Trigger>
          <Tabs.Trigger value="to-validate">À valider <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="var(--cc-gold)">({registeredLots.length})</Text></Tabs.Trigger>
          <Tabs.Trigger value="validated">Validés <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="var(--cc-olive)">({validatedLots.length})</Text></Tabs.Trigger>
          <Tabs.Trigger value="export">Exportation <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="var(--cc-gold)">({certifiedLots.length})</Text></Tabs.Trigger>
          <Tabs.Trigger value="farmers">Agriculteurs</Tabs.Trigger>
          <Tabs.Trigger value="rejected">Refusés</Tabs.Trigger>
        </Tabs.List>

          {/* Tab 0: Pesées */}
          <Tabs.Content value="pending-weighing" pt="6" px="0">
            <Flex gap="6" overflowX="auto" pb="4" className="cc-slide-up">
              <Stack className="cc-kanban-col" flex="1" onDragOver={(e) => e.preventDefault()}>
                <Flex justify="space-between" align="center" mb="4">
                  <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Lots en Attente de Pesée</Heading>
                  <StatusPill value="registered" label={String(pendingWeighingLots.length)} />
                </Flex>
                
                <Stack gap="4">
                  {pendingWeighingLots.length === 0 ? (
                    <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
                      <Text color="var(--cc-cocoa)" opacity="0.5">Aucune pesée en attente</Text>
                    </Box>
                  ) : null}
                  
                  {pendingWeighingLots.map((lot) => (
                    <Box key={lot.id} position="relative" transition="transform 0.2s" _hover={{ transform: 'translateY(-2px)' }}>
                      <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
                      <Flex mt="2" gap="2">
                        <button className="cc-btn-gold" style={{ flex: 1, padding: '8px', fontSize: '13px' }} onClick={() => openTranscription(lot)}>
                          👁️ Voir et Saisir Poids
                        </button>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Flex>
          </Tabs.Content>

          {/* Tab 1: À valider */}
          <Tabs.Content value="to-validate" pt="6" px="0">
            <Flex gap="6" overflowX="auto" pb="4" className="cc-slide-up">
              <Stack className="cc-kanban-col" flex="1" onDragOver={(e) => e.preventDefault()}>
                <Flex justify="space-between" align="center" mb="4">
                  <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Lots Enregistrés (Pesés)</Heading>
                  <StatusPill value="registered" label={String(registeredLots.length)} />
                </Flex>
                
                <Stack gap="4">
                  {registeredLots.length === 0 ? (
                    <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
                      <Text color="var(--cc-cocoa)" opacity="0.5">Aucun lot en attente de validation</Text>
                    </Box>
                  ) : null}
                  
                  {registeredLots.map((lot) => (
                    <Box key={lot.id} draggable onDragStart={(e) => handleDragStart(e, lot.id)} cursor="grab" _active={{ cursor: 'grabbing' }} position="relative" transition="transform 0.2s" _hover={{ transform: 'translateY(-2px)' }}>
                      <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
                      <Flex mt="2" gap="2">
                        <button className="cc-btn-outline" style={{ flex: 1, padding: '8px', fontSize: '13px' }} onClick={() => validateLot(lot.id)} disabled={loadingLotId !== null}>
                          {loadingLotId === lot.id ? '...' : '✓ Valider'}
                        </button>
                        <button className="cc-btn-outline" style={{ flex: 1, padding: '8px', fontSize: '13px', borderColor: 'var(--cc-danger)', color: 'var(--cc-danger)' }} onClick={() => rejectLot(lot.id)} disabled={loadingLotId !== null}>
                          {loadingLotId === lot.id ? '...' : '✗ Refuser'}
                        </button>
                      </Flex>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Flex>
          </Tabs.Content>

          {/* Tab 2: Validés */}
          <Tabs.Content value="validated" pt="6" px="0">
            <Flex gap="6" overflowX="auto" pb="4" className="cc-slide-up">
              <Stack className="cc-kanban-col cc-drop-target" flex="1" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'validated')}>
                <Flex justify="space-between" align="center" mb="4">
                  <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Lots Validés</Heading>
                  <StatusPill value="validated" label={String(validatedLots.length)} />
                </Flex>

                <Stack gap="4">
                  {validatedLots.length === 0 ? (
                    <Box p="8" textAlign="center">
                      <Text color="var(--cc-gold)" opacity="0.7">Aucun lot validé pour le moment</Text>
                    </Box>
                  ) : null}
                  
                  {validatedLots.map((lot) => (
                    <Box key={lot.id} position="relative" transition="transform 0.2s" _hover={{ transform: 'translateY(-2px)' }}>
                      <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
                      <Box mt="2">
                        <button className="cc-btn-outline" style={{ width: '100%', padding: '8px', fontSize: '13px', borderColor: 'var(--cc-gold)', color: 'var(--cc-gold)' }} onClick={() => transferLotToPartner(lot.id)} disabled={loadingLotId !== null}>
                          {loadingLotId === lot.id ? 'Transfert...' : '↗ Transférer au partenaire'}
                        </button>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </Flex>
          </Tabs.Content>

          {/* Tab 3: Refusés */}
          <Tabs.Content value="rejected" pt="6" px="0">
            <div className="cc-rejected-surface cc-slide-up">
              <Flex justify="space-between" align="center" mb="4">
                <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Lots Refusés</Heading>
                <StatusPill value="rejected" label={String(rejectedLots.length)} />
              </Flex>
              <Stack gap="4">
                {rejectedLots.length === 0 ? (
                  <Box p="8" textAlign="center" border="1px dashed rgba(231, 76, 60, 0.15)" borderRadius="var(--cc-radius-md)">
                    <Text color="var(--cc-cocoa)" opacity="0.5">Aucun lot refusé</Text>
                  </Box>
                ) : null}
                {rejectedLots.map((lot) => (
                  <Box key={lot.id} position="relative" transition="transform 0.2s" _hover={{ transform: 'translateY(-2px)' }} opacity="0.85">
                    <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
                  </Box>
                ))}
              </Stack>
            </div>
          </Tabs.Content>

          {/* Tab 4: Exportation */}
          <Tabs.Content value="export" pt="6" px="0">
            <div className="cc-slide-up">
              <CooperativeExportTab certifiedLots={certifiedLots} refreshLots={refreshLots} />
            </div>
          </Tabs.Content>

          {/* Tab 5: Agriculteurs */}
          <Tabs.Content value="farmers" pt="6" px="0">
            <div className="cc-slide-up">
              <Flex justify="space-between" align="center" mb="4">
                <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Approbation des agriculteurs</Heading>
              </Flex>
              <CooperativeFarmersTab />
            </div>
          </Tabs.Content>
      </Tabs.Root>

      {/* Transcription Modal */}
      <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="xl">
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>Transcription du Poids</DialogHeader>
          <DialogBody>
            {transcriptionLot && (
              <Stack gap={4}>
                <Text fontWeight="bold">Lot {transcriptionLot.id} - {transcriptionLot.ownerName || transcriptionLot.ownerId || '—'}</Text>
                
                <Flex gap={4} direction={{ base: 'column', md: 'row' }}>
                  <Box flex="1">
                    <Text fontSize="sm" mb={2}>Photo du lot</Text>
                    {transcriptionPrimaryImage ? (
                      <Image 
                        src={transcriptionPrimaryImage} 
                        borderRadius="md" 
                        objectFit="cover" 
                        h="200px" 
                        w="100%" 
                      />
                    ) : (
                      <Box h="200px" w="100%" bg="gray.100" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                        <Text color="gray.500" fontSize="sm">Pas de photo</Text>
                      </Box>
                    )}
                  </Box>
                  <Box flex="1">
                    <Text fontSize="sm" mb={2}>Photo de la balance</Text>
                    {transcriptionScaleImage ? (
                      <Image 
                        src={transcriptionScaleImage} 
                        borderRadius="md" 
                        objectFit="cover" 
                        h="200px" 
                        w="100%" 
                      />
                    ) : (
                      <Box h="200px" w="100%" bg="red.50" border="1px dashed red" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                        <Text color="red.500" fontSize="sm">Pas de balance</Text>
                      </Box>
                    )}
                  </Box>
                </Flex>

                <Box mt={4}>
                  <Text mb={2} fontWeight="bold">Saisir le poids final (en kg) :</Text>
                  <Input 
                    type="number" 
                    placeholder="Ex: 50.5" 
                    size="lg"
                    value={transcriptionWeight}
                    onChange={(e) => setTranscriptionWeight(e.target.value)}
                  />
                  {!transcriptionScaleImage && (
                    <Text fontSize="sm" color="red.500" mt={2}>
                      Attention : Le paysan n'a pas fourni de photo de balance. Vous devez peser ce lot vous-même.
                    </Text>
                  )}
                </Box>
              </Stack>
            )}
          </DialogBody>

          <DialogFooter>
            <DialogCloseTrigger asChild>
              <Button variant="ghost" mr={3}>
                Annuler
              </Button>
            </DialogCloseTrigger>
            <Button colorPalette="green" onClick={submitTranscription} loading={loadingLotId === transcriptionLot?.id}>
              Enregistrer le Poids
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Stack>
  )
}
