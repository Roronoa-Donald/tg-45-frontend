import { Box, Button, Container, Flex, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as registerRequest } from '../lib/api'
import { useToast } from '../context/ToastContext'

export function RegisterPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: '', identifier: '', phone: '', email: '', secret: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await registerRequest({
        name: form.name,
        phone: form.phone || undefined,
        email: form.email || undefined,
        secret: form.secret,
        role: 'farmer',
        farmName: `${form.name} Farm`,
      })

      showToast('Inscription réussie. Vous pouvez maintenant vous connecter.', 'success')
      navigate('/login')
    } catch (err) {
      showToast('Impossible de créer le compte.', 'error')
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
          <button className="cc-btn-outline" onClick={() => navigate('/login')} style={{ padding: '8px 20px', fontSize: '13px' }}>← Connexion</button>
        </Flex>
      </Box>

      {/* Main content */}
      <Flex flex="1" align="center" justify="center" py="10" px="4">
        <Container maxW="md">
          <Stack gap="8" className="cc-slide-up">
            {/* Header */}
            <Stack gap="2" textAlign="center">
              <Text textTransform="uppercase" letterSpacing="0.2em" fontSize="xs" fontWeight="700" color="var(--cc-olive)">Créer un compte</Text>
              <Heading size="2xl" color="var(--cc-cocoa-deep)">Inscription</Heading>
              <Text color="var(--cc-cocoa)" opacity="0.6">Rejoignez la chaîne de confiance ChainCacao en tant qu'agriculteur.</Text>
            </Stack>

            {/* Form Card */}
            <Box className="cc-surface" borderRadius="var(--cc-radius-lg)" p={{ base: '6', md: '8' }}>
              <form onSubmit={handleSubmit}>
                <Stack gap="5">
                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Nom complet</Text>
                    <input className="cc-input" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Ex: Kossi Amegboh" required />
                  </Stack>

                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Téléphone (identifiant)</Text>
                    <input className="cc-input" value={form.identifier} onChange={(e) => setForm((c) => ({ ...c, identifier: e.target.value }))} placeholder="+22890000000" required />
                  </Stack>

                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Email <Text as="span" fontSize="xs" opacity="0.5">(optionnel)</Text></Text>
                    <input className="cc-input" type="email" value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="kossi@example.com" />
                  </Stack>

                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Mot de passe / PIN</Text>
                    <input className="cc-input" type="password" value={form.secret} onChange={(e) => setForm((c) => ({ ...c, secret: e.target.value }))} placeholder="••••" required minLength={4} />
                  </Stack>

                  <Button type="submit" bg="linear-gradient(135deg, var(--cc-olive), #339966)" color="white" size="lg" borderRadius="full" _hover={{ transform: 'translateY(-1px)', boxShadow: '0 8px 30px rgba(42, 110, 80, 0.3)' }} loading={submitting}>
                    Créer mon compte
                  </Button>
                </Stack>
              </form>
            </Box>

            {/* Footer links */}
            <Flex justify="center" gap="4" wrap="wrap">
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.6">
                Déjà membre ?{' '}
                <Link to="/login" style={{ color: 'var(--cc-gold)', fontWeight: 600 }}>Se connecter</Link>
              </Text>
            </Flex>
          </Stack>
        </Container>
      </Flex>
    </Box>
  )
}

export default RegisterPage
