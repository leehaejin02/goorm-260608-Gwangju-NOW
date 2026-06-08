import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Event } from '../../types/event'
import { fetchAISummary } from '../../api/aiApi'
import { useAIChatStore } from '../../store/useAIChatStore'

interface RecommendTheme {
  id: string
  title: string
  emoji: string
  description: string
  filter: (event: Event) => boolean
}

const THEMES: RecommendTheme[] = [
  {
    id: 'date',
    title: '데이트 코스',
    emoji: '💑',
    description: '연인과 함께 즐기기 좋은 공연·전시·야경 명소',
    filter: (event) => event.category === '공연' || event.category === '전시',
  },
  {
    id: 'family',
    title: '가족 나들이',
    emoji: '👨‍👩‍👧',
    description: '온 가족이 함께 즐길 수 있는 축제·체험 행사',
    filter: (event) => event.category === '축제' || event.category === '전시',
  },
  {
    id: 'night',
    title: '야간 코스',
    emoji: '🌙',
    description: '밤에 더 빛나는 광주 축제·공연·야경 스팟',
    filter: (event) => event.category === '축제' || event.category === '공연',
  },
]

interface RecommendCardProps {
  theme: RecommendTheme
  events: Event[]
}

function RecommendCard({ theme, events }: RecommendCardProps) {
  const [aiText, setAiText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [usedAi, setUsedAi] = useState(false)
  const askAI = useAIChatStore((s) => s.askAI)

  const relatedEvents = useMemo(() => events.filter(theme.filter).slice(0, 3), [events, theme])

  const fallbackText =
    relatedEvents.length > 0
      ? `${relatedEvents[0].title}을 포함한 광주 ${theme.title}로 ${theme.description}`
      : theme.description

  useEffect(() => {
    let cancelled = false

    const eventList =
      relatedEvents.length > 0
        ? relatedEvents.map((e) => `${e.title}(${e.place})`).join(', ')
        : '광주 지역 문화 행사'

    fetchAISummary(
      `recommend-${theme.id}`,
      `광주 ${theme.title} 추천`,
      `${theme.description}. 추천 행사: ${eventList}. 2문장으로 코스를 추천해 주세요.`,
    ).then((result) => {
      if (!cancelled) {
        setAiText(result)
        setUsedAi(Boolean(result))
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [theme, relatedEvents])

  const displayText = aiText ?? fallbackText

  const handleAskMore = () => {
    const eventNames =
      relatedEvents.length > 0
        ? relatedEvents.map((e) => e.title).join(', ')
        : '광주 지역 문화 행사'
    askAI(
      `광주 ${theme.title}를 더 자세히 추천해줘. 관련 행사: ${eventNames}. 맛집과 이동 순서도 포함해줘.`,
    )
  }

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl" aria-hidden>
          {theme.emoji}
        </span>
        <h3 className="text-lg font-bold text-gray-900">{theme.title}</h3>
      </div>

      {isLoading ? (
        <div className="mb-4 flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#378ADD] [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#378ADD] [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#378ADD] [animation-delay:300ms]" />
        </div>
      ) : (
        <>
          <p className="mb-2 text-sm leading-relaxed text-gray-600">{displayText}</p>
          {usedAi ? (
            <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#378ADD]">
              ✨ AI 생성
            </span>
          ) : (
            <span className="mb-4 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
              기본 추천 (AI 연결 필요)
            </span>
          )}
        </>
      )}

      {relatedEvents.length > 0 ? (
        <ul className="mt-auto space-y-2 border-t border-gray-100 pt-4">
          {relatedEvents.map((event) => (
            <li key={event.id}>
              <Link
                to={`/events/${event.id}`}
                className="block truncate text-sm font-medium text-[#378ADD] hover:underline"
              >
                → {event.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-auto text-xs text-gray-400">관련 행사 정보를 불러오는 중입니다.</p>
      )}

      <button
        type="button"
        onClick={handleAskMore}
        className="mt-4 w-full rounded-lg border border-[#378ADD]/30 bg-blue-50 py-2 text-sm font-medium text-[#378ADD] transition-colors hover:bg-blue-100"
      >
        💬 AI에게 더 물어보기
      </button>
    </article>
  )
}

interface RecommendSectionProps {
  events: Event[]
}

export default function RecommendSection({ events }: RecommendSectionProps) {
  return (
    <section id="recommend" className="bg-gray-50 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">AI 추천 코스</h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            광주 행사를 테마별로 골라보세요
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {THEMES.map((theme) => (
            <RecommendCard key={theme.id} theme={theme} events={events} />
          ))}
        </div>
      </div>
    </section>
  )
}
