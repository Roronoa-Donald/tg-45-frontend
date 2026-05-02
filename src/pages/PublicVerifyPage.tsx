import { Box, Button, Circle, DialogBody, DialogCloseTrigger, DialogContent, DialogHeader, DialogRoot, DialogTitle, DialogTrigger, Flex, Heading, Stack, Text, Icon } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { PublicLotRecord } from '../domain/types'
import { useLots } from '../hooks/useLots'
import { EmptyState } from '../components/EmptyState'
import { StatusPill } from '../components/StatusPill'
import { formatLotEventLabel } from '../utils/lot-events'
import { Play } from 'lucide-react'

function AnimatedTimeline({ events }: { events: any[] }) {
  return (
    <Box position="relative" py="6" px="2">
      <Box position="absolute" left="27px" top="0" bottom="0" width="2px" bg="var(--cc-line)" />
      {events.map((event, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -30, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.4, type: 'spring' }}
        >
          <Box position="relative" pl="14" mb="8">
            <Circle size="10" bg="var(--cc-cream)" border="2px solid var(--cc-gold)" position="absolute" left="0" top="0" zIndex="2" boxShadow="0 0 15px rgba(196,151,58,0.2)">
              <Circle size="4" bg="linear-gradient(135deg, var(--cc-gold), var(--cc-gold-light))" />
            </Circle>
            <Stack gap="1" className="cc-surface-elevated" p="5" borderRadius="var(--cc-radius-md)">
              <Text fontWeight="700" className="cc-gold-text" fontSize="lg" fontFamily="'Playfair Display', serif">{formatLotEventLabel(event.eventType || event.action)}</Text>
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">{String(event.occurredAt || event.createdAt || 'Date inconnue')}</Text>
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
  const primaryImage = record?.images?.find((img) => img.isPrimary)?.url || record?.images?.[0]?.url

  useEffect(() => {
    if (!initialCode) return

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
    <Stack gap="8" pb="16" maxW="4xl" mx="auto">
      {/* ─── Search Section ─── */}
      <Box className="cc-surface" borderRadius="var(--cc-radius-xl)" p={{ base: '8', md: '12' }} textAlign="center" position="relative" overflow="hidden">
        <Box position="absolute" top="-50px" right="-50px" width="150px" height="150px" bg="radial-gradient(circle, rgba(196,151,58,0.2) 0%, transparent 70%)" />
        <Stack gap="4" alignItems="center" position="relative">
          <Text textTransform="uppercase" letterSpacing="0.2em" fontSize="xs" fontWeight="700" color="var(--cc-gold)">Traçabilité publique</Text>
          <Heading size="3xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Certificat d'Origine</Heading>
          <Text color="var(--cc-cocoa)" opacity="0.7" maxW="lg" mt="2">Saisissez le code d'un lot pour retracer son voyage de la plantation à l'exportation.</Text>

          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '450px', marginTop: '1.5rem' }}>
            <Flex gap="3" direction={{ base: 'column', sm: 'row' }}>
              <input className="cc-input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ex. LOT-2026-001" style={{ textAlign: 'center', letterSpacing: '0.1em', fontWeight: 600, fontSize: '18px' }} />
              <button type="submit" className="cc-btn-gold" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Vérification...' : 'Vérifier'}
              </button>
            </Flex>
          </form>
        </Stack>
      </Box>

      {/* ─── Result Section ─── */}
      {record ? (
        <Stack gap="6" className="cc-slide-up">
          <Box className="cc-surface" borderRadius="var(--cc-radius-xl)" overflow="hidden">
            {/* Header / Image Cover */}
            <Box position="relative" h={{ base: '200px', md: '300px' }} bg="var(--cc-cocoa-deep)">
              {primaryImage ? (
                <Box position="absolute" inset="0" backgroundImage={`url(${primaryImage})`} backgroundSize="cover" backgroundPosition="center" opacity="0.6" />
              ) : (
                <Box position="absolute" inset="0" bg="linear-gradient(135deg, var(--cc-cocoa-deep), var(--cc-olive))" opacity="0.8" />
              )}
              <Box position="absolute" inset="0" bg="linear-gradient(180deg, transparent 0%, rgba(28, 16, 10, 0.9) 100%)" />
              
              <Flex position="absolute" bottom="0" left="0" right="0" p={{ base: '6', md: '8' }} justify="space-between" align="flex-end" wrap="wrap" gap="4">
                <Stack gap="1">
                  <Text textTransform="uppercase" letterSpacing="0.2em" fontSize="xs" fontWeight="700" color="var(--cc-gold)">Lot Certifié</Text>
                  <Heading size="2xl" color="white" fontFamily="'Playfair Display', serif">{record.lotCode}</Heading>
                </Stack>
                <StatusPill value={record.status} />
              </Flex>
            </Box>

            <Box p={{ base: '6', md: '8' }}>
              <Stack gap="8">
                {/* Info Grid */}
                <Flex gap="6" wrap="wrap">
                  <Box flex="1" minW="200px" p="5" bg="rgba(196,151,58,0.05)" border="1px solid var(--cc-gold)" borderRadius="var(--cc-radius-md)">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)" mb="1">Origine GPS</Text>
                    <Text fontSize="lg" fontWeight="700" color="var(--cc-cocoa-deep)">
                      {Number.isFinite(gpsLat) ? gpsLat.toFixed(4) : '—'}, {Number.isFinite(gpsLng) ? gpsLng.toFixed(4) : '—'}
                    </Text>
                  </Box>
                  <Box flex="1" minW="200px" p="5" bg="rgba(42,110,80,0.05)" border="1px solid var(--cc-olive)" borderRadius="var(--cc-radius-md)">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)" mb="1">Ancrage Blockchain</Text>
                    <Text fontSize="sm" fontFamily="mono" color="var(--cc-olive)" wordBreak="break-all" fontWeight="600">
                      {record.proof?.proofHash || record.proof?.txHash || 'En attente de validation finale'}
                    </Text>
                  </Box>
                </Flex>

                {/* Timeline Box */}
                <Box>
                  <Flex justify="space-between" align="center" mb="6" wrap="wrap" gap="4">
                    <Heading size="lg" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Parcours du Lot</Heading>
                    
                    <DialogRoot placement="center" size="lg">
                      <DialogTrigger asChild>
                        <button className="cc-btn-outline" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Play size={16} strokeWidth={2} />
                          Lancer la cinématique
                        </button>
                      </DialogTrigger>
                      <DialogContent bg="var(--cc-cream)" border="1px solid var(--cc-gold)" borderRadius="var(--cc-radius-xl)" boxShadow="var(--cc-shadow-lg)">
                        <DialogHeader pb="0">
                          <DialogTitle className="cc-gold-text" fontFamily="'Playfair Display', serif" fontSize="2xl">Voyage du Lot {record.lotCode}</DialogTitle>
                        </DialogHeader>
                        <DialogBody pb="8">
                          <AnimatedTimeline events={record.events || []} />
                        </DialogBody>
                        <DialogCloseTrigger color="var(--cc-cocoa)" />
                      </DialogContent>
                    </DialogRoot>
                  </Flex>

                  {/* Static Timeline */}
                  <Box position="relative" py="2" pl="4">
                    <Box position="absolute" left="19px" top="10px" bottom="10px" width="2px" bg="var(--cc-line)" />
                    {record.events?.length ? record.events.map((event, index) => (
                      <Box position="relative" pl="10" mb="6" key={`fixed-${index}`}>
                        <Circle size="3" bg="var(--cc-gold)" position="absolute" left="14px" top="2" />
                        <Stack gap="1">
                          <Text fontWeight="600" color="var(--cc-cocoa-deep)">{formatLotEventLabel(event.eventType || event.action)}</Text>
                          <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.6">{String(event.occurredAt || event.createdAt || 'Date inconnue')}</Text>
                        </Stack>
                      </Box>
                    )) : <Text color="var(--cc-cocoa)" opacity="0.6">Aucun événement enregistré.</Text>}
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Stack>
      ) : initialCode ? (
        <EmptyState title="Lot introuvable" description="Le code saisi est invalide ou le lot n'a pas encore été ancré sur le registre public." />
      ) : null}
    </Stack>
  )
}
