import { Box, Button, Container, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSync } from '../hooks/useSync'
import { useI18n } from '../context/I18nContext'
import { SyncBanner } from './SyncBanner'
import { StatusPill } from './StatusPill'
import { Volume2, VolumeX } from 'lucide-react'

const NAV_BY_ROLE: Record<string, Array<{ to: string; label: string }>> = {
  farmer: [
    { to: '/farmer', label: 'farmer_space' },
    { to: '/farmer/new', label: 'register_harvest' },
    { to: '/farmer/lots', label: 'my_lots' },
    { to: '/farmer/drafts', label: 'drafts' },
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
  const { language, setLanguage, t, speak, isSpeaking } = useI18n()
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = user ? NAV_BY_ROLE[user.role] || [] : []

  const handleReadPage = () => {
    // Basic screen reader: grab text from the main container
    const content = document.getElementById('main-content')?.innerText || t('welcome')
    speak(content)
  }

  return (
    <Box minH="100vh">
      <Box as="header" position="sticky" top="0" zIndex="30" bg="rgba(250, 246, 240, 0.85)" backdropFilter="blur(20px)" borderBottom="1px solid var(--cc-line)">
        <Container maxW="7xl" py="3">
          <Flex align="center" justify="space-between" gap="4" wrap="wrap">
            <HStack gap="4">
              <HStack gap="1" cursor="pointer" onClick={() => navigate('/')} mr="2">
                <Text fontSize="lg" fontWeight="800" fontFamily="'Playfair Display', serif" color="var(--cc-cocoa-deep)">Chain</Text>
                <Text fontSize="lg" fontWeight="800" fontFamily="'Playfair Display', serif" className="cc-gold-text">Cacao</Text>
              </HStack>

              {!user && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/public/verify')}>{t('verify_lot')}</Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/register')}>Inscription</Button>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Connexion</Button>
                </>
              )}
              
              <StatusPill value={isOnline ? 'online' : 'offline'} />
              {queueLength > 0 && <Text fontSize="xs" fontWeight="600" color="var(--cc-gold)">{queueLength} en attente</Text>}
            </HStack>

            <HStack gap="3">
              {/* Language Switcher */}
              <Flex bg="rgba(0,0,0,0.05)" borderRadius="full" p="1">
                <Button size="xs" variant={language === 'fr' ? 'solid' : 'ghost'} colorPalette={language === 'fr' ? 'gray' : undefined} borderRadius="full" onClick={() => setLanguage('fr')}>FR</Button>
                <Button size="xs" variant={language === 'ee' ? 'solid' : 'ghost'} colorPalette={language === 'ee' ? 'gray' : undefined} borderRadius="full" onClick={() => setLanguage('ee')}>EE</Button>
              </Flex>

              {/* Speaker Button */}
              <button 
                onClick={handleReadPage} 
                className="cc-btn-outline" 
                style={{ padding: '4px 8px', borderColor: isSpeaking ? 'var(--cc-gold)' : 'var(--cc-line)', color: isSpeaking ? 'var(--cc-gold)' : 'var(--cc-cocoa)' }}
                title={t('read_aloud')}
              >
                {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              {user && (
                <Flex align="center" gap="3" bg="rgba(61, 36, 24, 0.04)" px="3" py="1.5" borderRadius="full">
                  <Box aria-hidden="true" w="6" h="6" borderRadius="full" bg="var(--cc-gold)" opacity="0.8" />
                  <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa-deep)">{user.displayName || user.identifier}</Text>
                  <StatusPill value={user.role} label={user.role} />
                  <Button size="xs" variant="ghost" colorPalette="red" onClick={logout} ml="2">{t('logout')}</Button>
                </Flex>
              )}
            </HStack>
          </Flex>

          {user && navItems.length > 0 && (
            <HStack gap="2" mt="4" overflowX="auto" pb="1" css={{ '&::-webkit-scrollbar': { display: 'none' } }}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.to || (item.to !== `/${user.role}` && location.pathname.startsWith(`${item.to}`))
                return (
                  <Button
                    key={item.to}
                    size="sm"
                    variant={isActive ? 'solid' : 'ghost'}
                    bg={isActive ? 'var(--cc-cocoa-deep)' : 'transparent'}
                    color={isActive ? 'var(--cc-cream)' : 'var(--cc-cocoa)'}
                    _hover={{ bg: isActive ? 'var(--cc-cocoa-deep)' : 'rgba(61, 36, 24, 0.06)' }}
                    borderRadius="full"
                    onClick={() => navigate(item.to)}
                    whiteSpace="nowrap"
                    px="4"
                  >
                    {t(item.label) || item.label}
                  </Button>
                )
              })}
            </HStack>
          )}
        </Container>
      </Box>

      <Container maxW="7xl" py={{ base: '6', md: '10' }} id="main-content">
        <Stack gap="4" mb="6">
          <SyncBanner />
        </Stack>
        <Box className="cc-motion-reveal">{children}</Box>
      </Container>
    </Box>
  )
}
