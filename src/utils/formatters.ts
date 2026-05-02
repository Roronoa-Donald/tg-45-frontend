export const formatDate = (isoDate: string, locale: 'fr' | 'en') => {
  const formatter = new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return formatter.format(new Date(isoDate))
}

export const formatFcfa = (value: number, locale: 'fr' | 'en') => {
  const formatter = new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-GB', {
    maximumFractionDigits: 0,
  })

  return `${formatter.format(value)} FCFA`
}

export const truncateHash = (hash: string) => {
  if (hash.length < 12) {
    return hash
  }

  return `${hash.slice(0, 8)}...${hash.slice(-4)}`
}
