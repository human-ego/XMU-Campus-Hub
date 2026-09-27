import type { AuthStatus } from '../types/auth'
import type { Service } from '../types/service'

export type ServiceOpenAction = 'open' | 'login' | 'miniprogram' | 'wechat-web'

export function getServiceOpenAction(
  service: Service,
  authStatus: AuthStatus,
): ServiceOpenAction {
  if (service.type === 'miniprogram') {
    return 'miniprogram'
  }

  if (service.type === 'wechat-web') {
    return 'wechat-web'
  }

  if (
    service.auth.loginRequirement === 'required' &&
    authStatus !== 'active'
  ) {
    return 'login'
  }

  return 'open'
}


