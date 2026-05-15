import React, { ReactNode, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { getEweAudioPath, isValidEweAudioKey, EweAudioKey } from '../config/eweAudioMap'

interface EweAudioProviderProps {
  children: ReactNode
  audioKey?: EweAudioKey | string
  autoPlay?: boolean
  onError?: (error: Error) => void
}

/**
 * Composant wrapper pour lire automatiquement l'audio Ewe sur les pages farmer.
 * Gère le cycle de vie de l'audio et l'auto-play en fonction de la langue.
 *
 * Utilisation:
 * <EweAudioProvider audioKey="farmer_home" autoPlay>
 *   <YourContent />
 * </EweAudioProvider>
 */
export const EweAudioProvider: React.FC<EweAudioProviderProps> = ({
  children,
  audioKey,
  autoPlay = true,
  onError,
}) => {
  const { i18n } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    // Seulement si la langue est Ewe
    if (i18n.language !== 'ee') {
      return
    }

    // Valider la clé d'audio
    if (!audioKey || !isValidEweAudioKey(audioKey)) {
      if (audioKey) {
        console.debug(`Invalid audio key: ${audioKey}. Check eweAudioMap.ts`)
      }
      return
    }

    const audioElement = audioRef.current
    if (!audioElement) return

    // Construire le chemin du fichier audio
    const audioPath = getEweAudioPath(audioKey as EweAudioKey)
    audioElement.src = audioPath

    if (autoPlay) {
      // Délai court pour laisser le DOM se stabiliser
      const timer = setTimeout(() => {
        audioElement.play().catch((err) => {
          console.debug(`Audio autoplay blocked or error for ${audioKey}:`, err.message)
          if (onError) onError(err)
        })
      }, 250)

      return () => clearTimeout(timer)
    }
  }, [i18n.language, audioKey, autoPlay, onError])

  // Ne rien rendre au niveau du DOM - l'audio est masqué
  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
        onError={(e) => {
          const error = new Error(`Audio load failed: ${e.currentTarget.src}`)
          console.debug(error.message)
          if (onError) onError(error)
        }}
      />
      {children}
    </>
  )
}
