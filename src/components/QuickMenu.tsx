import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface QuickMenuItem {
  label: string
  path: string
  bg: string
  color: string
  icon: ReactNode
}

const MENUS: QuickMenuItem[] = [
  {
    label: '행사/축제',
    path: '/#events',
    bg: '#F0EEFF',
    color: '#6C5CE7',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    label: '트렌드',
    path: '/#videos',
    bg: '#FFF3E0',
    color: '#FF6B35',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF6B35">
        <path d="M12 23c-3.9 0-7-3.1-7-7 0-3.9 3.1-7 7-7s7 3.1 7 7c0 3.9-3.1 7-7 7z" />
      </svg>
    ),
  },
  {
    label: '맛집/카페',
    path: '/#restaurants',
    bg: '#E8F5E9',
    color: '#2E7D32',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2">
        <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
      </svg>
    ),
  },
  {
    label: '관광명소',
    path: '/#spots',
    bg: '#E3F2FD',
    color: '#1565C0',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2">
        <path d="M3 21l9-9 9 9M12 3v9" />
      </svg>
    ),
  },
  {
    label: '주차장',
    path: '/#map',
    bg: '#E8F5E9',
    color: '#2E7D32',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" strokeWidth="2.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v10M9 10h4a2 2 0 110 4h-2" />
      </svg>
    ),
  },
]

interface QuickMenuProps {
  variant?: 'section' | 'hero'
}

export default function QuickMenu({ variant = 'section' }: QuickMenuProps) {
  const menuGrid = (
    <div className="grid grid-cols-5 gap-2 sm:gap-4">
      {MENUS.map((menu) => (
        <Link
          key={menu.label}
          to={menu.path}
          className="group flex flex-col items-center gap-2 py-1 transition-transform hover:-translate-y-0.5"
        >
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full transition-transform group-hover:scale-105 sm:h-14 sm:w-14"
            style={{ background: menu.bg }}
          >
            {menu.icon}
          </div>
          <span className="text-center text-[10px] font-medium text-gray-600 sm:text-[12px]">
            {menu.label}
          </span>
        </Link>
      ))}
    </div>
  )

  if (variant === 'hero') {
    return (
      <div className="rounded-2xl border border-gj-border bg-white px-4 py-5 shadow-lg shadow-gray-200/60 sm:px-8 sm:py-6">
        {menuGrid}
      </div>
    )
  }

  return (
    <section className="gj-section-white border-b border-gj-border">
      <div className="gj-container">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {MENUS.map((menu) => (
            <Link
              key={menu.label}
              to={menu.path}
              className="group flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-gj-border bg-white p-4 transition-all hover:border-gj-purple hover:shadow-sm"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110"
                style={{ background: menu.bg }}
              >
                {menu.icon}
              </div>
              <span className="text-center text-[12px] font-medium text-gray-600 group-hover:text-gj-purple">
                {menu.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
