import { openExternalUrl } from '../services/externalLinkService'
import type {
  Service,
  WebsiteService,
  WechatWebService,
} from '../types/service'

export function getWebsiteLaunchUrl(service: WebsiteService): string {
  return service.sessionEntryUrl ?? service.url
}

export function openWebsite(service: WebsiteService): boolean {
  return openExternalUrl(getWebsiteLaunchUrl(service))
}

export function openWechatWeb(service: WechatWebService): boolean {
  return openExternalUrl(service.url)
}

export function openService(
  service: Service,
  _returnTo = '/',
): boolean {
  if (service.type === 'website') {
    return openWebsite(service)
  }

  if (service.type === 'wechat-web') {
    return openWechatWeb(service)
  }

  return false
}
