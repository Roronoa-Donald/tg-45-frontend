import { Box, Button, Heading, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { LotCard } from '../../components/LotCard'
import { EmptyState } from '../../components/EmptyState'
import { useLots } from '../../hooks/useLots'

export function FarmerLotsViewPage() {
  const { lots, draftLots, searchLots } = useLots()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const results = useMemo(() => searchLots(query, status), [query, searchLots, status])

  return (
    <Stack gap="5">
      <Box className="cc-surface" borderRadius="3xl" p="6">
        <Stack gap="4">
          <Heading size="xl">Mes lots</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
            <Input placeholder="Rechercher un lot..." value={query} onChange={(event) => setQuery(event.target.value)} />
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="cc-surface" style={{ minHeight: '3rem', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
              <option value="all">Tous les statuts</option>
              <option value="registered">Enregistré</option>
              <option value="pending">En attente</option>
              <option value="validated">Validé</option>
              <option value="in_transit">En transit</option>
              <option value="certified">Certifié</option>
            </select>
            <Button colorPalette="olive" onClick={() => { window.location.href = '/farmer/new' }}>Nouveau lot</Button>
          </SimpleGrid>
        </Stack>
      </Box>

      <Text color="fg.muted">{draftLots.length} brouillon(s) local(aux) · {lots.length} lot(s) connus</Text>

      {results.length ? (
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          {results.map((lot) => (
            <LotCard key={lot.id} lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
          ))}
        </SimpleGrid>
      ) : (
        <EmptyState title="Aucun lot trouvé" description="Essayez un autre mot-clé ou créez un nouveau lot." actionLabel="Créer un lot" onAction={() => { window.location.href = '/farmer/new' }} />
      )}
    </Stack>
  )
}
