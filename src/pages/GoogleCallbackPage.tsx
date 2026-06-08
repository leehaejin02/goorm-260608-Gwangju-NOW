import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getTokenFromCode, getUserInfo } from '../lib/googleAuth'
import { useAuthStore } from '../store/useAuthStore'
import LoadingSpinner from '../components/common/LoadingSpinner'

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const oauthError = searchParams.get('error')

    if (oauthError) {
      setError('Google 로그인이 취소되었습니다.')
      return
    }

    if (!code) {
      setError('인가 코드가 없습니다.')
      return
    }

    async function processLogin() {
      try {
        const token = await getTokenFromCode(code!)
        const user = await getUserInfo(token)
        login(token, user)
        navigate('/', { replace: true })
      } catch (err) {
        setError(err instanceof Error ? err.message : '로그인에 실패했습니다.')
      }
    }

    processLogin()
  }, [searchParams, login, navigate])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg bg-[#378ADD] px-4 py-2 text-sm font-semibold text-white"
        >
          홈으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <LoadingSpinner />
      <p className="text-sm text-gray-500">로그인 중...</p>
    </div>
  )
}
