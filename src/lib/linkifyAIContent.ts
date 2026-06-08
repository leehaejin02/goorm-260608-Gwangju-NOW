import type { Event } from '../types/event'
import type { Restaurant } from '../types/restaurant'

export type ContentPart =
  | { type: 'text'; value: string }
  | { type: 'event'; value: string; eventId: string }
  | { type: 'restaurant'; value: string; href: string }

interface LinkTarget {
  pattern: string
  type: 'event' | 'restaurant'
  eventId?: string
  href?: string
}

export function parseAIContent(
  text: string,
  events: Event[],
  restaurants: Restaurant[],
): ContentPart[] {
  const targets: LinkTarget[] = [
    ...events.map((e) => ({
      pattern: e.title.trim(),
      type: 'event' as const,
      eventId: e.id,
    })),
    ...restaurants.map((r) => ({
      pattern: r.name.trim(),
      type: 'restaurant' as const,
      href: r.placeUrl || '#restaurants',
    })),
  ]
    .filter((t) => t.pattern.length >= 2)
    .sort((a, b) => b.pattern.length - a.pattern.length)

  const parts: ContentPart[] = []
  let cursor = 0

  while (cursor < text.length) {
    let matched: (LinkTarget & { index: number }) | null = null

    for (const target of targets) {
      const index = text.indexOf(target.pattern, cursor)
      if (index === -1) continue
      if (!matched || index < matched.index) {
        matched = { ...target, index }
      }
    }

    if (!matched) {
      parts.push({ type: 'text', value: text.slice(cursor) })
      break
    }

    if (matched.index > cursor) {
      parts.push({ type: 'text', value: text.slice(cursor, matched.index) })
    }

    if (matched.type === 'event' && matched.eventId) {
      parts.push({
        type: 'event',
        value: matched.pattern,
        eventId: matched.eventId,
      })
    } else if (matched.type === 'restaurant' && matched.href) {
      parts.push({
        type: 'restaurant',
        value: matched.pattern,
        href: matched.href,
      })
    }

    cursor = matched.index + matched.pattern.length
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: text }]
}
