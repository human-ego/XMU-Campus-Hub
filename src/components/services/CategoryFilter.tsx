import {
  GraduationCap,
  Landmark,
  Library,
  Smartphone,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ServiceCategory } from '../../types/service'

const categoryIcons: Record<ServiceCategory['icon'], LucideIcon> = {
  GraduationCap,
  Landmark,
  Library,
  Smartphone,
}

interface CategoryFilterProps {
  categories: readonly ServiceCategory[]
  activeCategory: ServiceCategory['id'] | 'all'
  onChange: (categoryId: ServiceCategory['id'] | 'all') => void
}

export function CategoryFilter({
  categories,
  activeCategory,
  onChange,
}: CategoryFilterProps) {
  return (
    <div
      className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-nowrap sm:gap-2 sm:overflow-x-auto sm:pb-2"
      role="tablist"
      aria-label="服务分类"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeCategory === 'all'}
        className={`min-h-9 rounded-md border px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 sm:col-span-auto sm:min-h-11 sm:shrink-0 sm:px-4 sm:text-sm ${
          activeCategory === 'all'
            ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
            : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]'
        }`}
        onClick={() => onChange('all')}
      >
        全部服务
      </button>

      {categories.map((category) => {
        const Icon = categoryIcons[category.icon]
        const isActive = category.id === activeCategory

        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`flex min-h-9 items-center justify-center gap-1.5 rounded-md border px-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 sm:min-h-11 sm:shrink-0 sm:gap-2 sm:px-4 sm:text-sm ${
              isActive
                ? 'border-[var(--brand)] bg-[var(--brand)] text-white'
                : 'border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]'
            }`}
            onClick={() => onChange(category.id)}
          >
            <Icon className="size-3.5 sm:size-4" aria-hidden="true" />
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
