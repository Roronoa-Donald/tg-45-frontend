import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { loadPendingFarmers, approveFarmer } from '../../lib/api'

type PendingFarmer = {
  id: string
  name?: string
  phone?: string
  farmName?: string
  location?: string
}

export function CooperativeFarmersTab() {
  const { token, user } = useAuth()
  const { showToast } = useToast()
  const [farmers, setFarmers] = useState<PendingFarmer[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token || !user?.cooperativeId) return
    try {
      const data = await loadPendingFarmers(token, user.cooperativeId)
      setFarmers(data as PendingFarmer[])
    } catch {
      showToast('Erreur lors du chargement des agriculteurs', 'error')
    }
  }, [showToast, token, user?.cooperativeId])

  useEffect(() => {
    void load()
  }, [load])

  const handleApprove = async (farmerId: string) => {
    if (!token || !user?.cooperativeId) return
    setLoadingId(farmerId)
    try {
      await approveFarmer(token, user.cooperativeId, farmerId)
      showToast('Agriculteur approuvé avec succès !', 'success')
      load()
    } catch {
      showToast("Erreur lors de l'approbation", 'error')
    } finally {
      setLoadingId(null)
    }
  }

  if (farmers.length === 0) {
    return (
      <Box p="8" textAlign="center" border="1px dashed var(--cc-line)" borderRadius="var(--cc-radius-md)">
        <Text color="var(--cc-cocoa)" opacity="0.5">Aucun agriculteur en attente d'approbation.</Text>
      </Box>
    )
  }

  return (
    <Stack gap="4">
      {farmers.map((farmer) => (
        <Flex key={farmer.id} className="cc-surface" p="5" borderRadius="var(--cc-radius-md)" justify="space-between" align="center" border="1px solid var(--cc-line)">
          <Stack gap="1">
            <Heading size="sm" color="var(--cc-cocoa-deep)">{farmer.name || 'Sans nom'}</Heading>
            <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.8">📞 {farmer.phone} · {farmer.farmName || 'Ferme non spécifiée'} ({farmer.location || 'Localisation non spécifiée'})</Text>
          </Stack>
          <Button 
            onClick={() => handleApprove(farmer.id)} 
            loading={loadingId === farmer.id}
            bg="linear-gradient(135deg, var(--cc-gold), var(--cc-gold-light))" 
            color="white" 
            _hover={{ transform: 'translateY(-1px)', boxShadow: 'var(--cc-shadow-gold)' }}
          >
            Approuver l'inscription
          </Button>
        </Flex>
      ))}
    </Stack>
  )
}
