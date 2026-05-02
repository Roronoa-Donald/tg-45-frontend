import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useLots } from '../hooks/useLots'
import { EmptyState } from '../components/EmptyState'
import { StatusPill } from '../components/StatusPill'
import { formatLotEventLabel } from '../utils/lot-events'

export function LotDetailPage() {
  const { lotId } = useParams()
  const { loadLot } = useLots()
  const [lot, setLot] = useState<Awaited<ReturnType<typeof loadLot>> | null>(null)

  useEffect(() => {
    if (!lotId) {
      return
    }

    void loadLot(lotId).then(setLot)
  }, [loadLot, lotId])

  if (!lot) {
    return <EmptyState title="Lot introuvable" description="Le lot demandé est indisponible ou hors ligne." />
  }

  return (
    <Stack gap="5">
      <Stack gap="2" className="cc-surface" borderRadius="3xl" p="6">
        <Heading size="xl">{lot.lotCode || lot.id}</Heading>
        <StatusPill value={String(lot.status)} />
        <Text>Produit: {lot.product || '—'} · Variété: {lot.variety || '—'}</Text>
        <Text>Poids: {lot.weightKg || 0} kg · GPS {Number(lot.gpsOriginLat || 0).toFixed(4)}, {Number(lot.gpsOriginLng || 0).toFixed(4)}</Text>
        <Text>Preuve blockchain: {lot.blockchainProofHash || 'non disponible'}</Text>
        <Text>Transaction blockchain: {lot.blockchainTxHash || 'non disponible'}</Text>
        <Text>Blockchain: {lot.blockchainConfirmed ? 'ancrée' : 'non confirmée'}</Text>
      </Stack>

      <Box className="cc-surface" borderRadius="3xl" p="6">
        <Stack gap="3">
          <Heading size="md">Historique</Heading>
          {lot.events?.length ? lot.events.map((event, index) => (
            <Box key={`${lot.id}-${index}`} border="1px solid" borderColor="border" borderRadius="xl" p="3">
              <Text fontWeight="semibold">{formatLotEventLabel(event.eventType || event.action)}</Text>
              <Text fontSize="sm" color="fg.muted">{String(event.occurredAt || event.createdAt || 'Date inconnue')}</Text>
            </Box>
          )) : <Text color="fg.muted">Aucun événement disponible.</Text>}
        </Stack>
      </Box>
    </Stack>
  )
}
