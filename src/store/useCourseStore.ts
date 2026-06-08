import { create } from 'zustand'
import type { CourseItem, SavedCourse } from '../types/course'
import { generateCourseTitle } from '../lib/courseUtils'

const CURRENT_KEY = 'gwangju_now_course_current'
const SAVED_KEY = 'gwangju_now_courses_saved'
const EDITING_KEY = 'gwangju_now_course_editing'

export interface SaveCourseResult {
  course: SavedCourse
  isUpdate: boolean
}

interface CourseStore {
  currentItems: CourseItem[]
  savedCourses: SavedCourse[]
  editingCourseId: string | null
  addItem: (item: CourseItem) => boolean
  removeItem: (itemId: string) => void
  reorderItems: (fromIndex: number, toIndex: number) => void
  updateItemTime: (itemId: string, timeSlot: string) => void
  setCurrentItems: (items: CourseItem[]) => void
  clearCurrent: () => void
  finishEditing: () => void
  startNewCourse: () => void
  isInCourse: (itemId: string) => boolean
  saveCurrentCourse: (title?: string) => SaveCourseResult | null
  saveAsNewCourse: (title?: string) => SaveCourseResult | null
  deleteSavedCourse: (courseId: string) => void
  duplicateSavedCourse: (courseId: string) => SavedCourse | null
  startEditingCourse: (courseId: string) => SavedCourse | null
  getEditingCourse: () => SavedCourse | null
  loadFromStorage: () => void
}

function saveCurrent(items: CourseItem[]) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(items))
}

function saveSaved(courses: SavedCourse[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(courses))
}

function saveEditingId(id: string | null) {
  if (id) localStorage.setItem(EDITING_KEY, id)
  else localStorage.removeItem(EDITING_KEY)
}

