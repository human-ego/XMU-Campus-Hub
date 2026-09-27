export type CourseType = 0 | 1 | 2 | 3

export interface Course {
  id: string
  code: string
  name: string
  teachers: string[]
  rooms: string[]
  day: number
  startNode: number
  endNode: number
  startWeek: number
  endWeek: number
  weeks: number[]
  type: CourseType
  color: string
}

export interface PeriodTime {
  period: number
  start: string
  end: string
}

export interface ScheduleTerm {
  semesterCode: string
  semesterLabel: string
  startDate: string
  maxWeek: number
  periods: PeriodTime[]
  courses: Course[]
}
