import { Check, Copy, MessageCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { MiniProgramService } from '../../types/service'

interface MiniProgramDialogProps {
  service: MiniProgramService | null
  onClose: () => void
}

export function MiniProgramDialog({
  service,
  onClose,
}: MiniProgramDialogProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCopied(false)

    if (!service) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, service])

  if (!service) {
    return null
  }

  const copyMiniProgramName = async () => {
    try {
      await navigator.clipboard.writeText(service.miniProgramName)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(18,32,27,0.42)] p-4 sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mini-program-dialog-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_24px_80px_rgba(18,32,27,0.22)] sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[var(--coral-soft)] text-[var(--coral)] sm:size-11">
            <MessageCircle className="size-5" aria-hidden="true" />
          </span>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface-strong)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)]"
            onClick={onClose}
            aria-label="关闭"
            title="关闭"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <h2
          id="mini-program-dialog-title"
          className="mt-4 text-lg font-semibold text-[var(--ink)] sm:mt-5 sm:text-xl"
        >
          {service.qrCode ? '微信扫码打开：' : '打开微信小程序：'}
          {service.miniProgramName}
        </h2>

        {service.qrCode ? (
          <div className="mt-4">
            <img
              src={service.qrCode.src}
              alt={service.qrCode.alt}
              className="mx-auto block w-full max-w-[320px] rounded-lg border border-[var(--line)] bg-white object-contain"
              decoding="async"
            />
            <p className="mt-3 text-center text-sm leading-6 text-[var(--muted)]">
              使用微信扫描上方二维码，进入“
              <span className="font-medium text-[var(--ink)]">
                {service.miniProgramName}
              </span>
              ”小程序。
            </p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              当前网页暂不能直接打开微信小程序。请进入微信，搜索“
              <span className="font-medium text-[var(--ink)]">
                {service.miniProgramName}
              </span>
              ”后打开对应小程序。
            </p>

            <div className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-4">
              <p className="text-xs font-semibold uppercase text-[var(--muted)]">
                小程序名称
              </p>
              <p className="mt-2 text-base font-semibold text-[var(--ink)]">
                {service.miniProgramName}
              </p>
            </div>
          </>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2 sm:mt-6 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="min-h-10 rounded-md border border-[var(--line)] px-4 text-sm font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 sm:min-h-11"
            onClick={onClose}
          >
            知道了
          </button>
          <button
            type="button"
            className="flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 sm:min-h-11"
            onClick={copyMiniProgramName}
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {copied ? '已复制' : '复制名称'}
          </button>
        </div>
      </div>
    </div>
  )
}
