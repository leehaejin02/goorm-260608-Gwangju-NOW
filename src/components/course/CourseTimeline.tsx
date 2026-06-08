import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CourseItem } from '../../types/course'
import { COURSE_TYPE_COLORS, COURSE_TYPE_LABELS } from '../../types/course'

const TIME_PRESETS = ['09:00', '11:30', '14:00', '17:00', '19:00']

interface CourseTimelineProps {
  items: CourseItem[]
  onRemove?: (itemId: string) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
  onTimeChange?: (itemId: string, timeSlot: string) => void
  editable?: boolean
}

export default function CourseTimeline({
  items,
  onRemove,
  onReorder,
  onTimeChange,
  editable = false,
}: CourseTimelineProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center">
        <p className="text-sm text-gray-500">코스가 비어 있습니다.</p>
        <p className="mt-1 text-xs text-gray-400">
          행사·명소·맛집·주차장에서 「코스에 담기」를 눌러 추가하세요.
        </p>
      </div>
    )
  }

  const handleDrop = (targetIndex: number) => {
    if (dragIndex != null && onReorder) {
      onReorder(dragIndex, targetIndex)
    }
    setDragIndex(null)
    setDropIndex(null)
  }

  return (
    <ol className="relative space-y-0">
      {items.map((item, index) => {
        const isDragging = dragIndex === index
        const isDropTarget = dropIndex === index && dragIndex !== index

        return (
          <li
            key={item.id}
            className={`relative flex gap-4 pb-6 last:pb-0 ${isDragging ? 'opacity-50' : ''} ${isDropTarget ? 'ring-2 ring-[#378ADD]/30 ring-offset-2 rounded-xl' : ''}`}
            draggable={editable && Boolean(onReorder)}
            onDragStart={() => editable && setDragIndex(index)}
            onDragEnd={() => {
              setDragIndex(null)
              setDropIndex(null)
            }}
            onDragOver={(e) => {
              if (!editable || !onReorder) return
              e.preventDefault()
              setDropIndex(index)
            }}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(index)
            }}
          >
            {index < items.length - 1 && (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-8px)] w-0.5 bg-gray-200"
                aria-hidden
              />
            )}

            <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#378ADD] text-xs font-bold text-white">
              {index + 1}
            </span>

            <div
              className={`min-w-0 flex-1 rounded-xl border p-4 ${COURSE_TYPE_COLORS[item.type]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {editable && onReorder && (
                    <span
                      className="mb-1 inline-block cursor-grab text-xs text-gray-400 active:cursor-grabbing"
                      title="드래그하여 순서 변경"
                    >
                      ⠿ 순서 변경
                    </span>
                  )}
                  <span className="text-xs font-medium text-gray-500">
                    {COURSE_TYPE_LABELS[item.type]}
                  </span>
                  {item.link?.startsWith('/') ? (
                    <Link
                      to={item.link}
                      className="mt-0.5 block font-semibold text-gray-900 hover:text-[#378ADD] hover:underline"
                    >
                      {item.title}
                    </Link>
                  ) : item.link?.startsWith('http') ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 block font-semibold text-gray-900 hover:text-[#378ADD] hover:underline"
                    >
                      {item.title}
                    </a>
                  ) : (
                    <p className="mt-0.5 font-semibold text-gray-900">{item.title}</p>
                  )}
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.subtitle}</p>

                  {editable && onTimeChange && (
                    <div className="mt-3 space-y-2">
                      <label className="flex items-center gap-2 text-xs text-gray-500">
                        <span>⏰ 시간</span>
                        <input
                          type="time"
                          value={item.timeSlot ?? ''}
                          onChange={(e) => onTimeChange(item.id, e.target.value)}
                          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                        />
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {TIME_PRESETS.map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => onTimeChange(item.id, time)}
                            className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                              item.timeSlot === time
                                ? 'bg-[#378ADD] text-white'
                                : 'bg-white/80 text-gray-600 hover:bg-white'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {!editable && item.timeSlot && (
                    <p className="mt-2 text-xs font-medium text-[#378ADD]">⏰ {item.timeSlot}</p>
                  )}
                </div>

                {editable && onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-white hover:text-red-500"
                    aria-label={`${item.title} 제거`}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
