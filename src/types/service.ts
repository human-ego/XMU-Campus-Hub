export type ServiceCategoryId = 'learning' | 'campus' | 'resources' | 'life'

export type ServiceIconName =
  | 'ClipboardList'
  | 'CalendarDays'
  | 'Building2'
  | 'CheckCircle2'
  | 'BookOpen'
  | 'LayoutDashboard'
  | 'Route'
  | 'Dumbbell'
  | 'Package'
  | 'Droplets'

export type CategoryIconName =
  | 'GraduationCap'
  | 'Landmark'
  | 'Library'
  | 'Smartphone'

export interface ServiceCategory {
  id: ServiceCategoryId
  name: string
  description: string
  icon: CategoryIconName
  color: 'green' | 'blue' | 'gold' | 'coral'
}

export type ServiceAuthMode =
  | 'unified'
  | 'separate'
  | 'public'
  | 'unverified'
  | 'miniprogram'
  | 'wechat-web'


export type ServiceAccountModel =
  | 'xmu-unified-account'
  | 'none'
  | 'unknown'
  | 'wechat'

export type LoginRequirement = 'required' | 'optional' | 'none' | 'unknown'

export interface ServiceAuthPolicy {
  mode: ServiceAuthMode
  accountModel: ServiceAccountModel
  loginRequirement: LoginRequirement
  reuseUnifiedSession: boolean
  note: string
  loginUrl?: string
}

interface ServiceBase {
  id: string
  name: string
  description: string
  category: ServiceCategoryId
  icon: ServiceIconName
  keywords: readonly string[]
  auth: ServiceAuthPolicy
}

export interface WebsiteService extends ServiceBase {
  type: 'website'
  url: string
  sessionEntryUrl?: string
}

export interface WechatWebService extends ServiceBase {
  type: 'wechat-web'
  url: string
}

export interface MiniProgramQrCode {
  src: string
  alt: string
}

export interface MiniProgramLaunchConfig {
  scheme?: string
  wxAppId?: string
  path?: string
}

export interface MiniProgramService extends ServiceBase {
  type: 'miniprogram'
  miniProgramName: string
  wechatShareText?: string
  qrCode?: MiniProgramQrCode
  launch?: MiniProgramLaunchConfig
}

export type Service = WebsiteService | MiniProgramService | WechatWebService

export interface ServiceUsageRecord {
  count: number
  lastUsedAt: number
}

export type ServiceUsageMap = Record<string, ServiceUsageRecord>
