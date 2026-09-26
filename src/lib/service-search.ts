import { categoryMap } from '../data/categories'
import type { Service } from '../types/service'

export function filterServices(
  services: readonly Service[],
  query: string,
): Service[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('zh-CN')

  if (!normalizedQuery) {
    return [...services]
  }

  return services.filter((service) => {
    const category = categoryMap[service.category]
    const searchableText = [
      service.name,
      service.description,
      category.name,
      ...service.keywords,
    ]
      .join(' ')
      .toLocaleLowerCase('zh-CN')

    return searchableText.includes(normalizedQuery)
  })
}
