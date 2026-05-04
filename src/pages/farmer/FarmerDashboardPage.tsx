import { Box, Flex, Heading, SimpleGrid, Stack, Text, Icon } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { Package, FileText, Camera, RefreshCw } from 'lucide-react'
import { useI18n } from '../../context/I18nContext'

export function FarmerDashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lots, draftLots } = useLots()
  const { t } = useI18n()

  const handleVibrate = () => {
    if (navigator.vibrate) navigator.vibrate(50)
  }

  return (
    <Stack gap="8" px={{ base: 2, md: 0 }}>
      {/* ─── Big Yellow Button (New Lot) ─── */}
      <Box 
        onClick={() => { handleVibrate(); navigate('/farmer/new') }}
        bg="#F6E05E" 
        borderRadius="3xl" 
        p={8} 
        cursor="pointer"
        boxShadow="0 10px 25px rgba(246, 224, 94, 0.4)"
        textAlign="center"
        _active={{ transform: 'scale(0.98)' }}
        transition="all 0.2s"
      >
        <Icon as={Camera} w={20} h={20} color="#744210" mb={4} />
        <Heading size="xl" color="#744210" fontWeight="900" textTransform="uppercase">
          Nouveau Sac
        </Heading>
      </Box>

      <SimpleGrid columns={2} gap={4}>
        {/* ─── Big Blue Button (History) ─── */}
        <Box 
          onClick={() => { handleVibrate(); navigate('/farmer/lots') }}
          bg="#4299E1" 
          borderRadius="3xl" 
          p={6} 
          cursor="pointer"
          boxShadow="0 8px 20px rgba(66, 153, 225, 0.3)"
          textAlign="center"
          _active={{ transform: 'scale(0.98)' }}
          transition="all 0.2s"
        >
          <Icon as={Package} w={12} h={12} color="white" mb={3} />
          <Heading size="lg" color="white" fontWeight="800">
            {lots.length}
          </Heading>
          <Text color="white" fontWeight="bold">Historique</Text>
        </Box>

        {/* ─── Big Grey Button (Drafts) ─── */}
        <Box 
          onClick={() => { handleVibrate(); navigate('/farmer/drafts') }}
          bg="#A0AEC0" 
          borderRadius="3xl" 
          p={6} 
          cursor="pointer"
          boxShadow="0 8px 20px rgba(160, 174, 192, 0.3)"
          textAlign="center"
          _active={{ transform: 'scale(0.98)' }}
          transition="all 0.2s"
        >
          <Icon as={RefreshCw} w={12} h={12} color="white" mb={3} />
          <Heading size="lg" color="white" fontWeight="800">
            {draftLots.length}
          </Heading>
          <Text color="white" fontWeight="bold">En attente</Text>
        </Box>
      </SimpleGrid>

      {/* ─── Profile Info (Minimal) ─── */}
      <Flex justify="center" align="center" gap={3} mt={6} opacity={0.6}>
        <Box w={3} h={3} bg="green.500" borderRadius="full" />
        <Text fontWeight="bold" fontSize="lg">{user?.displayName || 'Agriculteur'}</Text>
      </Flex>
    </Stack>
  )
}
