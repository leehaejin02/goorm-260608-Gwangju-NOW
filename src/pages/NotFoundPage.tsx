import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { usePageMeta } from '../hooks/usePageMeta'

export default function NotFoundPage() {
  usePageMeta({ title: '페이지를 찾을 수 없음' })

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto flex max-w-lg flex-col items-center px-4 pt-32 text-center">
        <p className="text-6xl font-bold text-[#378ADD]">404</p>
        <h1 className="mt-4 text-xl font-bold text-gray-900">페이지를 찾을 수 없습니다</h1>
        <p className="mt-2 text-sm text-gray-500">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <Link
          to="/"
          className="mt-8 rounded-lg bg-[#378ADD] px-6 py-3 text-sm font-semibold text-white hover:bg-[#2d6fc4]"
        >
          홈으로 돌아가기
        </Link>
      </main>
    </div>
  )
}
