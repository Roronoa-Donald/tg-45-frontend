import { Heading, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useLots } from '../../hooks/useLots'
import { StatusPill } from '../../components/StatusPill'
import { CooperativeExportTab } from './CooperativeExportTab'

export function CooperativeExportsPage() {
  const { lots, refreshLots } = useLots()

  const certifiedLots = useMemo(() => {
    return lots.filter((lot) => String(lot.status).split(';')[0] === 'certified')
  }, [lots])

  return (
    <Stack gap="8">
      <Stack gap="2">
        <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-gold)">Espace de travail</Text>
        <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Exports coopérative</Heading>
        <Text color="var(--cc-cocoa)" opacity="0.7">Sélectionnez des lots certifiés avec un dossier EUDR approuvé.</Text>
        <StatusPill value="approved" label="EUDR requis" />
      </Stack>

      <CooperativeExportTab certifiedLots={certifiedLots} refreshLots={refreshLots} />
    </Stack>
  )
}
