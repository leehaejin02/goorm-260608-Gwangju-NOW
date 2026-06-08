import { Link } from 'react-router-dom'

const QUICK_ITEMS = [
  {
    label: '행사 정보',
    desc: '축제·공연·전시',
    to: '/#events',
    icon: '🎭',
    color: 'from-blue-500 to-blue-600',
  },
  {
    label: '가볼만한 곳',
    desc: '관광·문화·쇼핑',
    to: '/spots',
    icon: '🏞️',
    color: 'from-teal-500 to-emerald-600',
  },
  {
    label: 'NOW 플래너',
    desc: 'AI·코스·동선',
    to: '/#ai-chat',
    icon: '🤖',
    color: 'from-violet-500 to-purple-600',
  },
  {
    label: '광주 맛집',
    desc: '카카오맵 POI',
    to: '/#restaurants',
    icon: '🍽️',
    color: 'from-amber-500 to-orange-600',
  },
  {
    label: '행사 지도',
    desc: '위치·주차장',
    to: '/#map',
    icon: '🗺️',
    color: 'from-emerald-500 to-teal-600',
  },
]

export default function QuickMenu() {
  return (
    <section className="relative z-10 px-4 pb-2 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xl shadow-slate-200/50 sm:p-6">
          <p className="mb-4 text-sm font-bold text-gray-900">
            Gwangju NOW <span className="font-medium text-gray-500">서비스 바로가기</span>
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 sm:gap-4">
            {QUICK_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-slate-200 hover:bg-white hover:shadow-md sm:p-4"
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} text-lg shadow-sm`}
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-gray-900 group-hover:text-[#378ADD]">
                    {item.label}
                  </p>
                  <p className="truncate text-xs text-gray-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
