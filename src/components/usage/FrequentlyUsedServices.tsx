import { Clock3, Sparkles } from 'lucide-react'
import type { Service, ServiceUsageMap } from '../../types/service'
import { ServiceGrid } from '../services/ServiceGrid'

interface FrequentlyUsedServicesProps {
  services: readonly Service[]
  usage: ServiceUsageMap
  onOpen: (service: Service) => void
}

export function FrequentlyUsedServices({
  services,
  usage,
  onOpen,
}: FrequentlyUsedServicesProps) {
  return (
    <section aria-labelledby="frequently-used">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--brand)] sm:size-5" aria-hidden="true" />
            <h2
              id="frequently-used"
              className="text-base font-semibold text-[var(--ink)] sm:text-lg"
            >
              常用服务
            </h2>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
            根据这台设备上的使用次数自动排序
          </p>
        </div>
      </div>

      {services.length > 0 ? (
        <ServiceGrid
          services={services}
          usage={usage}
          onOpen={onOpen}
          compact
        />
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3.5 sm:min-h-32 sm:gap-4 sm:px-5 sm:py-5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--muted)] sm:size-10">
            <Clock3 className="size-4 sm:size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-[var(--ink)]">
              还没有使用记录
            </p>
            <p className="mt-0.5 text-xs leading-5 text-[var(--muted)] sm:mt-1 sm:text-sm sm:leading-6">
              打开网站服务后，常用服务会出现在这里。
            </p>
          </div>
        </div>
      )}
    </section>
  )
}
