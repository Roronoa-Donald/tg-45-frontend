import { Box, Button, Container, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSync } from '../hooks/useSync'
import { SyncBanner } from './SyncBanner'
import { StatusPill } from './StatusPill'

const NAV_BY_ROLE: Record<string, Array<{ to: string; label: string }>> = {
  farmer: [
    { to: '/farmer', label: 'Tableau de bord' },
    { to: '/farmer/new', label: 'Nouveau lot' },
    { to: '/farmer/lots', label: 'Mes lots' },
    { to: '/farmer/drafts', label: 'Brouillons' },
  ],
  cooperative: [
    { to: '/cooperative', label: 'Travail coop' },
    { to: '/cooperative/lots', label: 'Lots à traiter' },
  ],
  verifier: [
    { to: '/verifier', label: 'Inspection' },
    { to: '/verifier/lots', label: 'Lots à vérifier' },
  ],
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const { queueLength, isOnline } = useSync()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = user ? NAV_BY_ROLE[user.role] || [] : []

  return (
    <Box minH="100vh">
      <Box as="header" position="sticky" top="0" zIndex="10" className="cc-surface" borderBottomWidth="1px">
        <Container maxW="7xl" py="3">
          <Flex align="center" justify="space-between" gap="4" wrap="wrap">
            <HStack gap="3">
              <Button variant="ghost" colorPalette="cocoa" onClick={() => navigate(-1)}>Retour</Button>

              <Button variant="ghost" colorPalette="cocoa" fontWeight="extrabold" fontSize="lg" onClick={() => navigate('/')}>ChainCacao</Button>

              <Button variant="ghost" onClick={() => navigate('/public/verify')}>Vérifier</Button>
              <Button variant="ghost" onClick={() => navigate('/register')}>Inscription</Button>
              <Button variant="ghost" onClick={() => navigate('/login')}>Connexion</Button>
              <StatusPill value={isOnline ? 'online' : 'offline'} />
              <Text fontSize="sm" color="fg.muted">{queueLength} mutation(s) en attente</Text>
            </HStack>

            <HStack gap="2">
              {user ? <Box aria-hidden="true" w="8" h="8" borderRadius="full" bg="cocoa.200" /> : null}
              {user ? <StatusPill value={user.role} label={user.role} /> : null}
              {user ? (
                <Button size="sm" variant="outline" onClick={logout}>Déconnexion</Button>
              ) : (
                <Button size="sm" colorPalette="olive" onClick={() => navigate('/login')}>Connexion</Button>
              )}
            </HStack>
          </Flex>

          {user ? (
            <HStack gap="2" mt="4" overflowX="auto" pb="1">
              {navItems.map((item) => (
                <Button
                  key={item.to}
                  size="sm"
                  variant={location.pathname === item.to || location.pathname.startsWith(`${item.to}/`) ? 'solid' : 'outline'}
                  colorPalette="olive"
                  onClick={() => navigate(item.to)}
                  whiteSpace="nowrap"
                >
                  {item.label}
                </Button>
              ))}
            </HStack>
          ) : null}
        </Container>
      </Box>

      <Container maxW="7xl" py={{ base: '5', md: '8' }}>
        <Stack gap="4" mb="6">
          <SyncBanner />
        </Stack>
        <Box className="cc-motion-reveal">{children}</Box>
      </Container>
    </Box>
  )
}
