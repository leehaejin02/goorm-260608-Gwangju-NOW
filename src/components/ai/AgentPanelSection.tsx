import { useEffect, useMemo, useRef, useState } from 'react'
import type { Event } from '../../types/event'
import type { Restaurant } from '../../types/restaurant'
import type { AgentAction } from '../../types/agent'
import { fetchGwangjuRestaurants } from '../../api/restaurantApi'
import {
  buildEventsContext,
  buildRestaurantsContext,
  type ChatMessage,
} from '../../api/aiChatApi'
import { buildSpotsContext, sendAgentMessage } from '../../api/agentApi'
import { buildCourseContext, enrichCourseItems } from '../../lib/courseUtils'
import { buildPoiCatalog } from '../../lib/agentPoiCatalog'
import { applyAgentActions } from '../../lib/applyAgentActions'
import { getProactiveSuggestions } from '../../lib/agentProactive'
import { useAIChatStore } from '../../store/useAIChatStore'
import { useCourseStore } from '../../store/useCourseStore'
import { useSpotStore } from '../../store/useSpotStore'
import CoursePanel from '../course/CoursePanel'
import ChatMessageContent from './ChatMessageContent'
import AgentActionCards from './AgentActionCards'
import AgentProactiveBanner from './AgentProactiveBanner'

interface DisplayMessage extends ChatMessage {
  actions?: AgentAction[]
}

const BASE_SUGGESTIONS = [
  '송정 떡갈비 찾아서 코스에 넣어줘',
  '이번 주말 데이트 코스 짜줘',
  '가족과 가기 좋은 행사 알려줘',
]

interface AgentPanelSectionProps {
  events: Event[]
}

export default function AgentPanelSection({ events }: AgentPanelSectionProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const pendingMessage = useAIChatStore((s) => s.pendingMessage)
  const consumePending = useAIChatStore((s) => s.consumePending)
  const currentItems = useCourseStore((s) => s.currentItems)
  const { spots, fetchSpots } = useSpotStore()

  const eventsContext = buildEventsContext(events)
  const restaurantsContext = buildRestaurantsContext(restaurants)
  const spotsContext = buildSpotsContext(spots)
  const proactiveSuggestions = useMemo(
    () => getProactiveSuggestions(currentItems),
    [currentItems],
  )

  const chipSuggestions =
    currentItems.length > 0
      ? ['내 코스에 점심 맛집 검색해서 넣어줘', '지금 코스 시간 배치해줘', ...BASE_SUGGESTIONS.slice(0, 1)]
      : BASE_SUGGESTIONS

  const courseLookup = useMemo(
    () => ({ events, spots, restaurants }),
    [events, spots, restaurants],
  )

  const poiCatalog = useMemo(
    () => buildPoiCatalog(events, spots, restaurants),
    [events, spots, restaurants],
  )

  useEffect(() => {
    fetchGwangjuRestaurants()
      .then((data) => setRestaurants(data.slice(0, 15)))
      .catch(() => setRestaurants([]))
  }, [])

  useEffect(() => {
    fetchSpots()
  }, [fetchSpots])

  useEffect(() => {
    const items = useCourseStore.getState().currentItems
    if (items.length === 0) return

    const enriched = enrichCourseItems(items, courseLookup)
    const changed = enriched.some(
      (item, i) =>
        item.lat !== items[i].lat ||
        item.lng !== items[i].lng ||
        item.link !== items[i].link,
    )

    if (changed) {
      useCourseStore.getState().setCurrentItems(enriched)
    }
  }, [courseLookup, events, spots, restaurants, currentItems.length])

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    })
  }

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMessage: DisplayMessage = { role: 'user', content: trimmed }
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setError(null)
    setIsLoading(true)
    scrollToBottom()

    try {
      const { reply, actions } = await sendAgentMessage(
        nextMessages.map(({ role, content }) => ({ role, content })),
        {
          eventsContext,
          restaurantsContext,
          spotsContext,
          courseContext: buildCourseContext(useCourseStore.getState().currentItems),
          poiCatalog,
        },
      )

      if (actions.length > 0) {
        applyAgentActions(actions, courseLookup)
      }

      setMessages([
        ...nextMessages,
        { role: 'assistant', content: reply, actions: actions.length > 0 ? actions : undefined },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : '에이전트 응답을 받지 못했습니다.')
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }

  useEffect(() => {
    if (!pendingMessage || isLoading) return
    const message = consumePending()
    if (message) void sendMessage(message)
  }, [pendingMessage, isLoading, consumePending])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <section id="ai-chat" className="border-t border-gray-100 bg-gradient-to-b from-white to-blue-50/30 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center lg:text-left">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">NOW 플래너</h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            AI 에이전트와 대화하며 코스·동선·시간을 한 화면에서 완성하세요
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
          <div className="lg:col-span-3">
            <AgentProactiveBanner
              suggestions={proactiveSuggestions}
              onAction={sendMessage}
              isLoading={isLoading}
            />

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
              <div
                ref={listRef}
                className="flex max-h-[480px] min-h-[280px] flex-col gap-4 overflow-y-auto p-4 sm:p-6"
              >
                {messages.length === 0 && (
                  <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                    <span className="text-4xl" aria-hidden>
                      🤖
                    </span>
                    <p className="mt-3 text-sm text-gray-500">
                      말하면 검색·추가·시간 설정까지 실행됩니다
                    </p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                      {chipSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => sendMessage(suggestion)}
                          className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors hover:border-[#378ADD] hover:text-[#378ADD] sm:text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#378ADD] text-white'
                          : 'border border-gray-200 bg-white text-gray-700'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <>
                          <ChatMessageContent
                            content={msg.content}
                            events={events}
                            restaurants={restaurants}
                            variant="assistant"
                          />
                          {msg.actions && <AgentActionCards actions={msg.actions} inlinePanel />}
                        </>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#378ADD] [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#378ADD] [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#378ADD] [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs text-gray-500">에이전트 실행 중…</span>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600 sm:px-6">
                  {error}
                </p>
              )}

              <form
                onSubmit={handleSubmit}
                className="flex gap-2 border-t border-gray-200 bg-white p-3 sm:p-4"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="예: 양동 순대 검색해서 12:00 점심으로 추가해줘"
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#378ADD] focus:outline-none focus:ring-2 focus:ring-[#378ADD]/20 disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="shrink-0 rounded-xl bg-[#378ADD] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2d6fc4] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  전송
                </button>
              </form>
            </div>
          </div>

          <div id="my-course" className="lg:col-span-2 lg:sticky lg:top-20">
            <CoursePanel />
          </div>
        </div>
      </div>
    </section>
  )
}
