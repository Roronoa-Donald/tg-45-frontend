import { Home, List, Plus, User } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageToggle } from '../../components/LanguageToggle'
import { MobileBottomNav } from '../../components/MobileBottomNav'
import { DesktopTopBar } from '../../components/DesktopTopBar'
import { SafeImage } from '../../components/SafeImage'
import { useAppData } from '../../context/AppContext'

export const FarmerLayout = () => {
  const { t } = useTranslation()
  const { farmers } = useAppData()
  const location = useLocation()
  const farmer = farmers[0]

  const sidebarItems = [
    {
      to: '/farmer',
      label: t('farmer.home'),
      icon: Home,
    },
    {
      to: '/farmer/new',
      label: t('farmer.newBatch'),
      icon: Plus,
    },
    {
      to: '/farmer/lots',
      label: t('farmer.myLots'),
      icon: List,
    },
    {
      to: '/farmer/profile',
      label: t('farmer.profile'),
      icon: User,
    },
  ]

  const activeTitle =
    location.pathname === '/farmer/new'
      ? t('farmer.newBatch')
      : location.pathname === '/farmer/lots'
        ? t('farmer.myLots')
        : location.pathname === '/farmer/profile'
          ? t('farmer.profile')
          : t('farmer.home')

  return (
    <div className="min-h-screen bg-cream-light text-base text-cocoa-700">
      <div className="fixed right-3 top-3 z-50 lg:hidden">
        <LanguageToggle />
      </div>

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] lg:pl-0">
        <aside className="hidden w-[220px] flex-none border-r border-[rgba(0,0,0,0.1)] bg-white px-4 py-6 lg:block">
          <div className="mb-6 rounded-xl border border-[rgba(0,0,0,0.1)] bg-cream-light p-3">
            <SafeImage
              src={farmer.avatarUrl}
              alt={farmer.name}
              className="mb-3 h-14 w-14 rounded-full object-cover"
            />
            <p className="font-semibold text-cocoa-700">{farmer.name}</p>
            <p className="text-sm text-cocoa-500">{farmer.region}</p>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/farmer'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150 ease-out ${
                      isActive
                        ? 'bg-brandGreen-50 font-semibold text-brandGreen-700'
                        : 'text-cocoa-700 hover:bg-cream-light'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <DesktopTopBar
            title={activeTitle}
            userName={farmer.name}
            roleLabel={t('common.farmer')}
          />

          <main className="flex-1 px-4 pb-24 pt-6 md:px-6 lg:px-8 lg:pb-8 lg:pt-6">
            <Outlet />
          </main>
        </div>
      </div>

      <MobileBottomNav items={sidebarItems} />
    </div>
  )
}
