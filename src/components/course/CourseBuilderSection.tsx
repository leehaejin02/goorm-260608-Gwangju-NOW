import { useEffect, useState } from 'react'
import { useCourseStore } from '../../store/useCourseStore'
import { generateCourseTitle } from '../../lib/courseUtils'
import { useToastStore } from '../../store/useToastStore'
import CourseTimeline from './CourseTimeline'
import CourseMap from './CourseMap'

export default function CourseBuilderSection() {
  const currentItems = useCourseStore((s) => s.currentItems)
  const editingCourseId = useCourseStore((s) => s.editingCourseId)
  const savedCourses = useCourseStore((s) => s.savedCourses)
  const removeItem = useCourseStore((s) => s.removeItem)
  const reorderItems = useCourseStore((s) => s.reorderItems)
  const updateItemTime = useCourseStore((s) => s.updateItemTime)
  const clearCurrent = useCourseStore((s) => s.clearCurrent)
  const finishEditing = useCourseStore((s) => s.finishEditing)
  const saveCurrentCourse = useCourseStore((s) => s.saveCurrentCourse)
  const showToast = useToastStore((s) => s.showToast)

  const editingCourse = editingCourseId
    ? savedCourses.find((c) => c.id === editingCourseId)
    : null

  const [title, setTitle] = useState('')

  useEffect(() => {
    if (editingCourse) setTitle(editingCourse.title)
    else setTitle('')
  }, [editingCourse?.id, editingCourse?.title])

  const handleSave = () => {
    const result = saveCurrentCourse(title || generateCourseTitle(currentItems))
    if (!result) return

    const { course, isUpdate } = result
    showToast(
      isUpdate ? `「${course.title}」 코스가 업데이트됐어요` : `「${course.title}」 저장됐어요`,
      { link: { label: '마이페이지에서 보기', href: '/mypage?tab=courses' } },
    )
    if (!isUpdate) setTitle('')
  }

  return (
    <section id="my-course" className="bg-gradient-to-b from-blue-50/50 to-white py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">나만의 코스</h2>
          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            행사 · 명소 · 맛집 · 주차를 순서대로 담고, 시간과 동선을 짜보세요
          </p>
        </div>

        {editingCourse && (
          <div className="mb-4 flex items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">「{editingCourse.title}」</span> 편집 중
            </p>
            <button
              type="button"
              onClick={() => {
                finishEditing()
                setTitle('')
              }}
              className="text-sm font-medium text-amber-700 hover:text-amber-900"
            >
              편집 종료
            </button>
          </div>
        )}

        <div className="space-y-6">
          {currentItems.length > 0 && (
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">코스 동선</h3>
              <CourseMap items={currentItems} />
            </div>
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <CourseTimeline
              items={currentItems}
              onRemove={removeItem}
              onReorder={reorderItems}
              onTimeChange={updateItemTime}
              editable
            />

            {currentItems.length > 0 && (
              <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`코스 이름 (예: ${generateCourseTitle(currentItems)})`}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#378ADD] focus:outline-none focus:ring-2 focus:ring-[#378ADD]/20"
                />

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-lg bg-[#378ADD] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2d6fc4]"
                  >
                    {editingCourse ? '💾 변경사항 저장' : '💾 코스 저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('작업 중인 코스를 비울까요?')) clearCurrent()
                    }}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    비우기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
