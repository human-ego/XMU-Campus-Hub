import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react'
import { useAuth, type ConfirmedLoginResult } from '../context/AuthContext'
import type { WebsiteService } from '../types/service'

interface LoginPageProps {
  pendingService?: WebsiteService
  returnTo: string
  onReturn: (returnTo: string, replace?: boolean) => void
  onConfirmed: (result: ConfirmedLoginResult) => void
}

export function LoginPage({
  pendingService,
  returnTo,
  onReturn,
  onConfirmed,
}: LoginPageProps) {
  const { openOfficialLogin, confirmOfficialLogin } = useAuth()

  const handleOpenOfficialLogin = () => {
    openOfficialLogin(pendingService?.id, returnTo)
  }

  const handleConfirmLogin = () => {
    onConfirmed(confirmOfficialLogin())
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-14 lg:px-8">
      <button
        type="button"
        className="flex min-h-10 items-center gap-2 rounded-md text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--brand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
        onClick={() => onReturn(returnTo)}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回原页面
      </button>

      <section className="mt-6 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_12px_36px_rgba(24,52,43,0.07)] sm:p-8">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)] sm:size-11">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-[var(--brand)]">
              厦门大学官方认证流程
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-[var(--ink)]">
              登录厦大校园 Hub
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Hub 不会接收或保存学号、密码、Cookie 或 Token。
              点击下方按钮后，由厦门大学统一身份认证页面完成正常登录。
            </p>
          </div>
        </div>

        {pendingService ? (
          <div className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-4">
            <p className="text-xs font-semibold text-[var(--muted)]">
              待打开服务
            </p>
            <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
              {pendingService.name}
            </p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            onClick={handleOpenOfficialLogin}
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            前往统一身份认证
          </button>

          <button
            type="button"
            className="min-h-11 rounded-md border border-[var(--line)] px-5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            onClick={handleConfirmLogin}
          >
            已完成登录并返回
          </button>
        </div>
      </section>
    </main>
  )
}
