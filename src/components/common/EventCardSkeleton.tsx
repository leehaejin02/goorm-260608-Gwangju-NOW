interface EventCardSkeletonProps {
  className?: string
}

export default function EventCardSkeleton({ className = '' }: EventCardSkeletonProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-gj-border bg-white ${className}`}>
      <div className="h-[160px] animate-pulse bg-gray-200" />
      <div className="space-y-2 p-4">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  )
}
