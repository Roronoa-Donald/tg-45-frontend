import { useTranslation } from 'react-i18next'
import type { LotStatus } from '../domain/types'

interface Props {
  status: LotStatus
}

const variantClasses: Record<LotStatus, string> = {
  registered: 'bg-infoBlue-50 text-infoBlue-700 border-infoBlue-200',
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  validated: 'bg-brandGreen-50 text-brandGreen-700 border-brandGreen-100',
  certified: 'bg-brandGreen-100 text-brandGreen-900 border-brandGreen-200',
  shipped: 'bg-ochre-50 text-ochre-700 border-ochre-100',
  exported: 'bg-brandGreen-100 text-brandGreen-900 border-brandGreen-200',
  delivered: 'bg-brandGreen-50 text-brandGreen-700 border-brandGreen-100',
  in_transit: 'bg-ochre-50 text-ochre-700 border-ochre-100',
  rejected: 'bg-errorRed-50 text-errorRed-700 border-errorRed-200',
}

export const LotStatusBadge = ({ status }: Props) => {
  const { t } = useTranslation()

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${variantClasses[status]}`}
    >
      {t(`status.${status}`)}
    </span>
  )
}
