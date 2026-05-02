import { Badge, Box, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import type { LotRecord } from '../domain/types'
import { StatusPill } from './StatusPill'

export function LotCard({ lot, detailHref }: { lot: LotRecord; detailHref: string }) {
  const navigate = useNavigate()
  const primaryImage = lot.images?.find((image) => image.isPrimary)?.url || lot.images?.[0]?.url

  return (
    <Box as="div" role="button" tabIndex={0} onClick={() => navigate(detailHref)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(detailHref) } }} className="cc-surface cc-focus-ring" borderRadius="2xl" overflow="hidden" textAlign="left" cursor="pointer">
      {primaryImage ? <Image src={primaryImage} alt={lot.product || lot.lotCode || lot.id} objectFit="cover" w="full" h="180px" /> : null}
      <Stack gap="3" p="4">
        <HStack justify="space-between" align="start">
          <Stack gap="1" flex="1" minW="0">
            <Heading size="sm">{lot.lotCode || lot.id}</Heading>
            <Text fontSize="sm" color="fg.muted">{lot.ownerName || 'Lot sans propriétaire'} · {lot.weightKg ?? 0} kg</Text>
          </Stack>
          <StatusPill value={String(lot.status)} />
        </HStack>

        <HStack gap="2" wrap="wrap">
          <Badge colorPalette="amber" variant="subtle">{lot.product || 'Cacao'}</Badge>
          {lot.variety ? <Badge colorPalette="olive" variant="subtle">{lot.variety}</Badge> : null}
          {lot.blockchainConfirmed ? <Badge colorPalette="green" variant="subtle">Ancré</Badge> : <Badge colorPalette="orange" variant="subtle">En attente blockchain</Badge>}
        </HStack>

        <Text fontSize="sm" color="fg.muted">
          GPS {Number(lot.gpsOriginLat || 0).toFixed(4)}, {Number(lot.gpsOriginLng || 0).toFixed(4)} · {lot.createdAt ? new Date(lot.createdAt).toLocaleDateString('fr-FR') : 'date inconnue'}
        </Text>
      </Stack>
    </Box>
  )
}
