import type { CourseItem } from './course'

export type AgentActionType =
  | 'add_to_course'
  | 'remove_from_course'
  | 'set_time_slot'
  | 'clear_course'

export interface AgentActionAddToCourse {
  type: 'add_to_course'
  item: CourseItem
  label: string
}

export interface AgentActionRemoveFromCourse {
  type: 'remove_from_course'
  itemId: string
  label: string
}

export interface AgentActionSetTimeSlot {
  type: 'set_time_slot'
  itemId: string
  timeSlot: string
  label: string
}

export interface AgentActionClearCourse {
  type: 'clear_course'
  label: string
}

export type AgentAction =
  | AgentActionAddToCourse
  | AgentActionRemoveFromCourse
  | AgentActionSetTimeSlot
  | AgentActionClearCourse

export interface AgentResponse {
  reply: string
  actions: AgentAction[]
}
