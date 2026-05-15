import { Box, Flex, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { CameraCapture } from '../../components/CameraCapture'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { listParcels } from '../../lib/api'
import type { ParcelRecord } from '../../domain/types'

import { useToast } from '../../context/ToastContext'
import { MapPin, Navigation, Camera, FileText } from 'lucide-react'

type GpsState = 'idle' | 'requesting' | 'calibrating' | 'acquired' | 'denied' | 'unavailable'

interface GpsData {
  lat: number
  lng: number
  precisionM: number
}

function GpsCalibrationWidget({
  state,
  gps,
  onRetry,
}: {
  state: GpsState
  gps: GpsData | null
  onRetry: () => void
}) {
  if (state === 'idle' || state === 'requesting') {
    return (
      <Flex
        className="cc-surface"
        borderRadius="var(--cc-radius-md)"
        p="5"
        align="center"
        gap="4"
        border="1px solid var(--cc-line)"
      >
        <Box position="relative" w="40px" h="40px" display="flex" alignItems="center" justifyContent="center">
          <Box className="cc-gps-ring" position="absolute" w="40px" h="40px" borderRadius="full" border="2px solid var(--cc-gold)" />
          <Box className="cc-gps-dot" color="var(--cc-gold)">
            <Navigation size={20} strokeWidth={2} />
          </Box>
        </Box>
        <Stack gap="0" flex="1">
          <Text fontSize="sm" fontWeight="700" color="var(--cc-cocoa-deep)">Demande d'accès GPS...</Text>
          <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.6">Autorisez l'accès à votre position pour continuer</Text>
        </Stack>
      </Flex>
    )
  }

  if (state === 'calibrating') {
    return (
      <Flex
        className="cc-surface"
        borderRadius="var(--cc-radius-md)"
        p="5"
        align="center"
        gap="4"
        border="1px solid var(--cc-olive)"
        bg="rgba(42, 110, 80, 0.04)"
      >
        <Box position="relative" w="40px" h="40px" display="flex" alignItems="center" justifyContent="center">
          <Box className="cc-gps-ring" position="absolute" w="40px" h="40px" borderRadius="full" border="2px solid var(--cc-olive)" />
          <Box className="cc-gps-dot" color="var(--cc-olive)">
            <Navigation size={20} strokeWidth={2} />
          </Box>
        </Box>
        <Stack gap="0" flex="1">
          <Flex align="center" gap="2">
            <Text fontSize="sm" fontWeight="700" color="var(--cc-cocoa-deep)">Calibrage en cours</Text>
            <Text fontSize="xs" color="var(--cc-olive)" fontWeight="600">
              {gps ? `± ${Math.round(gps.precisionM)}m` : '...'}
            </Text>
          </Flex>
          <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.6">Gardez l'appareil stable pour une meilleure précision</Text>
          {/* Progress bar animation */}
          <Box mt="2" h="3px" bg="var(--cc-line)" borderRadius="full" overflow="hidden">
            <Box
              h="full"
              bg="linear-gradient(90deg, var(--cc-olive), var(--cc-gold))"
              borderRadius="full"
              style={{
                width: gps ? `${Math.max(20, Math.min(100, (100 / gps.precisionM) * 100))}%` : '20%',
                transition: 'width 0.6s ease-out',
              }}
            />
          </Box>
        </Stack>
      </Flex>
    )
  }

  if (state === 'acquired' && gps) {
    return (
      <Flex
        p="5"
        bg="rgba(42, 110, 80, 0.08)"
        border="1px solid var(--cc-olive)"
        borderRadius="var(--cc-radius-md)"
        align="center"
        gap="3"
        className="cc-slide-up"
      >
        <Box color="var(--cc-olive)">
          <MapPin size={20} strokeWidth={2} />
        </Box>
        <Stack gap="0" flex="1">
          <Flex gap="2" align="center">
            <Text fontSize="sm" fontWeight="700" color="var(--cc-olive)">Position acquise</Text>
            <Text fontSize="xs" bg="var(--cc-olive)" color="white" px="2" py="0.5" borderRadius="full" fontWeight="600">± {Math.round(gps.precisionM)}m</Text>
          </Flex>
          <Text fontSize="xs" color="var(--cc-cocoa)" fontWeight="500">{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)}</Text>
        </Stack>
      </Flex>
    )
  }

  if (state === 'denied') {
    return (
      <Flex
        p="5"
        bg="rgba(192, 57, 43, 0.08)"
        border="1px solid var(--cc-danger)"
        borderRadius="var(--cc-radius-md)"
        align="center"
        gap="3"
        justify="space-between"
      >
        <Stack gap="0">
          <Text fontSize="sm" fontWeight="700" color="var(--cc-danger)">Accès GPS refusé</Text>
          <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.7">Autorisez la localisation dans les paramètres de votre navigateur</Text>
        </Stack>
        <button className="cc-btn-outline" style={{ padding: '6px 14px', fontSize: '12px' }} onClick={onRetry}>
          Réessayer
        </button>
      </Flex>
    )
  }

  if (state === 'unavailable') {
    return (
      <Flex
        p="5"
        bg="rgba(196, 151, 58, 0.08)"
        border="1px solid var(--cc-gold)"
        borderRadius="var(--cc-radius-md)"
        align="center"
        gap="3"
        justify="space-between"
      >
        <Stack gap="0">
          <Text fontSize="sm" fontWeight="700" color="var(--cc-gold)">GPS indisponible</Text>
          <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.7">Votre appareil ne supporte pas la géolocalisation</Text>
        </Stack>
      </Flex>
    )
  }

  return null
}

