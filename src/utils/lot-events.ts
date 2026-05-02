const EVENT_LABELS: Record<string, string> = {
  register_lot: 'Enregistrement',
  transfer_lot: 'Transfert',
  validate_lot: 'Validation',
  verify_lot: 'Vérification',
  verify_proof: 'Preuve de vérification',
  certify_lot: 'Certification',
  update_verification_status: 'Mise à jour de vérification',
}

export function formatLotEventLabel(eventType?: string | null, fallback = 'Événement') {
  if (!eventType) {
    return fallback
  }

  return EVENT_LABELS[eventType] || eventType.replace(/_/g, ' ')
}