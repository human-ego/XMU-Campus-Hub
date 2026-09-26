import {
  GraduationCap,
  Landmark,
  Library,
  Smartphone,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type {
  Service,
  ServiceCategory,
  ServiceUsageMap,
} from '../../types/service'
import { ServiceGrid } from './ServiceGrid'

const categoryIcons: Record<ServiceCategory['icon'], LucideIcon> = {
  GraduationCap,
  Landmark,
  Library,
  Smartphone,
}

interface CategorySectionProps {
  category: ServiceCategory
  services: readonly Service[]
  usage: ServiceUsageMap
  onOpen: (service: Service) => void
}

export function CategorySection({
  category,
  services,
  usage,
  onOpen,
}: CategorySectionProps) {
  const Icon = categoryIcons[category.icon]

  return (
    <section className="scroll-mt-20" aria-labelledby={`category-${category.id}`}>
      <div className="mb-3 flex items-center justify-between gap-3 sm:mb-5 sm:items-end">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span
            className={`flex size-9 shrink-0 items-center justify-center rounded-lg category-icon category-icon--${category.color} sm:size-10`}
          >
            <Icon className="size-[18px] sm:size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2
              id={`category-${category.id}`}
              className="text-base font-semibold text-[var(--ink)] sm:text-lg"
            >
              {category.name}
            </h2>
            <p className="truncate text-xs text-[var(--muted)] sm:mt-0.5 sm:text-sm">
              {category.description}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-xs text-[var(--muted)] sm:text-sm">
          {services.length} 项服务
        </span>
      </div>

      <ServiceGrid services={services} usage={usage} onOpen={onOpen} />
    </section>
  )
}
