import { Camera, CheckCircle, MapPin, Check, X, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLots } from '../../hooks/useLots'
import { useToast } from '../../context/ToastContext'
import { Box, Flex, Heading, Text, Icon, Spinner, Input } from '@chakra-ui/react'
import imageCompression from 'browser-image-compression'

export const FarmerNewLotPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { saveDraft, submitDraft } = useLots()
  const { showToast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [isCapturing, setIsCapturing] = useState(false)
  const [createdLotId, setCreatedLotId] = useState('')

  // Data collected during the flow
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_cocoaPhoto, setCocoaPhoto] = useState<File | null>(null)
  const [cocoaPhotoDataUrl, setCocoaPhotoDataUrl] = useState<string | null>(null)
  const [hasScale, setHasScale] = useState<boolean | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_scalePhoto, setScalePhoto] = useState<File | null>(null)
  const [gpsReady, setGpsReady] = useState(false)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_gpsError, setGpsError] = useState<string | null>(null)

  const handleVibrate = (pattern = [50]) => {
    if (navigator.vibrate) navigator.vibrate(pattern)
  }

  const compressImage = async (file: File) => {
    const options = {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1024,
      useWebWorker: true
    }
    try {
      return await imageCompression(file, options)
    } catch (error) {
      console.error(error)
      return file
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'cocoa' | 'scale') => {
    if (e.target.files && e.target.files[0]) {
      handleVibrate()
      setIsCapturing(true)

      const file = e.target.files[0]
      const compressedFile = await compressImage(file)

      handleVibrate([50, 100, 50]) // Success vibration
      setIsCapturing(false)

      if (type === 'cocoa') {
        setCocoaPhoto(compressedFile)
        // Convert to data URL for API submission
        const reader = new FileReader()
        reader.onloadend = () => {
          setCocoaPhotoDataUrl(reader.result as string)
        }
        reader.readAsDataURL(compressedFile)
        setCurrentStep(2)
      } else {
        setScalePhoto(compressedFile)
        setCurrentStep(3)
      }
    }
  }

  const captureCocoaClick = () => {
    document.getElementById('cocoa-upload')?.click()
  }

  const captureScaleClick = () => {
    document.getElementById('scale-upload')?.click()
  }

  const skipScale = () => {
    handleVibrate()
    setHasScale(false)
    setCurrentStep(3)
  }

  // Real GPS acquisition when reaching step 3
  useEffect(() => {
    if (currentStep === 3) {
      handleVibrate([100])
      setGpsError(null)

      if (!navigator.geolocation) {
        setGpsError('Géolocalisation non supportée par cet appareil')
        showToast('Géolocalisation non supportée par cet appareil', 'error')
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setGpsReady(true)
          handleVibrate([50, 100, 50, 100, 50]) // Long success vibration
          showToast('Position GPS acquise', 'success')
        },
        (error) => {
          let errorMessage = 'Impossible d\'obtenir la position GPS'
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = 'Accès GPS refusé. Veuillez autoriser la géolocalisation.'
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = 'Position GPS indisponible'
          } else if (error.code === error.TIMEOUT) {
            errorMessage = 'Délai d\'attente GPS dépassé'
          }
          setGpsError(errorMessage)
          showToast(errorMessage, 'error')
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      )
    }
  }, [currentStep, showToast])

  const submitLot = async () => {
    if (!gpsCoords) {
      showToast('Position GPS requise', 'error')
      return
    }

    if (!user) {
      showToast('Vous devez être connecté pour créer un lot', 'error')
      return
    }

    handleVibrate()
    setIsCapturing(true)

    try {
      const draftId = `draft-${Date.now()}`
      const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const lotTitle = `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`

      const draft = {
        id: draftId,
        title: lotTitle,
        product: 'Cacao',
        variety: 'Forastero',
        weightKg: 0, // Pending cooperative transcription
        harvestDate: new Date().toISOString().split('T')[0],
        gpsOriginLat: gpsCoords.lat,
        gpsOriginLng: gpsCoords.lng,
        gpsPrecisionM: 0,
        photoDataUrl: cocoaPhotoDataUrl || undefined,
        idempotencyKey,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await saveDraft(draft)
      await submitDraft(draft)

      setCreatedLotId(lotTitle)
      handleVibrate([100, 50, 100, 50, 200]) // Victory vibration
      showToast('Lot enregistré avec succès !', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erreur lors de la création du lot', 'error')
    } finally {
      setIsCapturing(false)
    }
  }

  if (createdLotId) {
    return (
      <Flex direction="column" align="center" justify="center" minH="60vh" p={4} textAlign="center">
        <CheckCircle size={100} color="#38A169" style={{ marginBottom: 20 }} />
        <Heading size="xl" color="green.600" mb={4}>C'est fini !</Heading>
        <Text fontSize="lg" color="gray.600" mb={8}>Le sac a bien été envoyé. Tu peux ranger le téléphone.</Text>
        
        <Box 
          onClick={() => navigate('/farmer')}
          bg="#A0AEC0" 
          borderRadius="2xl" 
          p={5} 
          w="full"
          maxW="sm"
          cursor="pointer"
          _active={{ transform: 'scale(0.98)' }}
        >
          <Heading size="md" color="white">Retour à l'accueil</Heading>
        </Box>
      </Flex>
    )
  }

  return (
    <Box maxW="sm" mx="auto" px={2}>
      
      {/* ─── Step 1: Photo Cacao ─── */}
      {currentStep === 1 && (
        <Flex direction="column" align="center" mt={10}>
          <Heading size="lg" mb={8} color="#2A6E50" textAlign="center">
            Photo du Cacao
          </Heading>
          
          <Input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            id="cocoa-upload" 
            display="none" 
            onChange={(e) => handlePhotoUpload(e, 'cocoa')} 
          />

          <Box 
            onClick={captureCocoaClick}
            bg="#E53E3E" // Red
            borderRadius="full" 
            w="250px" h="250px" 
            display="flex" flexDirection="column" alignItems="center" justifyContent="center"
            cursor="pointer"
            boxShadow="0 15px 35px rgba(229, 62, 62, 0.4)"
            _active={{ transform: 'scale(0.95)' }}
            transition="all 0.2s"
          >
            {isCapturing ? (
              <Spinner size="xl" color="white" />
            ) : (
              <Icon as={Camera} w={24} h={24} color="white" />
            )}
          </Box>
        </Flex>
      )}

      {/* ─── Step 2: Photo Balance ─── */}
      {currentStep === 2 && (
        <Flex direction="column" align="center" mt={10} w="full">
          {hasScale === null ? (
            <>
              <Heading size="lg" mb={10} color="#2A6E50" textAlign="center">
                As-tu une balance ?
              </Heading>
              
              <Flex w="full" gap={4} justify="center">
                <Box 
                  onClick={() => { handleVibrate(); setHasScale(true) }}
                  bg="#38A169" // Green
                  borderRadius="2xl" 
                  p={8} 
                  flex={1}
                  display="flex" flexDirection="column" alignItems="center" justifyContent="center"
                  cursor="pointer"
                  boxShadow="0 10px 25px rgba(56, 161, 105, 0.4)"
                  _active={{ transform: 'scale(0.95)' }}
                >
                  <Icon as={Check} w={16} h={16} color="white" mb={2} />
                  <Heading size="lg" color="white">OUI</Heading>
                </Box>

                <Box 
                  onClick={skipScale}
                  bg="#E53E3E" // Red
                  borderRadius="2xl" 
                  p={8} 
                  flex={1}
                  display="flex" flexDirection="column" alignItems="center" justifyContent="center"
                  cursor="pointer"
                  boxShadow="0 10px 25px rgba(229, 62, 62, 0.4)"
                  _active={{ transform: 'scale(0.95)' }}
                >
                  <Icon as={X} w={16} h={16} color="white" mb={2} />
                  <Heading size="lg" color="white">NON</Heading>
                </Box>
              </Flex>
            </>
          ) : (
            <>
              <Heading size="lg" mb={8} color="#2A6E50" textAlign="center">
                Photo du Poids (Balance)
              </Heading>
              
              <Input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                id="scale-upload" 
                display="none" 
                onChange={(e) => handlePhotoUpload(e, 'scale')} 
              />

              <Box 
                onClick={captureScaleClick}
                bg="#E53E3E" // Red
                borderRadius="full" 
                w="250px" h="250px" 
                display="flex" flexDirection="column" alignItems="center" justifyContent="center"
                cursor="pointer"
                boxShadow="0 15px 35px rgba(229, 62, 62, 0.4)"
                _active={{ transform: 'scale(0.95)' }}
                transition="all 0.2s"
              >
                {isCapturing ? (
                  <Spinner size="xl" color="white" />
                ) : (
                  <Icon as={Camera} w={24} h={24} color="white" />
                )}
              </Box>
            </>
          )}
        </Flex>
      )}

      {/* ─── Step 3: GPS & Submit ─── */}
      {currentStep === 3 && (
        <Flex direction="column" align="center" mt={10}>
          <Heading size="lg" mb={8} color="#2A6E50" textAlign="center">
            {gpsReady ? 'Tout est prêt !' : 'Recherche de la position...'}
          </Heading>
          
          {!gpsReady ? (
            <Box 
              bg="#A0AEC0" 
              borderRadius="full" 
              w="250px" h="250px" 
              display="flex" flexDirection="column" alignItems="center" justifyContent="center"
            >
              <Icon as={MapPin} w={24} h={24} color="white" className="animate-bounce" />
            </Box>
          ) : (
            <Box 
              onClick={submitLot}
              bg="#38A169" // Green
              borderRadius="full" 
              w="250px" h="250px" 
              display="flex" flexDirection="column" alignItems="center" justifyContent="center"
              cursor="pointer"
              boxShadow="0 15px 35px rgba(56, 161, 105, 0.5)"
              _active={{ transform: 'scale(0.95)' }}
              transition="all 0.2s"
            >
              {isCapturing ? (
                <Spinner size="xl" color="white" />
              ) : (
                <>
                  <Icon as={Upload} w={20} h={20} color="white" mb={2} />
                  <Heading size="xl" color="white">ENVOYER</Heading>
                </>
              )}
            </Box>
          )}
        </Flex>
      )}

    </Box>
  )
}
