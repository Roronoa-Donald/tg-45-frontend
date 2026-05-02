import {
  ArrowRight,
  Building2,
  Camera,
  CheckCircle,
  Leaf,
  Link2,
  QrCode,
  Ship,
  Sprout,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { landingMetrics, projectMeta, roleRoutes, imageBank } from '../data/mockData'
import { LanguageToggle } from '../components/LanguageToggle'
import { RoleCard } from '../components/RoleCard'
import { SafeImage } from '../components/SafeImage'
import { useToast } from '../context/ToastContext'

const roleCards = [
  {
    id: 'farmer',
    icon: Sprout,
    colorClass: 'bg-brandGreen-50 text-brandGreen-700',
    route: roleRoutes.farmer,
  },
  {
    id: 'cooperative',
    icon: Building2,
    colorClass: 'bg-cocoa-50 text-cocoa-700',
    route: roleRoutes.cooperative,
  },
  {
    id: 'exporter',
    icon: Ship,
    colorClass: 'bg-ochre-50 text-ochre-700',
    route: roleRoutes.exporter,
  },
  {
    id: 'verify',
    icon: QrCode,
    colorClass: 'bg-infoBlue-50 text-infoBlue-700',
    route: roleRoutes.verify,
  },
] as const

const processSteps = [
  { icon: Camera, key: 'landing.step1' },
  { icon: Link2, key: 'landing.step2' },
  { icon: ArrowRight, key: 'landing.step3' },
  { icon: CheckCircle, key: 'landing.step4' },
] as const

export const LandingPage = () => {
  const { t, i18n } = useTranslation()
  const { showToast } = useToast()

  const scrollToRoles = () => {
    document.getElementById('roles-access')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleComingSoon = () => {
    showToast(t('common.comingSoon'), 'info')
  }

  return (
    <div className="min-h-screen bg-cream-light text-cocoa-700">
      <header className="sticky top-0 z-20 border-b border-[rgba(0,0,0,0.1)] bg-cream-light/95 px-4 py-3 backdrop-blur md:px-8">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-cocoa-700">
            <Leaf className="h-5 w-5" />
            <span className="font-semibold">{projectMeta.name}</span>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <main>
        <section className="pattern-beans border-b border-[rgba(0,0,0,0.1)] px-4 py-10 md:px-8 md:py-14">
          <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 inline-flex rounded-full border border-brandGreen-100 bg-brandGreen-50 px-3 py-1 text-xs font-medium text-brandGreen-700">
                {projectMeta.hackathon} · {projectMeta.phase}
              </p>
              <h1 className="mb-4 text-[24px] font-bold leading-tight text-cocoa-700 md:text-[40px]">
                {t('landing.heroTitle')}
              </h1>
              <p className="mb-6 max-w-xl text-sm text-cocoa-500 md:text-base">
                {t('landing.heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/verify"
                  className="min-h-12 rounded-lg bg-brandGreen-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-150 ease-out hover:scale-[1.02]"
                >
                  {t('common.verifyBatch')}
                </Link>
                <button
                  type="button"
                  onClick={scrollToRoles}
                  className="min-h-12 rounded-lg border border-[rgba(0,0,0,0.1)] bg-white px-5 py-3 text-sm font-semibold text-cocoa-700 transition-all duration-150 ease-out hover:scale-[1.02]"
                >
                  {t('common.accessPlatform')}
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[rgba(0,0,0,0.1)] bg-white">
              <SafeImage
                src={imageBank.hero}
                alt={t('landing.heroImageAlt')}
                className="h-64 w-full object-cover md:h-[320px]"
              />
              <div className="grid grid-cols-3 border-t border-[rgba(0,0,0,0.1)] text-center text-xs text-cocoa-500">
                <span className="border-r border-[rgba(0,0,0,0.1)] p-3">{t('landing.routeFarm')}</span>
                <span className="border-r border-[rgba(0,0,0,0.1)] p-3">{t('landing.routePort')}</span>
                <span className="p-3">{t('landing.routeEurope')}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-brandGreen-500 px-4 py-6 text-white md:px-8">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
            {landingMetrics.map((metric) => (
              <div key={metric.value}>
                <p className="text-2xl font-bold">{metric.value}</p>
                <p className="text-xs opacity-90 md:text-sm">
                  {i18n.language.startsWith('fr') ? metric.labelFr : metric.labelEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-[rgba(0,0,0,0.1)] px-4 py-10 md:px-8">
          <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-5">
              <h2 className="mb-3 text-lg font-semibold text-cocoa-700">
                {t('landing.problemTitle')}
              </h2>
              <p className="text-sm leading-relaxed text-cocoa-500">
                {t('landing.problemBody')}
              </p>
              <div className="mt-4 rounded-lg border border-[rgba(0,0,0,0.1)] bg-cream-light p-3 text-xs text-cocoa-500">
                {t('landing.context')}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-errorRed-700">
                  {t('landing.currentChain')}
                </h3>
                <ul className="space-y-2 text-xs text-cocoa-500">
                  <li>{t('landing.opaqueStep1')}</li>
                  <li>{t('landing.opaqueStep2')}</li>
                  <li>{t('landing.opaqueStep3')}</li>
                  <li>{t('landing.opaqueStep4')}</li>
                </ul>
              </article>
              <article className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-brandGreen-700">
                  {t('landing.transparentChain')}
                </h3>
                <ul className="space-y-2 text-xs text-cocoa-500">
                  <li>{t('landing.transparentStep1')}</li>
                  <li>{t('landing.transparentStep2')}</li>
                  <li>{t('landing.transparentStep3')}</li>
                  <li>{t('landing.transparentStep4')}</li>
                </ul>
              </article>
            </div>
          </div>
        </section>

        <section id="roles-access" className="border-b border-[rgba(0,0,0,0.1)] px-4 py-10 md:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="mb-6 text-lg font-semibold text-cocoa-700">{t('landing.roleTitle')}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {roleCards.map((role) => (
                <RoleCard
                  key={role.id}
                  icon={role.icon}
                  title={
                    role.id === 'verify'
                      ? t('common.verifyBatch')
                      : t(`common.${role.id}`)
                  }
                  description={
                    role.id === 'farmer'
                      ? t('landing.roleDescFarmer')
                      : role.id === 'cooperative'
                        ? t('landing.roleDescCooperative')
                        : role.id === 'exporter'
                          ? t('landing.roleDescExporter')
                          : t('landing.roleDescVerify')
                  }
                  colorClass={role.colorClass}
                  to={role.route}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-10 md:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="mb-6 text-lg font-semibold text-cocoa-700">{t('landing.howItWorks')}</h2>
            <div className="grid gap-4 md:grid-cols-4">
              {processSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <article
                    key={step.key}
                    className="rounded-xl border border-[rgba(0,0,0,0.1)] bg-white p-4"
                  >
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brandGreen-50 text-brandGreen-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mb-2 text-xs font-semibold text-brandGreen-700">0{index + 1}</p>
                    <p className="text-sm text-cocoa-500">{t(step.key)}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[rgba(0,0,0,0.1)] bg-white px-4 py-6 md:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-xs text-cocoa-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-cocoa-700">ChainCacao</p>
            <p>{t('landing.footerPowered')}</p>
          </div>
          <nav className="flex flex-wrap gap-3">
            <button type="button" onClick={handleComingSoon} className="underline decoration-dotted">
              {t('landing.footerAbout')}
            </button>
            <button type="button" onClick={handleComingSoon} className="underline decoration-dotted">
              {t('landing.footerContact')}
            </button>
            <button type="button" onClick={handleComingSoon} className="underline decoration-dotted">
              {t('landing.footerDocs')}
            </button>
            <button type="button" onClick={handleComingSoon} className="underline decoration-dotted">
              {t('landing.footerApi')}
            </button>
          </nav>
        </div>
      </footer>
    </div>
  )
}
