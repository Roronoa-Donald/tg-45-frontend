import { Box, Button, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import type { PublicLotRecord } from '../domain/types'
import { useLots } from '../hooks/useLots'
import { EmptyState } from '../components/EmptyState'
import { StatusPill } from '../components/StatusPill'
import { formatLotEventLabel } from '../utils/lot-events'

export function PublicVerifyPage() {
  const { lotCode: pathLotCode } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCode = pathLotCode || searchParams.get('code') || ''
  const [query, setQuery] = useState(initialCode)
  const [record, setRecord] = useState<PublicLotRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const { loadPublicLot } = useLots()

  const gpsLat = Number(record?.gps?.lat)
  const gpsLng = Number(record?.gps?.lng)
  const gpsPrecision = Number(record?.gps?.precisionM)

  useEffect(() => {
    if (!initialCode) {
      return
    }

    const load = async () => {
      setLoading(true)
      const result = await loadPublicLot(initialCode)
      setRecord(result)
      setLoading(false)
    }

    void load()
  }, [initialCode, loadPublicLot])

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const code = query.trim().toUpperCase()
    setSearchParams(code ? { code } : {})
    setLoading(true)
    setRecord(await loadPublicLot(code))
    setLoading(false)
  }

  return (
    <Stack gap="6">
      <Stack gap="3" className="cc-surface" borderRadius="3xl" p="6">
        <Heading size="xl">Vérification publique</Heading>
        <Text color="fg.muted">Lecture seule. Aucun compte n’est nécessaire pour consulter un lot.</Text>

        <form onSubmit={handleSearch}>
          <Stack gap="3">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex. LOT-2026-001" size="lg" />
            <Button type="submit" colorPalette="olive" size="lg" loading={loading}>Vérifier le lot</Button>
          </Stack>
        </form>
      </Stack>

      {record ? (
        <Stack gap="4" className="cc-surface" borderRadius="3xl" p="6">
          <Stack gap="1">
            <Heading size="lg">{record.lotCode}</Heading>
            <StatusPill value={record.status} />
          </Stack>
          <Text>
            GPS: {Number.isFinite(gpsLat) ? gpsLat.toFixed(4) : '—'}, {Number.isFinite(gpsLng) ? gpsLng.toFixed(4) : '—'} · précision {Number.isFinite(gpsPrecision) ? gpsPrecision : '—'} m
          </Text>
          <Text>Preuve blockchain: {record.proof?.proofHash || record.proof?.txHash || 'non disponible'}</Text>
          <Text>Transaction blockchain: {record.proof?.txHash || 'non disponible'}</Text>
          <Stack gap="2">
            <Text fontWeight="semibold">Evénements</Text>
            {record.events?.length ? record.events.map((event, index) => (
              <Box key={`${record.lotCode}-${index}`} border="1px solid" borderColor="border" borderRadius="xl" p="3">
                <Text fontWeight="semibold">{formatLotEventLabel(event.eventType || event.action)}</Text>
                <Text fontSize="sm" color="fg.muted">{String(event.occurredAt || event.createdAt || 'Date inconnue')}</Text>
              </Box>
            )) : <Text color="fg.muted">Aucun événement publié.</Text>}
          </Stack>
        </Stack>
      ) : initialCode ? (
        <EmptyState title="Lot introuvable" description="Le code saisi ne correspond à aucun lot public connu." />
      ) : (
        <EmptyState title="Saisissez un code" description="Entrez un code lot ou scannez le QR pour lancer la vérification publique." />
      )}
    </Stack>
  )
}
