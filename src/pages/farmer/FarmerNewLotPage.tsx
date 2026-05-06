import { Camera, CheckCircle, MapPin, Check, X, Upload } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppData } from '../../context/AppContext'
// import { useAuth } from '../../hooks/useAuth'
import type { Lot } from '../../types'
import { Box, Flex, Heading, Text, Icon, Spinner, Input } from '@chakra-ui/react'
import imageCompression from 'browser-image-compression'

export const FarmerNewLotPage = () => {
  const navigate = useNavigate()
  const { farmers, addLot } = useAppData()
  // const { user } = useAuth()
  
  // Dans le vrai projet, on trouverait le farmer par son userId. Ici on prend le premier pour la démo.
  const farmer = farmers[0]

  const [currentStep, setCurrentStep] = useState(1)
  const [isCapturing, setIsCapturing] = useState(false)
  const [createdLotId, setCreatedLotId] = useState('')
  
  // Data collected during the flow
  const [cocoaPhoto, setCocoaPhoto] = useState<File | null>(null)
  const [hasScale, setHasScale] = useState<boolean | null>(null)
  const [scalePhoto, setScalePhoto] = useState<File | null>(null)
  const [gpsReady, setGpsReady] = useState(false)

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

  // Auto GPS when reaching step 3
  useEffect(() => {
    if (currentStep === 3) {
      handleVibrate([100])
      setTimeout(() => {
        handleVibrate([50, 100, 50, 100, 50]) // Long success vibration
        setGpsReady(true)
      }, 3000)
    }
  }, [currentStep])

  const submitLot = () => {
    handleVibrate()
    setIsCapturing(true)

    setTimeout(() => {
      let lotId = `LOT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`

      const newLot: Lot = {
        id: lotId,
        qrData: `https://chaincacao.tg/verify/${lotId}`,
        farmerId: farmer.id,
        farmerName: farmer.name,
        product: 'Cacao',
        variety: 'Forastero', // Default
        weightKg: 0, // Pending cooperative transcription
        gpsOrigin: farmer.gps,
        dateHarvest: new Date().toISOString().slice(0, 10),
        status: 'registered',
        blockchainHash: `0x${Math.random().toString(16).slice(2, 34)}`,
        blockchainConfirmed: false, // Will be confirmed later by coop
        certifications: ['Fairtrade'],
        eudrCompliant: true,
        imageUrl: cocoaPhoto ? URL.createObjectURL(cocoaPhoto) : 'https://images.unsplash.com/photo-1587049352847-4d4b1ed74dd4?auto=format&fit=crop&q=80&w=800',
        scaleImageUrl: scalePhoto ? URL.createObjectURL(scalePhoto) : undefined,
        journey: [
          {
            step: 1,
            actor: farmer.name,
            role: 'Agriculteur',
            action: 'Récolte enregistrée (En attente de pesée Coop)',
            location: farmer.region,
            date: new Date().toISOString(),
            gps: farmer.gps,
            status: 'validated',
          },
        ],
      }

      addLot(newLot)
      setCreatedLotId(lotId)
      setIsCapturing(false)
      handleVibrate([100, 50, 100, 50, 200]) // Victory vibration
    }, 2000)
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
