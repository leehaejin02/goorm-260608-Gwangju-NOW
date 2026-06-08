import { useEffect, useRef, useState } from 'react'

type ButtonStatus = 'idle' | 'loading' | 'error'

interface MyLocationButtonProps {
  onLocate: (lat: number, lng: number) => void
}

const ERROR_MESSAGES: Record<number, string> = {
  1: '위치 권한을 허용해주세요',
  2: '위치를 확인할 수 없어요',
  3: '위치 요청이 시간 초과됐어요',
}

export default function MyLocationButton({ onLocate }: MyLocationButtonProps) {
  const [status, setStatus] = useState<ButtonStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  const resetToIdle = () => {
    setStatus('idle')
    setErrorMessage('')
  }

  const handleClick = () => {
    if (status === 'loading') return

    if (!navigator.geolocation) {
      setErrorMessage('이 브라우저는 위치 서비스를 지원하지 않아요')
      setStatus('error')
      timerRef.current = window.setTimeout(resetToIdle, 3000)
      return
    }

    setStatus('loading')
    setErrorMessage('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocate(position.coords.latitude, position.coords.longitude)
        resetToIdle()
      },
      (error) => {
        setErrorMessage(ERROR_MESSAGES[error.code] ?? '위치를 가져오지 못했어요')
        setStatus('error')
        timerRef.current = window.setTimeout(resetToIdle, 3000)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return (
    <div className="relative">
      {status === 'error' && errorMessage && (
        <div className="absolute bottom-full right-0 mb-2 w-max max-w-[200px] rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
          {errorMessage}
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={status === 'loading'}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-md transition-colors hover:bg-gray-50 disabled:cursor-wait"
        aria-label="내 위치로 이동"
      >
        {status === 'loading' ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#378ADD]" />
        ) : (
          <svg className="h-4 w-4 text-[#378ADD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
        내 위치
      </button>
    </div>
  )
}
