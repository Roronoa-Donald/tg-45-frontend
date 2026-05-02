import { Button, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { StatusPill } from '../../components/StatusPill'

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Stack className="cc-surface" borderRadius="2xl" p="4" gap="1">
      <Text fontSize="sm" color="fg.muted">{label}</Text>
      <Heading size="lg">{value}</Heading>
    </Stack>
  )
}

export function FarmerDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lots, draftLots } = useLots()
  const farmerLots = lots.filter((lot) => lot.ownerId === user?.id || lot.ownerName === user?.displayName)
  const pendingCount = farmerLots.filter((lot) => String(lot.status) === 'pending').length
  const validatedCount = farmerLots.filter((lot) => String(lot.status) === 'validated').length

  return (
    <Stack gap="5">
      <Stack className="cc-surface" borderRadius="3xl" p="6" gap="3">
        <Text fontSize="sm" color="fg.muted">Bonjour {user?.displayName || 'utilisateur'}.</Text>
        <Heading size="xl">Votre espace agriculteur</Heading>
        <Text color="fg.muted">Capture photo-first, brouillons locaux et synchronisation reprise automatiquement lorsque le réseau revient.</Text>
        <StatusPill value="online" label="Prêt pour la capture" />
        <Button colorPalette="olive" size="lg" alignSelf="flex-start" onClick={() => navigate('/farmer/new')}>Créer un nouveau lot</Button>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
        <StatTile label="Lots enregistrés" value={String(farmerLots.length)} />
        <StatTile label="Lots validés" value={String(validatedCount)} />
        <StatTile label="Brouillons locaux" value={String(draftLots.length)} />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        <StatTile label="Lots en attente" value={String(pendingCount)} />
        <StatTile label="Synchronisation" value={String(farmerLots.length ? 'Active' : 'Prête')} />
      </SimpleGrid>
    </Stack>
  )
}
