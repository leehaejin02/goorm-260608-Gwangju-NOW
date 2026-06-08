import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import { useFavoriteStore } from '../store/useFavoriteStore'
import { useCourseStore } from '../store/useCourseStore'
import PrivateRoute from '../components/common/PrivateRoute'
import ProfileSection from '../components/mypage/ProfileSection'
import FavoriteList from '../components/mypage/FavoriteList'
import FavoriteRestaurantList from '../components/mypage/FavoriteRestaurantList'
import SavedCourseList from '../components/mypage/SavedCourseList'
import Header from '../components/Header'

type MyPageTab = 'events' | 'restaurants' | 'courses'

export default function MyPage() {
  const [searchParams] = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const favorites = useFavoriteStore((state) => state.favorites)
  const restaurantFavorites = useFavoriteStore((state) => state.restaurantFavorites)
  const savedCourses = useCourseStore((state) => state.savedCourses)
  const initialTab = searchParams.get('tab')
  const [tab, setTab] = useState<MyPageTab>(
    initialTab === 'courses' || initialTab === 'restaurants' || initialTab === 'events'
      ? initialTab
      : 'events',
  )

  useEffect(() => {
    const nextTab = searchParams.get('tab')
    if (nextTab === 'courses' || nextTab === 'restaurants' || nextTab === 'events') {
      setTab(nextTab)
    }
  }, [searchParams])

  if (!user) return null

  return (
    <PrivateRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
          <ProfileSection user={user} />

          <section className="mt-8">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">마이페이지</h2>
              <div className="flex flex-wrap rounded-lg border border-gray-200 bg-white p-1">
                <button
                  type="button"
                  onClick={() => setTab('events')}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    tab === 'events'
                      ? 'bg-[#378ADD] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  행사 ({favorites.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab('restaurants')}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    tab === 'restaurants'
                      ? 'bg-[#378ADD] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  맛집 ({restaurantFavorites.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTab('courses')}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                    tab === 'courses'
                      ? 'bg-[#378ADD] text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  코스 ({savedCourses.length})
                </button>
              </div>
            </div>

            {tab === 'events' && <FavoriteList favorites={favorites} />}
            {tab === 'restaurants' && (
              <FavoriteRestaurantList favorites={restaurantFavorites} />
            )}
            {tab === 'courses' && <SavedCourseList />}
          </section>
        </main>
      </div>
    </PrivateRoute>
  )
}
