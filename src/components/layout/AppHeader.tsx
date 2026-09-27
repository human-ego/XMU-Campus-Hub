import { BookOpen, MapPin } from 'lucide-react'
import { AuthControl } from '../auth/AuthControl'

interface AppHeaderProps {
  onLogin: () => void
}

export function AppHeader({ onLogin }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line-soft)] bg-[var(--canvas)]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        <a
          href="#top"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 sm:gap-3"
          aria-label="返回厦大校园 Hub 首页"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--brand)] text-white sm:size-9">
            <BookOpen className="size-4 sm:size-5" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-bold text-[var(--ink)]">
              厦大校园 Hub
            </span>
            <span className="hidden text-[11px] text-[var(--muted)] sm:block">
              XMU CAMPUS SERVICES
            </span>
          </span>
        </a>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-sm text-[var(--muted)] sm:flex">
            <MapPin className="size-4 text-[var(--brand)]" aria-hidden="true" />
            厦门大学
          </div>
          <AuthControl onLogin={onLogin} />
        </div>
      </div>
    </header>
  )
}
