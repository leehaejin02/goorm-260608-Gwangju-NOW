import type { AgentAction } from '../types/agent'
import { enrichCourseItem, type CourseItemLookup } from './courseUtils'
import { useCourseStore } from '../store/useCourseStore'

export function applyAgentActions(
  actions: AgentAction[],
  lookup?: CourseItemLookup,
): number {
  if (actions.length === 0) return 0

  const store = useCourseStore.getState()
  let applied = 0

  for (const action of actions) {
    switch (action.type) {
      case 'add_to_course': {
        const item = lookup ? enrichCourseItem(action.item, lookup) : action.item
        if (store.addItem(item)) applied += 1
        break
      }
      case 'remove_from_course':
        if (store.currentItems.some((i) => i.id === action.itemId)) {
          store.removeItem(action.itemId)
          applied += 1
        }
        break
      case 'set_time_slot':
        if (store.currentItems.some((i) => i.id === action.itemId)) {
          store.updateItemTime(action.itemId, action.timeSlot)
          applied += 1
        }
        break
      case 'clear_course':
        if (store.currentItems.length > 0) {
          store.clearCurrent()
          applied += 1
        }
        break
    }
  }

  return applied
}
