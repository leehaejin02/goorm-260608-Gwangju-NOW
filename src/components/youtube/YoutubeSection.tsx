import { useEffect, useState } from 'react'
import YoutubeCard from '../YoutubeCard'
import LoadingSpinner from '../common/LoadingSpinner'
import ErrorMessage from '../common/ErrorMessage'
import {
  fetchGwangjuYoutubeVideos,
  getYoutubeSearchUrl,
  YoutubeQuotaError,
} from '../../api/youtubeApi'
import type { YoutubeVideo } from '../../types/youtube'
import type { EventCategory } from '../../types/event'

interface YoutubeSectionProps {
  category?: EventCategory
  eventTitles?: string[]
}

export default function YoutubeSection({
  category = '축제',
  eventTitles = [],
}: YoutubeSectionProps) {
  const [videos, setVideos] = useState<YoutubeVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false)

  const loadVideos = () => {
    setIsLoading(true)
    setError(null)
    setIsQuotaExceeded(false)

    fetchGwangjuYoutubeVideos(category, eventTitles)
      .then(setVideos)
      .catch((err: unknown) => {
        if (err instanceof YoutubeQuotaError) {
          setIsQuotaExceeded(true)
          setError(
            'YouTube Data API 일일 검색 한도(10,000 units)를 초과했습니다. 검색 1회당 100 units가 사용되며, 내일(PST 기준 자정) 이후 다시 시도할 수 있습니다.',
          )
          return
        }
        setError(err instanceof Error ? err.message : '영상을 불러오지 못했습니다.')
      })
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadVideos()
  }, [category, eventTitles.join('|')])

  return (
    <section id="videos" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">광주 관련 영상</h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            광주의 문화와 행사를 영상으로 만나보세요
          </p>
        </div>

        {isLoading && <LoadingSpinner />}

        {!isLoading && error && isQuotaExceeded && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-amber-900">{error}</p>
            <p className="mt-2 text-xs text-amber-700">
              Google Cloud Console → API 및 서비스 → 할당량에서 YouTube Data API v3 사용량을
              확인하세요.
            </p>
            <a
              href={getYoutubeSearchUrl(category)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-[#378ADD] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2d6fc4]"
            >
              YouTube에서 직접 검색하기
            </a>
          </div>
        )}

        {!isLoading && error && !isQuotaExceeded && (
          <ErrorMessage message={error} onRetry={loadVideos} />
        )}

        {!isLoading && !error && videos.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {videos.map((video) => (
              <YoutubeCard
                key={video.videoId}
                title={video.title}
                channelName={video.channelTitle}
                thumbnailUrl={video.thumbnailUrl}
                videoUrl={video.videoUrl}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
