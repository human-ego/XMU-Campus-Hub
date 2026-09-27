import type { AuthSessionState } from '../types/auth'

const STORAGE_KEY = 'xmu-campus-hub:auth-session:v1'

function isTimestamp(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
}

export function readAuthSession(): AuthSessionState {
  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY)
    if (!storedValue) {
      return createUnknownSession()
    }

    const parsedValue: unknown = JSON.parse(storedValue)
    if (!parsedValue || typeof parsedValue !== 'object') {
      return createUnknownSession()
    }

    const session = parsedValue as Partial<AuthSessionState>
    const status =
      session.status === 'active' ||
      session.status === 'signed-out' ||
      session.status === 'expired'
        ? session.status
        : 'unknown'

    if (
      status === 'active' &&
      (!isTimestamp(session.confirmedAt) || !isTimestamp(session.expiresAt))
    ) {
      return createUnknownSession()
    }

    return {
      status,
      mode: 'official-external',
      verifiedByHub: false,
      confirmedAt: isTimestamp(session.confirmedAt)
        ? session.confirmedAt
        : undefined,
      expiresAt: isTimestamp(session.expiresAt) ? session.expiresAt : undefined,
      pendingServiceId:
        typeof session.pendingServiceId === 'string'
          ? session.pendingServiceId
          : undefined,
      pendingReturnTo:
        typeof session.pendingReturnTo === 'string'
          ? session.pendingReturnTo
          : undefined,
    }
  } catch {
    return createUnknownSession()
  }
}

export function writeAuthSession(session: AuthSessionState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    // The app remains usable when browser storage is unavailable.
  }
}

export function createUnknownSession(): AuthSessionState {
  return {
    status: 'unknown',
    mode: 'official-external',
    verifiedByHub: false,
  }
}
