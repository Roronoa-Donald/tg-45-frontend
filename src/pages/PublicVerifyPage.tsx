import { Box, Circle, DialogBody, DialogCloseTrigger, DialogContent, DialogHeader, DialogRoot, DialogTitle, DialogTrigger, Flex, Heading, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { LotEvent, PublicLotRecord } from '../domain/types'
import { useLots } from '../hooks/useLots'
import { EmptyState } from '../components/EmptyState'
import { StatusPill } from '../components/StatusPill'
import { formatLotEventLabel } from '../utils/lot-events'
import { Play, MapPin } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Custom ChainCacao markers
const createCustomIcon = (color: string, isLast = false) => {
  const size = isLast ? 18 : 14
  const pulse = isLast ? `<div style="position:absolute;inset:-8px;border-radius:50%;border:2px solid ${color};opacity:0.4;animation:cc-gps-ring 2s ease-out infinite;"></div>` : ''
  return L.divIcon({
    className: '',
    html: `<div style="position:relative;display:flex;align-items:center;justify-content:center;"><div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);"></div>${pulse}</div>`,
    iconSize: [size + 6, size + 6],
    iconAnchor: [(size + 6) / 2, (size + 6) / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  })
}

const MARKER_COLORS = {
  origin: '#2a6e50',    // olive - plantation
  verify: '#c4973a',    // gold - validation/certification
  last: '#c0392b',      // red - last checkpoint
}

function AnimatedTimeline({ events }: { events: LotEvent[] }) {
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

  const mapPoints: Array<{ position: [number, number]; label: string; actor: string }> = []
  
  if (Number.isFinite(gpsLat) && Number.isFinite(gpsLng) && gpsLat !== 0) {
    mapPoints.push({ position: [gpsLat, gpsLng] as [number, number], label: 'Origine (Agriculteur)', actor: 'Plantation' })
  }
  
  // ─── DEMO JITTER: Spread out points slightly if they overlap (testing on same PC) ───
  let jitterCount = 1;
  record?.events?.forEach((event) => {
    const metadata = event.metadata && typeof event.metadata === 'object'
      ? (event.metadata as { gps?: { lat?: number; lng?: number } })
      : undefined
    const gps = metadata?.gps
    if (typeof gps?.lat === 'number' && typeof gps?.lng === 'number') {
      // Add a small ~2km artificial offset to simulate movement between actors
      const latOffset = (jitterCount * 0.015); 
      const lngOffset = (jitterCount * 0.025);
      
      mapPoints.push({
        position: [gps.lat + latOffset, gps.lng + lngOffset],
        label: formatLotEventLabel(event.eventType || event.action),
        actor: event.actorName || 'Acteur inconnu'
      })
      jitterCount++;
    }
  })

  const pathPositions = mapPoints.map((p) => p.position)

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
                <Flex gap="2" wrap="wrap">
                  <StatusPill value={record.status} />
                  {record.eudrStatus ? <StatusPill value={record.eudrStatus} /> : null}
                </Flex>
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
                {/* Map Section */}
                {mapPoints.length > 0 && (
                  <Box>
                    <Flex align="center" gap="2" mb="4">
                      <MapPin size={18} color="var(--cc-gold)" />
                      <Heading size="lg" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Carte de Traçabilité</Heading>
                    </Flex>
                    <Box borderRadius="var(--cc-radius-lg)" overflow="hidden" border="1px solid var(--cc-line)" h="420px" position="relative" zIndex={1} className="cc-map-container" boxShadow="var(--cc-shadow-md)">
                      <MapContainer center={mapPoints[0].position} zoom={10} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                          attribution='&copy; <a href="https://carto.com">CARTO</a>'
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        {mapPoints.map((point, idx) => {
                          const isFirst = idx === 0
                          const isLast = idx === mapPoints.length - 1 && mapPoints.length > 1
                          const color = isFirst ? MARKER_COLORS.origin : isLast ? MARKER_COLORS.last : MARKER_COLORS.verify
                          return (
                            <Marker key={idx} position={point.position} icon={createCustomIcon(color, isLast)}>
                              <Popup>
                                <div style={{ fontFamily: 'Inter, sans-serif' }}>
                                  <strong style={{ color: '#2c1810', fontSize: '14px' }}>{point.label}</strong><br/>
                                  <span style={{ color: '#5b3a29', fontSize: '12px' }}>{point.actor}</span><br/>
                                  <span style={{ color: '#999', fontSize: '11px' }}>{point.position[0].toFixed(5)}, {point.position[1].toFixed(5)}</span>
                                </div>
                              </Popup>
                            </Marker>
                          )
                        })}
                        {pathPositions.length > 1 && (
                          <Polyline 
                            positions={pathPositions} 
                            pathOptions={{ 
                              color: '#c4973a', 
                              weight: 3, 
                              dashArray: '12, 8',
                              opacity: 0.8,
                              className: 'cc-animated-path'
                            }} 
                          />
                        )}
                      </MapContainer>
                    </Box>
                    {/* Map Legend */}
                    <Flex mt="3" gap="5" justify="center" wrap="wrap">
                      <Flex align="center" gap="2" fontSize="xs" color="var(--cc-cocoa)">
                        <Box w="10px" h="10px" borderRadius="50%" bg={MARKER_COLORS.origin} border="2px solid white" boxShadow="0 1px 3px rgba(0,0,0,0.2)" />
                        Origine
                      </Flex>
                      <Flex align="center" gap="2" fontSize="xs" color="var(--cc-cocoa)">
                        <Box w="10px" h="10px" borderRadius="50%" bg={MARKER_COLORS.verify} border="2px solid white" boxShadow="0 1px 3px rgba(0,0,0,0.2)" />
                        Validation / Certification
                      </Flex>
                      {mapPoints.length > 1 && (
                        <Flex align="center" gap="2" fontSize="xs" color="var(--cc-cocoa)">
                          <Box w="10px" h="10px" borderRadius="50%" bg={MARKER_COLORS.last} border="2px solid white" boxShadow="0 1px 3px rgba(0,0,0,0.2)" />
                          Dernier point
                        </Flex>
                      )}
                      <Flex align="center" gap="2" fontSize="xs" color="var(--cc-cocoa)">
                        <Box w="20px" h="2px" bg={MARKER_COLORS.verify} style={{ borderTop: '2px dashed #c4973a' }} />
                        Trajet
                      </Flex>
                    </Flex>
                  </Box>
                )}

                {record.parcels?.length ? (
                  <Box>
                    <Heading size="lg" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif" mb="4">Parcelles</Heading>
                    <Stack gap="3">
                      {record.parcels.map((parcel, index) => (
                        <Box key={`parcel-${index}`} className="cc-surface" p="4" borderRadius="var(--cc-radius-md)">
                          <Text fontWeight="700" color="var(--cc-cocoa-deep)">{parcel.id || `Parcelle ${index + 1}`}</Text>
                          <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">Type: {parcel.geometryType || '—'} · Surface: {parcel.areaHa ?? '—'} ha</Text>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                ) : null}
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
