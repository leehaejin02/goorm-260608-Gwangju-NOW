import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Event } from '../../types/event'
import { fetchAISummary } from '../../api/aiApi'
import { useAIChatStore } from '../../store/useAIChatStore'

const STEP_COLORS = ['#6C5CE7', '#4B8EF0', '#00B4FF']
const STEP_TIMES = ['14:00', '16:00', '18:00']

interface RecommendTheme {
  id: string
  label: string
  title: string
  bg: string
  color: string
  emoji: string
  description: string
  filter: (event: Event) => boolean
}

const THEMES: RecommendTheme[] = [
  {
    id: 'date',
    label: '데이트',
    title: '데이트 코스',
    bg: '#F0EEFF',
    color: '#6C5CE7',
    emoji: '💑',
    description: '연인과 함께 즐기기 좋은 공연·전시·야경 명소',
    filter: (event) => event.category === '공연' || event.category === '전시',
  },
  {
    id: 'family',
    label: '가족',
    title: '가족 나들이',
    bg: '#E8F5E9',
    color: '#2E7D32',
    emoji: '👨‍👩‍👧',
    description: '온 가족이 함께 즐길 수 있는 축제·체험 행사',
    filter: (event) => event.category === '축제' || event.category === '전시',
  },
  {
    id: 'night',
    label: '야간',
    title: '야간 코스',
    bg: '#E3F2FD',
    color: '#1565C0',
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
  const askAI = useAIChatStore((s) => s.askAI)

  const relatedEvents = useMemo(() => events.filter(theme.filter).slice(0, 3), [events, theme])

  const timelineItems =
    relatedEvents.length > 0
      ? relatedEvents.map((event, i) => ({
          time: STEP_TIMES[i] ?? `${14 + i * 2}:00`,
          place: event.title,
          desc: event.place,
          eventId: event.id,
        }))
      : [{ time: '14:00', place: theme.title, desc: theme.description, eventId: null }]

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
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [theme, relatedEvents])

  const handleStart = () => {
    const eventNames =
      relatedEvents.length > 0
        ? relatedEvents.map((e) => e.title).join(', ')
        : '광주 지역 문화 행사'
    askAI(
      `광주 ${theme.title}를 더 자세히 추천해줘. 관련 행사: ${eventNames}. 맛집과 이동 순서도 포함해줘.`,
    )
    document.getElementById('ai-chat')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <article className="rounded-2xl border border-gj-border bg-white p-5 transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center gap-2">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl text-base"
          style={{ background: theme.bg }}
        >
          {theme.emoji}
        </div>
        <div>
          <p className="text-[11px] text-gray-400">{theme.label}</p>
          <p className="text-[13px] font-semibold text-gj-dark">{theme.title}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="mb-4 flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-gj-purple"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      ) : aiText ? (
        <p className="mb-4 text-[11px] leading-relaxed text-gj-sub">{aiText}</p>
      ) : null}

      {timelineItems.map((step, i) => (
        <div key={`${step.place}-${i}`} className="mb-3 flex items-start gap-3 last:mb-0">
          <span
            className="min-w-[44px] pt-0.5 text-[11px] font-semibold"
            style={{ color: STEP_COLORS[i] ?? STEP_COLORS[0] }}
          >
            {step.time}
          </span>
          <div className="mt-1.5 flex flex-col items-center">
            <div
              className="h-2 w-2 rounded-full"
              style={{ background: STEP_COLORS[i] ?? STEP_COLORS[0] }}
            />
            {i < timelineItems.length - 1 && (
              <div className="mt-0.5 h-4 w-px bg-gray-200" />
            )}
          </div>
          <div>
            {step.eventId ? (
              <Link
                to={`/events/${step.eventId}`}
                className="text-[12px] font-medium text-gj-dark hover:text-gj-purple"
              >
                {step.place}
              </Link>
            ) : (
              <p className="text-[12px] font-medium text-gj-dark">{step.place}</p>
            )}
            <p className="text-[11px] text-gray-400">{step.desc}</p>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleStart}
        className="gj-grad-bg mt-4 w-full rounded-xl py-2.5 text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
      >
        이 코스로 출발 →
      </button>
    </article>
  )
}

interface RecommendSectionProps {
  events: Event[]
}

export default function RecommendSection({ events }: RecommendSectionProps) {
  return (
    <section id="recommend" className="gj-section">
      <div className="gj-container">
        <div className="gj-section-head">
          <div>
            <span className="gj-grad-bg mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2l1.09 3.26L16 6.27l-2.91 2.84.69 4.01L12 11.77l-3.78 1.99.69-4.01L6 6.27l2.91-1.01L12 2z" />
              </svg>
              AI 추천
            </span>
            <h2 className="gj-section-title">오늘의 추천 코스</h2>
          </div>
          <Link to="/#ai-chat" className="gj-section-more">
            전체 코스 보기 ›
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {THEMES.map((theme) => (
            <RecommendCard key={theme.id} theme={theme} events={events} />
          ))}
        </div>
      </div>
    </section>
  )
}
