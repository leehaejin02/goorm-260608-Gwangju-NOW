import type { Event } from '../types/event'

export type DateFilter = 'all' | 'thisWeek' | 'thisMonth'

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function getWeekRange(now: Date): { start: Date; end: Date } {
  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const start = startOfDay(new Date(now))
  start.setDate(now.getDate() + mondayOffset)
  const end = endOfDay(new Date(start))
  end.setDate(start.getDate() + 6)
  return { start, end }
}

function getMonthRange(now: Date): { start: Date; end: Date } {
  const start = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
  const end = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  return { start, end }
}

function eventOverlapsRange(event: Event, rangeStart: Date, rangeEnd: Date): boolean {
  const eventStart = startOfDay(new Date(event.startDate))
  const eventEnd = endOfDay(new Date(event.endDate))
  return eventStart <= rangeEnd && eventEnd >= rangeStart
}

export function filterEventsByDate(events: Event[], dateFilter: DateFilter, now = new Date()): Event[] {
  if (dateFilter === 'all') return events

  const range = dateFilter === 'thisWeek' ? getWeekRange(now) : getMonthRange(now)
  return events.filter((event) => eventOverlapsRange(event, range.start, range.end))
}

export function filterEventsBySearch(events: Event[], query: string): Event[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return events

  return events.filter(
    (event) =>
      event.title.toLowerCase().includes(trimmed) ||
      event.place.toLowerCase().includes(trimmed) ||
      event.description.toLowerCase().includes(trimmed),
  )
}

export function applyEventFilters(
  events: Event[],
  options: { category: Event['category'] | '전체'; searchQuery: string; dateFilter: DateFilter },
): Event[] {
  let result = events

  if (options.category !== '전체') {
    result = result.filter((event) => event.category === options.category)
  }

  result = filterEventsBySearch(result, options.searchQuery)
  result = filterEventsByDate(result, options.dateFilter)

  return result
}
