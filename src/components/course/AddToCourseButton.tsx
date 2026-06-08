import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import type { CourseItem } from '../../types/course'
import { useCourseStore } from '../../store/useCourseStore'
import { useToastStore } from '../../store/useToastStore'
import { goToCoursePanel } from '../../lib/scrollToSection'

interface AddToCourseButtonProps {
  item: CourseItem
  size?: 'sm' | 'md'
  className?: string
}

interface MenuPosition {
  top: number
  left: number
  minWidth: number
}

export default function AddToCourseButton({
  item,
  size = 'md',
  className = '',
}: AddToCourseButtonProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const addItem = useCourseStore((s) => s.addItem)
  const startEditingCourse = useCourseStore((s) => s.startEditingCourse)
  const startNewCourse = useCourseStore((s) => s.startNewCourse)
  const savedCourses = useCourseStore((s) => s.savedCourses)
  const editingCourseId = useCourseStore((s) => s.editingCourseId)
  const isInCourse = useCourseStore((s) => s.isInCourse(item.id))
  const showToast = useToastStore((s) => s.showToast)

  const [feedback, setFeedback] = useState<'added' | 'duplicate' | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const hasSavedCourses = savedCourses.length > 0
  const showCourseMenu = hasSavedCourses || editingCourseId != null

  const updateMenuPosition = () => {
    if (!menuRef.current) return
    const rect = menuRef.current.getBoundingClientRect()
    const minWidth = Math.max(220, rect.width)
    const left = Math.min(rect.right - minWidth, window.innerWidth - minWidth - 8)
    setMenuPos({
      top: rect.bottom + 6,
      left: Math.max(8, left),
      minWidth,
    })
  }

  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuPos(null)
      return
    }
    updateMenuPosition()
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement
        if (!target.closest('[data-saved-course-menu]')) {
          setMenuOpen(false)
        }
      }
    }

    const handleReposition = () => updateMenuPosition()

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('resize', handleReposition)
    window.addEventListener('scroll', handleReposition, true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('resize', handleReposition)
      window.removeEventListener('scroll', handleReposition, true)
    }
  }, [menuOpen])

  const addToDraft = () => {
    if (isInCourse) {
      setFeedback('duplicate')
      window.setTimeout(() => setFeedback(null), 1500)
      return false
    }

    const ok = addItem(item)
    if (ok) {
      setFeedback('added')
      window.setTimeout(() => setFeedback(null), 1500)
    }
    return ok
  }

  const addToNewCourse = () => {
    startNewCourse()

    const ok = addItem(item)
    setMenuOpen(false)

    if (ok) {
      setFeedback('added')
      window.setTimeout(() => setFeedback(null), 1500)
      showToast('새 코스에 담았어요', {
        link: { label: '코스 확인', href: '/#my-course' },
      })
      goToCoursePanel(navigate, location)
    }
  }

  const addToSavedCourse = (courseId: string) => {
    const course = savedCourses.find((c) => c.id === courseId)
    if (!course) return

    if (editingCourseId !== courseId) {
      startEditingCourse(courseId)
    }

    if (useCourseStore.getState().isInCourse(item.id)) {
      setFeedback('duplicate')
      window.setTimeout(() => setFeedback(null), 1500)
      setMenuOpen(false)
      return
    }

    const ok = addItem(item)
    setMenuOpen(false)

    if (ok) {
      showToast(`「${course.title}」 코스에 추가됐어요`, {
        link: { label: '코스 확인', href: '/#my-course' },
      })
      goToCoursePanel(navigate, location)
    }
  }

  const handlePrimaryClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToDraft()
  }

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setMenuOpen((open) => !open)
  }

  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'

  const label =
    feedback === 'added'
      ? '✓ 담김'
      : feedback === 'duplicate' || isInCourse
        ? '담음'
        : editingCourseId
          ? '+ 이 코스에 담기'
          : '+ 코스에 담기'

  const menuDropdown =
    menuOpen && menuPos
      ? createPortal(
          <div
            data-saved-course-menu
            className="fixed z-[200] overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-xl"
            style={{
              top: menuPos.top,
              left: menuPos.left,
              minWidth: menuPos.minWidth,
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                addToNewCourse()
              }}
              className="block w-full px-3 py-2.5 text-left text-sm font-medium text-[#378ADD] hover:bg-blue-50"
            >
              + 새 코스에 담기
            </button>
            {hasSavedCourses && (
              <>
                <p className="border-t border-gray-100 px-3 py-2 text-xs font-semibold text-gray-500">
                  저장된 코스에 추가
                </p>
                {savedCourses.slice(0, 5).map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      addToSavedCourse(course.id)
                    }}
                    className="block w-full truncate px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-[#378ADD]"
                  >
                    {course.title}
                    {editingCourseId === course.id && (
                      <span className="ml-1 text-xs text-amber-600">· 편집 중</span>
                    )}
                    <span className="ml-1 text-xs text-gray-400">({course.items.length}곳)</span>
                  </button>
                ))}
                {savedCourses.length > 5 && (
                  <p className="border-t border-gray-100 px-3 py-1.5 text-xs text-gray-400">
                    외 {savedCourses.length - 5}개 · 마이페이지에서 확인
                  </p>
                )}
              </>
            )}
          </div>,
          document.body,
        )
      : null

  if (!showCourseMenu) {
    return (
      <button
        type="button"
        onClick={handlePrimaryClick}
        disabled={isInCourse && !feedback}
        className={`inline-flex items-center gap-1 rounded-lg font-medium transition-colors ${sizeClass} ${
          isInCourse
            ? 'border border-gray-200 bg-gray-100 text-gray-500'
            : 'border border-[#378ADD]/40 bg-blue-50 text-[#378ADD] hover:bg-blue-100'
        } ${className}`}
      >
        {label}
      </button>
    )
  }

  return (
    <>
      <div ref={menuRef} className={`relative inline-flex ${className}`}>
        <button
          type="button"
          onClick={handlePrimaryClick}
          disabled={isInCourse && !feedback}
          className={`inline-flex items-center gap-1 rounded-l-lg font-medium transition-colors ${sizeClass} ${
            isInCourse
              ? 'border border-gray-200 bg-gray-100 text-gray-500'
              : 'border border-r-0 border-[#378ADD]/40 bg-blue-50 text-[#378ADD] hover:bg-blue-100'
          }`}
        >
          {label}
        </button>
        <button
          type="button"
          onClick={handleMenuToggle}
          aria-label="코스 선택"
          aria-expanded={menuOpen}
          title="새 코스 또는 저장된 코스에 담기"
          className={`inline-flex shrink-0 items-center gap-0.5 rounded-r-lg border border-[#378ADD]/40 bg-blue-50 font-medium text-[#378ADD] transition-colors hover:bg-blue-100 ${
            size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-2 py-1.5 text-xs'
          } ${menuOpen ? 'bg-blue-100' : ''}`}
        >
          <span className="text-[10px] sm:text-xs">선택</span>
          <span aria-hidden>{menuOpen ? '▴' : '▾'}</span>
        </button>
      </div>
      {menuDropdown}
    </>
  )
}
