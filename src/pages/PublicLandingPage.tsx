import { Box, Button, Container, Heading, HStack, Input, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const roles = [
  { label: 'Agriculteur', to: '/login?role=farmer' },
  { label: 'Coopérative', to: '/login?role=cooperative' },
  { label: 'Vérificateur', to: '/login?role=verifier' },
]

export function PublicLandingPage() {
  const navigate = useNavigate()
  const submitVerify = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const code = String(formData.get('code') || '').trim()
    if (code) {
      navigate(`/public/verify/${encodeURIComponent(code)}`)
    }
  }

  return (
    <Container maxW="7xl" py="8">
      <Stack gap="6">
        <Box className="cc-surface cc-hero-pattern" borderRadius="3xl" p={{ base: '6', md: '10' }}>
          <Stack gap="5" maxW="3xl">
            <Text textTransform="uppercase" letterSpacing="0.2em" fontSize="xs" fontWeight="bold" color="olive.600">Traçabilité cacao premium</Text>
            <Heading size="3xl">Une expérience simple pour enregistrer, vérifier et suivre chaque lot.</Heading>
            <Text fontSize="lg" color="fg.muted">ChainCacao accompagne les agriculteurs, coopératives et vérificateurs avec une interface mobile-first, un mode hors ligne, et une vérification publique en lecture seule.</Text>
            <HStack gap="3" wrap="wrap">
              <Button colorPalette="olive" size="lg" onClick={() => navigate('/login')}>Se connecter</Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/public/verify')}>Vérification publique</Button>
            </HStack>
          </Stack>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap="4">
          {roles.map((role) => (
            <Box key={role.label} className="cc-surface" borderRadius="2xl" p="5">
              <Stack gap="3">
                <Heading size="md">{role.label}</Heading>
                <Text color="fg.muted">Accès guidé vers le bon espace de travail, avec protection de rôle.</Text>
                <Button colorPalette="amber" variant="subtle" onClick={() => navigate(role.to)}>Continuer</Button>
              </Stack>
            </Box>
          ))}
        </SimpleGrid>

        <Box className="cc-surface" borderRadius="2xl" p="5">
          <Heading size="md" mb={3}>Comptes de démonstration</Heading>
          <Text color="fg.muted" mb={2}>Utilisez ces identifiants pour tester rapidement l'application :</Text>
          <Stack gap={2}>
            <Box>
              <Text fontWeight="bold">Agriculteur</Text>
              <Text>Identifiant: farmer.com — PIN: 1234</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Coopérative</Text>
              <Text>Identifiant: coop@example.test — PIN: 1234</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Vérificateur</Text>
              <Text>Identifiant: verifier@example.test — PIN: 1234</Text>
            </Box>
          </Stack>
        </Box>

        <Box className="cc-surface" borderRadius="2xl" p="5">
          <form onSubmit={submitVerify as never}>
            <Stack gap="3">
            <Heading size="md">Vérifier un lot</Heading>
            <Text color="fg.muted">Saisissez un code lot ou un identifiant QR pour afficher le statut public.</Text>
            <Input name="code" placeholder="LOT-2026-001" size="lg" />
            <Button type="submit" colorPalette="olive" alignSelf="flex-start">Lancer la vérification</Button>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  )
}
