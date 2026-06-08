import { useAuthStore } from '../../store/useAuthStore'
import KakaoLoginButton from './KakaoLoginButton'
import GoogleLoginButton from './GoogleLoginButton'

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useAuthStore()

  if (!isLoginModalOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={closeLoginModal}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={closeLoginModal}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="닫기"
        >
          ✕
        </button>
        <h2 className="text-lg font-bold text-gray-900">로그인</h2>
        <p className="mt-2 text-sm text-gray-500">
          카카오 또는 Google 계정으로 로그인하고 찜 기능을 이용해 보세요.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <KakaoLoginButton />
          <GoogleLoginButton />
        </div>
      </div>
    </div>
  )
}
