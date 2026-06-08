import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/Header'

import HeroSection from '../components/HeroSection'

import QuickMenu from '../components/QuickMenu'

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

    <div className="min-h-screen bg-white">

      <Header />

      <HeroSection />

      <QuickMenu />



      <section id="events" className="py-12 sm:py-16">

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          <div className="mb-8">

            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">광주 행사</h2>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">

              광주에서 진행 중인 축제, 공연, 전시를 만나보세요

            </p>

          </div>



          <EventSearchBar

            searchQuery={searchQuery}

            dateFilter={dateFilter}

            onSearchChange={setSearchQuery}

            onDateFilterChange={setDateFilter}

          />



          <CategoryFilter selected={selectedCategory} onChange={setCategory} />



          {isLoading && (

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

              {Array.from({ length: 6 }).map((_, i) => (

                <EventCardSkeleton key={i} />

              ))}

            </div>

          )}



          {!isLoading && error && (

            <ErrorMessage message={error} onRetry={fetchEvents} />

          )}



          {!isLoading && !error && filteredEvents.length === 0 && (

            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-gray-200 bg-gray-50">

              <p className="text-sm text-gray-500">

                {searchQuery || dateFilter !== 'all' || selectedCategory !== '전체'

                  ? '검색 조건에 맞는 행사가 없습니다.'

                  : '해당 카테고리의 행사가 없습니다.'}

              </p>

            </div>

          )}



          {!isLoading && !error && filteredEvents.length > 0 && (

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

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



      <footer className="border-t border-gray-200 bg-gray-50 py-8">

        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">

          <p className="text-sm font-semibold text-[#378ADD]">Gwangju NOW</p>

          <p className="mt-1 text-xs text-gray-400">

            © 2025 Gwangju NOW. 광주의 지금을 AI로 탐색하세요.

          </p>

        </div>

      </footer>

      <FloatingCourseBar />
    </div>

  )

}


