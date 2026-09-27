import {
  AUTH_CALLBACK_PATH,
  OFFICIAL_UNIFIED_LOGIN_URL,
} from '../config/auth'

export function getSafeReturnTo(value: string | null | undefined): string {
  if (!value) {
    return '/'
  }

  const trimmedValue = value.trim()
  if (
    !trimmedValue.startsWith('/') ||
    trimmedValue.startsWith('//') ||
    trimmedValue.includes('\\') ||
    trimmedValue.includes(':')
  ) {
    return '/'
  }

  return trimmedValue
}

export function getCurrentReturnTo(): string {
  const hash = window.location.hash || '#/'
  const path = hash.startsWith('#') ? hash.slice(1) : hash

  if (path.startsWith('/login') || path.startsWith(AUTH_CALLBACK_PATH)) {
    return '/'
  }

  return getSafeReturnTo(path)
}

export function buildLoginHash(returnTo: string | undefined): string {
  const safeReturnTo = getSafeReturnTo(returnTo)
  return `#/login?returnTo=${encodeURIComponent(safeReturnTo)}`
}

export function buildCallbackUrl(returnTo: string | undefined): string {
  const safeReturnTo = getSafeReturnTo(returnTo)
  const configuredBaseUrl = import.meta.env.VITE_AUTH_CALLBACK_URL
  const baseUrl =
    configuredBaseUrl || window.location.origin + window.location.pathname
  const callbackUrl = new URL(baseUrl, window.location.origin)
  callbackUrl.hash = `${AUTH_CALLBACK_PATH}?returnTo=${encodeURIComponent(
    safeReturnTo,
  )}`
  return callbackUrl.toString()
}

export function isAutomaticCallbackConfigured(): boolean {
  return (
    import.meta.env.VITE_AUTH_SERVICE_REGISTERED === 'true' &&
    Boolean(import.meta.env.VITE_AUTH_CALLBACK_URL)
  )
}

export function buildOfficialLoginUrl(returnTo: string | undefined): string {
  if (!isAutomaticCallbackConfigured()) {
    return OFFICIAL_UNIFIED_LOGIN_URL
  }

  return `${OFFICIAL_UNIFIED_LOGIN_URL}?service=${encodeURIComponent(
    buildCallbackUrl(returnTo),
  )}`
}

export interface AuthCallbackValidationResult {
  verified: boolean
  returnTo: string
}

export async function validateAuthCallback(
  hash: string,
): Promise<AuthCallbackValidationResult> {
  const [, queryString = ''] = hash.split('?')
  const query = new URLSearchParams(queryString)
  const returnTo = getSafeReturnTo(query.get('returnTo'))
  const ticket = query.get('ticket') ?? query.get('code')
  const validationEndpoint =
    import.meta.env.VITE_AUTH_CALLBACK_VALIDATION_ENDPOINT

  if (
    !isAutomaticCallbackConfigured() ||
    !validationEndpoint ||
    !ticket
  ) {
    return { verified: false, returnTo }
  }

  const response = await fetch(validationEndpoint, {
    method: 'POST',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ticket,
      service: buildCallbackUrl(returnTo),
    }),
  })

  if (!response.ok) {
    return { verified: false, returnTo }
  }

  const result = (await response.json()) as { verified?: unknown }
  return {
    verified: result.verified === true,
    returnTo,
  }
}
