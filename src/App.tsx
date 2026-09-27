import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { AppHeader } from './components/layout/AppHeader'
import { BottomNavigation } from './components/navigation/BottomNavigation'
import { MiniProgramDialog } from './components/miniprogram/MiniProgramDialog'
import { SearchBar } from './components/search/SearchBar'
import { CategoryFilter } from './components/services/CategoryFilter'
import { CategorySection } from './components/services/CategorySection'
import { EmptySearchState } from './components/services/EmptySearchState'
import { ServiceGrid } from './components/services/ServiceGrid'
import { FrequentlyUsedServices } from './components/usage/FrequentlyUsedServices'
import { useAuth, type ConfirmedLoginResult } from './context/AuthContext'
import { serviceCategories } from './data/categories'
import { services } from './data/services'
import { useHashRoute } from './hooks/useHashRoute'
import { useServiceUsage } from './hooks/useServiceUsage'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { LoginPage } from './pages/LoginPage'
import { SchedulePage } from './pages/SchedulePage'
import { XmuAuthValidationPage } from './pages/XmuAuthValidationPage'
import { openService } from './lib/service-actions'
import { getServiceOpenAction } from './lib/service-access'
import { filterServices } from './lib/service-search'
import { getCurrentReturnTo } from './services/authService'
import { openXmuOfficialLogin } from './services/xmuSessionService'
import type {
  MiniProgramService,
  Service,
  ServiceCategoryId,
  WebsiteService,
} from './types/service'

