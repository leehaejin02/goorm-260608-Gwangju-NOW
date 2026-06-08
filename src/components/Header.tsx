import { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { useAuthStore } from '../store/useAuthStore'

import LoginModal from './auth/LoginModal'



const NAV_ITEMS = [

  { label: '행사', to: '/#events' },

  { label: '둘러보기', to: '/spots' },

  { label: 'NOW 플래너', to: '/#ai-chat' },

  { label: '맛집', to: '/#restaurants' },

  { label: '지도', to: '/#map' },

  { label: '영상', to: '/#videos' },

]



export default function Header() {

  const [isScrolled, setIsScrolled] = useState(false)

  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { isLoggedIn, user, logout, openLoginModal } = useAuthStore()



  useEffect(() => {

    const handleScroll = () => setIsScrolled(window.scrollY > 20)

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)

  }, [])



  useEffect(() => {

    document.body.style.overflow = isMenuOpen ? 'hidden' : ''

    return () => {

      document.body.style.overflow = ''

    }

  }, [isMenuOpen])



  const handleNavClick = () => setIsMenuOpen(false)



  return (

    <>

      <header

        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${

          isScrolled

            ? 'bg-white/80 backdrop-blur-md shadow-sm'

            : 'bg-transparent'

        }`}

      >

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link to="/" className="text-xl font-bold tracking-tight text-[#378ADD]">

            Gwangju NOW

          </Link>



          <nav className="hidden items-center gap-8 md:flex">

            {NAV_ITEMS.map((item) => (

              <Link

                key={item.to}

                to={item.to}

                className="text-sm font-medium text-gray-700 transition-colors hover:text-[#378ADD]"

              >

                {item.label}

              </Link>

            ))}

          </nav>



          <div className="flex items-center gap-2">

            {isLoggedIn && user ? (

              <div className="hidden items-center gap-2 md:flex">

                <Link to="/mypage" className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-gray-100">

                  {user.profileImage ? (

                    <img

                      src={user.profileImage}

                      alt={user.nickname}

                      className="h-8 w-8 rounded-full border border-gray-200 object-cover"

                    />

                  ) : (

                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm">

                      👤

                    </span>

                  )}

                  <span className="text-sm font-medium text-gray-700">{user.nickname}</span>

                </Link>

                <button

                  type="button"

                  onClick={logout}

                  className="text-xs text-gray-500 hover:text-gray-700"

                >

                  로그아웃

                </button>

              </div>

            ) : (

              <button

                type="button"

                onClick={openLoginModal}

                className="hidden rounded-lg bg-[#378ADD] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2d6fc4] md:block"

              >

                로그인

              </button>

            )}



            <button

              type="button"

              className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 md:hidden"

              aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}

              aria-expanded={isMenuOpen}

              onClick={() => setIsMenuOpen((prev) => !prev)}

            >

              {isMenuOpen ? (

                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />

                </svg>

              ) : (

                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">

                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />

                </svg>

              )}

            </button>

          </div>

        </div>



        {isMenuOpen && (

          <>

            <div

              className="fixed inset-0 top-16 bg-black/30 md:hidden"

              onClick={() => setIsMenuOpen(false)}

              aria-hidden="true"

            />

            <nav className="fixed left-0 right-0 top-16 border-b border-gray-200 bg-white/95 backdrop-blur-md md:hidden">

              <ul className="flex flex-col px-4 py-4">

                {NAV_ITEMS.map((item) => (

                  <li key={item.to}>

                    <Link

                      to={item.to}

                      onClick={handleNavClick}

                      className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#378ADD]"

                    >

                      {item.label}

                    </Link>

                  </li>

                ))}

                <li className="mt-2 border-t border-gray-100 pt-2">

                  {isLoggedIn && user ? (

                    <>

                      <Link

                        to="/mypage"

                        onClick={handleNavClick}

                        className="flex items-center gap-3 rounded-lg px-4 py-3 hover:bg-gray-50"

                      >

                        {user.profileImage && (

                          <img

                            src={user.profileImage}

                            alt=""

                            className="h-8 w-8 rounded-full object-cover"

                          />

                        )}

                        <span className="font-medium text-gray-700">{user.nickname}</span>

                      </Link>

                      <button

                        type="button"

                        onClick={() => {

                          logout()

                          handleNavClick()

                        }}

                        className="block w-full rounded-lg px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-50"

                      >

                        로그아웃

                      </button>

                    </>

                  ) : (

                    <button

                      type="button"

                      onClick={() => {

                        openLoginModal()

                        handleNavClick()

                      }}

                      className="block w-full rounded-lg px-4 py-3 text-left font-medium text-[#378ADD] hover:bg-gray-50"

                    >

                      로그인

                    </button>

                  )}

                </li>

              </ul>

            </nav>

          </>

        )}

      </header>

      <LoginModal />

    </>

  )

}


