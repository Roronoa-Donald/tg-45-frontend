import { Box, Flex, Heading, Stack, Text, Tabs } from '@chakra-ui/react'
import { useState } from 'react'
import { LotCard } from '../../components/LotCard'
import { StatusPill } from '../../components/StatusPill'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { useSync } from '../../hooks/useSync'
import { useToast } from '../../context/ToastContext'

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

export function VerifierWorkspacePage() {
  const { user } = useAuth()
  const { lots, refreshLots, updateLotOptimistically } = useLots()
  const { enqueueMutation } = useSync()
  const { showToast } = useToast()
  const [loadingLotId, setLoadingLotId] = useState<string | null>(null)
  const [acquiringGps, setAcquiringGps] = useState(false)

  const pendingLots = lots.filter((lot) => String(lot.status) === 'validated')
  const certifiedLots = lots.filter((lot) => String(lot.status) === 'certified')
  const rejectedLots = lots.filter((lot) => String(lot.status) === 'rejected')

  const certifyLot = async (lotId: string) => {
    try {
      setLoadingLotId(lotId)
      const effectiveLot = lots.find((lot) => lot.id === lotId)

      if (!effectiveLot) return showToast('Lot introuvable.', 'warning')
      if (String(effectiveLot.status) === 'certified') return showToast('Lot déjà certifié.', 'info')

      setAcquiringGps(true)
      const gps = await getGpsLocation().catch(() => null);
      setAcquiringGps(false)

      if (!gps) {
        showToast('⚠️ GPS indisponible — la certification continue sans coordonnées.', 'warning')
      }

      updateLotOptimistically(lotId, { status: 'certified' })
      await enqueueMutation({ type: 'certifyLot', payload: { lotId, certificateHash: `cert-${Date.now()}`, ...(gps ? { gps } : {}) } })
      showToast('Lot certifié avec succès.', 'success')
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

  const handleDragStart = (e: React.DragEvent, lotId: string) => {
    e.dataTransfer.setData('lotId', lotId)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault()
    const lotId = e.dataTransfer.getData('lotId')
    if (!lotId) return
    if (targetStatus === 'certified') certifyLot(lotId)
  }

  return (
    <Stack gap="8">
      {/* ─── Header ─── */}
      <Flex justify="space-between" align="flex-end" wrap="wrap" gap="4">
        <Stack gap="2">
          <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-cocoa)">Bureau d'audit</Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Vérificateur</Heading>
          <Text color="var(--cc-cocoa)" opacity="0.7">Certifiez ou refusez les lots validés par les coopératives.</Text>
        </Stack>
        <Flex gap="3" align="center">
          {acquiringGps && <span className="cc-gps-spinner">Acquisition satellite…</span>}
          <StatusPill value="idle" label={`Auditeur: ${user?.displayName || 'Anonyme'}`} />
        </Flex>
      </Flex>

      <Tabs.Root defaultValue="to-certify" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="to-certify">À certifier <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="var(--cc-gold)">({pendingLots.length})</Text></Tabs.Trigger>
          <Tabs.Trigger value="certified">Certifiés <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="var(--cc-olive)">({certifiedLots.length})</Text></Tabs.Trigger>
          <Tabs.Trigger value="rejected">Refusés <Text as="span" ml="2" fontSize="xs" fontWeight="700" color="var(--cc-danger)">({rejectedLots.length})</Text></Tabs.Trigger>
        </Tabs.List>

          {/* Tab 1: À certifier */}
          <Tabs.Content value="to-certify" pt="6" px="0">
            <Flex gap="6" overflowX="auto" pb="4" className="cc-slide-up">
              <Stack className="cc-kanban-col" flex="1" onDragOver={(e) => e.preventDefault()}>
                <Flex justify="space-between" align="center" mb="4">
                  <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Lots Validés</Heading>
                  <StatusPill value="validated" label={String(pendingLots.length)} />
                </Flex>
                
                <Stack gap="4">
                  {pendingLots.length === 0 ? (
                    <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
                      <Text color="var(--cc-cocoa)" opacity="0.5">Aucun lot en attente de certification</Text>
                    </Box>
                  ) : null}
                  
                  {pendingLots.map((lot) => (
                    <Box key={lot.id} draggable onDragStart={(e) => handleDragStart(e, lot.id)} cursor="grab" _active={{ cursor: 'grabbing' }} position="relative" transition="transform 0.2s" _hover={{ transform: 'translateY(-2px)' }}>
                      <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
                      <Flex mt="2" gap="2">
                        <button className="cc-btn-outline" style={{ flex: 1, padding: '8px', fontSize: '13px' }} onClick={() => certifyLot(lot.id)} disabled={loadingLotId !== null}>
                          {loadingLotId === lot.id ? '...' : '⭐ Certifier'}
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

          {/* Tab 2: Certifiés */}
          <Tabs.Content value="certified" pt="6" px="0">
            <Flex gap="6" overflowX="auto" pb="4" className="cc-slide-up">
              <Stack className="cc-kanban-col" flex="1" style={{ borderColor: '#27ae60', background: 'rgba(39, 174, 96, 0.04)' }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'certified')}>
                <Flex justify="space-between" align="center" mb="4">
                  <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Certifiés (Ancrés)</Heading>
                  <StatusPill value="certified" label={String(certifiedLots.length)} />
                </Flex>

                <Stack gap="4">
                  {certifiedLots.length === 0 ? (
                    <Box p="8" textAlign="center">
                      <Text color="var(--cc-success)" opacity="0.7">Glissez un lot ici pour le certifier définitivement</Text>
                    </Box>
                  ) : null}
                  
                  {certifiedLots.map((lot) => (
                    <Box key={lot.id} position="relative" transition="transform 0.2s" _hover={{ transform: 'translateY(-2px)' }}>
                      <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
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
      </Tabs.Root>
    </Stack>
  )
}
