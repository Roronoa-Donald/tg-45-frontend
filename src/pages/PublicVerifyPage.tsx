import { Box, Button, Circle, DialogBody, DialogCloseTrigger, DialogContent, DialogHeader, DialogRoot, DialogTitle, DialogTrigger, Heading, Input, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { PublicLotRecord } from '../domain/types'
import { useLots } from '../hooks/useLots'
import { EmptyState } from '../components/EmptyState'
import { StatusPill } from '../components/StatusPill'
import { formatLotEventLabel } from '../utils/lot-events'

function AnimatedTimeline({ events }: { events: any[] }) {
  return (
    <Box position="relative" py="4">
      <Box position="absolute" left="15px" top="0" bottom="0" width="2px" bg="rgba(185, 139, 74, 0.3)" />
      {events.map((event, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -30, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.4 }}
        >
          <Box position="relative" pl="10" mb="8">
            <Circle size="8" bg="var(--cc-cocoa-deep)" border="2px solid var(--cc-gold)" position="absolute" left="0" top="0" boxShadow="0 0 10px var(--cc-gold-glow)">
              <Circle size="3" bg="var(--cc-gold)" />
            </Circle>
            <Stack gap="1" className="cc-surface" p="4" borderRadius="xl">
              <Text fontWeight="bold" className="cc-gold-text" fontSize="lg">{formatLotEventLabel(event.eventType || event.action)}</Text>
              <Text fontSize="sm" color="fg.muted">{String(event.occurredAt || event.createdAt || 'Date inconnue')}</Text>
            </Stack>
          </Box>
        </motion.div>
      ))}
    </Box>
  )
}

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
    <Stack gap="6" pb="12">
      <Stack gap="3" className="cc-surface" borderRadius="3xl" p="8" textAlign="center" alignItems="center">
        <Heading size="2xl" className="cc-gold-text">Certificat d'Origine</Heading>
        <Text color="fg.muted" maxW="lg">Saisissez le code d'un lot pour retracer son voyage depuis la plantation jusqu'à l'exportation.</Text>

        <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '400px', marginTop: '1rem' }}>
          <Stack gap="3">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ex. LOT-2026-001" size="lg" textAlign="center" letterSpacing="widest" fontWeight="bold" variant="flushed" borderColor="var(--cc-gold)" _focus={{ borderColor: 'var(--cc-gold)' }} />
            <Button type="submit" colorPalette="amber" size="lg" loading={loading} width="full">Vérifier l'authenticité</Button>
          </Stack>
        </form>
      </Stack>

      {record ? (
        <Stack gap="6">
          <Stack gap="4" className="cc-surface" borderRadius="3xl" p="6">
            <Box textAlign="center" mb="4">
              <Heading size="xl" className="cc-gold-text" mb="2">{record.lotCode}</Heading>
              <StatusPill value={record.status} />
            </Box>
            
            <Box border="1px solid rgba(255,255,255,0.05)" bg="rgba(0,0,0,0.2)" borderRadius="xl" p="4">
              <Heading size="sm" mb="2" color="fg.muted">Informations de base</Heading>
              <Text>
                Origine GPS: {Number.isFinite(gpsLat) ? gpsLat.toFixed(4) : '—'}, {Number.isFinite(gpsLng) ? gpsLng.toFixed(4) : '—'}
              </Text>
              <Text mt="1">Hash de l'ancrage blockchain: <Text as="span" fontFamily="mono" fontSize="sm" color="var(--cc-gold)">{record.proof?.proofHash || record.proof?.txHash || 'En attente'}</Text></Text>
            </Box>

            <Box mt="4">
              <Heading size="md" mb="4" className="cc-gold-text">Parcours de certification</Heading>
              
              <DialogRoot placement="center" size="lg">
                <DialogTrigger asChild>
                  <Button variant="outline" colorPalette="amber" w="full" mb="6">Lancer l'animation du parcours</Button>
                </DialogTrigger>
                <DialogContent bg="var(--cc-cocoa-deep)" border="1px solid var(--cc-gold)" borderRadius="2xl">
                  <DialogHeader>
                    <DialogTitle className="cc-gold-text">Voyage du Lot {record.lotCode}</DialogTitle>
                  </DialogHeader>
                  <DialogBody pb="8">
                    <AnimatedTimeline events={record.events || []} />
                  </DialogBody>
                  <DialogCloseTrigger color="var(--cc-cream)" />
                </DialogContent>
              </DialogRoot>

              {/* Version Fixe */}
              <Box position="relative" py="4" pl="4">
                <Box position="absolute" left="15px" top="0" bottom="0" width="2px" bg="var(--cc-line)" />
                {record.events?.length ? record.events.map((event, index) => (
                  <Box position="relative" pl="8" mb="6" key={`fixed-${index}`}>
                    <Circle size="3" bg="var(--cc-gold)" position="absolute" left="-19px" top="2" />
                    <Stack gap="1">
                      <Text fontWeight="semibold">{formatLotEventLabel(event.eventType || event.action)}</Text>
                      <Text fontSize="sm" color="fg.muted">{String(event.occurredAt || event.createdAt || 'Date inconnue')}</Text>
                    </Stack>
                  </Box>
                )) : <Text color="fg.muted">Aucun événement enregistré.</Text>}
              </Box>
            </Box>
          </Stack>
        </Stack>
      ) : initialCode ? (
        <EmptyState title="Lot introuvable" description="Le code saisi est invalide ou le lot n'a pas encore été ancré." />
      ) : null}
    </Stack>
  )
}
