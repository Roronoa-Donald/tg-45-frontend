import { Box, Flex, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import type { LotRecord } from '../domain/types'
import { StatusPill } from './StatusPill'
import { Leaf } from 'lucide-react'

export function LotCard({ lot, detailHref }: { lot: LotRecord; detailHref: string }) {
  const navigate = useNavigate()
  const primaryImage = lot.images?.find((image) => image.isPrimary)?.url || lot.images?.[0]?.url

  return (
    <Box 
      as="div" 
      role="button" 
      tabIndex={0} 
      onClick={() => navigate(detailHref)} 
      onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(detailHref) } }} 
      className="cc-surface cc-focus-ring" 
      borderRadius="var(--cc-radius-md)" 
      overflow="hidden" 
      textAlign="left" 
      cursor="pointer"
      position="relative"
    >
      {primaryImage ? (
        <Box position="relative" w="full" h="160px" overflow="hidden">
          <Image src={primaryImage} alt={lot.product || lot.lotCode || lot.id} objectFit="cover" w="full" h="full" transition="transform 0.5s var(--cc-transition)" _hover={{ transform: 'scale(1.05)' }} />
          <Box position="absolute" inset="0" bg="linear-gradient(180deg, transparent 40%, rgba(44, 24, 16, 0.8) 100%)" />
        </Box>
      ) : (
        <Box w="full" h="100px" bg="linear-gradient(135deg, rgba(196, 151, 58, 0.1), rgba(42, 110, 80, 0.05))" display="flex" alignItems="center" justifyContent="center">
          <Box color="var(--cc-gold)" opacity="0.3">
            <Leaf size={48} strokeWidth={1} />
          </Box>
        </Box>
      )}

      <Stack gap="3" p="4" position="relative">
        <HStack justify="space-between" align="start">
          <Stack gap="1" flex="1" minW="0">
            <Text fontSize="xs" fontWeight="700" letterSpacing="0.1em" color="var(--cc-gold)" textTransform="uppercase">
              {lot.product || 'Cacao'} {lot.variety ? `· ${lot.variety}` : ''}
            </Text>
            <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif" lineHeight="1.2">
              {lot.lotCode || lot.id}
            </Heading>
          </Stack>
        </HStack>

        <HStack gap="2" wrap="wrap" mt="1">
          <StatusPill value={String(lot.status)} />
          {lot.eudrStatus ? <StatusPill value={String(lot.eudrStatus)} /> : null}
          {lot.blockchainConfirmed ? <StatusPill value="online" label="Ancré" /> : <StatusPill value="idle" label="Attente Blockchain" />}
        </HStack>

        <Box pt="3" mt="1" borderTop="1px solid var(--cc-line)">
          <Flex justify="space-between" align="center">
            <Stack gap="0">
              <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.6">Propriétaire</Text>
              <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa-deep)">{lot.ownerName || 'Inconnu'}</Text>
            </Stack>
            <Stack gap="0" align="flex-end">
              <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.6">Poids</Text>
              <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa-deep)">{lot.weightKg ?? 0} kg</Text>
            </Stack>
          </Flex>
        </Box>
      </Stack>
    </Box>
  )
}
