import { Link } from 'react-router-dom'
import { useToastStore } from '../../store/useToastStore'

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const dismissToast = useToastStore((s) => s.dismissToast)

  if (toasts.length === 0) return null

  return (
    <div
      className="pointer-events-none fixed bottom-6 right-4 z-50 flex flex-col gap-2 sm:right-6"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg"
        >
          <span className="text-base" aria-hidden>
            ✓
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{toast.message}</p>
            {toast.link && (
              <Link
                to={toast.link.href}
                onClick={() => dismissToast(toast.id)}
                className="mt-1 inline-block text-xs font-medium text-[#378ADD] hover:underline"
              >
                {toast.link.label} →
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="닫기"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
