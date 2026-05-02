import { Box, Flex, Heading, SimpleGrid, Stack, Text, Icon } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { LotCard } from '../../components/LotCard'
import { EmptyState } from '../../components/EmptyState'
import { useLots } from '../../hooks/useLots'
import { useToast } from '../../context/ToastContext'
import { Search } from 'lucide-react'

export function FarmerLotsViewPage() {
  const { lots, draftLots, searchLots, refreshLots, error, loading } = useLots()
  const { showToast } = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')

  const results = useMemo(() => searchLots(query, status), [query, searchLots, status])

  const handleRefresh = async () => {
    try {
      await refreshLots()
      showToast('Liste mise à jour.', 'info')
    } catch (refreshError) {
      showToast(refreshError instanceof Error ? refreshError.message : 'Erreur.', 'error')
    }
  }

  return (
    <Stack gap="6">
      {/* ─── Header & Filters ─── */}
      <Box className="cc-surface" borderRadius="var(--cc-radius-xl)" p={{ base: '6', md: '8' }}>
        <Stack gap="5">
          <Flex justify="space-between" align="center" wrap="wrap" gap="4">
            <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Mes Lots</Heading>
            <button className="cc-btn-gold" onClick={() => { window.location.href = '/farmer/new' }}>
              + Nouveau Lot
            </button>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap="4" alignItems="center">
            <input 
              className="cc-input" 
              placeholder="Rechercher (code, variété...)" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
            />
            <select 
              className="cc-input" 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="all">Tous les statuts</option>
              <option value="registered">Enregistré</option>
              <option value="validated">Validé</option>
              <option value="certified">Certifié</option>
              <option value="shipped">Expédié</option>
              <option value="rejected">Rejeté</option>
            </select>
            <button className="cc-btn-outline" onClick={handleRefresh} disabled={loading}>
              {loading ? 'Rafraîchissement...' : 'Actualiser'}
            </button>
          </SimpleGrid>
        </Stack>
      </Box>

      {error ? <Text color="var(--cc-danger)" bg="rgba(192, 57, 43, 0.1)" p="3" borderRadius="md">{error}</Text> : null}

      <Flex justify="space-between" align="center" px="2">
        <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">{results.length} résultat(s)</Text>
        <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.6">{draftLots.length} brouillon(s) local(aux)</Text>
      </Flex>

      {/* ─── Grid ─── */}
      {results.length ? (
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="6" className="cc-stagger">
          {results.map((lot) => (
            <LotCard key={lot.id} lot={lot} detailHref={`/lots/${encodeURIComponent(lot.id)}`} />
          ))}
        </SimpleGrid>
      ) : (
        <Box className="cc-surface" borderRadius="var(--cc-radius-lg)" p="10" textAlign="center">
          <Flex justify="center" mb="4" color="var(--cc-cocoa)" opacity="0.3">
            <Search size={48} strokeWidth={1.5} />
          </Flex>
          <Heading size="md" mb="2" color="var(--cc-cocoa-deep)">Aucun lot trouvé</Heading>
          <Text color="var(--cc-cocoa)" opacity="0.7" mb="5">Essayez de modifier vos filtres ou créez un nouveau lot.</Text>
          <button className="cc-btn-outline" onClick={() => { window.location.href = '/farmer/new' }}>Créer un lot</button>
        </Box>
      )}
    </Stack>
  )
}
