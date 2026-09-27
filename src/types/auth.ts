export type AuthStatus = 'unknown' | 'active' | 'signed-out' | 'expired'

export interface AuthSessionState {
  status: AuthStatus
  mode: 'official-external'
  verifiedByHub: false
  confirmedAt?: number
  expiresAt?: number
  pendingServiceId?: string
  pendingReturnTo?: string
}
