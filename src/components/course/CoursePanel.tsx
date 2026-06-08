import { useEffect, useState } from 'react'
import { useCourseStore } from '../../store/useCourseStore'
import { generateCourseTitle } from '../../lib/courseUtils'
import { useToastStore } from '../../store/useToastStore'
import CourseTimeline from './CourseTimeline'
import CourseMap from './CourseMap'

export default function CoursePanel() {
  const currentItems = useCourseStore((s) => s.currentItems)
  const editingCourseId = useCourseStore((s) => s.editingCourseId)
  const savedCourses = useCourseStore((s) => s.savedCourses)
  const removeItem = useCourseStore((s) => s.removeItem)
  const reorderItems = useCourseStore((s) => s.reorderItems)
  const updateItemTime = useCourseStore((s) => s.updateItemTime)
  const clearCurrent = useCourseStore((s) => s.clearCurrent)
  const startNewCourse = useCourseStore((s) => s.startNewCourse)
  const saveCurrentCourse = useCourseStore((s) => s.saveCurrentCourse)
  const saveAsNewCourse = useCourseStore((s) => s.saveAsNewCourse)
  const showToast = useToastStore((s) => s.showToast)

  const editingCourse = editingCourseId
    ? savedCourses.find((c) => c.id === editingCourseId)
    : null

  const [title, setTitle] = useState('')

  useEffect(() => {
    if (editingCourse) {
      setTitle(editingCourse.title)
    } else {
      setTitle('')
    }
  }, [editingCourse?.id, editingCourse?.title])

  const handleSaveUpdate = () => {
    const result = saveCurrentCourse(title || generateCourseTitle(currentItems))
    if (!result) return

    showToast(`「${result.course.title}」 코스가 업데이트됐어요`, {
      link: { label: '마이페이지에서 보기', href: '/mypage?tab=courses' },
    })
  }

  const handleSaveNew = () => {
    const resolvedTitle =
      editingCourse && title === editingCourse.title
        ? `${title} (새 코스)`
        : title || generateCourseTitle(currentItems)

    const result = saveAsNewCourse(resolvedTitle)
    if (!result) return

    showToast(`「${result.course.title}」 새 코스로 저장됐어요`, {
      link: { label: '마이페이지에서 보기', href: '/mypage?tab=courses' },
    })
    setTitle('')
  }

  const handleSave = () => {
    if (editingCourse) {
      handleSaveUpdate()
      return
    }

    const result = saveCurrentCourse(title || generateCourseTitle(currentItems))
    if (!result) return

    showToast(`「${result.course.title}」 저장됐어요`, {
      link: { label: '마이페이지에서 보기', href: '/mypage?tab=courses' },
    })
    setTitle('')
  }

  const handleStartNewCourse = () => {
    if (currentItems.length === 0) {
      startNewCourse()
      return
    }

    const message = editingCourse
      ? '편집을 멈추고 새 코스를 시작할까요? 저장하지 않은 변경은 사라집니다.'
      : '새 코스를 시작할까요? 현재 작업 중인 내용은 사라집니다.'

    if (window.confirm(message)) {
      startNewCourse()
      setTitle('')
    }
  }

  const handleClear = () => {
    if (currentItems.length === 0) return
    const confirmed = window.confirm(
      editingCourse
        ? '편집 중인 코스를 비울까요? 저장하지 않은 변경은 사라집니다.'
        : '작업 중인 코스를 비울까요?',
    )
    if (confirmed) {
      clearCurrent()
      setTitle('')
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white shadow-sm">
      {editingCourse && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 sm:px-5">
          <p className="text-xs leading-relaxed text-amber-900">
            <span className="font-semibold">「{editingCourse.title}」</span> 편집 중
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleStartNewCourse}
              className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
            >
              + 새 코스 시작
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gray-900">나만의 코스</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              {currentItems.length > 0
                ? `${currentItems.length}곳 · 에이전트가 수정하면 실시간 반영`
                : editingCourse
                  ? '장소를 추가하거나 순서를 바꾼 뒤 저장하세요'
                  : '에이전트에게 맡기거나 직접 담아보세요'}
            </p>
          </div>
          {!editingCourse && (currentItems.length > 0 || savedCourses.length > 0) && (
            <button
              type="button"
              onClick={handleStartNewCourse}
              className="shrink-0 text-xs font-medium text-[#378ADD] hover:underline"
            >
              + 새 코스
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        {currentItems.length > 0 && (
          <div className="mb-4">
            <CourseMap items={currentItems} />
          </div>
        )}

        <div className={currentItems.length > 3 ? 'max-h-[320px] overflow-y-auto pr-1' : ''}>
          <CourseTimeline
            items={currentItems}
            onRemove={removeItem}
            onReorder={reorderItems}
            onTimeChange={updateItemTime}
            editable
          />
        </div>

        {currentItems.length > 0 && (
          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`코스 이름 (예: ${generateCourseTitle(currentItems)})`}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#378ADD] focus:outline-none focus:ring-2 focus:ring-[#378ADD]/20"
            />
            <div className="flex flex-wrap gap-2">
              {editingCourse ? (
                <>
                  <button
                    type="button"
                    onClick={handleSaveUpdate}
                    className="rounded-lg bg-[#378ADD] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d6fc4]"
                  >
                    💾 변경사항 저장
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNew}
                    className="rounded-lg border border-[#378ADD] px-3 py-1.5 text-xs font-semibold text-[#378ADD] hover:bg-blue-50"
                  >
                    📋 새 코스로 저장
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-[#378ADD] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2d6fc4]"
                >
                  💾 저장
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50"
              >
                비우기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
