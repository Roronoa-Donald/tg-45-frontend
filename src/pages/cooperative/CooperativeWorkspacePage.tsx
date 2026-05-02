import { Box, Button, Flex, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LotCard } from '../../components/LotCard'
import { StatusPill } from '../../components/StatusPill'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { useSync } from '../../hooks/useSync'
import { useToast } from '../../context/ToastContext'

export function CooperativeWorkspacePage() {
  const { user } = useAuth()
  const { lots, refreshLots, updateLotOptimistically } = useLots()
  const { enqueueMutation } = useSync()
  const { showToast } = useToast()
  const [transferTarget, setTransferTarget] = useState('')
  const [loadingLotId, setLoadingLotId] = useState<string | null>(null)

  const registeredLots = lots.filter((lot) => String(lot.status) === 'registered')
  const validatedLots = lots.filter((lot) => String(lot.status) === 'validated' || String(lot.status) === 'pending')

  const validateLot = async (lotId: string) => {
    try {
      setLoadingLotId(lotId)
      const effectiveLot = lots.find((lot) => lot.id === lotId)

      if (!effectiveLot) {
        showToast('Lot introuvable.', 'warning')
        return
      }

      if (String(effectiveLot.status) === 'validated') {
        showToast('Lot déjà validé.', 'info')
        return
      }

      if (['certified', 'rejected'].includes(String(effectiveLot.status))) {
        showToast('Statut incompatible pour validation.', 'warning')
        return
      }

      updateLotOptimistically(lotId, { status: 'validated' })
      await enqueueMutation({ type: 'updateVerificationStatus', payload: { lotId, status: 'validated', reason: 'Conforme' } })
      showToast('Validation envoyée.', 'success')
      await refreshLots()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur lors de la validation.', 'error')
    } finally {
      setLoadingLotId(null)
    }
  }

  const transferLotToPartner = async (lotId: string) => {
    if (!transferTarget.trim()) {
      showToast('Renseignez un destinataire.', 'warning')
      return
    }

    try {
      setLoadingLotId(lotId)
      updateLotOptimistically(lotId, { ownerId: transferTarget.trim() })
      await enqueueMutation({ type: 'transferLot', payload: { lotId, newOwnerId: transferTarget.trim() } })
      showToast('Transfert mis en file.', 'success')
      await refreshLots()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur lors du transfert.', 'error')
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

    if (targetStatus === 'validated') {
      validateLot(lotId)
    }
  }

  return (
    <Stack gap="5">
      <Stack className="cc-surface" borderRadius="3xl" p="6" gap="2">
        <Heading size="xl" color="var(--cc-cocoa-deep)">Espace coopérative</Heading>
        <Text color="fg.muted">Validez et transférez les lots par glisser-déposer.</Text>
        <StatusPill value="idle" label={user?.displayName || 'Coopérative'} />
      </Stack>

      <Stack className="cc-surface" borderRadius="2xl" p="4" gap="3">
        <Heading size="md" color="var(--cc-cocoa-deep)">Transfert rapide</Heading>
        <Input placeholder="ID du destinataire (Ex: exporter-uuid)" value={transferTarget} onChange={(event) => setTransferTarget(event.target.value)} variant="flushed" borderColor="var(--cc-gold)" _focus={{ borderColor: 'var(--cc-gold)' }} />
      </Stack>

      <Flex gap="6" overflowX="auto" pb="4" css={{ '&::-webkit-scrollbar': { height: '8px' }, '&::-webkit-scrollbar-thumb': { background: 'var(--cc-gold)', borderRadius: '4px' } }}>
        {/* Column 1: A valider */}
        <Stack flex="1" minW="320px" bg="rgba(61,36,24,0.04)" p="4" borderRadius="2xl" border="1px solid var(--cc-line)" onDragOver={(e) => e.preventDefault()}>
          <Heading size="md" mb="2" color="var(--cc-cocoa-deep)">À valider ({registeredLots.length})</Heading>
          {registeredLots.length === 0 ? <Text color="fg.muted" fontSize="sm">Aucun lot en attente.</Text> : null}
          {registeredLots.map((lot) => (
            <Box key={lot.id} draggable onDragStart={(e) => handleDragStart(e, lot.id)} cursor="grab" _active={{ cursor: 'grabbing' }} transition="transform 0.2s" _hover={{ transform: 'scale(1.02)' }}>
              <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
              <Button mt="3" w="full" colorPalette="amber" onClick={() => validateLot(lot.id)} loading={loadingLotId === lot.id} disabled={loadingLotId !== null && loadingLotId !== lot.id}>Valider ce lot</Button>
            </Box>
          ))}
        </Stack>

        {/* Column 2: Validés */}
        <Stack flex="1" minW="320px" bg="rgba(61,36,24,0.04)" p="4" borderRadius="2xl" border="1px dashed var(--cc-line)" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'validated')}>
          <Heading size="md" mb="2" color="var(--cc-cocoa-deep)">Validés ({validatedLots.length})</Heading>
          {validatedLots.length === 0 ? <Text color="fg.muted" fontSize="sm">Glissez un lot ici pour le valider.</Text> : null}
          {validatedLots.map((lot) => (
            <Box key={lot.id} transition="transform 0.2s" _hover={{ transform: 'scale(1.02)' }}>
              <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
              <Button mt="3" w="full" variant="outline" colorPalette="amber" onClick={() => transferLotToPartner(lot.id)} loading={loadingLotId === lot.id} disabled={loadingLotId !== null && loadingLotId !== lot.id}>Transférer le lot</Button>
            </Box>
          ))}
        </Stack>
      </Flex>
    </Stack>
  )
}
