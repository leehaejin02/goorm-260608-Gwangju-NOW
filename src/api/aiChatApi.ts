export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatResponse {
  reply?: string
  error?: string
}

export async function sendAIChatMessage(
  messages: ChatMessage[],
  eventsContext: string,
  restaurantsContext: string,
  courseContext = '',
): Promise<string> {
  const response = await fetch('/api/ai-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, eventsContext, restaurantsContext, courseContext }),
  })

  const data = (await response.json()) as AIChatResponse

  if (!response.ok) {
    throw new Error(data.error || 'AI 응답을 받지 못했습니다.')
  }

  if (!data.reply) {
    throw new Error('AI 응답이 비어 있습니다.')
  }

  return data.reply
}

export function buildEventsContext(
  events: Array<{
    id: string
    title: string
    place: string
    startDate: string
    endDate: string
    category: string
  }>,
): string {
  if (events.length === 0) return ''

  return events
    .slice(0, 20)
    .map(
      (e, i) =>
        `${i + 1}. [ID:${e.id}] [${e.category}] ${e.title} | ${e.place} | ${e.startDate}~${e.endDate}`,
    )
    .join('\n')
}

export function buildRestaurantsContext(
  restaurants: Array<{ name: string; category: string; address: string }>,
): string {
  if (restaurants.length === 0) return ''

  return restaurants
    .slice(0, 15)
    .map((r, i) => `${i + 1}. ${r.name} | ${r.category} | ${r.address}`)
    .join('\n')
}
