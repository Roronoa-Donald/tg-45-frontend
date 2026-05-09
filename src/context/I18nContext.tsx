/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react'

type Language = 'fr' | 'ee'

type Translations = {
  [key in Language]: {
    [key: string]: string
  }
}

const translations: Translations = {
  fr: {
    welcome: "Bienvenue sur ChainCacao",
    farmer_space: "Espace Agriculteur",
    register_harvest: "Enregistrer une récolte",
    my_lots: "Mes Lots",
    profile: "Mon Profil",
    weight: "Poids (en Kg)",
    take_photo: "Prendre une photo",
    validate: "Valider l'enregistrement",
    home: "Accueil",
    logout: "Se déconnecter",
    read_aloud: "Lire à haute voix",
    loading: "Chargement en cours...",
    success: "Opération réussie !",
    error: "Une erreur s'est produite",
    scan_qr: "Scanner un code QR",
    verify_lot: "Vérifier la traçabilité"
  },
  ee: {
    welcome: "Woezor le ChainCacao dzi",
    farmer_space: "Agbledela ƒe teƒe",
    register_harvest: "Ŋlɔ nuku yeye ɖi",
    my_lots: "Nye kokawo",
    profile: "Nye nɔnɔme",
    weight: "Kpekpeme (Kg)",
    take_photo: "Ɖe foto",
    validate: "Lɔ̃ ɖe edzi",
    home: "Aƒeme",
    logout: "Do le eme",
    read_aloud: "Xlẽe kple gbe gã",
    loading: "Le mɔ dzi...",
    success: "Edze edzi !",
    error: "Vodada aɖe dzɔ",
    scan_qr: "Lé QR code la",
    verify_lot: "Kpɔ eƒe mɔzɔzɔ"
  }
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  speak: (text: string) => void
  isSpeaking: boolean
}

const I18nContext = createContext<I18nContextType | null>(null)

const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return 'fr'
  }

  const saved = localStorage.getItem('cc_language') as Language | null
  return saved === 'fr' || saved === 'ee' ? saved : 'fr'
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => getInitialLanguage())
  const [isSpeaking, setIsSpeaking] = useState(false)

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cc_language', lang)
    }
  }

  const t = (key: string): string => {
    return translations[language][key] || translations['fr'][key] || key
  }

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert("Votre navigateur ne supporte pas la lecture vocale.")
      return
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Web Speech API usually does not have a native Ewe ('ee') voice.
    // If the language is Ewe, we set it to 'fr-TG' or 'fr-FR' so the engine attempts to read the Ewe text using its phonetic engine,
    // which is the standard workaround for unsupported local languages on Android TTS.
    utterance.lang = language === 'ee' ? 'fr-FR' : 'fr-FR' 
    utterance.rate = 0.85 // Read slightly slower for better comprehension
    utterance.pitch = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t, speak, isSpeaking }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within an I18nProvider')
  return context
}
