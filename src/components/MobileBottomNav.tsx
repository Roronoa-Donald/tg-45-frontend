import { NavLink, useLocation } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'

export interface BottomNavItem {
  to: string
  label: string
  icon: LucideIcon
}

interface Props {
  items: BottomNavItem[]
}

export const MobileBottomNav = ({ items }: Props) => {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 border-t border-[rgba(0,0,0,0.1)] bg-white lg:hidden">
      <ul className="grid h-full grid-cols-4">
        {items.map((item) => {
          const active =
            location.pathname === item.to ||
            location.pathname.startsWith(`${item.to}/`)
          const Icon = item.icon

          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className="flex h-full flex-col items-center justify-center gap-1"
              >
                <Icon
                  className={`h-6 w-6 ${
                    active ? 'text-brandGreen-500' : 'text-cocoa-700'
                  }`}
                />
                <span
                  className={`text-[11px] ${
                    active ? 'font-semibold text-brandGreen-600' : 'text-cocoa-700'
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`h-1 w-1 rounded-full ${
                    active ? 'bg-brandGreen-500' : 'bg-transparent'
                  }`}
                />
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
