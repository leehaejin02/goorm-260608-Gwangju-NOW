import { useEffect } from 'react'
import { useEventStore } from '../../store/useEventStore'
import { useSpotStore } from '../../store/useSpotStore'

const STATS_META = [
  { id: 'events', icon: '📅', label: '진행중 행사', tint: 'bg-violet-50 text-violet-600' },
  { id: 'trends', icon: '🔥', label: '트렌드 키워드', tint: 'bg-orange-50 text-orange-500' },
  { id: 'courses', icon: '🗺️', label: '오늘의 코스', tint: 'bg-blue-50 text-blue-600' },
  { id: 'spots', icon: '🏞️', label: '관광명소', tint: 'bg-emerald-50 text-emerald-600' },
] as const

export default function StatsStrip() {
  const events = useEventStore((s) => s.events)
  const { spots, fetchSpots } = useSpotStore()

  useEffect(() => {
    if (spots.length === 0) fetchSpots()
  }, [spots.length, fetchSpots])

  const values: Record<string, string | number> = {
    events: events.length || '—',
    trends: 24,
    courses: 3,
    spots: spots.length || '—',
  }

  return (
    <section className="relative z-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {STATS_META.map(({ id, icon, label, tint }) => (
            <div key={id} className="stat-card">
              <span className={`icon-circle mb-3 ${tint}`}>{icon}</span>
              <p className="text-2xl font-extrabold text-slate-900">{values[id]}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
