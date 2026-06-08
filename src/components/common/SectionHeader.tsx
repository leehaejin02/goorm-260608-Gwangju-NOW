interface SectionHeaderProps {
  title: string
  highlight?: string
  subtitle?: string
  href?: string
  linkLabel?: string
}

export default function SectionHeader({
  title,
  highlight,
  subtitle,
  href,
  linkLabel = '더보기',
}: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
          {highlight && (
            <span className="ml-1.5 bg-gradient-to-r from-brand to-accent bg-clip-text text-transparent">
              {highlight}
            </span>
          )}
        </h2>
        {subtitle && (
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">{subtitle}</p>
        )}
      </div>
      {href && (
        <a
          href={href}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          {linkLabel}
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      )}
    </div>
  )
}
