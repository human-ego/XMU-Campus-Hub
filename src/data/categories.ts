import type { ServiceCategory } from '../types/service'

export const serviceCategories: readonly ServiceCategory[] = [
  {
    id: 'learning',
    name: '学习',
    description: '教学、课程、图书与签到',
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
