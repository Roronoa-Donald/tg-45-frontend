import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LotCard } from '../../components/LotCard'
import { StatusPill } from '../../components/StatusPill'

import { useLots } from '../../hooks/useLots'
import { useSync } from '../../hooks/useSync'
import { useToast } from '../../context/ToastContext'

export function CooperativeWorkspacePage() {
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

      if (!effectiveLot) return showToast('Lot introuvable.', 'warning')
      if (String(effectiveLot.status) === 'validated') return showToast('Lot déjà validé.', 'info')
      if (['certified', 'rejected'].includes(String(effectiveLot.status))) return showToast('Statut incompatible.', 'warning')

      updateLotOptimistically(lotId, { status: 'validated' })
      await enqueueMutation({ type: 'updateVerificationStatus', payload: { lotId, status: 'validated', reason: 'Conforme' } })
      showToast('Validation effectuée.', 'success')
      await refreshLots()
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Erreur.', 'error')
    } finally {
      setLoadingLotId(null)
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
          <Text color="var(--cc-cocoa)" opacity="0.7">Validez les lots reçus par glisser-déposer vers la colonne de droite.</Text>
        </Stack>
        <Box>
          <input 
            className="cc-input" 
            placeholder="ID du destinataire (Ex: exporter-uuid)" 
            value={transferTarget} 
            onChange={(event) => setTransferTarget(event.target.value)} 
            style={{ width: '250px', background: 'transparent' }}
          />
        </Box>
      </Flex>

      {/* ─── Kanban Board ─── */}
      <Flex gap="6" overflowX="auto" pb="4" className="cc-slide-up">
        {/* Column 1: A valider */}
        <Stack className="cc-kanban-col" onDragOver={(e) => e.preventDefault()}>
          <Flex justify="space-between" align="center" mb="4">
            <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">À valider</Heading>
            <StatusPill value="registered" label={String(registeredLots.length)} />
          </Flex>
          
          <Stack gap="4">
            {registeredLots.length === 0 ? (
              <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
                <Text color="var(--cc-cocoa)" opacity="0.5">Aucun lot en attente</Text>
              </Box>
            ) : null}
            
            {registeredLots.map((lot) => (
              <Box key={lot.id} draggable onDragStart={(e) => handleDragStart(e, lot.id)} cursor="grab" _active={{ cursor: 'grabbing' }} position="relative" transition="transform 0.2s" _hover={{ transform: 'translateY(-2px)' }}>
                <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
                <Box mt="2">
                  <button className="cc-btn-outline" style={{ width: '100%', padding: '8px', fontSize: '13px' }} onClick={() => validateLot(lot.id)} disabled={loadingLotId !== null}>
                    {loadingLotId === lot.id ? 'Validation...' : '✓ Valider ce lot'}
                  </button>
                </Box>
              </Box>
            ))}
          </Stack>
        </Stack>

        {/* Column 2: Validés */}
        <Stack className="cc-kanban-col cc-drop-target" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'validated')}>
          <Flex justify="space-between" align="center" mb="4">
            <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Lots Validés</Heading>
            <StatusPill value="validated" label={String(validatedLots.length)} />
          </Flex>

          <Stack gap="4">
            {validatedLots.length === 0 ? (
              <Box p="8" textAlign="center">
                <Text color="var(--cc-gold)" opacity="0.7">Glissez un lot ici pour le valider</Text>
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
    </Stack>
  )
}
