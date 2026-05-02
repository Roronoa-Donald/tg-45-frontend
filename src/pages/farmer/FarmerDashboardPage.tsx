import { Box, Flex, Heading, SimpleGrid, Stack, Text, Icon } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { StatusPill } from '../../components/StatusPill'
import { Package, Clock, CheckCircle, FileText, Award } from 'lucide-react'

function StatTile({ label, value, icon: IconCmp, accent = 'gold' }: { label: string; value: string; icon: any; accent?: 'gold' | 'olive' }) {
  return (
    <Stack className="cc-surface" borderRadius="var(--cc-radius-lg)" p="5" gap="3" position="relative" overflow="hidden" _hover={{ transform: 'translateY(-2px)' }} transition="transform 0.3s var(--cc-transition)">
      <Box position="absolute" right="-10px" top="-10px" opacity="0.05" transform="rotate(15deg)">
        <IconCmp size={80} strokeWidth={1.5} />
      </Box>
      <Flex justify="space-between" align="center">
        <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)" textTransform="uppercase" letterSpacing="0.05em">{label}</Text>
        <Box color={accent === 'gold' ? 'var(--cc-gold)' : 'var(--cc-olive)'} opacity="0.8">
          <IconCmp size={24} strokeWidth={1.5} />
        </Box>
      </Flex>
      <Heading size="2xl" color={accent === 'gold' ? 'var(--cc-gold)' : 'var(--cc-olive)'} fontFamily="'Inter', sans-serif" fontWeight="800">
        {value}
      </Heading>
    </Stack>
  )
}

export function FarmerDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lots, draftLots } = useLots()
  
  // Le backend filtre déjà par ownerId pour les agriculteurs
  const registeredCount = lots.filter((lot) => String(lot.status) === 'registered').length
  const validatedCount = lots.filter((lot) => String(lot.status) === 'validated').length
  const certifiedCount = lots.filter((lot) => String(lot.status) === 'certified').length
  const rejectedCount = lots.filter((lot) => String(lot.status) === 'rejected').length

  return (
    <Stack gap="8">
      {/* ─── Hero Welcome ─── */}
      <Box className="cc-surface" borderRadius="var(--cc-radius-xl)" p={{ base: '6', md: '10' }} position="relative" overflow="hidden">
        <Box position="absolute" right="-5%" top="-20%" width="300px" height="300px" bg="radial-gradient(circle, rgba(42, 110, 80, 0.1) 0%, transparent 70%)" />
        <Stack gap="5" position="relative" maxW="2xl">
          <Flex align="center" gap="3" wrap="wrap">
            <StatusPill value="online" label="Prêt pour la capture" />
            <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Synchronisation active</Text>
          </Flex>
          <Box>
            <Heading size="3xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif" mb="2">
              Bonjour, {user?.displayName || 'Agriculteur'}
            </Heading>
            <Text color="var(--cc-cocoa)" opacity="0.8" fontSize="lg" lineHeight="1.6">
              Bienvenue sur votre espace. Vous pouvez enregistrer de nouveaux lots de cacao, même hors connexion.
            </Text>
          </Box>
          <Box pt="2">
            <button className="cc-btn-gold" onClick={() => navigate('/farmer/new')}>
              + Déclarer un lot
            </button>
          </Box>
        </Stack>
      </Box>

      {/* ─── KPIs ─── */}
      <Box>
        <Heading size="md" mb="4" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Vue d'ensemble</Heading>
        <SimpleGrid columns={{ base: 2, lg: 5 }} gap="5">
          <StatTile label="Lots totaux" value={String(lots.length)} icon={Package} />
          <StatTile label="Enregistrés" value={String(registeredCount)} icon={Clock} />
          <StatTile label="Validés" value={String(validatedCount)} icon={CheckCircle} accent="olive" />
          <StatTile label="Certifiés" value={String(certifiedCount)} icon={Award} accent="olive" />
          <StatTile label="Brouillons" value={String(draftLots.length)} icon={FileText} />
        </SimpleGrid>
      </Box>
    </Stack>
  )
}
