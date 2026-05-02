import { Button, Container, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <Container maxW="lg" py="10">
      <Stack gap="6" className="cc-surface" borderRadius="3xl" p={{ base: '5', md: '8' }}>
        <Stack gap="2">
          <Heading size="xl">Inscription - Agriculteur</Heading>
          <Text color="fg.muted">Créez un compte agriculteur pour démarrer.</Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap="4">
            <Stack gap="2">
              <Text as="label" fontWeight="semibold">Nom complet</Text>
              <Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Kossi Amegboh" size="lg" />
            </Stack>

            <Stack gap="2">
              <Text as="label" fontWeight="semibold">Téléphone (identifiant)</Text>
              <Input value={form.identifier} onChange={(e) => setForm((c) => ({ ...c, identifier: e.target.value }))} placeholder="+22890000000" size="lg" />
            </Stack>

            <Stack gap="2">
              <Text as="label" fontWeight="semibold">Email (optionnel)</Text>
              <Input value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="kossi@example.test" size="lg" />
            </Stack>

            <Stack gap="2">
              <Text as="label" fontWeight="semibold">Mot de passe / PIN</Text>
              <Input value={form.secret} onChange={(e) => setForm((c) => ({ ...c, secret: e.target.value }))} type="password" placeholder="1234" size="lg" />
            </Stack>

            <Button type="submit" colorPalette="olive" size="lg" loading={submitting}>
              Créer mon compte
            </Button>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
}

export default RegisterPage
