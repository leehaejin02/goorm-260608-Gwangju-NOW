import { fetchKakaoLocalPlaces } from './kakao-local-handler'
import { GWANGJU_CENTER } from '../src/types/kakaoLocal'
import type { CourseItem, CourseItemType } from '../src/types/course'
import type { AgentAction } from '../src/types/agent'
import type { AgentPoiCatalogEntry } from '../src/lib/agentPoiCatalog'
import { normalizeCourseLatLng } from '../src/lib/geoUtils'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface RestaurantSearchEntry {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  place_url: string
}

interface OpenAIToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

interface OpenAIMessage {
  role: string
  content: string | null
  tool_calls?: OpenAIToolCall[]
  tool_call_id?: string
}

interface OpenAIChatResponse {
  choices?: Array<{ message?: OpenAIMessage; finish_reason?: string }>
}

const AGENT_TOOLS = [
  {
    type: 'function' as const,
    function: {
      name: 'search_restaurants',
      description: '광주 지역 음식점을 키워드로 검색합니다. 맛집 추천·코스 추가 전에 사용하세요.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '검색 키워드 (예: 송정 떡갈비, 양동 순대)' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'add_to_course',
      description:
        '사용자 코스에 장소를 추가합니다. 행사/명소는 목록의 ID, 맛집은 search_restaurants 결과의 id를 ref_id로 사용하세요.',
      parameters: {
        type: 'object',
        properties: {
          item_type: { type: 'string', enum: ['event', 'restaurant', 'spot'] },
          ref_id: { type: 'string' },
          title: { type: 'string' },
          subtitle: { type: 'string' },
          lat: { type: 'number' },
          lng: { type: 'number' },
          link: { type: 'string' },
        },
        required: ['item_type', 'ref_id', 'title', 'subtitle'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'set_time_slot',
      description: '코스 항목에 방문 시간(HH:MM)을 설정합니다. item_id는 [item_id:xxx] 형식을 사용하세요.',
      parameters: {
        type: 'object',
        properties: {
          item_id: { type: 'string' },
          time_slot: { type: 'string', description: '24시간 HH:MM 형식 (예: 11:30)' },
        },
        required: ['item_id', 'time_slot'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'remove_from_course',
      description: '코스에서 항목을 제거합니다.',
      parameters: {
        type: 'object',
        properties: {
          item_id: { type: 'string' },
        },
        required: ['item_id'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'clear_course',
      description: '코스를 모두 비웁니다. 사용자가 명확히 요청할 때만 사용하세요.',
      parameters: { type: 'object', properties: {} },
    },
  },
]

function buildSystemPrompt(
  eventsContext: string,
  restaurantsContext: string,
  spotsContext: string,
  courseContext: string,
): string {
  const courseSection = courseContext
    ? `\n[사용자 코스]\n${courseContext}\n- 코스 수정 시 add_to_course, set_time_slot, remove_from_course 도구를 사용하세요.`
    : '\n[사용자 코스]\n비어 있음 — 필요하면 search_restaurants 후 add_to_course로 채우세요.'

  return `당신은 광주 관광 AI 에이전트입니다. 한국어로 친절하게 답하고, **직접 코스를 조작**할 수 있습니다.
- 추천만 하지 말고, 사용자가 원하면 도구로 코스에 추가·시간 설정까지 실행하세요.
- 행사·명소는 아래 목록의 ID만 사용하고, 맛집은 search_restaurants 후 결과 id를 사용하세요.
- 목록에 없는 장소는 지어내지 마세요.
- 답변은 2~4문장으로 간결하게, 어떤 action을 했는지 요약하세요.

[광주 행사 목록]
${eventsContext || '없음'}

[광주 맛집 샘플]
${restaurantsContext || '없음'}

[광주 명소 목록]
${spotsContext || '없음'}${courseSection}`
}

async function searchRestaurantsTool(
  query: string,
  kakaoRestApiKey: string,
  restaurantCache: Map<string, RestaurantSearchEntry>,
): Promise<string> {
  const { documents } = await fetchKakaoLocalPlaces(kakaoRestApiKey, {
    type: 'keyword',
    query: query.trim(),
    x: String(GWANGJU_CENTER.lng),
    y: String(GWANGJU_CENTER.lat),
    radius: '20000',
    sort: 'accuracy',
    size: '10',
    category_group_code: 'FD6',
  })

  if (documents.length === 0) {
    return JSON.stringify({ results: [], message: '검색 결과 없음' })
  }

  const results = documents.map((doc) => {
    const entry: RestaurantSearchEntry = {
      id: doc.id,
      name: doc.place_name,
      address: doc.road_address_name || doc.address_name,
      lat: parseFloat(doc.y),
      lng: parseFloat(doc.x),
      place_url: doc.place_url,
    }
    restaurantCache.set(entry.id, entry)
    return {
      id: entry.id,
      name: entry.name,
      category: doc.category_name.split('>').pop()?.trim() ?? '음식점',
      address: entry.address,
      lat: entry.lat,
      lng: entry.lng,
      place_url: entry.place_url,
    }
  })

  return JSON.stringify({ results })
}

function findInPoiCatalog(
  catalog: AgentPoiCatalogEntry[],
  itemType: CourseItemType,
  refId: string,
  title: string,
): AgentPoiCatalogEntry | undefined {
  return (
    catalog.find((e) => e.item_type === itemType && e.ref_id === refId) ??
    catalog.find((e) => e.item_type === itemType && e.title === title)
  )
}

function addToCourseTool(
  args: Record<string, unknown>,
  pendingActions: AgentAction[],
  poiCatalog: AgentPoiCatalogEntry[],
  restaurantCache: Map<string, RestaurantSearchEntry>,
): string {
  const itemType = args.item_type as CourseItemType
  const refId = String(args.ref_id ?? '')
  const title = String(args.title ?? '')
  const subtitle = String(args.subtitle ?? '')

  if (!refId || !title) {
    return JSON.stringify({ success: false, error: 'ref_id와 title이 필요합니다.' })
  }

  let lat = typeof args.lat === 'number' ? args.lat : undefined
  let lng = typeof args.lng === 'number' ? args.lng : undefined
  let link = args.link ? String(args.link) : undefined

  if (lat == null || lng == null) {
    const catalogEntry = findInPoiCatalog(poiCatalog, itemType, refId, title)
    if (catalogEntry?.lat != null && catalogEntry?.lng != null) {
      lat = catalogEntry.lat
      lng = catalogEntry.lng
      link = link ?? catalogEntry.link
    }
  }

  if ((lat == null || lng == null) && itemType === 'restaurant') {
    const restaurant = restaurantCache.get(refId)
    if (restaurant) {
      lat = restaurant.lat
      lng = restaurant.lng
      link = link ?? restaurant.place_url
    }
  }

  const normalized = normalizeCourseLatLng(lat, lng)
  if (normalized) {
    lat = normalized.lat
    lng = normalized.lng
  } else {
    lat = undefined
    lng = undefined
  }

  const item: CourseItem = {
    id: `${itemType}-${refId}`,
    type: itemType,
    title,
    subtitle,
    refId,
    link,
    lat,
    lng,
  }

  pendingActions.push({
    type: 'add_to_course',
    item,
    label: `「${title}」 코스에 추가`,
  })

  return JSON.stringify({ success: true, item_id: item.id })
}

async function executeTool(
  name: string,
  argsJson: string,
  pendingActions: AgentAction[],
  kakaoRestApiKey: string,
  poiCatalog: AgentPoiCatalogEntry[],
  restaurantCache: Map<string, RestaurantSearchEntry>,
): Promise<string> {
  let args: Record<string, unknown> = {}
  try {
    args = JSON.parse(argsJson) as Record<string, unknown>
  } catch {
    return JSON.stringify({ error: 'Invalid JSON arguments' })
  }

  switch (name) {
    case 'search_restaurants':
      return searchRestaurantsTool(String(args.query ?? ''), kakaoRestApiKey, restaurantCache)

    case 'add_to_course':
      return addToCourseTool(args, pendingActions, poiCatalog, restaurantCache)

    case 'set_time_slot': {
      const itemId = String(args.item_id ?? '')
      const timeSlot = String(args.time_slot ?? '')
      pendingActions.push({
        type: 'set_time_slot',
        itemId,
        timeSlot,
        label: `방문 시간 ${timeSlot} 설정`,
      })
      return JSON.stringify({ success: true })
    }

    case 'remove_from_course': {
      const itemId = String(args.item_id ?? '')
      pendingActions.push({
        type: 'remove_from_course',
        itemId,
        label: '코스에서 항목 제거',
      })
      return JSON.stringify({ success: true })
    }

    case 'clear_course':
      pendingActions.push({ type: 'clear_course', label: '코스 전체 비우기' })
      return JSON.stringify({ success: true })

    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` })
  }
}

export async function runAgent(
  messages: ChatMessage[],
  contexts: {
    eventsContext: string
    restaurantsContext: string
    spotsContext: string
    courseContext: string
    poiCatalog?: AgentPoiCatalogEntry[]
  },
  apiKey: string,
  kakaoRestApiKey: string,
): Promise<{ reply: string; actions: AgentAction[] }> {
  const pendingActions: AgentAction[] = []
  const poiCatalog = contexts.poiCatalog ?? []
  const restaurantCache = new Map<string, RestaurantSearchEntry>()
  const openAIMessages: OpenAIMessage[] = [
    {
      role: 'system',
      content: buildSystemPrompt(
        contexts.eventsContext,
        contexts.restaurantsContext,
        contexts.spotsContext,
        contexts.courseContext,
      ),
    },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ]

  for (let step = 0; step < 6; step++) {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 600,
        tools: AGENT_TOOLS,
        tool_choice: 'auto',
        messages: openAIMessages,
      }),
    })

    if (!openaiRes.ok) {
      throw new Error('OpenAI request failed')
    }

    const data = (await openaiRes.json()) as OpenAIChatResponse
    const message = data.choices?.[0]?.message

    if (!message) {
      throw new Error('Empty agent response')
    }

    if (!message.tool_calls?.length) {
      const reply = message.content?.trim() || '요청을 처리했습니다.'
      return { reply, actions: pendingActions }
    }

    openAIMessages.push(message)

    for (const toolCall of message.tool_calls) {
      const result = await executeTool(
        toolCall.function.name,
        toolCall.function.arguments,
        pendingActions,
        kakaoRestApiKey,
        poiCatalog,
        restaurantCache,
      )
      openAIMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      })
    }
  }

  return {
    reply: '요청하신 작업을 처리했습니다. 코스를 확인해 보세요.',
    actions: pendingActions,
  }
}
