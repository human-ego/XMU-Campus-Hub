import type { Service } from '../../types/service'
import { ServiceCard } from './ServiceCard'

interface ServiceGridProps {
  services: readonly Service[]
  usage: Record<string, { count: number }>
  onOpen: (service: Service) => void
  compact?: boolean
}

export function ServiceGrid({
  services,
  usage,
  onOpen,
  compact = false,
}: ServiceGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          usageCount={usage[service.id]?.count ?? 0}
          compact={compact}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
