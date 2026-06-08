export type CourseItemType = 'event' | 'restaurant' | 'parking' | 'spot'

export interface CourseItem {
  id: string
  type: CourseItemType
  title: string
  subtitle: string
  refId: string
  link?: string
  lat?: number
  lng?: number
  timeSlot?: string
}

export interface SavedCourse {
  id: string
  title: string
  items: CourseItem[]
  createdAt: string
  updatedAt: string
}

export const COURSE_TYPE_LABELS: Record<CourseItemType, string> = {
  event: '🎭 행사',
  restaurant: '🍽️ 맛집',
  parking: '🅿️ 주차',
  spot: '🏞️ 명소',
}

export const COURSE_TYPE_COLORS: Record<CourseItemType, string> = {
  event: 'border-purple-200 bg-purple-50',
  restaurant: 'border-amber-200 bg-amber-50',
  parking: 'border-blue-200 bg-blue-50',
  spot: 'border-teal-200 bg-teal-50',
}
