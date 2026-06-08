import { Link, useLocation } from 'react-router-dom'

const TABS = [
  {
    label: '홈',
    to: '/',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? '#6C5CE7' : 'none'} stroke={active ? '#6C5CE7' : '#AAAAAA'} strokeWidth="2">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    active: (path: string, hash: string) => path === '/' && !hash,
  },
  {
    label: '코스추천',
    to: '/#ai-chat',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#6C5CE7' : '#AAAAAA'} strokeWidth="2">
        <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    active: (_path: string, hash: string) => hash === '#ai-chat',
  },
  {
    label: '지도',
    to: '/#map',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#6C5CE7' : '#AAAAAA'} strokeWidth="2">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    active: (_path: string, hash: string) => hash === '#map',
  },
  {
    label: '마이페이지',
    to: '/mypage',
    icon: (active: boolean) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? '#6C5CE7' : '#AAAAAA'} strokeWidth="2">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    active: (path: string) => path === '/mypage',
  },
]

export default function BottomNav() {
  const { pathname, hash } = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around border-t border-gj-border bg-white py-2 pb-3 md:hidden">
      {TABS.map((tab) => {
        const active = tab.active(pathname, hash)
        return (
          <Link key={tab.to} to={tab.to} className="flex flex-col items-center gap-0.5">
            {tab.icon(active)}
            <span className="text-[9px]" style={{ color: active ? '#6C5CE7' : '#AAAAAA' }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
