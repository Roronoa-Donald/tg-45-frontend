import { Link2, Clock, CheckCircle2 } from 'lucide-react'
import { truncateHash } from '../utils/formatters'

interface Props {
  hash?: string | null
  txHash?: string | null
  status?: string
}

export const BlockchainBadge = ({ hash, txHash, status = 'registered' }: Props) => {
  // Pending state
  if (status === 'pending' || (!hash && !txHash)) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full border border-ochre-100 bg-ochre-50 px-2 py-1 font-mono text-[11px] text-ochre-700">
        <Clock className="h-3.5 w-3.5" />
        <span className="font-sans">En attente de confirmation...</span>
      </div>
    )
  }

  // Confirmed with transaction hash
  if (txHash) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full border border-brandGreen-100 bg-brandGreen-50 px-2 py-1 font-mono text-[11px] text-brandGreen-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>{truncateHash(txHash)}</span>
        <span className="font-sans">Confirmé</span>
      </div>
    )
  }

  // Registered with proof hash
  if (hash) {
    return (
      <div className="inline-flex items-center gap-1 rounded-full border border-brandGreen-100 bg-brandGreen-50 px-2 py-1 font-mono text-[11px] text-brandGreen-700">
        <Link2 className="h-3.5 w-3.5" />
        <span>{truncateHash(hash)}</span>
        <span className="font-sans">Enregistré</span>
      </div>
    )
  }

  return null
}

