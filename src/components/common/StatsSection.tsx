import { Link } from 'react-router-dom'
import { useEventStore } from '../../store/useEventStore'
import { useSpotStore } from '../../store/useSpotStore'

const STATS = [
  {
    id: 'events',
    color: '#6C5CE7',
    label: '행사 진행중',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V10h14v10z" />
      </svg>
    ),
  },
  {
    id: 'trends',
    color: '#FF6B35',
    label: '트렌드 상승중',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.04-1.66 3.7-3.7 3.7-2.15 0-4.8-.74-4.8-.74S10.04 2.15 12.18 2.15c2.15 0 4.8.74 4.8.74z" />
      </svg>
    ),
  },
  {
    id: 'courses',
    color: '#00B4FF',
    label: '오늘의 코스',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      </svg>
    ),
  },
  {
    id: 'parking',
    color: '#4B8EF0',
    label: '주차 이용가능',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15H9V8h3a3 3 0 013 3v1a3 3 0 01-3 3h-1v3z" />
      </svg>
    ),
  },
] as const

export default function StatsSection() {
  const eventCount = useEventStore((s) => s.events.length)
  const spotCount = useSpotStore((s) => s.spots.length)

  const values: Record<string, number> = {
    events: eventCount,
    trends: 24,
    courses: 3,
    parking: spotCount > 0 ? Math.min(spotCount, 236) : 236,
  }

  return (
    <section className="gj-section-white">
      <div className="gj-container">
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border border-gj-border bg-gj-bg p-4 text-center"
              >
                <div className="mx-auto mb-2" style={{ color: s.color }}>
                  {s.icon}
                </div>
                <p
                  className="mb-1 text-[28px] font-bold leading-none"
                  style={{ color: s.color }}
                >
                  {values[s.id]}
                </p>
                <p className="text-[11px] text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="gj-grad-bg flex flex-col justify-between rounded-2xl p-5 md:w-[280px]">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/60">
                NOW 플래너
              </p>
              <p className="mb-1 text-[18px] font-bold leading-snug text-white">
                나만의 광주 코스
                <br />
                AI가 30초에 완성
              </p>
              <p className="text-[12px] text-white/60">대화로 코스를 설계하세요</p>
            </div>
            <Link
              to="/#ai-chat"
              className="mt-4 rounded-xl bg-white py-2.5 text-center text-[13px] font-semibold text-gj-purple transition-colors hover:bg-white/90"
            >
              시작하기 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
