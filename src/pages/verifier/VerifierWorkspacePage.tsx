import { Button, Heading, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LotCard } from '../../components/LotCard'
import { StatusPill } from '../../components/StatusPill'
import { useLots } from '../../hooks/useLots'
import { useSync } from '../../hooks/useSync'
import { useToast } from '../../context/ToastContext'

export function VerifierWorkspacePage() {
  const { lots, refreshLots } = useLots()
  const { enqueueMutation } = useSync()
  const { showToast } = useToast()
  const [selectedLotId, setSelectedLotId] = useState('')

  const selectedLot = lots.find((lot) => lot.id === selectedLotId || lot.lotCode === selectedLotId) || lots[0]

  const approveLot = async () => {
    if (!selectedLot) {
      return
    }

    const payloadHash = selectedLot.blockchainProofHash || `hash-${selectedLot.id.slice(0, 8)}`

    await enqueueMutation({ type: 'updateVerificationStatus', payload: { lotId: selectedLot.id, status: 'validated', reason: 'Traçabilité cohérente' } })
    await enqueueMutation({ type: 'submitVerificationProof', payload: { lotId: selectedLot.id, signature: 'verifier-signature', payloadHash } })
    await enqueueMutation({ type: 'certifyLot', payload: { lotId: selectedLot.id, signature: 'verifier-signature' } })
    showToast('Lot certifié en file.', 'success')
    await refreshLots()
  }

  return (
    <Stack gap="5">
      <Stack className="cc-surface" borderRadius="3xl" p="6" gap="2">
        <Heading size="xl">Espace vérificateur</Heading>
        <Text color="fg.muted">Inspection, preuve et certification en lecture métier claire.</Text>
        <StatusPill value="idle" label="Audit prêt" />
      </Stack>

      <Stack className="cc-surface" borderRadius="2xl" p="4" gap="3">
        <Heading size="md">Choisir un lot</Heading>
        <Input placeholder="LOT-2026-001" value={selectedLotId} onChange={(event) => setSelectedLotId(event.target.value)} />
      </Stack>

      {selectedLot ? (
        <Stack gap="4">
          <LotCard lot={selectedLot} detailHref={`/lots/${encodeURIComponent(selectedLot.id)}`} />
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="2">
            <Button colorPalette="olive" onClick={approveLot}>Approuver et certifier</Button>
            <Button variant="outline" onClick={() => enqueueMutation({ type: 'updateVerificationStatus', payload: { lotId: selectedLot.id, status: 'rejected', reason: 'À revoir' } })}>Rejeter</Button>
            <Button variant="outline" onClick={() => refreshLots()}>Rafraîchir</Button>
          </SimpleGrid>
        </Stack>
      ) : (
        <Text color="fg.muted">Aucun lot disponible.</Text>
      )}
    </Stack>
  )
}
