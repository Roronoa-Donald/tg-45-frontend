import { useTranslation } from 'react-i18next'

interface Props {
  className?: string
}

const languages: Array<'fr' | 'en'> = ['fr', 'en']

export const LanguageToggle = ({ className = '' }: Props) => {
  const { i18n } = useTranslation()

  return (
    <div
      className={`inline-flex items-center rounded-full border border-[rgba(0,0,0,0.1)] bg-white p-1 ${className}`}
      aria-label="Language switch"
      role="group"
    >
      {languages.map((language) => {
        const active = i18n.language.startsWith(language)

        return (
          <button
            key={language}
            type="button"
            onClick={() => i18n.changeLanguage(language)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150 ease-out ${
              active
                ? 'bg-brandGreen-500 text-white'
                : 'text-cocoa-700 hover:bg-cream-light'
            }`}
          >
            {language.toUpperCase()}
          </button>
        )
      })}
    </div>
  )
}
