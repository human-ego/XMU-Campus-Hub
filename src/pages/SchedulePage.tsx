import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react'
import { mockScheduleTerm } from '../data/mockSchedule'
import { isCourseInWeek, parseXmuScheduleJson } from '../lib/xmuScheduleParser'
import {
  fetchXmuSchedule,
  getXmuStudentNumber,
  setXmuStudentNumber,
  type XmuScheduleFetchResult,
} from '../services/xmuSessionService'
import type { Course, PeriodTime, ScheduleTerm } from '../types/course'

const DAY_NAMES = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const SHORT_DAY_NAMES = ['一', '二', '三', '四', '五', '六', '日']

function parseLocalDate(value: string): Date {
  return new Date(`${value}T00:00:00`)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
}

function getCurrentWeek(term: ScheduleTerm): number {
  const start = parseLocalDate(term.startDate)
  const today = new Date()
  const diffDays = Math.floor((today.getTime() - start.getTime()) / 86_400_000)
  return Math.min(term.maxWeek, Math.max(1, Math.floor(diffDays / 7) + 1))
}

function getTodayDay(): number {
  const day = new Date().getDay()
  return day === 0 ? 7 : day
}

function padMonth(value: number): string {
  return value < 10 ? `0${value}` : String(value)
}

function inferSemesterStart(semesterCode: string): string {
  const year = Number(semesterCode.slice(0, 4))
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear()
  const month = semesterCode.slice(4) === '2' ? 2 : 9
  const firstDay = new Date(safeYear, month - 1, 1)

  while (firstDay.getDay() !== 1) {
    firstDay.setDate(firstDay.getDate() + 1)
  }

  return `${safeYear}-${padMonth(month)}-${padMonth(firstDay.getDate())}`
}

function formatSemesterLabel(semesterCode: string): string {
  const year = Number(semesterCode.slice(0, 4))
  const safeYear = Number.isFinite(year) ? year : new Date().getFullYear()
  const season = semesterCode.slice(4) === '2' ? '春季学期' : '秋季学期'
  return `${safeYear}-${safeYear + 1} ${season}`
}

function buildRealScheduleTerm(
  result: XmuScheduleFetchResult,
  courses: Course[],
): ScheduleTerm {
  const maxCourseNode = courses.reduce(
    (maximum, course) => Math.max(maximum, course.endNode),
    0,
  )
  const periodMap = new Map(
    result.periods.map((period) => [period.period, period]),
  )
  const periods = Array.from(
    { length: Math.max(11, maxCourseNode) },
    (_, index) => {
      const period = index + 1
      return (
        periodMap.get(period) ??
        mockScheduleTerm.periods.find((item) => item.period === period) ?? {
          period,
          start: '21:45',
          end: '22:30',
        }
      )
    },
  )

  return {
    semesterCode: result.semesterCode ?? '未知学期',
    semesterLabel: formatSemesterLabel(result.semesterCode ?? ''),
    startDate: inferSemesterStart(result.semesterCode ?? ''),
    maxWeek: Math.max(
      16,
      courses.reduce((maximum, course) => Math.max(maximum, course.endWeek), 0),
    ),
    periods,
    courses,
  }
}

function courseDuration(course: Course): number {
  return course.endNode - course.startNode + 1
}

function CourseBlock({
  course,
  periods,
}: {
  course: Course
  periods: PeriodTime[]
}) {
  const start = periods.find((period) => period.period === course.startNode)
  const end = periods.find((period) => period.period === course.endNode)
  const room = course.rooms[0] ?? ''

  return (
    <article
      className="min-h-0 overflow-hidden rounded-md border border-white/45 p-1 text-white shadow-sm"
      style={{ backgroundColor: course.color }}
      title={`${course.name}\n${start?.start ?? ''}-${end?.end ?? ''}\n${room}\n${course.teachers.join('、')}`}
    >
      <div className="line-clamp-3 text-[8px] font-semibold leading-[10px]">
        {course.name}
      </div>
      {room ? (
        <div className="mt-0.5 line-clamp-2 text-[7px] leading-[9px] opacity-90">
          @{room}
        </div>
      ) : null}
    </article>
  )
}

