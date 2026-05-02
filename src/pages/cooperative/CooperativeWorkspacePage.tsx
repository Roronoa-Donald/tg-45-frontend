import { Button, Heading, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LotCard } from '../../components/LotCard'
import { StatusPill } from '../../components/StatusPill'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { useSync } from '../../hooks/useSync'
import { useToast } from '../../context/ToastContext'

export function CooperativeWorkspacePage() {
  const { user } = useAuth()
  const { lots, refreshLots } = useLots()
  const { enqueueMutation } = useSync()
  const { showToast } = useToast()
  const [transferTarget, setTransferTarget] = useState('')

  const incomingLots = lots.filter((lot) => ['registered', 'pending', 'in_transit'].includes(String(lot.status)))

  const validateLot = async (lotId: string) => {
    await enqueueMutation({ type: 'updateVerificationStatus', payload: { lotId, status: 'validated', reason: 'Conforme' } })
    showToast('Validation demandée.', 'success')
    await refreshLots()
  }

  const transferLotToPartner = async (lotId: string) => {
    if (!transferTarget.trim()) {
      showToast('Renseignez un destinataire.', 'warning')
      return
    }

    await enqueueMutation({ type: 'transferLot', payload: { lotId, newOwnerId: transferTarget.trim() } })
    showToast('Transfert mis en file.', 'success')
    await refreshLots()
  }

  return (
    <Stack gap="5">
      <Stack className="cc-surface" borderRadius="3xl" p="6" gap="2">
        <Heading size="xl">Espace coopérative</Heading>
        <Text color="fg.muted">Validez, transférez et suivez les lots entrants avec une file de reprise robuste.</Text>
        <StatusPill value="idle" label={user?.displayName || 'Coopérative'} />
      </Stack>

      <Stack className="cc-surface" borderRadius="2xl" p="4" gap="3">
        <Heading size="md">Transfert rapide</Heading>
        <Input placeholder="ID du prochain propriétaire" value={transferTarget} onChange={(event) => setTransferTarget(event.target.value)} />
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        {incomingLots.map((lot) => (
          <Stack key={lot.id} gap="3">
            <LotCard lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
            <SimpleGrid columns={2} gap="2">
              <Button colorPalette="olive" onClick={() => validateLot(lot.id)}>Valider</Button>
              <Button variant="outline" onClick={() => transferLotToPartner(lot.id)}>Transférer</Button>
            </SimpleGrid>
          </Stack>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
