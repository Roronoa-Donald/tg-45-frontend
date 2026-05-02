import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LotCard } from '../../components/LotCard'
import { StatusPill } from '../../components/StatusPill'
import { useLots } from '../../hooks/useLots'
import { useSync } from '../../hooks/useSync'
import { useToast } from '../../context/ToastContext'

export function VerifierWorkspacePage() {
  const { lots, refreshLots, updateLotOptimistically } = useLots()
  const { enqueueMutation } = useSync()
  const { showToast } = useToast()
  const [loadingLotId, setLoadingLotId] = useState<string | null>(null)

  const pendingLots = lots.filter((lot) => String(lot.status) === 'validated' || String(lot.status) === 'pending')
  const certifiedLots = lots.filter((lot) => String(lot.status) === 'certified')
  const rejectedLots = lots.filter((lot) => String(lot.status) === 'rejected')

  const approveLot = async (lotId: string) => {
    const effectiveLot = lots.find(l => l.id === lotId)
    if (!effectiveLot) return

    const payloadHash = effectiveLot.blockchainProofHash || `hash-${effectiveLot.id.slice(0, 8)}`

    try {
      setLoadingLotId(lotId)
      if (String(effectiveLot.status) === 'registered') {
        updateLotOptimistically(effectiveLot.id, { status: 'validated' })
        await enqueueMutation({ type: 'updateVerificationStatus', payload: { lotId: effectiveLot.id, status: 'validated', reason: 'Traçabilité cohérente' } })
      } else if (String(effectiveLot.status) === 'certified') {
        showToast('Lot déjà certifié.', 'info')
        return
      } else if (String(effectiveLot.status) === 'rejected') {
        showToast('Lot rejeté, impossible à certifier.', 'warning')
        return
      }

      updateLotOptimistically(effectiveLot.id, { status: 'certified' })
      await enqueueMutation({ type: 'submitVerificationProof', payload: { lotId: effectiveLot.id, signature: 'verifier-signature', payloadHash } })
      await enqueueMutation({ type: 'certifyLot', payload: { lotId: effectiveLot.id, signature: 'verifier-signature' } })
      showToast('Lot certifié en file.', 'success')
      await refreshLots()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur lors de la certification.', 'error')
    } finally {
      setLoadingLotId(null)
    }
  }

  const rejectLot = async (lotId: string) => {
    const selectedLot = lots.find(l => l.id === lotId)
    if (!selectedLot) return

    try {
      setLoadingLotId(lotId)
      updateLotOptimistically(selectedLot.id, { status: 'rejected' })
      await enqueueMutation({ type: 'updateVerificationStatus', payload: { lotId: selectedLot.id, status: 'rejected', reason: 'À revoir' } })
      showToast('Lot rejeté.', 'warning')
      await refreshLots()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur lors du rejet.', 'error')
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

    if (targetStatus === 'certified') {
      approveLot(lotId)
    } else if (targetStatus === 'rejected') {
      rejectLot(lotId)
    }
  }

  return (
    <Stack gap="5" h="full">
      <Stack className="cc-surface" borderRadius="3xl" p="6" gap="2">
        <Heading size="xl" className="cc-gold-text">Espace vérificateur</Heading>
        <Text color="fg.muted">Glissez les lots pour les certifier ou les rejeter.</Text>
        <StatusPill value="idle" label="Audit premium" />
      </Stack>

      <Flex gap="6" overflowX="auto" pb="4" css={{ '&::-webkit-scrollbar': { height: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'var(--cc-gold)', borderRadius: '4px' } }}>
        {/* Column 1: A auditer */}
        <Stack flex="1" minW="320px" bg="rgba(0,0,0,0.2)" p="4" borderRadius="2xl" border="1px solid rgba(255,255,255,0.05)" onDragOver={(e) => e.preventDefault()}>
          <Heading size="md" mb="2" color="var(--cc-cream)">À auditer ({pendingLots.length})</Heading>
          {pendingLots.length === 0 ? <Text color="fg.muted" fontSize="sm">Aucun lot en attente.</Text> : null}
          {pendingLots.map((lot) => (
            <Box key={lot.id} draggable onDragStart={(e) => handleDragStart(e, lot.id)} cursor="grab" _active={{ cursor: 'grabbing' }} transition="transform 0.2s" _hover={{ transform: 'scale(1.02)' }}>
              <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
              <Flex gap="2" mt="3">
                <Button flex="1" colorPalette="amber" onClick={() => approveLot(lot.id)} loading={loadingLotId === lot.id} disabled={loadingLotId !== null && loadingLotId !== lot.id}>Certifier</Button>
                <Button flex="1" variant="outline" colorPalette="red" onClick={() => rejectLot(lot.id)} loading={loadingLotId === lot.id} disabled={loadingLotId !== null && loadingLotId !== lot.id}>Rejeter</Button>
              </Flex>
            </Box>
          ))}
        </Stack>

        {/* Column 2: Certifiés */}
        <Stack flex="1" minW="320px" bg="rgba(0,0,0,0.2)" p="4" borderRadius="2xl" border="1px dashed rgba(185,139,74,0.4)" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'certified')}>
          <Heading size="md" mb="2" color="var(--cc-gold)">Certifiés ({certifiedLots.length})</Heading>
          {certifiedLots.length === 0 ? <Text color="fg.muted" fontSize="sm">Glissez un lot ici pour le certifier.</Text> : null}
          {certifiedLots.map((lot) => (
            <Box key={lot.id} transition="transform 0.2s" _hover={{ transform: 'scale(1.02)' }}>
              <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
            </Box>
          ))}
        </Stack>

        {/* Column 3: Rejetés */}
        <Stack flex="1" minW="320px" bg="rgba(0,0,0,0.2)" p="4" borderRadius="2xl" border="1px dashed rgba(200,50,50,0.4)" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'rejected')}>
          <Heading size="md" mb="2" color="red.400">Rejetés ({rejectedLots.length})</Heading>
          {rejectedLots.length === 0 ? <Text color="fg.muted" fontSize="sm">Glissez un lot ici pour le rejeter.</Text> : null}
          {rejectedLots.map((lot) => (
            <Box key={lot.id} transition="transform 0.2s" _hover={{ transform: 'scale(1.02)' }}>
              <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
            </Box>
          ))}
        </Stack>
      </Flex>
    </Stack>
  )
}
