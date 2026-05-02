import { Box, Button, Container, Flex, Heading, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Link as LinkIcon, CheckCircle, Smartphone, Search, Shield } from 'lucide-react'

const features = [
  {
    icon: Leaf,
    title: 'Capture Terrain',
    desc: 'Enregistrement GPS, photo et poids directement depuis la plantation, même sans réseau.',
  },
  {
    icon: LinkIcon,
    title: 'Blockchain Immuable',
    desc: 'Chaque lot est ancré cryptographiquement pour garantir l\'intégrité de la chaîne.',
  },
  {
    icon: CheckCircle,
    title: 'Validation Multi-Rôle',
    desc: 'Coopératives et vérificateurs certifient chaque étape via un workflow Kanban intuitif.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-First & Offline',
    desc: 'Interface conçue pour le terrain. Synchronisation automatique au retour du réseau.',
  },
  {
    icon: Search,
    title: 'Vérification Publique',
    desc: 'Tout consommateur peut retracer l\'origine d\'un lot avec un simple code, sans compte.',
  },
  {
    icon: Shield,
    title: 'Sécurité par Rôle',
    desc: 'Accès protégé : chaque acteur ne voit que son espace de travail autorisé.',
  },
]

const demoAccounts = [
  { role: 'Agriculteur', id: 'farmer.com', pin: '1234', color: 'var(--cc-olive)' },
  { role: 'Coopérative', id: 'coop@example.test', pin: '1234', color: 'var(--cc-gold)' },
  { role: 'Vérificateur', id: 'verifier@example.test', pin: '1234', color: 'var(--cc-cocoa)' },
]