export default function App() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<
    ServiceCategoryId | 'all'
  >('all')
  const [selectedMiniProgram, setSelectedMiniProgram] =
    useState<MiniProgramService | null>(null)

  const { session, setPendingService } = useAuth()
  const [location, navigate] = useHashRoute()
  const { usage, recordUsage, mostUsedServices } = useServiceUsage(services)

  const pendingService = useMemo(() => {
    return services.find(
      (service): service is WebsiteService =>
        service.id === session.pendingServiceId && service.type === 'website',
    )
  }, [session.pendingServiceId])

  const searchResults = useMemo(() => {
    const results = filterServices(services, query)

    return activeCategory === 'all'
      ? results
      : results.filter((service) => service.category === activeCategory)
  }, [activeCategory, query])

  const visibleCategories =
    activeCategory === 'all'
      ? serviceCategories
      : serviceCategories.filter(
          (category) => category.id === activeCategory,
        )

  const isSearching = query.trim().length > 0

  useEffect(() => {
    if (location.route === 'home' && location.returnTo === '/services') {
      window.requestAnimationFrame(() => {
        document.getElementById('services')?.scrollIntoView()
      })
    }
  }, [location.returnTo, location.route])

  const handleServiceOpen = (service: Service) => {
    const openAction = getServiceOpenAction(service, session.status)

    if (openAction === 'login') {
      setPendingService(service.id)
      navigate('login', getCurrentReturnTo())
      return
    }

    if (openAction === 'wechat-web') {
      if (service.type === 'wechat-web') {
        openService(service, getCurrentReturnTo())
      }
      return
    }

    if (openAction === 'miniprogram') {
      if (service.type === 'miniprogram') {
        setSelectedMiniProgram(service)
      }
      return
    }

    if (service.type === 'website') {
      openService(service, getCurrentReturnTo())
      recordUsage(service.id)
    }
  }

  const handleLoginConfirmed = ({
    returnTo,
    serviceId,
  }: ConfirmedLoginResult) => {
    if (serviceId) {
      const service = services.find(
        (candidate): candidate is WebsiteService =>
          candidate.id === serviceId && candidate.type === 'website',
      )

      if (service) {
        openService(service, returnTo)
        recordUsage(service.id)
      }
    }

    setPendingService(undefined)
    navigate('home', returnTo, true)
  }

  const resetSearch = () => {
    setQuery('')
    setActiveCategory('all')
  }

  const openLogin = () => {
    setPendingService(undefined)
    navigate('login', getCurrentReturnTo())
  }

  const returnFromLogin = (returnTo: string, replace = false) => {
    navigate('home', returnTo, replace)
  }

  const handleTabNavigate = (tab: 'services' | 'schedule') => {
    if (tab === 'schedule') {
      navigate('schedule', '/schedule', true)
      return
    }

    navigate('home', '/services', true)
  }

  if (location.route === 'login') {
    return (
      <div className="min-h-screen bg-[var(--canvas)]">
        <AppHeader onLogin={openLogin} />
        <LoginPage
          pendingService={pendingService}
          returnTo={location.returnTo}
          onReturn={returnFromLogin}
          onConfirmed={handleLoginConfirmed}
        />
      </div>
    )
  }

  if (location.route === 'callback') {
    return (
      <div className="min-h-screen bg-[var(--canvas)]">
        <AppHeader onLogin={openLogin} />
        <AuthCallbackPage
          returnTo={location.returnTo}
          onLogin={openLogin}
          onReturn={returnFromLogin}
        />
      </div>
    )
  }


  if (location.route === 'xmu-auth') {
    return (
      <div className="min-h-screen bg-[var(--canvas)] pb-24">
        <AppHeader onLogin={() => void openXmuOfficialLogin()} />
        <XmuAuthValidationPage
          onBack={() => navigate('schedule', '/schedule', true)}
        />
        <BottomNavigation active="schedule" onNavigate={handleTabNavigate} />
      </div>
    )
  }
  if (location.route === 'schedule') {
    return (
      <div className="h-[100dvh] overflow-hidden bg-[var(--canvas)]">
        <SchedulePage />
        <BottomNavigation active="schedule" onNavigate={handleTabNavigate} />
      </div>
    )
  }

  return (
    <div id="top" className="min-h-screen bg-[var(--canvas)] pb-24">
      <AppHeader onLogin={openLogin} />

      <main>
        <section className="border-b border-[var(--line-soft)]">
          <div className="mx-auto max-w-7xl px-4 pb-5 pt-6 sm:px-6 sm:pb-14 sm:pt-20 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--brand)] sm:text-sm">
                <ShieldCheck className="size-4" aria-hidden="true" />
                厦门大学校园服务聚合入口
              </div>
              <h1 className="mt-3 text-[24px] font-bold leading-8 tracking-normal text-[var(--ink)] sm:mt-5 sm:text-5xl sm:leading-tight">
                厦大校园 Hub
              </h1>
              <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[var(--muted)] sm:mt-5 sm:text-lg sm:leading-8">
                把分散的教务、选课、资源和生活服务放在一个清晰的入口里，
                快速找到并打开你需要的校园服务。
              </p>
            </div>

            <div className="mt-4 max-w-3xl sm:mt-9">
              <SearchBar value={query} onChange={setQuery} />
            </div>
          </div>
        </section>

        <div
          id="services"
          className="mx-auto max-w-7xl space-y-7 px-4 py-5 sm:space-y-12 sm:px-6 sm:py-16 lg:px-8"
        >
          <CategoryFilter
            categories={serviceCategories}
            activeCategory={activeCategory}
            onChange={setActiveCategory}
          />

          {!isSearching && activeCategory === 'all' ? (
            <FrequentlyUsedServices
              services={mostUsedServices}
              usage={usage}
              onOpen={handleServiceOpen}
            />
          ) : null}

          {isSearching ? (
            <section aria-labelledby="search-results-title">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2 sm:mb-5 sm:gap-3">
                <div>
                  <h2
                    id="search-results-title"
                    className="text-base font-semibold text-[var(--ink)] sm:text-lg"
                  >
                    搜索结果
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                    “{query}” 的匹配服务
                  </p>
                </div>
                <span
                  className="text-xs text-[var(--muted)] sm:text-sm"
                  aria-live="polite"
                >
                  找到 {searchResults.length} 项服务
                </span>
              </div>

              {searchResults.length > 0 ? (
                <ServiceGrid
                  services={searchResults}
                  usage={usage}
                  onOpen={handleServiceOpen}
                />
              ) : (
                <EmptySearchState query={query} onReset={resetSearch} />
              )}
            </section>
          ) : (
            <div className="space-y-9 sm:space-y-14">
              {visibleCategories.map((category) => {
                const categoryServices = searchResults.filter(
                  (service) => service.category === category.id,
                )

                return (
                  <CategorySection
                    key={category.id}
                    category={category}
                    services={categoryServices}
                    usage={usage}
                    onOpen={handleServiceOpen}
                  />
                )
              })}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-[var(--line-soft)] bg-[var(--surface-soft)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs leading-5 text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8 sm:text-sm sm:leading-6 lg:px-8">
          <p>厦大校园 Hub · 校园服务导航</p>
          <p>具体服务由学校相关部门提供，本站仅负责整理与导航。</p>
        </div>
      </footer>

      <BottomNavigation active="services" onNavigate={handleTabNavigate} />

      <MiniProgramDialog
        service={selectedMiniProgram}
        onClose={() => setSelectedMiniProgram(null)}
      />
    </div>
  )
}
