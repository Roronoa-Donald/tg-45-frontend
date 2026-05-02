import { Badge } from '@chakra-ui/react'

const VARIANTS: Record<string, { colorPalette: string; label: string }> = {
  registered: { colorPalette: 'amber', label: 'Enregistré' },
  pending: { colorPalette: 'orange', label: 'En attente' },
  validated: { colorPalette: 'green', label: 'Validé' },
  certified: { colorPalette: 'olive', label: 'Certifié' },
  shipped: { colorPalette: 'blue', label: 'Expédié' },
  in_transit: { colorPalette: 'blue', label: 'En transit' },
  rejected: { colorPalette: 'red', label: 'Rejeté' },
  online: { colorPalette: 'green', label: 'En ligne' },
  offline: { colorPalette: 'orange', label: 'Hors ligne' },
  idle: { colorPalette: 'gray', label: 'Prêt' },
  syncing: { colorPalette: 'blue', label: 'Synchronisation' },
  error: { colorPalette: 'red', label: 'Erreur' },
}

export function StatusPill({ value, label }: { value: string; label?: string }) {
  const variant = VARIANTS[value] ?? { colorPalette: 'gray', label: label || value }

  return (
    <Badge colorPalette={variant.colorPalette} variant="solid" borderRadius="full" px="3" py="1">
      {label || variant.label}
    </Badge>
  )
}
