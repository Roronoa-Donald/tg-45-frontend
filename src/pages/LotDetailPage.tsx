import { Box, Flex, Heading, HStack, Stack, Text, SimpleGrid } from '@chakra-ui/react'
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLots } from '../hooks/useLots'
import { EmptyState } from '../components/EmptyState'
import { StatusPill } from '../components/StatusPill'
import { formatLotEventLabel } from '../utils/lot-events'
import type { LotRecord } from '../domain/types'

export function LotDetailPage() {
  const { lotId } = useParams()
  const navigate = useNavigate()
  const { lots, draftLots, loadLot } = useLots()
  const [lot, setLot] = useState<LotRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!lotId) { setLoading(false); return }

    // Try local first
    const local = lots.find((l) => l.id === lotId || l.lotCode === lotId)
    if (local) { setLot(local); setLoading(false); return }

    // Try draft
    const draft = draftLots.find((d) => d.id === lotId)
    if (draft) { setLot(draft as unknown as LotRecord); setLoading(false); return }

    // Fetch from API
    void loadLot(lotId).then((result) => {
      setLot(result ?? null)
      setLoading(false)
    })
  }, [lotId, lots, draftLots, loadLot])

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="300px">
        <Text color="var(--cc-cocoa)" opacity="0.6">Chargement du lot...</Text>
      </Flex>
    )
  }

  if (!lot) {
    return <EmptyState title="Lot introuvable" description="Ce lot n'existe pas ou n'est plus accessible." actionLabel="Retour" onAction={() => navigate(-1)} />
  }

  const primaryImage = lot.images?.find((img) => img.isPrimary)?.url || lot.images?.[0]?.url
  const gpsLat = Number(lot.gpsOriginLat)
  const gpsLng = Number(lot.gpsOriginLng)

  return (
    <Stack gap="8" maxW="4xl" mx="auto" pb="12" className="cc-slide-up">
      {/* ─── Header ─── */}
      <Flex justify="space-between" align="center" wrap="wrap" gap="4">
        <HStack gap="3">
          <button className="cc-btn-outline" onClick={() => navigate(-1)} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px' }}>← Retour</button>
          <StatusPill value={String(lot.status)} />
          {draftLots.some((d) => d.id === lotId) ? <StatusPill value="offline" label="Brouillon local" /> : null}
        </HStack>
        <Text fontFamily="mono" fontSize="sm" color="var(--cc-cocoa)" opacity="0.6">ID: {lot.id}</Text>
      </Flex>

      {/* ─── Main Card ─── */}
      <Box className="cc-surface" borderRadius="var(--cc-radius-xl)" overflow="hidden">
        {/* Cover Image */}
        <Box position="relative" h={{ base: '200px', md: '300px' }} bg="var(--cc-cocoa-deep)">
          {primaryImage ? (
            <Box position="absolute" inset="0" backgroundImage={`url(${primaryImage})`} backgroundSize="cover" backgroundPosition="center" />
          ) : (
            <Box position="absolute" inset="0" bg="linear-gradient(135deg, var(--cc-cocoa-deep), var(--cc-olive))" />
          )}
          <Box position="absolute" inset="0" bg="linear-gradient(180deg, transparent 0%, rgba(28, 16, 10, 0.9) 100%)" />
          <Box position="absolute" bottom="0" left="0" p={{ base: '6', md: '8' }}>
            <Text textTransform="uppercase" letterSpacing="0.2em" fontSize="xs" fontWeight="700" color="var(--cc-gold)">{lot.product || 'Produit'}</Text>
            <Heading size="3xl" color="white" fontFamily="'Playfair Display', serif" mt="1">{lot.lotCode || 'Code non attribué'}</Heading>
          </Box>
        </Box>

        <Box p={{ base: '6', md: '8' }}>
          <Stack gap="8">
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="6">
              <Box>
                <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" mb="1">Propriétaire</Text>
                <Text fontSize="lg" fontWeight="700" color="var(--cc-cocoa-deep)">{lot.ownerName || '—'}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" mb="1">Variété</Text>
                <Text fontSize="lg" fontWeight="700" color="var(--cc-cocoa-deep)">{lot.variety || '—'}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" mb="1">Poids</Text>
                <Text fontSize="lg" fontWeight="700" color="var(--cc-cocoa-deep)">{lot.weightKg ?? 0} kg</Text>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" mb="1">Coordonnées GPS</Text>
                <Text fontSize="md" fontWeight="600" color="var(--cc-cocoa-deep)">{Number.isFinite(gpsLat) ? gpsLat.toFixed(4) : '—'}, {Number.isFinite(gpsLng) ? gpsLng.toFixed(4) : '—'}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" mb="1">Création</Text>
                <Text fontSize="md" fontWeight="600" color="var(--cc-cocoa-deep)">{lot.createdAt ? new Date(lot.createdAt).toLocaleString('fr-FR') : '—'}</Text>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" mb="1">Blockchain</Text>
                {lot.blockchainConfirmed ? <Text fontSize="md" fontWeight="600" color="var(--cc-success)">Confirmé</Text> : <Text fontSize="md" fontWeight="600" color="var(--cc-gold)">En attente</Text>}
              </Box>
            </SimpleGrid>

            {lot.events && lot.events.length > 0 && (
              <Box borderTop="1px solid var(--cc-line)" pt="6">
                <Heading size="md" mb="4" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Historique</Heading>
                <Stack gap="3">
                  {lot.events.map((event, idx) => (
                    <Flex key={idx} p="4" bg="rgba(255,255,255,0.4)" border="1px solid var(--cc-line)" borderRadius="var(--cc-radius-sm)" align="center" gap="4">
                      <Box w="2" h="2" borderRadius="full" bg="var(--cc-gold)" />
                      <Box flex="1">
                        <Text fontWeight="600" color="var(--cc-cocoa-deep)">{formatLotEventLabel(event.eventType || event.action)}</Text>
                        <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.7">{event.actorName || event.actorId} · {String(event.occurredAt || event.createdAt || '')}</Text>
                      </Box>
                    </Flex>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Box>
      </Box>
    </Stack>
  )
}