function ScheduleGrid({
  term,
  week,
}: {
  term: ScheduleTerm
  week: number
}) {
  const weekStart = addDays(parseLocalDate(term.startDate), (week - 1) * 7)
  const weekCourses = useMemo(
    () =>
      term.courses.filter((course) => isCourseInWeek(course, week)),
    [term.courses, week],
  )

  return (
    <div className="h-[calc(100dvh-132px)] min-h-[520px] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
      <div
        className="grid h-full"
        style={{
          gridTemplateColumns: '42px repeat(7, minmax(0, 1fr))',
          gridTemplateRows: `42px repeat(${term.periods.length}, minmax(0, 1fr))`,
        }}
      >
        <div className="flex items-center justify-center border-b border-r text-[9px] font-semibold text-[var(--muted)]">
          {weekStart.getMonth() + 1}月
        </div>

        {SHORT_DAY_NAMES.map((dayName, index) => {
          const date = addDays(weekStart, index)
          const isToday =
            date.getFullYear() === new Date().getFullYear() &&
            date.getMonth() === new Date().getMonth() &&
            date.getDate() === new Date().getDate()

          return (
            <div
              key={dayName}
              className="flex flex-col items-center justify-center border-b border-[var(--line-soft)] text-[8px] text-[var(--muted)]"
            >
              <span className="text-[9px]">{dayName}</span>
              <span
                className={
                  isToday
                    ? 'mt-0.5 rounded-md bg-[var(--ink)] px-1 text-[8px] font-semibold text-white'
                    : 'mt-0.5 text-[9px] font-medium text-[var(--ink)]'
                }
              >
                {date.getDate()}
              </span>
            </div>
          )
        })}

        {term.periods.map((period) => (
          <div
            key={`time-${period.period}`}
            className="flex flex-col items-center justify-center border-r border-[var(--line-soft)] text-[7px] leading-[8px] text-[var(--muted)]"
            style={{ gridColumn: 1, gridRow: period.period + 1 }}
            title={`${period.start}-${period.end}`}
          >
            <span className="text-[9px] font-semibold text-[var(--ink)]">
              {period.period}
            </span>
            <span>{period.start}</span>
            <span>{period.end}</span>
          </div>
        ))}

        {term.periods.map((period) =>
          SHORT_DAY_NAMES.map((_, dayIndex) => (
            <div
              key={`${period.period}-${dayIndex}`}
              className="border-b border-r border-[var(--line-soft)] bg-[var(--surface-soft)]/25"
              style={{ gridColumn: dayIndex + 2, gridRow: period.period + 1 }}
            />
          )),
        )}

        {weekCourses.map((course) => (
          <div
            key={course.id}
            className="relative z-10 min-h-0 p-0.5"
            style={{
              gridColumn: course.day + 1,
              gridRow: `${course.startNode + 1} / span ${courseDuration(course)}`,
            }}
          >
            <CourseBlock course={course} periods={term.periods} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SchedulePage() {
  const [term, setTerm] = useState<ScheduleTerm | null>(null)
  const [selectedWeek, setSelectedWeek] = useState(1)
  const [studentNumber, setStudentNumber] = useState(() =>
    getXmuStudentNumber(),
  )
  const [showStudentInput, setShowStudentInput] = useState(
    () => !getXmuStudentNumber(),
  )
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const todayDay = getTodayDay()
  const currentWeek = term ? getCurrentWeek(term) : 1
  const today = new Date()

  const handleRefresh = useCallback(async (value: string) => {
    const normalized = value.trim()
    if (!normalized) {
      setShowStudentInput(true)
      setMessage('请输入本人学号')
      return
    }

    setLoading(true)
    setMessage('')

    const result = await fetchXmuSchedule(normalized)
    if (!result.success) {
      setLoading(false)
      setMessage(result.message || '无法读取厦大课表数据')
      return
    }

    try {
      const courses = parseXmuScheduleJson(
        JSON.stringify({ pkjgList: result.courseRows }),
      )
      if (result.courseRows.length > 0 && courses.length === 0) {
        throw new Error('课程数据解析结果为空')
      }

      const nextTerm = buildRealScheduleTerm(result, courses)
      setXmuStudentNumber(normalized)
      setStudentNumber(normalized)
      setTerm(nextTerm)
      setSelectedWeek(getCurrentWeek(nextTerm))
      setShowStudentInput(false)
      setMessage('')
    } catch {
      setMessage('课表数据解析失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const saved = getXmuStudentNumber()
    if (saved) {
      void handleRefresh(saved)
    }
  }, [handleRefresh])

  return (
    <main className="h-[100dvh] overflow-hidden bg-[var(--canvas)] px-2 pb-[68px] pt-2">
      <header className="flex h-[52px] items-center justify-between px-1">
        <div>
          <div className="text-lg font-semibold leading-5 text-[var(--ink)]">
            第 {term ? selectedWeek : currentWeek} 周 {DAY_NAMES[todayDay - 1]}
          </div>
          <div className="mt-1 text-[11px] text-[var(--muted)]">
            {formatDate(today)}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)] disabled:opacity-40"
            aria-label="上一周"
            disabled={!term || selectedWeek <= 1}
            onClick={() =>
              setSelectedWeek((week) => Math.max(1, week - 1))
            }
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)] disabled:opacity-40"
            aria-label="下一周"
            disabled={!term || selectedWeek >= term.maxWeek}
            onClick={() =>
              setSelectedWeek((week) =>
                term ? Math.min(term.maxWeek, week + 1) : week,
              )
            }
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)] disabled:opacity-40"
            aria-label="刷新课表"
            disabled={loading}
            onClick={() => {
              const saved = getXmuStudentNumber() || studentNumber
              if (saved) {
                void handleRefresh(saved)
              } else {
                setShowStudentInput(true)
              }
            }}
          >
            <RefreshCw
              className={`size-4 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
          <a
            href="#/schedule/auth"
            className="flex size-9 items-center justify-center rounded-lg text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)]"
            aria-label="登录或验证厦大账号"
          >
            <ShieldCheck className="size-4" />
          </a>
        </div>
      </header>

      {term ? (
        <ScheduleGrid term={term} week={selectedWeek} />
      ) : (
        <section className="flex h-[calc(100dvh-132px)] min-h-[520px] flex-col items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] px-6 text-center">
          <CalendarDays className="size-8 text-[var(--brand)]" />
          <h1 className="mt-3 text-base font-semibold text-[var(--ink)]">
            {loading ? '正在读取课表' : '登录后查看我的课表'}
          </h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {message || '完成厦大账号登录后，点击右上角刷新课表。'}
          </p>        </section>
      )}

      {showStudentInput ? (
        <div className="fixed inset-0 z-[60] flex items-end bg-black/25 p-3">
          <div className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[var(--ink)]">
                  读取本人课表
                </h2>
                <p className="mt-1 text-[11px] text-[var(--muted)]">
                  学号只保存在当前 App 进程内，用于 XH 查询。
                </p>
              </div>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-[var(--muted)]"
                aria-label="关闭"
                onClick={() => setShowStudentInput(false)}
              >
                <X className="size-4" />
              </button>
            </div>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="mt-4 min-h-11 w-full rounded-xl border border-[var(--line)] bg-[var(--canvas)] px-3 text-sm text-[var(--ink)] outline-none focus:border-[var(--brand)]"
              value={studentNumber}
              onChange={(event) => setStudentNumber(event.target.value)}
              placeholder="本人学号"
            />

            <button
              type="button"
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white disabled:opacity-60"
              disabled={loading}
              onClick={() => {
                setShowStudentInput(false)
                void handleRefresh(studentNumber)
              }}
            >
              <RefreshCw
                className={`size-4 ${loading ? 'animate-spin' : ''}`}
              />
              读取课表
            </button>
          </div>
        </div>
      ) : null}
    </main>
  )
}

