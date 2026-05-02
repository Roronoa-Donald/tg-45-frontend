import { Leaf } from 'lucide-react'
import { LanguageToggle } from './LanguageToggle'

interface Props {
  title: string
  userName?: string
  roleLabel?: string
}

export const DesktopTopBar = ({ title, userName, roleLabel }: Props) => {
  return (
    <header className="sticky top-0 z-30 hidden h-[60px] items-center justify-between border-b border-[rgba(0,0,0,0.1)] bg-white px-8 lg:flex">
      <div className="flex items-center gap-2 text-cocoa-700">
        <Leaf className="h-5 w-5" />
        <span className="font-semibold">ChainCacao</span>
      </div>

      <h1 className="text-base font-semibold text-cocoa-700">{title}</h1>

      <div className="flex items-center gap-3">
        <LanguageToggle />
        {userName ? (
          <span className="rounded-full border border-[rgba(0,0,0,0.1)] px-3 py-1 text-xs text-cocoa-700">
            {userName}
          </span>
        ) : null}
        {roleLabel ? (
          <span className="rounded-full border border-brandGreen-100 bg-brandGreen-50 px-3 py-1 text-xs font-medium text-brandGreen-700">
            {roleLabel}
          </span>
        ) : null}
      </div>
    </header>
  )
}
