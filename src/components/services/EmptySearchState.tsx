import { SearchX } from 'lucide-react'

interface EmptySearchStateProps {
  query: string
  onReset: () => void
}

export function EmptySearchState({ query, onReset }: EmptySearchStateProps) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--line)] px-5 text-center sm:min-h-72 sm:px-6">
      <span className="flex size-10 items-center justify-center rounded-lg bg-[var(--surface-strong)] text-[var(--muted)] sm:size-12">
        <SearchX className="size-5 sm:size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-semibold text-[var(--ink)] sm:mt-5 sm:text-lg">
        没有找到相关服务
      </h2>
      <p className="mt-2 max-w-md text-xs leading-5 text-[var(--muted)] sm:text-sm sm:leading-6">
        暂时没有服务匹配“{query}”。可以尝试“教务”“成绩”“快递”或“热水”。
      </p>
      <button
        type="button"
        className="mt-4 min-h-10 rounded-md bg-[var(--brand)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] focus-visible:ring-offset-2 sm:mt-5"
        onClick={onReset}
      >
        清除搜索
      </button>
    </div>
  )
}
