export interface Event {
  id: string
  title: string
  place: string
  startDate: string
  endDate: string
  imageUrl: string
  category: '축제' | '공연' | '전시' | '기타'
  description: string
  lat?: number
  lng?: number
}

export type EventCategory = Event['category'] | '전체'