export const useCourseStore = create<CourseStore>((set, get) => ({
  currentItems: [],
  savedCourses: [],
  editingCourseId: null,

  addItem: (item) => {
    const { currentItems } = get()
    if (currentItems.some((i) => i.id === item.id)) return false
    const next = [...currentItems, item]
    saveCurrent(next)
    set({ currentItems: next })
    return true
  },

  removeItem: (itemId) => {
    const next = get().currentItems.filter((i) => i.id !== itemId)
    saveCurrent(next)
    set({ currentItems: next })
  },

  reorderItems: (fromIndex, toIndex) => {
    const items = [...get().currentItems]
    if (
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= items.length ||
      toIndex >= items.length ||
      fromIndex === toIndex
    ) {
      return
    }

    const [moved] = items.splice(fromIndex, 1)
    items.splice(toIndex, 0, moved)
    saveCurrent(items)
    set({ currentItems: items })
  },

  updateItemTime: (itemId, timeSlot) => {
    const next = get().currentItems.map((item) =>
      item.id === itemId ? { ...item, timeSlot: timeSlot || undefined } : item,
    )
    saveCurrent(next)
    set({ currentItems: next })
  },

  setCurrentItems: (items) => {
    saveCurrent(items)
    set({ currentItems: items })
  },

  clearCurrent: () => {
    saveCurrent([])
    saveEditingId(null)
    set({ currentItems: [], editingCourseId: null })
  },

  finishEditing: () => {
    saveEditingId(null)
    set({ editingCourseId: null })
  },

  startNewCourse: () => {
    saveCurrent([])
    saveEditingId(null)
    set({ currentItems: [], editingCourseId: null })
  },

  isInCourse: (itemId) => get().currentItems.some((i) => i.id === itemId),

  saveAsNewCourse: (title) => {
    const { currentItems, savedCourses } = get()
    if (currentItems.length === 0) return null

    const now = new Date().toISOString()
    const course: SavedCourse = {
      id: `course-${Date.now()}`,
      title: title?.trim() || generateCourseTitle(currentItems),
      items: [...currentItems],
      createdAt: now,
      updatedAt: now,
    }

    const next = [course, ...savedCourses]
    saveSaved(next)
    saveCurrent([])
    saveEditingId(null)
    set({ savedCourses: next, currentItems: [], editingCourseId: null })
    return { course, isUpdate: false }
  },

  saveCurrentCourse: (title) => {
    const { currentItems, savedCourses, editingCourseId } = get()
    if (currentItems.length === 0) return null

    const now = new Date().toISOString()
    const resolvedTitle = title?.trim() || generateCourseTitle(currentItems)

    if (editingCourseId) {
      const existing = savedCourses.find((c) => c.id === editingCourseId)
      if (!existing) {
        saveEditingId(null)
        set({ editingCourseId: null })
        return null
      }

      const updated: SavedCourse = {
        ...existing,
        title: resolvedTitle,
        items: [...currentItems],
        updatedAt: now,
      }

      const next = savedCourses.map((c) => (c.id === editingCourseId ? updated : c))
      saveSaved(next)
      set({ savedCourses: next })
      return { course: updated, isUpdate: true }
    }

    const course: SavedCourse = {
      id: `course-${Date.now()}`,
      title: resolvedTitle,
      items: [...currentItems],
      createdAt: now,
      updatedAt: now,
    }

    const next = [course, ...savedCourses]
    saveSaved(next)
    saveCurrent([])
    set({ savedCourses: next, currentItems: [], editingCourseId: null })
    return { course, isUpdate: false }
  },

  deleteSavedCourse: (courseId) => {
    const { editingCourseId } = get()
    const next = get().savedCourses.filter((c) => c.id !== courseId)
    saveSaved(next)
    if (editingCourseId === courseId) {
      saveEditingId(null)
      set({ savedCourses: next, editingCourseId: null })
    } else {
      set({ savedCourses: next })
    }
  },

  duplicateSavedCourse: (courseId) => {
    const course = get().savedCourses.find((c) => c.id === courseId)
    if (!course) return null

    const now = new Date().toISOString()
    const copy: SavedCourse = {
      id: `course-${Date.now()}`,
      title: `${course.title} (복사)`,
      items: [...course.items],
      createdAt: now,
      updatedAt: now,
    }

    const next = [copy, ...get().savedCourses]
    saveSaved(next)
    set({ savedCourses: next })
    return copy
  },

  startEditingCourse: (courseId) => {
    const course = get().savedCourses.find((c) => c.id === courseId)
    if (!course) return null

    saveCurrent(course.items)
    saveEditingId(courseId)
    set({ currentItems: course.items, editingCourseId: courseId })
    return course
  },

  getEditingCourse: () => {
    const { editingCourseId, savedCourses } = get()
    if (!editingCourseId) return null
    return savedCourses.find((c) => c.id === editingCourseId) ?? null
  },

  loadFromStorage: () => {
    let currentItems: CourseItem[] = []
    let savedCourses: SavedCourse[] = []
    let editingCourseId: string | null = null

    try {
      const currentRaw = localStorage.getItem(CURRENT_KEY)
      if (currentRaw) currentItems = JSON.parse(currentRaw) as CourseItem[]
    } catch {
      localStorage.removeItem(CURRENT_KEY)
    }

    try {
      const savedRaw = localStorage.getItem(SAVED_KEY)
      if (savedRaw) savedCourses = JSON.parse(savedRaw) as SavedCourse[]
    } catch {
      localStorage.removeItem(SAVED_KEY)
    }

    try {
      const editingRaw = localStorage.getItem(EDITING_KEY)
      if (editingRaw) {
        editingCourseId = editingRaw
        if (!savedCourses.some((c) => c.id === editingCourseId)) {
          editingCourseId = null
          localStorage.removeItem(EDITING_KEY)
        }
      }
    } catch {
      localStorage.removeItem(EDITING_KEY)
    }

    set({ currentItems, savedCourses, editingCourseId })
  },
}))
