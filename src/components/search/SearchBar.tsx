import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="relative block w-full">
      <span className="sr-only">搜索校园服务</span>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-[var(--muted)] sm:left-5 sm:size-5"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索教务、成绩、图书馆、快递、热水..."
        className="min-h-[42px] w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] pl-10 pr-9 text-[13px] text-[var(--ink)] shadow-[0_8px_24px_rgba(24,52,43,0.06)] outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)] sm:min-h-14 sm:pl-14 sm:pr-12 sm:text-base sm:focus:ring-4"
      />
      {value ? (
        <button
          type="button"
          className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--muted)] transition-colors hover:bg-[var(--surface-strong)] hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] sm:right-3 sm:size-8"
          onClick={() => onChange('')}
          aria-label="清除搜索"
          title="清除搜索"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      ) : null}
    </label>
  )
}
