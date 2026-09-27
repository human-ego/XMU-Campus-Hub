import { useEffect } from 'react'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'

interface StartupNoticeProps {
  onClose: () => void
}

const steps = [
  {
    icon: BookOpen,
    title: '服务综合',
    description: 'App 登录后自动登录厦大网站；部分网站需要手动点击“统一身份认证”。',
  },
  {
    icon: CalendarDays,
    title: '我的课表',
    description: '切换到课表，使用右上角盾牌登录并验证厦大账号。',
  },
  {
    icon: RefreshCw,
    title: '刷新课表',
    description: '首次使用输入本人学号；登录后刷新即可读取本学期课表。',
  },
]

export function StartupNotice({ onClose }: StartupNoticeProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(18,32,27,0.52)] p-3 sm:items-center sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose()
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="startup-notice-title"
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_28px_90px_rgba(18,32,27,0.28)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[var(--brand)]">
                开屏通告
              </p>
              <h1
                id="startup-notice-title"
                className="mt-1 text-xl font-bold text-[var(--ink)]"
              >
                欢迎使用厦大校园 Hub
              </h1>
            </div>
          </div>

          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
            onClick={onClose}
            aria-label="关闭通告"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
          通过底部导航切换校园服务和课表。首次读取真实课表时，需要完成厦大官方认证。
        </p>

        <div className="mt-4 space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="flex items-start gap-3 rounded-xl border border-[var(--line-soft)] bg-[var(--surface-soft)]/65 p-3"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-[var(--brand)]">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[var(--ink)]">
                      {index + 1}. {step.title}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[var(--brand-soft)]/70 p-3 text-xs leading-5 text-[var(--ink)]">
          <ShieldCheck
            className="mt-0.5 size-4 shrink-0 text-[var(--brand)]"
            aria-hidden="true"
          />
          <p>
            学号、密码、验证码和 MFA 由厦大官方页面处理；App
            不保存密码、Cookie、Token 或 CAS ticket。
          </p>
        </div>

        <button
          type="button"
          className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)]"
          onClick={onClose}
        >
          开始使用
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
      </section>
    </div>
  )
}

