import { redirectToKakaoLogin } from '../../lib/kakaoAuth'

export default function KakaoLoginButton() {
  const handleClick = () => {
    try {
      redirectToKakaoLogin()
    } catch (error) {
      alert(error instanceof Error ? error.message : '로그인을 시작할 수 없습니다.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-[#191919] transition-opacity hover:opacity-90"
      style={{ backgroundColor: '#FEE500' }}
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 3C6.48 3 2 6.58 2 11c0 2.84 1.52 5.35 3.82 6.84L5 21l3.45-2.07C9.57 19.32 10.76 19.5 12 19.5c5.52 0 10-3.58 10-8.5S17.52 3 12 3z" />
      </svg>
      카카오로 시작하기
    </button>
  )
}
