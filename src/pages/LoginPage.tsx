import { Button, Container, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'
import { Link } from 'react-router-dom'

const ROLE_OPTIONS = [
  { value: 'farmer', label: 'Agriculteur' },
  { value: 'cooperative', label: 'Coopérative' },
  { value: 'verifier', label: 'Vérificateur' },
]

const ROLE_ROUTES: Record<string, string> = {
  farmer: '/farmer',
  cooperative: '/cooperative',
  verifier: '/verifier',
  exporter: '/exporter',
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [form, setForm] = useState({ identifier: '', secret: '', role: 'farmer', displayName: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)

    try {
      const user = await login({
        identifier: form.identifier,
        secret: form.secret,
        roleHint: form.role as 'farmer' | 'cooperative' | 'verifier',
        displayName: form.displayName || undefined,
      })

      showToast('Session ouverte.', 'success')
      navigate(ROLE_ROUTES[user.role] || '/farmer', { replace: true })
    } catch {
      showToast('Impossible de se connecter.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container maxW="lg" py="10">
      <Stack gap="6" className="cc-surface" borderRadius="3xl" p={{ base: '5', md: '8' }}>
        <Stack gap="2">
          <Heading size="xl">Connexion ChainCacao</Heading>
          <Text color="fg.muted">Choisissez votre rôle, puis ouvrez votre espace sécurisé.</Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap="4">
            <Stack gap="2">
              <Text as="label" fontWeight="semibold">Identifiant</Text>
              <Input value={form.identifier} onChange={(event) => setForm((current) => ({ ...current, identifier: event.target.value }))} placeholder="kossi" size="lg" />
            </Stack>

            <Stack gap="2">
              <Text as="label" fontWeight="semibold">Mot de passe ou PIN</Text>
              <Input value={form.secret} onChange={(event) => setForm((current) => ({ ...current, secret: event.target.value }))} type="password" placeholder="••••" size="lg" />
            </Stack>

            <Stack gap="2">
              <Text as="label" fontWeight="semibold">Rôle</Text>
              <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="cc-surface" style={{ minHeight: '3rem', borderRadius: '0.75rem', padding: '0.75rem 1rem' }}>
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Stack>

            <Stack gap="2">
              <Text as="label" fontWeight="semibold">Nom affiché</Text>
              <Input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Kossi Amegboh" size="lg" />
            </Stack>

            <Button type="submit" colorPalette="olive" size="lg" loading={submitting}>
              Ouvrir ma session
            </Button>
            <Text fontSize="sm" color="fg.muted">Pas de compte ? <Link to="/register">S'inscrire</Link></Text>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
}
