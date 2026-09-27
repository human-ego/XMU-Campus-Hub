import { CalendarDays, Layers3 } from 'lucide-react'

export type AppTab = 'services' | 'schedule'

interface BottomNavigationProps {
  active: AppTab
  onNavigate: (tab: AppTab) => void
}

const items: Array<{ id: AppTab; label: string; icon: typeof Layers3 }> = [
  { id: 'services', label: '服务综合', icon: Layers3 },
  { id: 'schedule', label: '我的课表', icon: CalendarDays },
]

export function BottomNavigation({ active, onNavigate }: BottomNavigationProps) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[var(--surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
      aria-label="主导航"
    >
      <div className="mx-auto grid h-[60px] max-w-2xl grid-cols-2 gap-1 px-3 py-1">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              type="button"
              className={
                isActive
                  ? 'flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl bg-[var(--brand-soft)] text-[11px] font-semibold text-[var(--brand)]'
                  : 'flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]'
              }
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

