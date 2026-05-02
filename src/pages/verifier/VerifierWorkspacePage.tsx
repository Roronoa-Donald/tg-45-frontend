import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LotCard } from '../../components/LotCard'
import { StatusPill } from '../../components/StatusPill'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { useSync } from '../../hooks/useSync'
import { useToast } from '../../context/ToastContext'

export function VerifierWorkspacePage() {
  const { user } = useAuth()
  const { lots, refreshLots, updateLotOptimistically } = useLots()
  const { enqueueMutation } = useSync()
  const { showToast } = useToast()
  const [loadingLotId, setLoadingLotId] = useState<string | null>(null)

  const pendingLots = lots.filter((lot) => String(lot.status) === 'validated')
  const certifiedLots = lots.filter((lot) => String(lot.status) === 'certified')

  const certifyLot = async (lotId: string) => {
    try {
      setLoadingLotId(lotId)
      const effectiveLot = lots.find((lot) => lot.id === lotId)

      if (!effectiveLot) return showToast('Lot introuvable.', 'warning')
      if (String(effectiveLot.status) === 'certified') return showToast('Lot déjà certifié.', 'info')

      updateLotOptimistically(lotId, { status: 'certified' })
      await enqueueMutation({ type: 'certifyLot', payload: { lotId, certificateHash: `cert-${Date.now()}` } })
      showToast('Lot certifié avec succès.', 'success')
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
    if (targetStatus === 'certified') certifyLot(lotId)
  }

  return (
    <Stack gap="8">
      {/* ─── Header ─── */}
      <Flex justify="space-between" align="flex-end" wrap="wrap" gap="4">
        <Stack gap="2">
          <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-cocoa)">Bureau d'audit</Text>
          <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Vérificateur</Heading>
          <Text color="var(--cc-cocoa)" opacity="0.7">Certifiez les lots validés en les glissant vers la zone de certification.</Text>
        </Stack>
        <StatusPill value="idle" label={`Auditeur: ${user?.displayName || 'Anonyme'}`} />
      </Flex>

      {/* ─── Kanban Board ─── */}
      <Flex gap="6" overflowX="auto" pb="4" className="cc-slide-up">
        {/* Column 1: A certifier */}
        <Stack className="cc-kanban-col" onDragOver={(e) => e.preventDefault()}>
          <Flex justify="space-between" align="center" mb="4">
            <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Lots Validés</Heading>
            <StatusPill value="validated" label={String(pendingLots.length)} />
          </Flex>
          
          <Stack gap="4">
            {pendingLots.length === 0 ? (
              <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
                <Text color="var(--cc-cocoa)" opacity="0.5">Aucun lot en attente</Text>
              </Box>
            ) : null}
            
            {pendingLots.map((lot) => (
              <Box key={lot.id} draggable onDragStart={(e) => handleDragStart(e, lot.id)} cursor="grab" _active={{ cursor: 'grabbing' }} position="relative" transition="transform 0.2s" _hover={{ transform: 'translateY(-2px)' }}>
                <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
                <Box mt="2">
                  <button className="cc-btn-outline" style={{ width: '100%', padding: '8px', fontSize: '13px' }} onClick={() => certifyLot(lot.id)} disabled={loadingLotId !== null}>
                    {loadingLotId === lot.id ? 'Certification...' : '⭐ Certifier ce lot'}
                  </button>
                </Box>
              </Box>
            ))}
          </Stack>
        </Stack>

        {/* Column 2: Certifiés */}
        <Stack className="cc-kanban-col cc-drop-target" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'certified')} style={{ borderColor: '#27ae60', background: 'rgba(39, 174, 96, 0.04)' }}>
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
    </Stack>
  )
}
