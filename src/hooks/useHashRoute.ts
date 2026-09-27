import { useCallback, useEffect, useState } from 'react'
import { getSafeReturnTo } from '../services/authService'

export type AppRoute = 'home' | 'login' | 'callback' | 'schedule' | 'xmu-auth'

export interface HashRouteLocation {
  route: AppRoute
  returnTo: string
}

function parseRoute(): HashRouteLocation {
  const hash = window.location.hash || '#/'
  const [path, queryString = ''] = hash.startsWith('#')
    ? hash.slice(1).split('?')
    : hash.split('?')

  const query = new URLSearchParams(queryString)
  const returnTo = getSafeReturnTo(query.get('returnTo'))

  if (path.startsWith('/login')) {
    return { route: 'login', returnTo }
  }

  if (path.startsWith('/auth/callback')) {
    return { route: 'callback', returnTo }
  }

  if (path.startsWith('/schedule/auth')) {
    return { route: 'xmu-auth', returnTo: '/schedule/auth' }
  }

  if (path.startsWith('/schedule')) {
    return { route: 'schedule', returnTo: '/schedule' }
  }

  return {
    route: 'home',
    returnTo: getSafeReturnTo(path),
  }
}

function buildHash(route: AppRoute, returnTo: string): string {
  const safeReturnTo = getSafeReturnTo(returnTo)

  if (route === 'login') {
    return `#/login?returnTo=${encodeURIComponent(safeReturnTo)}`
  }

  if (route === 'callback') {
    return `#/auth/callback?returnTo=${encodeURIComponent(safeReturnTo)}`
  }

  if (route === 'schedule') {
    return '#/schedule'
  }

  if (route === 'xmu-auth') {
    return '#/schedule/auth'
  }

  return `#${safeReturnTo}`
}

export function useHashRoute(): [
  HashRouteLocation,
  (route: AppRoute, returnTo?: string, replace?: boolean) => void,
] {
  const [location, setLocation] = useState<HashRouteLocation>(parseRoute)

  useEffect(() => {
    const handleHashChange = () => {
      setLocation(parseRoute())
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = useCallback(
    (route: AppRoute, returnTo?: string, replace = false) => {
      const nextHash = buildHash(route, returnTo ?? '/')

      if (window.location.hash === nextHash) {
        setLocation(parseRoute())
        return
      }

      if (replace) {
        window.history.replaceState(null, '', nextHash)
        setLocation(parseRoute())
        return
      }

      window.location.hash = nextHash
    },
    [],
  )

  return [location, navigate]
}
