import type { Course, CourseType } from '../types/course'

type RawRow = Record<string, unknown>
type WeekRun = {
  startWeek: number
  endWeek: number
  weeks: number[]
  type: CourseType
}

const COURSE_COLORS = [
  '#0b6b53',
  '#2f68ad',
  '#9b6a12',
  '#b64d42',
  '#6b5aa8',
  '#167c80',
  '#8a5a35',
]

function isRecord(value: unknown): value is RawRow {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function textValue(row: RawRow, key: string): string {
  const value = row[key]
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function intValue(row: RawRow, key: string): number | null {
  const value = textValue(row, key)
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null
}

function hashText(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

function colorForCourse(value: string): string {
  return COURSE_COLORS[hashText(value) % COURSE_COLORS.length]
}

function splitList(value: string): string[] {
  return value
    .split(/[,，、]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, items) => items.indexOf(item) === index)
}

export function parseWeekBitmap(bitmap: string): number[] {
  return Array.from(bitmap.trim()).flatMap((character, index) =>
    character === '1' ? [index + 1] : [],
  )
}

export function parseWeekLabel(label: string): number[] {
  const normalized = label.replace(/\s+/g, '')
  const range = normalized.match(/(\d+)[-—~至](\d+)(单周|双周)?/)
  if (!range) {
    const single = normalized.match(/(\d+)/)
    return single ? [Number(single[1])] : []
  }

  const start = Number(range[1])
  const end = Number(range[2])
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return []

  const allWeeks: number[] = []
  for (let week = start; week <= end; week += 1) allWeeks.push(week)

  if (range[3] === '单周') return allWeeks.filter((week) => week % 2 === 1)
  if (range[3] === '双周') return allWeeks.filter((week) => week % 2 === 0)
  return allWeeks
}

function weekRuns(weeks: number[]): WeekRun[] {
  const sorted = [...new Set(weeks)].sort((a, b) => a - b)
  if (sorted.length === 0) return []

  const isOddOrEven =
    sorted.length >= 2 &&
    sorted.every((week, index) => index === 0 || week - sorted[index - 1] === 2)

  if (isOddOrEven) {
    return [
      {
        startWeek: sorted[0],
        endWeek: sorted[sorted.length - 1],
        weeks: sorted,
        type: sorted[0] % 2 === 1 ? 1 : 2,
      },
    ]
  }

  const runs: WeekRun[] = []
  let start = sorted[0]
  let previous = sorted[0]
  let current = [sorted[0]]

  for (const week of sorted.slice(1)) {
    if (week === previous + 1) {
      current.push(week)
    } else {
      runs.push({
        startWeek: start,
        endWeek: previous,
        weeks: current,
        type: 0,
      })
      start = week
      current = [week]
    }
    previous = week
  }

  runs.push({
    startWeek: start,
    endWeek: previous,
    weeks: current,
    type: 0,
  })
  return runs
}

function extractRows(payload: unknown): RawRow[] {
  if (Array.isArray(payload)) return payload.filter(isRecord)
  if (!isRecord(payload)) return []

  if (Array.isArray(payload.pkjgList)) return payload.pkjgList.filter(isRecord)
  if (isRecord(payload.datas) && Array.isArray(payload.datas.pkjgList)) {
    return payload.datas.pkjgList.filter(isRecord)
  }
  return []
}

function makeId(row: RawRow, weeks: number[]): string {
  return [
    textValue(row, 'KCDM'),
    textValue(row, 'KCMC'),
    textValue(row, 'XQ'),
    textValue(row, 'KSJCDM'),
    textValue(row, 'JSJCDM'),
    weeks.join(','),
  ].join('|')
}

/**
 * Parse the XMU gsapp `queryXspkjg.do` response shape.
 * The raw rows are merged by course/time/week-mask before week runs are expanded.
 */
export function parseXmuScheduleJson(source: string): Course[] {
  let payload: unknown
  try {
    payload = JSON.parse(source)
  } catch {
    return []
  }

  const grouped = new Map<
    string,
    {
      row: RawRow
      weeks: number[]
      rooms: string[]
      teachers: string[]
    }
  >()

  for (const row of extractRows(payload)) {
    const name = textValue(row, 'KCMC')
    const day = intValue(row, 'XQ')
    const startNode = intValue(row, 'KSJCDM')
    const endNode = intValue(row, 'JSJCDM') ?? startNode
    if (!name || day === null || startNode === null || endNode === null) continue

    const weekBitmap = textValue(row, 'ZCBH')
    const weeks = weekBitmap
      ? parseWeekBitmap(weekBitmap)
      : parseWeekLabel(textValue(row, 'ZCMC'))
    if (weeks.length === 0) continue

    const normalizedDay = Math.min(7, Math.max(1, day))
    const normalizedStart = Math.max(1, startNode)
    const normalizedEnd = Math.max(normalizedStart, endNode)
    const normalizedRow: RawRow = {
      ...row,
      XQ: normalizedDay,
      KSJCDM: normalizedStart,
      JSJCDM: normalizedEnd,
    }
    const key = makeId(normalizedRow, weeks)
    const existing = grouped.get(key)
    const rooms = splitList(textValue(row, 'JASMC'))
    const teachers = splitList(textValue(row, 'JSXM'))

    if (existing) {
      existing.rooms.push(...rooms)
      existing.teachers.push(...teachers)
    } else {
      grouped.set(key, {
        row: normalizedRow,
        weeks,
        rooms,
        teachers,
      })
    }
  }

  const courses: Course[] = []
  for (const group of grouped.values()) {
    const row = group.row
    const name = textValue(row, 'KCMC')
    const day = Math.min(7, Math.max(1, intValue(row, 'XQ') ?? 1))
    const startNode = Math.max(1, intValue(row, 'KSJCDM') ?? 1)
    const endNode = Math.max(startNode, intValue(row, 'JSJCDM') ?? startNode)
    const rooms = group.rooms.filter((item, index, items) => items.indexOf(item) === index)
    const teachers = group.teachers.filter((item, index, items) => items.indexOf(item) === index)

    for (const run of weekRuns(group.weeks)) {
      courses.push({
        id: makeId(row, run.weeks),
        code: textValue(row, 'KCDM'),
        name,
        teachers,
        rooms,
        day,
        startNode,
        endNode,
        startWeek: run.startWeek,
        endWeek: run.endWeek,
        weeks: run.weeks,
        type: run.type,
        color: colorForCourse(name),
      })
    }
  }

  return courses.sort(
    (left, right) =>
      left.day - right.day ||
      left.startNode - right.startNode ||
      left.startWeek - right.startWeek ||
      left.name.localeCompare(right.name, 'zh-CN'),
  )
}

export function isCourseInWeek(course: Course, week: number): boolean {
  return course.weeks.includes(week)
}
