interface YoutubeCardProps {
  title: string
  channelName: string
  thumbnailUrl: string
  videoUrl: string
  className?: string
}

export default function YoutubeCard({
  title,
  channelName,
  thumbnailUrl,
  videoUrl,
  className = '',
}: YoutubeCardProps) {
  const handleClick = () => {
    window.open(videoUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      className={`group cursor-pointer overflow-hidden rounded-2xl border border-gj-border bg-white transition-all hover:shadow-md ${className}`}
    >
      <div className="relative h-[120px] overflow-hidden bg-gray-900">
        <img
          src={thumbnailUrl}
          alt={title}
          className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 transition-transform group-hover:scale-110">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#6C5CE7" className="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-[12px] font-medium leading-snug text-gj-dark">
          {title}
        </p>
        <p className="mt-1 text-[10px] text-gray-400">{channelName}</p>
      </div>
    </article>
  )
}
