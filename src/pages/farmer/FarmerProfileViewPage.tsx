import { Button, Heading, Stack, Text } from '@chakra-ui/react'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { useToast } from '../../context/ToastContext'

export function FarmerProfileViewPage() {
  const { user, logout } = useAuth()
  const { draftLots, syncSummary } = useLots()
  const { showToast } = useToast()

  const handleLogout = () => {
    logout()
    showToast('Session fermée.', 'info')
    window.location.href = '/'
  }

  return (
    <Stack gap="5" className="cc-surface" borderRadius="3xl" p="6">
      <Heading size="xl">Profil</Heading>
      <Text>Nom: {user?.displayName || '—'}</Text>
      <Text>Rôle: {user?.role || '—'}</Text>
      <Text>Identifiant: {user?.identifier || '—'}</Text>
      <Text>Brouillons locaux: {draftLots.length}</Text>
      <Text>File de synchro: {syncSummary.pending}</Text>
      <Button colorPalette="olive" alignSelf="flex-start" onClick={handleLogout}>Déconnexion</Button>
    </Stack>
  )
}