export function FarmerCapturePage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { token } = useAuth()
  const { submitDraft, saveDraft } = useLots()

  const [step, setStep] = useState(1)
  const [photoUri, setPhotoUri] = useState<string | null>(null)
  const [gpsState, setGpsState] = useState<GpsState>('idle')
  const [gps, setGps] = useState<GpsData | null>(null)
  const [form, setForm] = useState({
    variety: 'Trinitario',
    weightKg: '',
    harvestDate: new Date().toISOString().split('T')[0],
    hsCode: '1801',
    originCountry: 'TG',
    originRegion: '',
    productionStartDate: '',
    productionEndDate: '',
    parcelIds: [] as string[],
  })
  const [submitting, setSubmitting] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [parcels, setParcels] = useState<ParcelRecord[]>([])
  const [parcelsLoading, setParcelsLoading] = useState(false)
  const [selectedParcelId, setSelectedParcelId] = useState('')

  // Track if GPS has been requested to prevent infinite loop
  const gpsRequestedRef = useRef(false)

  const stopWatching = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
  }, [watchId])

  const requestGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsState('unavailable')
      showToast('Géolocalisation non supportée par cet appareil.', 'warning')
      return
    }

    setGpsState('requesting')
    showToast('Demande d\'accès à la localisation...', 'info')

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const data: GpsData = { lat: latitude, lng: longitude, precisionM: accuracy }
        setGps(data)

        if (accuracy <= 100) {
          setGpsState('acquired')
          showToast(`Position GPS acquise avec une précision de ± ${Math.round(accuracy)}m`, 'success')
          navigator.geolocation.clearWatch(id)
          setWatchId(null)
        } else {
          setGpsState('calibrating')
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGpsState('denied')
          showToast('Vous avez refusé l\'accès GPS. La localisation est obligatoire.', 'error')
        } else {
          setGpsState('unavailable')
          showToast('Impossible d\'obtenir la position GPS.', 'error')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      },
    )

    setWatchId(id)
  }, [showToast])

  // Request GPS on mount - use ref to prevent infinite loop
  useEffect(() => {
    if (!gpsRequestedRef.current) {
      gpsRequestedRef.current = true
      requestGps()
    }
  }, [requestGps])

  useEffect(() => {
    if (!token) {
      setParcels([])
      return
    }

    const loadParcels = async () => {
      setParcelsLoading(true)
      try {
        const response = await listParcels(token)
        const items = Array.isArray(response)
          ? response
          : Array.isArray((response as { items?: unknown })?.items)
            ? (response as { items: unknown[] }).items
            : Array.isArray((response as { data?: { items?: unknown } })?.data?.items)
              ? ((response as { data: { items: unknown[] } }).data.items)
              : []
        setParcels(items as ParcelRecord[])
      } catch {
        showToast('Impossible de charger les parcelles.', 'warning')
        setParcels([])
      } finally {
        setParcelsLoading(false)
      }
    }

    void loadParcels()
  }, [token, showToast])

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      stopWatching()
    }
  }, [stopWatching])

  const goToStep2 = () => {
    if (!photoUri) {
      showToast('Veuillez prendre une photo avant de continuer.', 'warning')
      return
    }
    if (gpsState !== 'acquired') {
      showToast('Attendez que la localisation GPS soit calibrée.', 'warning')
      return
    }
    setStep(2)
    showToast('Photo et GPS validés. Renseignez les détails du lot.', 'info')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!photoUri) {
      showToast('Photo manquante.', 'warning')
      return
    }
    if (!gps) {
      showToast('Position GPS manquante.', 'warning')
      return
    }
    if (form.weightKg === '' || Number(form.weightKg) < 0) {
      showToast('Veuillez renseigner un poids valide.', 'warning')
      return
    }

    setSubmitting(true)
    showToast('Enregistrement du lot en cours...', 'info')

    try {
      const draftId = `draft-${Date.now()}`
      const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const parcelIds = form.parcelIds.length > 0 ? form.parcelIds : undefined

      const draft = {
        id: draftId,
        title: `LOT-${Date.now()}`,
        product: 'Cacao',
        variety: form.variety,
        hsCode: form.hsCode || undefined,
        originCountry: form.originCountry || undefined,
        originRegion: form.originRegion || undefined,
        weightKg: Number(form.weightKg),
        harvestDate: form.harvestDate,
        productionStartDate: form.productionStartDate || undefined,
        productionEndDate: form.productionEndDate || undefined,
        parcelIds,
        gpsOriginLat: gps.lat,
        gpsOriginLng: gps.lng,
        gpsPrecisionM: Math.round(gps.precisionM),
        photoDataUrl: photoUri,
        idempotencyKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await saveDraft(draft)
      await submitDraft(draft)
      showToast('Lot enregistré avec succès !', 'success')
      navigate('/farmer/lots')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la création du lot.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack gap="8" maxW="2xl" mx="auto" pb="12" className="cc-slide-up">
      {/* Header */}
      <Stack gap="2" textAlign="center">
        <Text textTransform="uppercase" letterSpacing="0.1em" fontSize="xs" fontWeight="700" color="var(--cc-olive)">Nouvelle Déclaration</Text>
        <Heading size="2xl" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Capturer un lot</Heading>
        <Text color="var(--cc-cocoa)" opacity="0.7">Suivez les étapes pour enregistrer la récolte.</Text>
      </Stack>

      {/* Progress Bar (3 steps) */}
      <Flex gap="2" mb="2">
        <Flex flex="1" direction="column" align="center" gap="1">
          <Box w="full" h="4px" bg={step >= 1 ? 'var(--cc-olive)' : 'var(--cc-line)'} borderRadius="full" transition="all 0.4s" />
          <Flex align="center" gap="1">
            <Camera size={12} strokeWidth={2} color={step >= 1 ? 'var(--cc-olive)' : 'var(--cc-cocoa)'} />
            <Text fontSize="10px" fontWeight="600" color={step >= 1 ? 'var(--cc-olive)' : 'var(--cc-cocoa)'}>Photo + GPS</Text>
          </Flex>
        </Flex>
        <Flex flex="1" direction="column" align="center" gap="1">
          <Box w="full" h="4px" bg={step >= 2 ? 'var(--cc-olive)' : 'var(--cc-line)'} borderRadius="full" transition="all 0.4s" />
          <Flex align="center" gap="1">
            <FileText size={12} strokeWidth={2} color={step >= 2 ? 'var(--cc-olive)' : 'var(--cc-cocoa)'} />
            <Text fontSize="10px" fontWeight="600" color={step >= 2 ? 'var(--cc-olive)' : 'var(--cc-cocoa)'}>Détails</Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Card */}
      <Box className="cc-surface" borderRadius="var(--cc-radius-xl)" p={{ base: '6', md: '8' }}>
        {step === 1 && (
          <Stack gap="6">
            <Stack gap="1">
              <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Étape 1 : Photo & Localisation</Heading>
              <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">Prenez une photo claire du lot. La localisation GPS est acquise en parallèle.</Text>
            </Stack>

            {/* GPS Widget */}
            <GpsCalibrationWidget state={gpsState} gps={gps} onRetry={requestGps} />

            {/* Camera */}
            <Box borderRadius="var(--cc-radius-md)" overflow="hidden" border="1px solid var(--cc-line)">
              <CameraCapture
                value={photoUri}
                onChange={(uri) => setPhotoUri(uri)}
              />
            </Box>

            <Flex justify="flex-end">
              <button
                className="cc-btn-gold"
                onClick={goToStep2}
                disabled={!photoUri || gpsState !== 'acquired'}
                style={{ opacity: (!photoUri || gpsState !== 'acquired') ? 0.5 : 1 }}
              >
                {gpsState === 'calibrating' ? 'Calibrage GPS...' : gpsState !== 'acquired' ? 'En attente GPS...' : 'Suivant →'}
              </button>
            </Flex>
          </Stack>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <Stack gap="6">
              <Flex justify="space-between" align="center">
                <Stack gap="1">
                  <Heading size="md" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">Étape 2 : Détails</Heading>
                  <Text fontSize="sm" color="var(--cc-cocoa)" opacity="0.7">Renseignez le poids et la variété.</Text>
                </Stack>
                {photoUri && (
                  <Box w="60px" h="60px" borderRadius="var(--cc-radius-sm)" overflow="hidden" border="1px solid var(--cc-gold)">
                    <img src={photoUri} alt="Preuve" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                )}
              </Flex>

              {/* GPS Summary (compact) */}
              {gps && (
                <Flex p="3" bg="rgba(42, 110, 80, 0.06)" border="1px solid var(--cc-olive)" borderRadius="var(--cc-radius-sm)" align="center" gap="2">
                  <Box color="var(--cc-olive)"><MapPin size={14} strokeWidth={2} /></Box>
                  <Text fontSize="xs" fontWeight="600" color="var(--cc-olive)">{gps.lat.toFixed(6)}, {gps.lng.toFixed(6)} (± {Math.round(gps.precisionM)}m)</Text>
                </Flex>
              )}

              <SimpleGrid columns={2} gap="4">
                <Stack gap="1">
                  <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Variété</Text>
                  <select className="cc-input" value={form.variety} onChange={(e) => setForm((c) => ({ ...c, variety: e.target.value }))}>
                    <option value="Forastero">Forastero</option>
                    <option value="Criollo">Criollo</option>
                    <option value="Trinitario">Trinitario</option>
                    <option value="Inconnu">Inconnu</option>
                  </select>
                </Stack>

                <Stack gap="1">
                  <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Poids (kg)</Text>
                  <input className="cc-input" type="number" step="0.1" min="0" value={form.weightKg} onChange={(e) => setForm((c) => ({ ...c, weightKg: e.target.value }))} placeholder="Ex: 50.5" required />
                </Stack>
              </SimpleGrid>

              <Stack gap="1">
                <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Date de récolte</Text>
                <input className="cc-input" type="date" value={form.harvestDate} onChange={(e) => setForm((c) => ({ ...c, harvestDate: e.target.value }))} />
              </Stack>

              <Stack gap="2" pt="2">
                <Heading size="sm" color="var(--cc-cocoa-deep)" fontFamily="'Playfair Display', serif">EUDR (optionnel)</Heading>
                <Text fontSize="xs" color="var(--cc-cocoa)" opacity="0.6">Renseignez ces champs si disponibles.</Text>
                <SimpleGrid columns={2} gap="4">
                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Code HS</Text>
                    <input className="cc-input" value={form.hsCode} onChange={(e) => setForm((c) => ({ ...c, hsCode: e.target.value }))} />
                  </Stack>
                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Pays d'origine</Text>
                    <input className="cc-input" value={form.originCountry} onChange={(e) => setForm((c) => ({ ...c, originCountry: e.target.value }))} />
                  </Stack>
                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Région d'origine</Text>
                    <input className="cc-input" value={form.originRegion} onChange={(e) => setForm((c) => ({ ...c, originRegion: e.target.value }))} />
                  </Stack>
                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Début production</Text>
                    <input className="cc-input" type="date" value={form.productionStartDate} onChange={(e) => setForm((c) => ({ ...c, productionStartDate: e.target.value }))} />
                  </Stack>
                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Fin production</Text>
                    <input className="cc-input" type="date" value={form.productionEndDate} onChange={(e) => setForm((c) => ({ ...c, productionEndDate: e.target.value }))} />
                  </Stack>
                  <Stack gap="1">
                    <Text fontSize="sm" fontWeight="600" color="var(--cc-cocoa)">Parcelles</Text>
                    <Flex gap="2" wrap="wrap">
                      <select
                        className="cc-input"
                        value={selectedParcelId}
                        onChange={(e) => setSelectedParcelId(e.target.value)}
                        disabled={parcelsLoading || parcels.length === 0}
                      >
                        <option value="">
                          {parcelsLoading
                            ? 'Chargement des parcelles...'
                            : parcels.length === 0
                              ? 'Aucune parcelle disponible'
                              : 'Choisir une parcelle'}
                        </option>
                        {parcels.map((parcel) => (
                          <option key={parcel.id} value={parcel.id}>
                            {parcel.name || parcel.id}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        className="cc-btn-outline"
                        onClick={() => {
                          if (!selectedParcelId || form.parcelIds.includes(selectedParcelId)) {
                            return
                          }
                          setForm((current) => ({
                            ...current,
                            parcelIds: [...current.parcelIds, selectedParcelId],
                          }))
                          setSelectedParcelId('')
                        }}
                        disabled={!selectedParcelId || form.parcelIds.includes(selectedParcelId)}
                        style={{ padding: '8px 14px', fontSize: '12px' }}
                      >
                        Ajouter
                      </button>
                    </Flex>
                    {form.parcelIds.length > 0 && (
                      <Flex gap="2" wrap="wrap">
                        {form.parcelIds.map((parcelId) => {
                          const parcel = parcels.find((item) => item.id === parcelId)
                          return (
                            <Flex
                              key={parcelId}
                              align="center"
                              gap="2"
                              px="3"
                              py="1"
                              borderRadius="full"
                              border="1px solid var(--cc-line)"
                              bg="white"
                            >
                              <Text fontSize="xs" fontWeight="600" color="var(--cc-cocoa)">
                                {parcel?.name || parcelId}
                              </Text>
                              <button
                                type="button"
                                onClick={() =>
                                  setForm((current) => ({
                                    ...current,
                                    parcelIds: current.parcelIds.filter((id) => id !== parcelId),
                                  }))
                                }
                                style={{
                                  borderRadius: '999px',
                                  border: '1px solid var(--cc-line)',
                                  width: '20px',
                                  height: '20px',
                                  fontSize: '12px',
                                  lineHeight: '18px',
                                }}
                                aria-label="Retirer la parcelle"
                              >
                                ×
                              </button>
                            </Flex>
                          )
                        })}
                      </Flex>
                    )}
                  </Stack>
                </SimpleGrid>
              </Stack>

              <Flex gap="3" pt="4">
                <button type="button" className="cc-btn-outline" onClick={() => setStep(1)} style={{ flex: 1 }}>Retour</button>
                <button type="submit" className="cc-btn-gold" style={{ flex: 2 }} disabled={submitting}>
                  {submitting ? 'Enregistrement...' : 'Finaliser le lot'}
                </button>
              </Flex>
            </Stack>
          </form>
        )}
      </Box>
    </Stack>
  )
}
