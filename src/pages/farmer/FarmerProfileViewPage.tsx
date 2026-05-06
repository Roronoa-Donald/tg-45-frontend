import { Button, Heading, Stack, Text, Box, Flex, Select } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { useToast } from '../../context/ToastContext'
import { listCooperatives, sendJoinRequest } from '../../lib/api'

export function FarmerProfileViewPage() {
  const { user, token, logout } = useAuth()
  const { draftLots, syncSummary } = useLots()
  const { showToast } = useToast()

  const [cooperatives, setCooperatives] = useState<any[]>([])
  const [selectedCoop, setSelectedCoop] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (token) {
      listCooperatives(token)
        .then((data) => setCooperatives(data))
        .catch((err) => console.error('Failed to load cooperatives', err))
    }
  }, [token])

  const handleLogout = () => {
    logout()
    showToast('Session fermée.', 'info')
    window.location.href = '/'
  }

  const handleJoinRequest = async () => {
    if (!selectedCoop || !token) return
    setIsSubmitting(true)
    try {
      await sendJoinRequest(token, selectedCoop)
      showToast('Demande d\'adhésion envoyée avec succès.', 'success')
      // Refresh user context or show a message
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la demande', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Stack gap="5" className="cc-surface" borderRadius="3xl" p="6">
      <Heading size="xl">Profil</Heading>
      <Text>Nom: {user?.displayName || '—'}</Text>
      <Text>Rôle: {user?.role || '—'}</Text>
      <Text>Identifiant: {user?.identifier || '—'}</Text>
      <Text>Brouillons locaux: {draftLots.length}</Text>
      <Text>File de synchro: {syncSummary.pending}</Text>
      
      {!user?.cooperativeId && (
        <Box mt="4" p="4" border="1px solid var(--cc-line)" borderRadius="xl">
          <Heading size="sm" mb="3">Rejoindre une coopérative</Heading>
          <Text fontSize="sm" color="gray.600" mb="3">
            Vous n'êtes membre d'aucune coopérative. Sélectionnez-en une pour envoyer une demande d'adhésion.
          </Text>
          <Flex gap="3">
            <select 
              className="cc-input" 
              value={selectedCoop} 
              onChange={(e) => setSelectedCoop(e.target.value)}
              style={{ flex: 1 }}
            >
              <option value="">-- Sélectionner --</option>
              {cooperatives.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.region ? `(${c.region})` : ''}</option>
              ))}
            </select>
            <Button 
              colorPalette="gold" 
              onClick={handleJoinRequest} 
              disabled={!selectedCoop || isSubmitting}
            >
              Envoyer
            </Button>
          </Flex>
        </Box>
      )}

      <Button mt="4" colorPalette="olive" alignSelf="flex-start" onClick={handleLogout}>Déconnexion</Button>
    </Stack>
  )
}
