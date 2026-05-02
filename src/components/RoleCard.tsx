import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

interface Props {
  icon: LucideIcon
  title: string
  description: string
  to: string
  colorClass: string
}

export const RoleCard = ({
  icon: Icon,
  title,
  description,
  to,
  colorClass,
}: Props) => {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4 transition-all duration-150 ease-out hover:scale-[1.02]"
    >
      <div
        className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full ${colorClass}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-cocoa-700">{title}</h3>
      <p className="text-xs text-cocoa-500">{description}</p>
    </Link>
  )
}
