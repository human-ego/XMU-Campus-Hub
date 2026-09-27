import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AUTH_SESSION_TTL_MS } from '../config/auth'
import {
  createUnknownSession,
  readAuthSession,
  writeAuthSession,
} from '../lib/auth-storage'
import {
  buildOfficialLoginUrl,
  getSafeReturnTo,
} from '../services/authService'
import { openExternalUrl } from '../services/externalLinkService'
import type { AuthSessionState } from '../types/auth'

export interface ConfirmedLoginResult {
  returnTo: string
  serviceId?: string
}

interface AuthContextValue {
  session: AuthSessionState
  setPendingService: (serviceId: string | undefined) => void
  openOfficialLogin: (
    pendingServiceId?: string,
    returnTo?: string,
  ) => boolean
  confirmOfficialLogin: () => ConfirmedLoginResult
  completeVerifiedCallback: (returnTo: string) => void
  signOut: () => void
  expireSession: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSessionState>(readAuthSession)

  useEffect(() => {
    writeAuthSession(session)
  }, [session])

  useEffect(() => {
    if (session.status !== 'active' || !session.expiresAt) {
      return
    }

    const remainingTime = session.expiresAt - Date.now()
    if (remainingTime <= 0) {
      setSession((currentSession) => ({
        ...currentSession,
        status: 'expired',
      }))
      return
    }

    const timer = window.setTimeout(() => {
      setSession((currentSession) => ({
        ...currentSession,
        status: 'expired',
      }))
    }, remainingTime)

    return () => window.clearTimeout(timer)
  }, [session.expiresAt, session.status])

  const setPendingService = useCallback((serviceId: string | undefined) => {
    setSession((currentSession) => ({
      ...currentSession,
      pendingServiceId: serviceId,
    }))
  }, [])

  const openOfficialLogin = useCallback(
    (pendingServiceId?: string, returnTo?: string) => {
      const safeReturnTo = getSafeReturnTo(returnTo ?? session.pendingReturnTo)

      setSession((currentSession) => ({
        ...currentSession,
        pendingServiceId:
          pendingServiceId ?? currentSession.pendingServiceId,
        pendingReturnTo: safeReturnTo,
      }))

      return openExternalUrl(buildOfficialLoginUrl(safeReturnTo))
    },
    [session.pendingReturnTo],
  )

  const confirmOfficialLogin = useCallback((): ConfirmedLoginResult => {
    const result = {
      returnTo: getSafeReturnTo(session.pendingReturnTo),
      serviceId: session.pendingServiceId,
    }
    const confirmedAt = Date.now()

    setSession({
      status: 'active',
      mode: 'official-external',
      verifiedByHub: false,
      confirmedAt,
      expiresAt: confirmedAt + AUTH_SESSION_TTL_MS,
    })

    return result
  }, [session.pendingReturnTo, session.pendingServiceId])

  const completeVerifiedCallback = useCallback((returnTo: string) => {
    const confirmedAt = Date.now()

    setSession({
      status: 'active',
      mode: 'official-external',
      verifiedByHub: false,
      confirmedAt,
      expiresAt: confirmedAt + AUTH_SESSION_TTL_MS,
      pendingReturnTo: getSafeReturnTo(returnTo),
    })
  }, [])

  const signOut = useCallback(() => {
    setSession({
      ...createUnknownSession(),
      status: 'signed-out',
    })
  }, [])

  const expireSession = useCallback(() => {
    setSession((currentSession) => ({
      ...currentSession,
      status: 'expired',
    }))
  }, [])

  const value = useMemo(
    () => ({
      session,
      setPendingService,
      openOfficialLogin,
      confirmOfficialLogin,
      completeVerifiedCallback,
      signOut,
      expireSession,
    }),
    [
      confirmOfficialLogin,
      completeVerifiedCallback,
      expireSession,
      openOfficialLogin,
      session,
      setPendingService,
      signOut,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