export function PublicLandingPage() {
  const navigate = useNavigate()
  const [verifyCode, setVerifyCode] = useState('')

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    const code = verifyCode.trim()
    if (code) navigate(`/public/verify/${encodeURIComponent(code)}`)
  }

  return (
    <Box minH="100vh">
      {/* ─── Navbar ─── */}
      <Box as="nav" position="sticky" top="0" zIndex="20" bg="rgba(250, 246, 240, 0.85)" backdropFilter="blur(20px)" borderBottom="1px solid var(--cc-line)">
        <Container maxW="7xl" py="4">
          <Flex align="center" justify="space-between">
            <HStack gap="2" cursor="pointer" onClick={() => navigate('/')}>
              <Text fontSize="2xl" fontWeight="800" fontFamily="'Playfair Display', serif" color="var(--cc-cocoa-deep)">Chain</Text>
              <Text fontSize="2xl" fontWeight="800" fontFamily="'Playfair Display', serif" className="cc-gold-text">Cacao</Text>
            </HStack>
            <HStack gap="3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/public/verify')} color="var(--cc-cocoa)" _hover={{ color: 'var(--cc-gold)' }}>Vérifier un lot</Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/register')} color="var(--cc-cocoa)" _hover={{ color: 'var(--cc-gold)' }}>S'inscrire</Button>
              <button className="cc-btn-gold" onClick={() => navigate('/login')} style={{ padding: '10px 24px', fontSize: '14px' }}>Connexion</button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* ─── Hero ─── */}
      <Box position="relative" overflow="hidden" py={{ base: '16', md: '24' }}>
        <Box position="absolute" inset="0" bg="linear-gradient(180deg, rgba(196,151,58,0.04) 0%, transparent 60%)" pointerEvents="none" />
        <Container maxW="7xl" position="relative">
          <Stack gap="8" maxW="3xl" mx="auto" textAlign="center" alignItems="center" className="cc-slide-up">
            <Text textTransform="uppercase" letterSpacing="0.25em" fontSize="xs" fontWeight="700" color="var(--cc-gold)" bg="rgba(196,151,58,0.08)" px="4" py="2" borderRadius="full" border="1px solid rgba(196,151,58,0.15)">
              Traçabilité Cacao Premium
            </Text>
            <Heading size="4xl" lineHeight="1.1" fontWeight="700" color="var(--cc-cocoa-deep)">
              Du champ à la tasse,{' '}
              <Text as="span" className="cc-gold-text">chaque grain</Text>
              {' '}raconte son histoire
            </Heading>
            <Text fontSize="lg" color="var(--cc-cocoa)" maxW="2xl" lineHeight="1.7" opacity="0.8">
              ChainCacao est la plateforme de traçabilité de luxe qui connecte agriculteurs, coopératives et vérificateurs autour d'une chaîne de confiance transparente et immuable.
            </Text>
            <HStack gap="4" wrap="wrap" justify="center" pt="2">
              <button className="cc-btn-gold" onClick={() => navigate('/login')}>Accéder à mon espace</button>
              <button className="cc-btn-outline" onClick={() => navigate('/public/verify')}>Vérifier un lot →</button>
            </HStack>
          </Stack>
        </Container>
      </Box>

      {/* ─── Features Grid ─── */}
      <Container maxW="7xl" py={{ base: '12', md: '20' }}>
        <Stack gap="12" alignItems="center">
          <Stack gap="3" textAlign="center" maxW="xl">
            <Heading size="2xl" color="var(--cc-cocoa-deep)">Une solution complète</Heading>
            <Text color="var(--cc-cocoa)" opacity="0.7">Chaque fonctionnalité est pensée pour le terrain africain.</Text>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="5" w="full" className="cc-stagger">
            {features.map((f) => (
              <Box key={f.title} className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" transition="all 0.4s var(--cc-transition)" _hover={{ transform: 'translateY(-4px)', boxShadow: 'var(--cc-shadow-lg)' }}>
                <Stack gap="3">
                  <Box color="var(--cc-olive)"><f.icon size={32} strokeWidth={1.5} /></Box>
                  <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">{f.title}</Heading>
                  <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7" lineHeight="1.6">{f.desc}</Text>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      {/* ─── Demo Accounts ─── */}
      <Box bg="rgba(44, 24, 16, 0.03)" py={{ base: '12', md: '16' }}>
        <Container maxW="7xl">
          <Stack gap="8" alignItems="center">
            <Stack gap="3" textAlign="center">
              <Heading size="xl" color="var(--cc-cocoa-deep)">Tester la plateforme</Heading>
              <Text color="var(--cc-cocoa)" opacity="0.7">Utilisez ces comptes de démonstration pour explorer chaque rôle.</Text>
            </Stack>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="5" w="full" maxW="4xl">
              {demoAccounts.map((acc) => (
                <Box key={acc.role} className="cc-surface" borderRadius="var(--cc-radius-lg)" p="6" borderTop="3px solid" borderTopColor={acc.color} transition="all 0.3s var(--cc-transition)" _hover={{ transform: 'translateY(-3px)' }}>
                  <Stack gap="3">
                    <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">{acc.role}</Heading>
                    <Box>
                      <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.6">Identifiant</Text>
                      <Text fontWeight="600" fontFamily="monospace" fontSize="sm">{acc.id}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.6">PIN</Text>
                      <Text fontWeight="600" fontFamily="monospace" fontSize="sm">{acc.pin}</Text>
                    </Box>
                    <button className="cc-btn-outline" onClick={() => navigate('/login')} style={{ padding: '10px 20px', fontSize: '13px', marginTop: '4px' }}>Se connecter →</button>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>
      </Box>

      {/* ─── Public Verify Section ─── */}
      <Container maxW="7xl" py={{ base: '12', md: '16' }}>
        <Box className="cc-surface" borderRadius="var(--cc-radius-xl)" p={{ base: '6', md: '10' }} textAlign="center">
          <Stack gap="5" alignItems="center" maxW="lg" mx="auto">
            <Box color="var(--cc-gold)"><Search size={40} strokeWidth={1.5} /></Box>
            <Heading size="xl" color="var(--cc-cocoa-deep)">Vérification Publique</Heading>
            <Text color="var(--cc-cocoa)" opacity="0.7">Saisissez le code unique d'un lot pour retracer son parcours complet.</Text>
            <form onSubmit={handleVerify as never} style={{ width: '100%' }}>
              <Flex gap="3" direction={{ base: 'column', md: 'row' }}>
                <input
                  className="cc-input"
                  placeholder="Ex: LOT-2026-001"
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value)}
                  style={{ flex: 1, textAlign: 'center', letterSpacing: '0.1em', fontWeight: 600 }}
                />
                <button className="cc-btn-gold" type="submit" style={{ whiteSpace: 'nowrap' }}>Vérifier →</button>
              </Flex>
            </form>
          </Stack>
        </Box>
      </Container>

      {/* ─── Footer ─── */}
      <Box borderTop="1px solid var(--cc-line)" py="8">
        <Container maxW="7xl">
          <Flex justify="space-between" align="center" wrap="wrap" gap="4">
            <HStack gap="2">
              <Text fontWeight="800" fontFamily="'Playfair Display', serif" color="var(--cc-cocoa-deep)">Chain</Text>
              <Text fontWeight="800" fontFamily="'Playfair Display', serif" className="cc-gold-text">Cacao</Text>
            </HStack>
            <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.5">© 2026 ChainCacao — Traçabilité Premium</Text>
          </Flex>
        </Container>
      </Box>
    </Box>
  )
}
