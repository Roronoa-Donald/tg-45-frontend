import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { getEweAudioPath, isValidEweAudioKey } from '../config/eweAudioMap'
import type { EweAudioKey } from '../config/eweAudioMap'

interface AudioConfig {
  key: EweAudioKey | string
  autoPlay?: boolean
}

export const useEweAudio = (config: AudioConfig) => {
  const { i18n } = useTranslation()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Seulement si la langue est Ewe et clé valide
    if (i18n.language !== 'ee' || !isValidEweAudioKey(config.key)) {
      return
    }

    const audioPath = getEweAudioPath(config.key as EweAudioKey)

    // Créer l'élément audio s'il n'existe pas
    if (!audioRef.current) {
      audioRef.current = new Audio(audioPath)
    } else {
      audioRef.current.src = audioPath
    }

    // Auto-play au chargement
    if (config.autoPlay !== false) {
      const timer = setTimeout(() => {
        audioRef.current?.play().catch((err) => {
          console.debug(`Audio autoplay blocked or failed for ${config.key}:`, err.message)
        })
      }, 250)

      return () => clearTimeout(timer)
    }
  }, [i18n.language, config.key, config.autoPlay])

  const play = () => {
    audioRef.current?.play().catch((err) => {
      console.debug('Audio play failed:', err.message)
    })
  }

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  const isEwe = i18n.language === 'ee'

  return { play, stop, isEwe, audioRef }
}
