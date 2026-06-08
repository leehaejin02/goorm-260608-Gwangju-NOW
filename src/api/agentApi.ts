import type { AgentAction, AgentResponse } from '../types/agent'
import type { ChatMessage } from './aiChatApi'
import type { AgentPoiCatalogEntry } from '../lib/agentPoiCatalog'

export async function sendAgentMessage(
  messages: ChatMessage[],
  contexts: {
    eventsContext: string
    restaurantsContext: string
    spotsContext: string
    courseContext: string
    poiCatalog?: AgentPoiCatalogEntry[]
  },
): Promise<AgentResponse> {
  const response = await fetch('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, ...contexts }),
  })

  const data = (await response.json()) as AgentResponse & { error?: string }

  if (!response.ok) {
    throw new Error(data.error || '에이전트 응답을 받지 못했습니다.')
  }

  if (!data.reply) {
    throw new Error('에이전트 응답이 비어 있습니다.')
  }

  return {
    reply: data.reply,
    actions: data.actions ?? [],
  }
}

export function buildSpotsContext(
  spots: Array<{ id: string; title: string; category: string; address: string }>,
): string {
  if (spots.length === 0) return ''

  return spots
    .slice(0, 30)
    .map(
      (spot, i) =>
        `${i + 1}. [ID:${spot.id}] [${spot.category}] ${spot.title} | ${spot.address}`,
    )
    .join('\n')
}

export type { AgentAction }
