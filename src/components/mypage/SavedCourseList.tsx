import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCourseStore } from '../../store/useCourseStore'
import { formatCourseForShare, formatCourseTypeChips } from '../../lib/courseUtils'
import { useToastStore } from '../../store/useToastStore'
import CourseTimeline from '../course/CourseTimeline'
import CourseMap from '../course/CourseMap'

export default function SavedCourseList() {
  const navigate = useNavigate()
  const savedCourses = useCourseStore((s) => s.savedCourses)
  const deleteSavedCourse = useCourseStore((s) => s.deleteSavedCourse)
  const startEditingCourse = useCourseStore((s) => s.startEditingCourse)
  const duplicateSavedCourse = useCourseStore((s) => s.duplicateSavedCourse)
  const showToast = useToastStore((s) => s.showToast)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (savedCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16">
        <span className="text-4xl" aria-hidden>
          🗺️
        </span>
        <p className="mt-3 text-sm font-medium text-gray-500">저장된 코스가 없어요</p>
        <p className="mt-1 text-xs text-gray-400">홈에서 코스를 만든 뒤 저장해 보세요</p>
        <Link
          to="/#my-course"
          className="mt-4 rounded-lg bg-[#378ADD] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d6fc4]"
        >
          코스 만들러 가기
        </Link>
      </div>
    )
  }

  const handleShare = async (courseId: string) => {
    const course = savedCourses.find((c) => c.id === courseId)
    if (!course) return
    const text = formatCourseForShare(course)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(courseId)
      window.setTimeout(() => setCopiedId(null), 2000)
    } catch {
      window.prompt('아래 내용을 복사하세요', text)
    }
  }

  const handleEdit = (courseId: string) => {
    const course = startEditingCourse(courseId)
    if (!course) return
    showToast(`「${course.title}」 코스를 불러왔어요`)
    navigate({ pathname: '/', hash: 'my-course' })
  }

  const handleDuplicate = (courseId: string) => {
    const copy = duplicateSavedCourse(courseId)
    if (copy) {
      showToast(`「${copy.title}」 복사됐어요`)
      setExpandedId(copy.id)
    }
  }

  const handleDelete = (courseId: string, title: string) => {
    if (!window.confirm(`「${title}」 코스를 삭제할까요?`)) return
    deleteSavedCourse(courseId)
    if (expandedId === courseId) setExpandedId(null)
  }

  return (
    <div className="space-y-4">
      {savedCourses.map((course) => {
        const typeChips = formatCourseTypeChips(course.items)
        const isExpanded = expandedId === course.id

        return (
          <article
            key={course.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="p-4">
              <CourseMap items={course.items} compact />

              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : course.id)}
                className="mt-3 flex w-full items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-gray-900">{course.title}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {course.items.length}곳
                    {typeChips ? ` · ${typeChips}` : ''} ·{' '}
                    {new Date(course.updatedAt).toLocaleDateString('ko-KR')} 수정
                  </p>
                </div>
                <span className="shrink-0 text-gray-400">{isExpanded ? '▲' : '▼'}</span>
              </button>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(course.id)}
                  className="rounded-lg bg-[#378ADD] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2d6fc4]"
                >
                  이 코스로 출발
                </button>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : course.id)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {isExpanded ? '접기' : '상세 보기'}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-100 p-4">
                <CourseTimeline items={course.items} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(course.id)}
                    className="rounded-lg bg-[#378ADD] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#2d6fc4]"
                  >
                    편집하기
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(course.id)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {copiedId === course.id ? '✓ 복사됨' : '공유하기'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(course.id)}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    복제
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(course.id, course.title)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}
