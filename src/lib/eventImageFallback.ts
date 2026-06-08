import type { Event } from '../types/event'

export const EVENT_CATEGORY_VISUALS: Record<
  Event['category'],
  { emoji: string; gradient: string }
> = {
  축제: { emoji: '🎉', gradient: 'from-orange-100 via-amber-50 to-orange-50' },
  공연: { emoji: '🎭', gradient: 'from-purple-100 via-violet-50 to-purple-50' },
  전시: { emoji: '🖼️', gradient: 'from-green-100 via-emerald-50 to-green-50' },
  기타: { emoji: '📍', gradient: 'from-slate-100 via-gray-50 to-slate-50' },
}

export function isPlaceholderEventImage(url: string): boolean {
  return !url || url.includes('placehold.co')
}

export function getEventImageUrl(item: { firstimage?: string; firstimage2?: string }): string {
  const url = item.firstimage || item.firstimage2 || ''
  return isPlaceholderEventImage(url) ? '' : url
}
