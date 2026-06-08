import type { AuthUser } from '../../types/auth'
import { useAuthStore } from '../../store/useAuthStore'

interface ProfileSectionProps {
  user: AuthUser
}

const PROVIDER_LABELS = {
  kakao: '카카오',
  google: 'Google',
} as const

const PROVIDER_BADGE_CLASS = {
  kakao: 'bg-[#FEE500]/30 text-gray-700',
  google: 'bg-blue-50 text-blue-700',
} as const

export default function ProfileSection({ user }: ProfileSectionProps) {
  const logout = useAuthStore((state) => state.logout)

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.nickname}
            className="h-20 w-20 rounded-full border-2 border-gray-100 object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl">
            👤
          </div>
        )}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-xl font-bold text-gray-900">{user.nickname}</h1>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${PROVIDER_BADGE_CLASS[user.provider]}`}
          >
            {PROVIDER_LABELS[user.provider]} 계정으로 로그인됨
          </span>
          <button
            type="button"
            onClick={logout}
            className="mt-4 block w-full rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto"
          >
            로그아웃
          </button>
        </div>
      </div>
    </section>
  )
}
