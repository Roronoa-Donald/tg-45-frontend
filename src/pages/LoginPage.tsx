import { Box, Button, Container, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'


const ROLE_ROUTES: Record<string, string> = {
  farmer: '/farmer',
  cooperative: '/cooperative',
  verifier: '/verifier',
  exporter: '/exporter',
  admin: '/admin',
  ministry: '/ministry',
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState({ identifier: '', secret: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const user = await login({
        identifier: form.identifier,
        secret: form.secret,
      })

      showToast('Session ouverte.', 'success')
      navigate(ROLE_ROUTES[user.role] || '/farmer', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Impossible de se connecter.'
      showToast(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      {/* Mini navbar */}
      <Box as="nav" py="4" px="6" borderBottom="1px solid var(--cc-line)" bg="rgba(250,246,240,0.85)" backdropFilter="blur(20px)">
        <Flex align="center" justify="space-between" maxW="7xl" mx="auto">
          <HStack gap="2" cursor="pointer" onClick={() => navigate('/')}>
            <Text fontSize="xl" fontWeight="800" fontFamily="'Playfair Display', serif">Chain</Text>
            <Text fontSize="xl" fontWeight="800" fontFamily="'Playfair Display', serif" className="cc-gold-text">Cacao</Text>
          </HStack>
          <button className="cc-btn-outline" onClick={() => navigate('/')} style={{ padding: '8px 20px', fontSize: '13px' }}>← Accueil</button>
        </Flex>
      </Box>

      {/* Main content */}
      <Flex flex="1" align="center" justify="center" py="10" px="4">
        <Container maxW="md">
          <Stack gap="8" className="cc-slide-up">
            {/* Header */}
            <Stack gap="2" textAlign="center">
              <Text textTransform="uppercase" letterSpacing="0.2em" fontSize="xs" fontWeight="700" color="var(--cc-gold)">Espace sécurisé</Text>
              <Heading size="2xl" color="var(--cc-cocoa-deep)">Connexion</Heading>
              <Text color="var(--cc-cocoa)" opacity="0.6">Accédez à votre espace de travail ChainCacao.</Text>
            </Stack>

            {/* Form Card */}
            <Box className="cc-surface" borderRadius="var(--cc-radius-lg)" p={{ base: '6', md: '8' }}>
              <form onSubmit={handleSubmit}>
                <Stack gap="5">


                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Identifiant</Text>
                    <input className="cc-input" value={form.identifier} onChange={(e) => setForm((c) => ({ ...c, identifier: e.target.value }))} placeholder="farmer.com" />
                  </Stack>

                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Mot de passe / PIN</Text>
                    <input className="cc-input" type="password" value={form.secret} onChange={(e) => setForm((c) => ({ ...c, secret: e.target.value }))} placeholder="••••" />
                  </Stack>



                  <Button type="submit" bg="linear-gradient(135deg, var(--cc-gold), var(--cc-gold-light))" color="white" size="lg" borderRadius="full" _hover={{ transform: 'translateY(-1px)', boxShadow: 'var(--cc-shadow-gold)' }} loading={submitting}>
                    Ouvrir ma session
                  </Button>
                </Stack>
              </form>
            </Box>

            {/* Footer links */}
            <Flex justify="center" gap="4" wrap="wrap">
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.6">
                Pas encore de compte ?{' '}
                <Link to="/register" style={{ color: 'var(--cc-gold)', fontWeight: 600 }}>S'inscrire</Link>
              </Text>
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.4">·</Text>
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.6">
                <Link to="/public/verify" style={{ color: 'var(--cc-olive)', fontWeight: 600 }}>Vérifier un lot</Link>
              </Text>
            </Flex>
          </Stack>
        </Container>
      </Flex>
    </Box>
  )
}
