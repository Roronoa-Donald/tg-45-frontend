import { Box, Flex } from '@chakra-ui/react'

const VARIANTS: Record<string, { bg: string; color: string; border: string; label: string }> = {
  registered: { bg: 'rgba(196, 151, 58, 0.1)', color: 'var(--cc-gold)', border: 'var(--cc-gold-light)', label: 'Enregistré' },
  pending: { bg: 'rgba(212, 170, 79, 0.1)', color: '#d4aa4f', border: '#d4aa4f', label: 'En attente' },
  validated: { bg: 'rgba(42, 110, 80, 0.1)', color: 'var(--cc-olive)', border: 'var(--cc-olive)', label: 'Validé' },
  certified: { bg: 'rgba(42, 110, 80, 0.15)', color: '#27ae60', border: '#27ae60', label: 'Certifié' },
  shipped: { bg: 'rgba(66, 84, 102, 0.1)', color: 'var(--cc-slate)', border: 'var(--cc-slate)', label: 'Expédié' },
  delivered: { bg: 'rgba(39, 174, 96, 0.1)', color: 'var(--cc-success)', border: 'var(--cc-success)', label: 'Livré' },
  exported: { bg: 'rgba(39, 174, 96, 0.1)', color: 'var(--cc-success)', border: 'var(--cc-success)', label: 'Exporté' },
  in_transit: { bg: 'rgba(66, 84, 102, 0.1)', color: 'var(--cc-slate)', border: 'var(--cc-slate)', label: 'En transit' },
  rejected: { bg: 'rgba(192, 57, 43, 0.1)', color: 'var(--cc-danger)', border: 'var(--cc-danger)', label: 'Rejeté' },
  online: { bg: 'rgba(39, 174, 96, 0.1)', color: 'var(--cc-success)', border: 'var(--cc-success)', label: 'En ligne' },
  offline: { bg: 'rgba(196, 151, 58, 0.1)', color: 'var(--cc-gold)', border: 'var(--cc-gold)', label: 'Hors ligne' },
  idle: { bg: 'rgba(66, 84, 102, 0.1)', color: 'var(--cc-slate)', border: 'var(--cc-slate)', label: 'Prêt' },
  syncing: { bg: 'rgba(66, 84, 102, 0.1)', color: 'var(--cc-slate)', border: 'var(--cc-slate)', label: 'Sync...' },
  error: { bg: 'rgba(192, 57, 43, 0.1)', color: 'var(--cc-danger)', border: 'var(--cc-danger)', label: 'Erreur' },
  farmer: { bg: 'rgba(42, 110, 80, 0.1)', color: 'var(--cc-olive)', border: 'var(--cc-olive)', label: 'Agriculteur' },
  cooperative: { bg: 'rgba(196, 151, 58, 0.1)', color: 'var(--cc-gold)', border: 'var(--cc-gold)', label: 'Coopérative' },
  verifier: { bg: 'rgba(44, 24, 16, 0.1)', color: 'var(--cc-cocoa)', border: 'var(--cc-cocoa)', label: 'Vérificateur' },
  exporter: { bg: 'rgba(196, 151, 58, 0.1)', color: 'var(--cc-gold)', border: 'var(--cc-gold)', label: 'Exportateur' },
  compliance: { bg: 'rgba(42, 110, 80, 0.1)', color: 'var(--cc-olive)', border: 'var(--cc-olive)', label: 'Conformité' },
  not_started: { bg: 'rgba(66, 84, 102, 0.1)', color: 'var(--cc-slate)', border: 'var(--cc-slate)', label: 'EUDR à initier' },
  draft: { bg: 'rgba(196, 151, 58, 0.12)', color: 'var(--cc-gold)', border: 'var(--cc-gold)', label: 'EUDR brouillon' },
  in_review: { bg: 'rgba(66, 84, 102, 0.1)', color: 'var(--cc-slate)', border: 'var(--cc-slate)', label: 'EUDR en revue' },
  approved: { bg: 'rgba(39, 174, 96, 0.12)', color: 'var(--cc-success)', border: 'var(--cc-success)', label: 'EUDR approuvé' },
  submitted: { bg: 'rgba(42, 110, 80, 0.15)', color: 'var(--cc-olive)', border: 'var(--cc-olive)', label: 'EUDR soumis' },
  blocked: { bg: 'rgba(192, 57, 43, 0.12)', color: 'var(--cc-danger)', border: 'var(--cc-danger)', label: 'EUDR bloqué' },
}

export function StatusPill({ value, label }: { value: string; label?: string }) {
  const parts = String(value || '').split(';').filter(Boolean)
  const normalized = parts.length > 0 ? parts : [String(value)]

  return (
    <Flex gap="2" wrap="wrap" display="inline-flex">
      {normalized.map((part, index) => {
        const variant = VARIANTS[part] ?? {
          bg: 'rgba(66, 84, 102, 0.1)',
          color: 'var(--cc-slate)',
          border: 'var(--cc-slate)',
          label: index === 0 && label ? label : part,
        }

        return (
          <Box
            key={`${part}-${index}`}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            bg={variant.bg}
            color={variant.color}
            border="1px solid"
            borderColor="transparent"
            borderRadius="full"
            px="10px"
            py="2px"
            fontSize="xs"
            fontWeight="700"
            letterSpacing="0.02em"
            textTransform="uppercase"
            whiteSpace="nowrap"
            style={{ borderBlockColor: `${variant.border}40` }}
          >
            {index === 0 && label ? label : variant.label}
          </Box>
        )
      })}
    </Flex>
  )
}

