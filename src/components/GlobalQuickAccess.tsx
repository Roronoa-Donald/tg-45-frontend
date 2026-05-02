import { Home, RotateCcw, Users } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppData } from '../context/AppContext'
import { useToast } from '../context/ToastContext'

const roleOptions = [
  { value: '/', labelKey: 'nav.landing' },
  { value: '/farmer', labelKey: 'nav.farmer' },
  { value: '/cooperative', labelKey: 'nav.cooperative' },
  { value: '/verify', labelKey: 'nav.verifier' },
  { value: '/exporter', labelKey: 'nav.exporter' },
]

const mapPathToOption = (path: string) => {
  if (path.startsWith('/farmer')) {
    return '/farmer'
  }

  if (path.startsWith('/cooperative')) {
    return '/cooperative'
  }

  if (path.startsWith('/verify')) {
    return '/verify'
  }

  if (path.startsWith('/exporter')) {
    return '/exporter'
  }

  return '/'
}

export const GlobalQuickAccess = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { resetDemoData } = useAppData()
  const { showToast } = useToast()

  const activeOption = useMemo(() => mapPathToOption(location.pathname), [location.pathname])

  const handleResetDemoData = () => {
    resetDemoData()
    navigate('/')
    showToast(t('common.demoDataReset'), 'info')
  }

  return (
    <div className="fixed left-3 top-3 z-50 flex items-center gap-2 rounded-xl border border-[rgba(0,0,0,0.1)] bg-white/95 p-2 backdrop-blur">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg border border-[rgba(0,0,0,0.1)] text-cocoa-700"
        aria-label={t('common.backHome')}
      >
        <Home className="h-4 w-4" />
      </button>

      <label className="relative inline-flex items-center gap-2">
        <Users className="h-4 w-4 text-cocoa-500" />
        <select
          value={activeOption}
          onChange={(event) => navigate(event.target.value)}
          className="h-10 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-3 pr-8 text-xs font-medium text-cocoa-700"
          aria-label={t('common.roleSwitcher')}
        >
          {roleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.labelKey)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={handleResetDemoData}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[rgba(0,0,0,0.1)] px-3 text-xs font-semibold text-cocoa-700"
        aria-label={t('common.resetDemoData')}
      >
        <RotateCcw className="h-4 w-4" />
        {t('common.reset')}
      </button>
    </div>
  )
}
