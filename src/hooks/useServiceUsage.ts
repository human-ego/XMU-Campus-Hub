import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  Service,
  ServiceUsageMap,
  ServiceUsageRecord,
} from '../types/service'

const STORAGE_KEY = 'xmu-campus-hub:service-usage:v1'

function isUsageRecord(value: unknown): value is ServiceUsageRecord {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Partial<ServiceUsageRecord>
  return (
    typeof record.count === 'number' &&
    Number.isFinite(record.count) &&
    record.count >= 0 &&
    typeof record.lastUsedAt === 'number' &&
    Number.isFinite(record.lastUsedAt)
  )
}

function readUsageMap(): ServiceUsageMap {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) {
      return {}
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    if (!parsedValue || typeof parsedValue !== 'object') {
      return {}
    }

    return Object.fromEntries(
      Object.entries(parsedValue as Record<string, unknown>).filter(
        ([, value]) => isUsageRecord(value),
      ),
    ) as ServiceUsageMap
  } catch {
    return {}
  }
}

export function useServiceUsage(services: readonly Service[]) {
  const [usage, setUsage] = useState<ServiceUsageMap>(readUsageMap)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usage))
    } catch {
      // The app remains usable when browser storage is unavailable.
    }
  }, [usage])

  const recordUsage = useCallback((serviceId: string) => {
    setUsage((currentUsage) => {
      const previousRecord = currentUsage[serviceId]

      return {
        ...currentUsage,
        [serviceId]: {
          count: (previousRecord?.count ?? 0) + 1,
          lastUsedAt: Date.now(),
        },
      }
    })
  }, [])

  const mostUsedServices = useMemo(() => {
    return [...services]
      .filter((service) => (usage[service.id]?.count ?? 0) > 0)
      .sort((firstService, secondService) => {
        const firstUsage = usage[firstService.id]
        const secondUsage = usage[secondService.id]

        if (!firstUsage || !secondUsage) {
          return 0
        }

        return (
          secondUsage.count - firstUsage.count ||
          secondUsage.lastUsedAt - firstUsage.lastUsedAt
        )
      })
      .slice(0, 4)
  }, [services, usage])

  return {
    usage,
    recordUsage,
    mostUsedServices,
  }
}
