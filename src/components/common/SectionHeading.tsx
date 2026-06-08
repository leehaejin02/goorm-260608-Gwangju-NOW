import type { ReactNode } from 'react'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  action?: ReactNode
  badge?: string
}

export default function SectionHeading({ title, subtitle, action, badge }: SectionHeadingProps) {
  return (
    <div className="mb-3 flex items-end justify-between gap-2">
      <div>
        {badge && (
          <span className="mb-1 inline-block text-[10px] font-semibold text-gj-purple">{badge}</span>
        )}
        <h2 className="text-sm font-semibold text-gj-dark">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[10px] text-gj-sub">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
