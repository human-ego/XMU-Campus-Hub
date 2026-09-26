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

interface ServiceBase {
  id: string
  name: string
  description: string
  category: ServiceCategoryId
  icon: ServiceIconName
  keywords: readonly string[]
}

export interface WebsiteService extends ServiceBase {
  type: 'website'
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
  qrCode?: MiniProgramQrCode
  launch?: MiniProgramLaunchConfig
}

export type Service = WebsiteService | MiniProgramService

export interface ServiceUsageRecord {
  count: number
  lastUsedAt: number
}

export type ServiceUsageMap = Record<string, ServiceUsageRecord>
