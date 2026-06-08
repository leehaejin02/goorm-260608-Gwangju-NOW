interface ErrorMessageProps {
  message: string
  onRetry: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="text-sm font-medium text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-lg bg-[#378ADD] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2d6fc4]"
      >
        다시 시도
      </button>
    </div>
  )
}
