import type { WebsiteService } from '../types/service'

export function openWebsite(service: WebsiteService): boolean {
  const newWindow = window.open(service.url, '_blank', 'noopener,noreferrer')

  if (!newWindow) {
    return false
  }

  newWindow.opener = null
  return true
}
