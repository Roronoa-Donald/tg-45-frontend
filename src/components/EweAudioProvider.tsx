import React, { useRef, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { EweAudioKey } from '../config/eweAudioMap'

interface EweAudioProviderProps {
  children: ReactNode
  page?: EweAudioKey | string
  autoPlay?: boolean
  onError?: (error: Error) => void
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000'

/**
 * Composant wrapper pour lire automatiquement l'audio Ewe sur les pages farmer.
 * Charge les URLs audio depuis Cloudinary via l'API backend.
 *
 * Utilisation:
 * <EweAudioProvider page="farmer_home" autoPlay>
 *   <YourContent />
 * </EweAudioProvider>
 */
export const EweAudioProvider: React.FC<EweAudioProviderProps> = ({
  children,
  page,
  autoPlay = true,
  onError,
}) => {
  const { i18n } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({})

  // Fetch audio URLs from API
  useEffect(() => {
    if (i18n.language !== 'ee' || !page) return

    const fetchAudios = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/audio-collector/pages/${page}/ee`)
        if (!response.ok) {
          console.debug(`Audio API returned ${response.status}`)
          return
        }
        const data = await response.json()
        if (data.data?.audios) {
          setAudioUrls(data.data.audios)
        }
      } catch (err) {
        console.debug(`Failed to fetch audios for ${page}:`, err)
      }
    }

    fetchAudios()
  }, [i18n.language, page])

  // Play the first available audio for this page
  useEffect(() => {
    if (i18n.language !== 'ee' || !page || Object.keys(audioUrls).length === 0) {
      return
    }

    const audioElement = audioRef.current
    if (!audioElement) return

    // Get the first audio URL
    const firstAudioUrl = Object.values(audioUrls)[0]
    if (!firstAudioUrl) {
      console.debug(`No audio URLs found for page ${page}`)
      return
    }

    audioElement.src = firstAudioUrl

    if (autoPlay) {
      const timer = setTimeout(() => {
        audioElement.play().catch((err) => {
          console.debug(`Audio autoplay blocked or error for ${page}:`, err.message)
          if (onError) onError(err as Error)
        })
      }, 250)

      return () => clearTimeout(timer)
    }
  }, [i18n.language, page, audioUrls, autoPlay, onError])

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
