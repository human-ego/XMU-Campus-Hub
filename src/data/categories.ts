import type { ServiceCategory } from '../types/service'

export const serviceCategories: readonly ServiceCategory[] = [
  {
    id: 'learning',
    name: '学习',
    description: '教学、课程与签到',
    icon: 'GraduationCap',
    color: 'green',
  },
  {
    id: 'campus',
    name: '校园',
    description: '门户与校园事务',
    icon: 'Landmark',
    color: 'blue',
  },
  {
    id: 'resources',
    name: '资源',
    description: '图书与学习资源',
    icon: 'Library',
    color: 'gold',
  },
  {
    id: 'life',
    name: '生活',
    description: '运动、快递与宿舍',
    icon: 'Smartphone',
    color: 'coral',
  },
] as const

export const categoryMap = Object.fromEntries(
  serviceCategories.map((category) => [category.id, category]),
) as Record<ServiceCategory['id'], ServiceCategory>
