import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import EventCard from '../components/EventCard'
import MapSection from '../components/MapSection'
import YoutubeSection from '../components/youtube/YoutubeSection'
import RecommendSection from '../components/common/RecommendSection'
import RestaurantSection from '../components/restaurant/RestaurantSection'
import SpotSection from '../components/spot/SpotSection'
import AgentPanelSection from '../components/ai/AgentPanelSection'
import FloatingCourseBar from '../components/course/FloatingCourseBar'
import EventCardSkeleton from '../components/common/EventCardSkeleton'
import ErrorMessage from '../components/common/ErrorMessage'
import CategoryFilter from '../components/common/CategoryFilter'
import EventSearchBar from '../components/common/EventSearchBar'
import Footer from '../components/Footer'
import { usePageMeta } from '../hooks/usePageMeta'
import { useEventStore } from '../store/useEventStore'

export default function HomePage() {
  const location = useLocation()

  usePageMeta({
    title: undefined,
    description: '광주의 행사, 명소, 맛집, 주차 정보를 AI로 탐색하세요.',
  })

  const {
    events,
    filteredEvents,
    selectedCategory,
    searchQuery,
    dateFilter,
    isLoading,
    error,
    fetchEvents,
    setCategory,
    setSearchQuery,
    setDateFilter,
  } = useEventStore()

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    if (!location.hash) return
    const timer = window.setTimeout(() => {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
    return () => window.clearTimeout(timer)
  }, [location.hash])

  return (
    <div className="min-h-screen bg-gj-bg">
      <Header />
      <HeroSection />

      <section id="events" className="gj-section-white">
        <div className="gj-container">
          <div className="gj-section-head">
            <div>
              <span className="mb-1 inline-block text-[11px] font-semibold text-gj-purple">
                🔥 오늘의 인기
              </span>
              <h2 className="gj-section-title">오늘의 인기 행사</h2>
              <p className="mt-0.5 text-[13px] text-gj-sub">
                광주에서 진행 중인 축제, 공연, 전시
              </p>
            </div>
          </div>

          <EventSearchBar
            searchQuery={searchQuery}
            dateFilter={dateFilter}
            onSearchChange={setSearchQuery}
            onDateFilterChange={setDateFilter}
          />

          <CategoryFilter selected={selectedCategory} onChange={setCategory} />

          {isLoading && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && error && <ErrorMessage message={error} onRetry={fetchEvents} />}

          {!isLoading && !error && filteredEvents.length === 0 && (
            <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-gj-border bg-gj-bg">
              <p className="text-[13px] text-gj-sub">
                {searchQuery || dateFilter !== 'all' || selectedCategory !== '전체'
                  ? '검색 조건에 맞는 행사가 없습니다.'
                  : '해당 카테고리의 행사가 없습니다.'}
              </p>
            </div>
          )}

          {!isLoading && !error && filteredEvents.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SpotSection />
      <RecommendSection events={events} />
      <AgentPanelSection events={events} />
      <RestaurantSection />
      <MapSection events={filteredEvents} />
      <YoutubeSection
        category={selectedCategory}
        eventTitles={events.slice(0, 3).map((event) => event.title)}
      />

      <Footer />
      <FloatingCourseBar />
    </div>
  )
}
