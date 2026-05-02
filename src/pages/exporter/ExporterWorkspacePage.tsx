import { Heading, Stack, Text } from '@chakra-ui/react'

export function ExporterWorkspacePage() {
  return (
    <Stack gap="5" className="cc-surface" borderRadius="3xl" p="6">
      <Heading size="xl">Espace export</Heading>
      <Text color="fg.muted">Le parcours export n’est pas prioritaire dans le MVP demandé. Cette vue reste disponible comme point d’extension sans exposer d’actions critiques.</Text>
    </Stack>
  )
}
