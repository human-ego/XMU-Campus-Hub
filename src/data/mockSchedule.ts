import { parseXmuScheduleJson } from '../lib/xmuScheduleParser'
import type { PeriodTime, ScheduleTerm } from '../types/course'

function weekMask(weeks: number[], total = 20): string {
  return Array.from({ length: total }, (_, index) =>
    weeks.includes(index + 1) ? '1' : '0',
  ).join('')
}

const mockRows = [
  {
    KCDM: 'MATH101',
    KCMC: '高等数学 A',
    JSXM: '林老师',
    JASMC: '南强二 201',
    XQ: 1,
    KSJCDM: 1,
    JSJCDM: 2,
    ZCBH: weekMask(Array.from({ length: 16 }, (_, index) => index + 1)),
    ZCMC: '1-16周',
  },
  {
    KCDM: 'CS201',
    KCMC: '数据结构',
    JSXM: '陈老师,周老师',
    JASMC: '海韵园 C203',
    XQ: 2,
    KSJCDM: 3,
    JSJCDM: 4,
    ZCBH: weekMask([1, 3, 5, 7, 9, 11, 13, 15]),
    ZCMC: '1-15单周',
  },
  {
    KCDM: 'ENG102',
    KCMC: '大学英语 II',
    JSXM: '吴老师',
    JASMC: '南强一 105',
    XQ: 3,
    KSJCDM: 5,
    JSJCDM: 6,
    ZCBH: weekMask([2, 4, 6, 8, 10, 12, 14, 16]),
    ZCMC: '2-16双周',
  },
  {
    KCDM: 'HIST110',
    KCMC: '厦门大学校史',
    JSXM: '郑老师',
    JASMC: '南强二 101',
    XQ: 4,
    KSJCDM: 7,
    JSJCDM: 8,
    ZCBH: weekMask([4, 6, 9]),
    ZCMC: '4、6、9周',
  },
  {
    KCDM: 'LAB210',
    KCMC: '程序设计实践',
    JSXM: '许老师',
    JASMC: '海韵园 A101',
    XQ: 5,
    KSJCDM: 9,
    JSJCDM: 11,
    ZCBH: weekMask([2, 4, 6, 8, 10, 12, 14, 16]),
    ZCMC: '2-16双周',
  },
  {
    KCDM: 'LAB210',
    KCMC: '程序设计实践',
    JSXM: '许老师',
    JASMC: '海韵园 A102',
    XQ: 5,
    KSJCDM: 9,
    JSJCDM: 11,
    ZCBH: weekMask([2, 4, 6, 8, 10, 12, 14, 16]),
    ZCMC: '2-16双周',
  },
  {
    KCDM: 'PE101',
    KCMC: '羽毛球',
    JSXM: '黄老师',
    JASMC: '风雨球馆 1 号场',
    XQ: 6,
    KSJCDM: 3,
    JSJCDM: 4,
    ZCBH: weekMask([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]),
    ZCMC: '1-16周',
  },
]

export const mockXmuScheduleJson = JSON.stringify({ pkjgList: mockRows })

const mockPeriods: PeriodTime[] = [
  { period: 1, start: '08:00', end: '08:45' },
  { period: 2, start: '08:55', end: '09:40' },
  { period: 3, start: '10:10', end: '10:55' },
  { period: 4, start: '11:05', end: '11:50' },
  { period: 5, start: '14:30', end: '15:15' },
  { period: 6, start: '15:25', end: '16:10' },
  { period: 7, start: '16:40', end: '17:25' },
  { period: 8, start: '17:35', end: '18:20' },
  { period: 9, start: '19:10', end: '19:55' },
  { period: 10, start: '20:05', end: '20:50' },
  { period: 11, start: '21:00', end: '21:45' },
]

export const mockScheduleTerm: ScheduleTerm = {
  semesterCode: '20261',
  semesterLabel: '2026-2027 学年 秋季学期',
  startDate: '2026-09-07',
  maxWeek: 16,
  periods: mockPeriods,
  courses: parseXmuScheduleJson(mockXmuScheduleJson),
}
