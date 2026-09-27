import { ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  isAutomaticCallbackConfigured,
  validateAuthCallback,
} from '../services/authService'

interface AuthCallbackPageProps {
  returnTo: string
  onLogin: () => void
  onReturn: (returnTo: string, replace?: boolean) => void
}

type CallbackState = 'checking' | 'unavailable' | 'verified' | 'failed'

export function AuthCallbackPage({
  returnTo,
  onLogin,
  onReturn,
}: AuthCallbackPageProps) {
  const { completeVerifiedCallback } = useAuth()
  const automaticCallbackAvailable = isAutomaticCallbackConfigured()
  const [callbackState, setCallbackState] = useState<CallbackState>(
    automaticCallbackAvailable ? 'checking' : 'unavailable',
  )

  useEffect(() => {
    if (!automaticCallbackAvailable) {
      return
    }

    let active = true

    validateAuthCallback(window.location.hash)
      .then((result) => {
        if (!active) {
          return
        }

        if (result.verified) {
          completeVerifiedCallback(result.returnTo)
          setCallbackState('verified')
          onReturn(result.returnTo, true)
          return
        }

        setCallbackState('failed')
      })
      .catch(() => {
        if (active) {
          setCallbackState('failed')
        }
      })

    return () => {
      active = false
    }
  }, [automaticCallbackAvailable, completeVerifiedCallback])

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[0_12px_36px_rgba(24,52,43,0.07)] sm:p-8">
        <span className="flex size-11 items-center justify-center rounded-lg bg-[var(--gold-soft)] text-[var(--gold)]">
          {callbackState === 'verified' ? (
            <ShieldCheck className="size-5" aria-hidden="true" />
          ) : (
            <ShieldAlert className="size-5" aria-hidden="true" />
          )}
        </span>

        <h1 className="mt-5 text-2xl font-semibold text-[var(--ink)]">
          {callbackState === 'checking'
            ? '正在验证官方认证结果'
            : callbackState === 'verified'
              ? '官方认证成功'
              : callbackState === 'failed'
                ? '认证结果验证失败'
                : '官方自动回调暂不可用'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          {callbackState === 'checking'
            ? '正在调用已配置的验证服务确认 callback 结果。'
            : callbackState === 'verified'
              ? '认证结果已经验证，正在返回原来的内部页面。'
              : callbackState === 'failed'
                ? 'callback 参数未通过验证，不能保存登录状态。'
                : '厦门大学统一身份认证当前只允许已注册的应用作为 service 回调地址。当前开发域名尚未注册，因此不能伪造自动登录成功。'}
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            className="flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            onClick={() => onReturn(returnTo, true)}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            返回原页面
          </button>
          <button
            type="button"
            className="min-h-11 rounded-md border border-[var(--line)] px-5 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2"
            onClick={onLogin}
          >
            重新登录
          </button>
        </div>
      </section>
    </main>
  )
}
