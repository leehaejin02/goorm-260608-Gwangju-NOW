import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import LoginModal from './auth/LoginModal'

const GNB_ITEMS = [
  { label: '행사', to: '/#events' },
  { label: '명소', to: '/#spots' },
  { label: '맛집', to: '/#restaurants' },
  { label: '지도', to: '/#map' },
  { label: '코스추천', to: '/#recommend' },
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isLoggedIn, user, logout, openLoginModal } = useAuthStore()

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gj-border bg-white">
        <div className="gj-container flex h-[60px] items-center justify-between gap-4 md:gap-6">
          <Link to="/" className="flex shrink-0 flex-col leading-none">
            <span className="text-[9px] font-medium tracking-[0.14em] text-gray-400">GWANGJU</span>
            <span className="gj-grad-text text-[22px] font-bold tracking-tight">NOW</span>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {GNB_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] text-gray-600 transition-colors hover:bg-gray-50 hover:text-gj-purple"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            {isLoggedIn && user ? (
              <Link
                to="/mypage"
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-gray-50"
                aria-label="마이페이지"
              >
                <img
                  src={user.profileImage}
                  alt={user.nickname}
                  className="h-8 w-8 shrink-0 rounded-full border-2 border-gj-purple object-cover"
                />
                <span className="text-[13px] font-medium text-gray-700">마이페이지</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="rounded-lg border border-gj-purple px-3 py-1.5 text-[12px] font-medium text-gj-purple hover:bg-[#F0EEFF]"
              >
                로그인
              </button>
            )}

            <button
              type="button"
              className="p-2 text-gray-500 md:hidden"
              aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
              onClick={() => setIsMenuOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <>
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <nav className="border-t border-gj-border bg-white md:hidden">
            <ul className="gj-container py-3">
              {GNB_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setIsMenuOpen(false)}
                    className="block py-2.5 text-sm font-medium text-gj-dark"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-gj-border pt-2">
                {isLoggedIn && user ? (
                  <>
                    <Link
                      to="/mypage"
                      onClick={() => setIsMenuOpen(false)}
                      className="block py-2 text-sm text-gj-dark"
                    >
                      {user.nickname} · 마이페이지
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}
                      className="py-2 text-xs text-gj-sub"
                    >
                      로그아웃
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      openLoginModal()
                      setIsMenuOpen(false)
                    }}
                    className="py-2 text-sm font-semibold text-gj-purple"
                  >
                    로그인
                  </button>
                )}
              </li>
            </ul>
          </nav>
        )}
      </header>
      <LoginModal />
    </>
  )
}
