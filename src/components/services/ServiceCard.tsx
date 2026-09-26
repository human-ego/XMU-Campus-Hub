import {
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Dumbbell,
  LayoutDashboard,
  Package,
  Route,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { categoryMap } from '../../data/categories'
import type { Service, ServiceIconName } from '../../types/service'

const serviceIcons: Record<ServiceIconName, LucideIcon> = {
  ClipboardList,
  CalendarDays,
  Building2,
  CheckCircle2,
  BookOpen,
  LayoutDashboard,
  Route,
  Dumbbell,
  Package,
  Droplets,
}

interface ServiceCardProps {
  service: Service
  usageCount?: number
  compact?: boolean
  onOpen: (service: Service) => void
}

export function ServiceCard({
  service,
  usageCount = 0,
  compact = false,
  onOpen,
}: ServiceCardProps) {
  const Icon = serviceIcons[service.icon]
  const category = categoryMap[service.category]
  const isWebsite = service.type === 'website'

  const actionLabel = isWebsite
    ? `访问${service.name}网站`
    : `打开微信小程序：${service.miniProgramName}`

  return (
    <button
      type="button"
      className="group w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] text-left shadow-[0_8px_24px_rgba(24,52,43,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-[var(--brand)] hover:shadow-[0_14px_32px_rgba(24,52,43,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 active:translate-y-0 sm:hover:-translate-y-1"
      onClick={() => onOpen(service)}
      aria-label={actionLabel}
    >
      <div className="relative flex min-h-[104px] flex-col items-center justify-center px-2 py-3 text-center sm:hidden">
        {usageCount > 0 ? (
          <span
            className="absolute right-1.5 top-1.5 flex items-center gap-0.5 text-[10px] font-semibold text-[var(--brand)]"
            title={`已使用 ${usageCount} 次`}
          >
            <Sparkles className="size-3" aria-hidden="true" />
            {usageCount}
          </span>
        ) : null}

        <span className="flex size-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
          <Icon className="size-4" strokeWidth={2} aria-hidden="true" />
        </span>

        <h3 className="mt-2 line-clamp-2 min-h-8 text-xs font-semibold leading-4 text-[var(--ink)]">
          {service.name}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-[10px] text-[var(--muted)]">
          <span
            className={`size-1.5 rounded-full ${
              isWebsite ? 'bg-[var(--blue)]' : 'bg-[var(--coral)]'
            }`}
            aria-hidden="true"
          />
          {isWebsite ? '网页' : '小程序'}
        </div>
      </div>

      <div
        className={`hidden w-full flex-col rounded-lg sm:flex ${
          compact
            ? 'min-h-[168px] p-5'
            : 'min-h-[210px] p-6'
        }`}
      >
        <div className="flex w-full items-start justify-between gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
            <Icon className="size-5" strokeWidth={2} aria-hidden="true" />
          </span>

          <span className="flex flex-wrap items-center justify-end gap-2">
            {usageCount > 0 ? (
              <span className="flex items-center gap-1 text-xs font-medium text-[var(--muted)]">
                <Sparkles className="size-3.5" aria-hidden="true" />
                已用 {usageCount} 次
              </span>
            ) : null}
            <span
              className={`rounded-md px-2 py-1 text-[11px] font-semibold ${
                isWebsite
                  ? 'bg-[var(--blue-soft)] text-[var(--blue)]'
                  : 'bg-[var(--coral-soft)] text-[var(--coral)]'
              }`}
            >
              {isWebsite ? '网站' : '微信小程序'}
            </span>
          </span>
        </div>

        <div className="mt-5 flex-1">
          <h3 className="text-base font-semibold text-[var(--ink)]">
            {service.name}
          </h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
            <span className="font-medium">{category.name}</span>
            <span aria-hidden="true">·</span>
            <span>{isWebsite ? '浏览器直接打开' : '微信内搜索打开'}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            {service.description}
          </p>
        </div>

        <div className="mt-5 flex w-full items-center justify-between gap-3 border-t border-[var(--line-soft)] pt-4">
          <span className="text-sm font-medium text-[var(--brand)]">
            {isWebsite ? '进入服务' : '查看打开方式'}
          </span>
          <ArrowUpRight
            className="size-4 text-[var(--brand)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </div>
      </div>
    </button>
  )
}
