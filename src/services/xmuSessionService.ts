import { Capacitor, registerPlugin } from '@capacitor/core'
import type { PeriodTime } from '../types/course'

export type XmuAuthStatus = 'verified' | 'login-required' | 'error'

export type XmuScheduleStatus = 'success' | 'login-required' | 'error'

export interface XmuSessionProbeResult {
  status: XmuAuthStatus
  message: string
  details: string[]
}

export interface XmuActionResult {
  ok: boolean
  message?: string
}

export interface XmuCourseRow {
  KCDM?: string
  KCMC?: string
  KCYWMC?: string
  BJMC?: string
  BJDM?: string
  JSXM?: string
  JASMC?: string
  XQ?: number
  KSJCDM?: number
  JSJCDM?: number
  ZCBH?: string
  ZCMC?: string
}

export interface XmuScheduleFetchResult {
  success: boolean
  status: XmuScheduleStatus
  semesterCode?: string
  periods: PeriodTime[]
  courseRows: XmuCourseRow[]
  message?: string
}

interface NativeXmuSessionPlugin {
  openXmuOfficialLogin(): Promise<{ status?: string; message?: string }>
  probeXmuJwSession(): Promise<{ status?: string; message?: string }>
  clearXmuSession(): Promise<{ status?: string; message?: string }>
  fetchXmuSchedule(options: {
    studentNumber: string
  }): Promise<{
    success?: boolean
    status?: string
    semesterCode?: string
    periods?: PeriodTime[]
    courseRows?: XmuCourseRow[]
    message?: string
  }>
}

const NativeXmuSession = registerPlugin<NativeXmuSessionPlugin>('XmuSession')

let activeStudentNumber = ''

export function getXmuStudentNumber(): string {
  return activeStudentNumber
}

export function setXmuStudentNumber(value: string): void {
  activeStudentNumber = value.trim()
}

const XMU_JW_LOGIN_URL = 'https://jw.xmu.edu.cn/login'
const XMU_JW_APP_ENTRY_URL =
  'https://jw.xmu.edu.cn/gsapp/sys/wdkbapp/*default/index.do?EMAP_LANG=zh&THEME=cherry'

function androidOnly(): XmuActionResult {
  return {
    ok: false,
    message: '此功能需要 Android App',
  }
}

function androidOnlyProbe(): XmuSessionProbeResult {
  return {
    status: 'error',
    message: '此功能需要 Android App',
    details: [
      'Web 开发环境不尝试通过 CORS 绕过厦大认证或 Cookie 限制。',
      '请在 Capacitor Android App 中验证官方 WebView Session。',
    ],
  }
}

function androidOnlySchedule(): XmuScheduleFetchResult {
  return {
    success: false,
    status: 'error',
    periods: [],
    courseRows: [],
    message: '此功能需要 Android App',
  }
}

function isNative(): boolean {
  return Capacitor.isNativePlatform()
}

function normalizeAuthStatus(value: unknown): XmuAuthStatus {
  return value === 'verified' || value === 'login-required' || value === 'error'
    ? value
    : 'error'
}

function normalizeScheduleStatus(value: unknown): XmuScheduleStatus {
  return value === 'success' || value === 'login-required' || value === 'error'
    ? value
    : 'error'
}

export function getXmuFlowUrls() {
  return {
    officialLoginUrl: XMU_JW_LOGIN_URL,
    jwAppEntryUrl: XMU_JW_APP_ENTRY_URL,
  }
}

/**
 * Opens the official JW login entry. The native WebView follows JW -> IDS
 * redirects on its own; this function does not construct CAS form parameters.
 */
export async function openXmuOfficialLogin(): Promise<XmuActionResult> {
  if (!isNative()) return androidOnly()

  try {
    const result = await NativeXmuSession.openXmuOfficialLogin()
    return result.status === 'opened'
      ? { ok: true }
      : { ok: false, message: result.message || '无法打开厦大官方登录页面' }
  } catch {
    return { ok: false, message: '无法打开厦大官方登录页面' }
  }
}

/**
 * Uses the native WebView Cookie environment to probe only the fixed wdkbapp
 * entry. No cookie, token, ticket, page body, or student data crosses the bridge.
 */
export async function probeXmuJwSession(): Promise<XmuSessionProbeResult> {
  if (!isNative()) return androidOnlyProbe()

  try {
    const result = await NativeXmuSession.probeXmuJwSession()
    const status = normalizeAuthStatus(result.status)
    return {
      status,
      message: result.message || '无法访问厦大教务系统',
      details: [
        '已通过固定 wdkbapp 入口检查最终 JW / IDS 跳转地址。',
        '原生桥接不返回 Cookie、Token、CAS ticket 或响应正文。',
      ],
    }
  } catch {
    return {
      status: 'error',
      message: '无法访问厦大教务系统',
      details: ['原生 Session 验证调用失败。'],
    }
  }
}

export async function clearXmuSession(): Promise<XmuActionResult> {
  activeStudentNumber = ''
  if (!isNative()) return androidOnly()

  try {
    const result = await NativeXmuSession.clearXmuSession()
    return result.status === 'cleared'
      ? { ok: true }
      : { ok: false, message: result.message || '无法清理厦大认证 Session' }
  } catch {
    return { ok: false, message: '无法清理厦大认证 Session' }
  }
}

/**
 * Fetches the current user's schedule through fixed native XMU endpoints.
 * The student number is used only as the required XH query value and is not
 * stored or returned by the native bridge.
 */
export async function fetchXmuSchedule(
  studentNumber: string,
): Promise<XmuScheduleFetchResult> {
  const normalizedStudentNumber = studentNumber.trim()
  if (!normalizedStudentNumber) {
    return {
      success: false,
      status: 'error',
      periods: [],
      courseRows: [],
      message: '请输入本人学号',
    }
  }

  if (!isNative()) return androidOnlySchedule()

  try {
    const result = await NativeXmuSession.fetchXmuSchedule({
      studentNumber: normalizedStudentNumber,
    })
    const status = normalizeScheduleStatus(result.status)
    return {
      success: result.success === true && status === 'success',
      status,
      semesterCode: result.semesterCode,
      periods: Array.isArray(result.periods) ? result.periods : [],
      courseRows: Array.isArray(result.courseRows) ? result.courseRows : [],
      message: result.message,
    }
  } catch {
    return {
      success: false,
      status: 'error',
      periods: [],
      courseRows: [],
      message: '无法读取厦大课表数据',
    }
  }
}

