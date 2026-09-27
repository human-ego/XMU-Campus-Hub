import { LogIn, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface AuthControlProps {
  onLogin: () => void
}

export function AuthControl({ onLogin }: AuthControlProps) {
  const { session, signOut } = useAuth()

  if (session.status === 'active') {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1.5 text-xs font-medium text-[var(--brand)] sm:flex">
          <ShieldCheck className="size-4" aria-hidden="true" />
          官方登录已确认
        </span>
        <button
          type="button"
          className="flex size-9 items-center justify-center rounded-md border border-[var(--line)] text-[var(--muted)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
          onClick={signOut}
          aria-label="退出 Hub 登录状态"
          title="退出 Hub 登录状态"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      className="flex min-h-9 items-center gap-2 rounded-md border border-[var(--line)] px-3 text-xs font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 sm:min-h-10 sm:px-4 sm:text-sm"
      onClick={onLogin}
    >
      <LogIn className="size-4" aria-hidden="true" />
      {session.status === 'expired' ? '重新登录' : '登录'}
    </button>
  )
}
