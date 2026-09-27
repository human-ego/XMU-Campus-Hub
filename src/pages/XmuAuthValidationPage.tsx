import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import {
  clearXmuSession,
  probeXmuJwSession,
} from '../services/xmuSessionService'

type ValidationState =
  | 'idle'
  | 'probing'
  | 'clearing'
  | 'verified'
  | 'login-required'
  | 'error'

interface XmuAuthValidationPageProps {
  onBack: () => void
}

const stateTitle: Record<ValidationState, string> = {
  idle: '验证厦大账号',
  probing: '正在验证教务系统 Session',
  clearing: '正在清理认证 Session',
  verified: '厦大账号认证成功',
  'login-required': '登录成功，但教务系统 Session 验证失败',
  error: '验证未完成',
}

export function XmuAuthValidationPage({
  onBack,
}: XmuAuthValidationPageProps) {
  const [state, setState] = useState<ValidationState>('idle')
  const [statusMessage, setStatusMessage] = useState(
    '使用右上角“登录”进入厦大官方登录页面，完成后返回并验证教务 Session。',
  )

  const handleVerify = async () => {
    setStatusMessage('正在检查固定 wdkbapp 入口的 Session 状态。')
    setState('probing')

    const result = await probeXmuJwSession()
    if (result.status === 'verified') {
      onBack()
      return
    }

    setStatusMessage(result.message)
    setState(result.status)
  }

  const handleClear = async () => {
    setStatusMessage('正在清理认证 Session。')
    setState('clearing')

    const cleared = await clearXmuSession()
    if (!cleared.ok) {
      setStatusMessage(cleared.message || '无法清理厦大认证 Session')
      setState('error')
      return
    }

    const result = await probeXmuJwSession()
    if (result.status === 'verified') {
      onBack()
      return
    }

    setStatusMessage(result.message)
    setState(result.status)
  }

  const isBusy = state === 'probing' || state === 'clearing'
  const statusTone =
    state === 'verified'
      ? 'border-[var(--brand)]/30 bg-[var(--brand-soft)]/60'
      : state === 'login-required' || state === 'error'
        ? 'border-[var(--coral)]/30 bg-[var(--coral-soft)]/60'
        : 'border-[var(--line)] bg-[var(--surface)]'

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
      <button
        type="button"
        className="flex min-h-9 items-center gap-2 text-sm text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
        onClick={onBack}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        返回我的课表
      </button>

      <section className={`mt-5 rounded-2xl border p-5 ${statusTone}`}>
        <div className="flex items-start gap-3">
          {state === 'verified' ? (
            <CheckCircle2
              className="mt-0.5 size-5 shrink-0 text-[var(--brand)]"
              aria-hidden="true"
            />
          ) : state === 'login-required' || state === 'error' ? (
            <ShieldAlert
              className="mt-0.5 size-5 shrink-0 text-[var(--coral)]"
              aria-hidden="true"
            />
          ) : (
            <ShieldCheck
              className="mt-0.5 size-5 shrink-0 text-[var(--brand)]"
              aria-hidden="true"
            />
          )}
          <div>
            <h1 className="text-lg font-semibold text-[var(--ink)]">
              {stateTitle[state]}
            </h1>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              {statusMessage}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleVerify}
            disabled={isBusy}
          >
            {state === 'probing' ? (
              <LoaderCircle
                className="size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ShieldCheck className="size-4" aria-hidden="true" />
            )}
            验证教务 Session
          </button>

          <button
            type="button"
            className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--line)] px-5 text-sm font-semibold text-[var(--muted)] transition-colors hover:border-[var(--coral)] hover:text-[var(--coral)] disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleClear}
            disabled={isBusy}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            清理认证 Session
          </button>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-[var(--brand)]"
            aria-hidden="true"
          />
          <div>
            <h2 className="text-sm font-semibold text-[var(--ink)]">
              安全声明
            </h2>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              学号、密码、验证码和 MFA 仅由厦门大学官方页面处理。App
              不读取、不保存、不导出密码、Cookie、Token 或 CAS
              ticket，也不提供任意 URL 请求或第三方代理登录。清理 Session
              时不会显示任何 Cookie 内容。
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}


