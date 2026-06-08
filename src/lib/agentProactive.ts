import type { CourseItem } from '../types/course'

export interface ProactiveSuggestion {
  id: string
  emoji: string
  message: string
  actionPrompt: string
}

export function getProactiveSuggestions(items: CourseItem[]): ProactiveSuggestion[] {
  const suggestions: ProactiveSuggestion[] = []

  if (items.length === 0) {
    suggestions.push({
      id: 'empty-course',
      emoji: '✨',
      message: '코스가 비어 있어요. 주말 나들이 코스를 만들어 드릴까요?',
      actionPrompt: '이번 주말 광주 데이트 코스 3곳 짜서 코스에 넣어줘',
    })
    return suggestions
  }

  const hasRestaurant = items.some((item) => item.type === 'restaurant')
  const hasSpotOrEvent = items.some(
    (item) => item.type === 'spot' || item.type === 'event',
  )
  const withoutTime = items.filter((item) => !item.timeSlot)

  if (!hasRestaurant) {
    suggestions.push({
      id: 'no-restaurant',
      emoji: '🍽️',
      message: '점심·저녁 맛집이 아직 없어요.',
      actionPrompt: '내 코스에 어울리는 광주 맛집 검색해서 추가해줘',
    })
  }

  if (withoutTime.length >= 2) {
    suggestions.push({
      id: 'no-time',
      emoji: '⏰',
      message: `${withoutTime.length}곳에 방문 시간이 없어요.`,
      actionPrompt: '내 코스 전체에 09:00부터 순서대로 시간 배치해줘',
    })
  }

  if (hasRestaurant && !hasSpotOrEvent) {
    suggestions.push({
      id: 'only-food',
      emoji: '🏞️',
      message: '먹기만 있는 코스예요. 볼거리를 추가할까요?',
      actionPrompt: '광주 관광명소 하나 골라서 코스에 넣어줘',
    })
  }

  if (items.length === 1) {
    suggestions.push({
      id: 'single-item',
      emoji: '🗺️',
      message: '한 곳만 담겨 있어요. 동선을 이어 드릴까요?',
      actionPrompt: '지금 코스에 어울리는 맛집이랑 명소 추가해줘',
    })
  }

  return suggestions.slice(0, 2)
}
