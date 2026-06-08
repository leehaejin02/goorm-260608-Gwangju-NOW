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
    <section id="videos" className="gj-section">
      <div className="gj-container">
        <div className="gj-section-head">
          <h2 className="gj-section-title flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000" aria-hidden>
              <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
            </svg>
            광주 트렌드 영상
          </h2>
          <a
            href={getYoutubeSearchUrl(category)}
            target="_blank"
            rel="noopener noreferrer"
            className="gj-section-more"
          >
            더보기 ›
          </a>
        </div>

        {isLoading && <LoadingSpinner />}

        {!isLoading && error && isQuotaExceeded && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-amber-900">{error}</p>
            <a
              href={getYoutubeSearchUrl(category)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-gj-blue px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              YouTube에서 직접 검색하기
            </a>
          </div>
        )}

        {!isLoading && error && !isQuotaExceeded && (
          <ErrorMessage message={error} onRetry={loadVideos} />
        )}

        {!isLoading && !error && videos.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
