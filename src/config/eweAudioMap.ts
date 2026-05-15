/**
 * Mapping des clés d'audio Ewe vers les fichiers MP3
 * Correspond aux fichiers dans public/audios/ee/
 *
 * Utilisation:
 * - Lorsqu'un utilisateur navigue vers une page farmer en Ewe
 * - EweAudioProvider détecte la route et joue l'audio correspondant
 * - Auto-play se déclenche avec un délai de 250ms
 */

export const EWE_AUDIO_MAP = {
  // Pages farmer
  farmer_home: {
    filename: 'farmer_home.mp3',
    description: 'Accueil agriculteur - Introduction et bienvenue',
    section: 'Home page',
  },
  farmer_capture: {
    filename: 'farmer_capture.mp3',
    description: 'Capture de lot - Instructions GPS, poids, photos',
    section: 'New lot capture',
  },
  farmer_lots: {
    filename: 'farmer_lots.mp3',
    description: 'Mes lots - Gestion des lots et historique',
    section: 'Lots list',
  },
  farmer_profile: {
    filename: 'farmer_profile.mp3',
    description: 'Profil agriculteur - Informations personnelles',
    section: 'Profile page',
  },
} as const

export type EweAudioKey = keyof typeof EWE_AUDIO_MAP

/**
 * Valider qu\'une clé audio existe
 */
export const isValidEweAudioKey = (key: string): key is EweAudioKey => {
  return key in EWE_AUDIO_MAP
}

/**
 * Obtenir le chemin complet d\'un fichier audio
 */
export const getEweAudioPath = (key: EweAudioKey): string => {
  return `/audios/ee/${EWE_AUDIO_MAP[key].filename}`
}
