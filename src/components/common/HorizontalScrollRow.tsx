import type { ReactNode } from 'react'

interface HorizontalScrollRowProps {
  children: ReactNode
  className?: string
}

export default function HorizontalScrollRow({ children, className = '' }: HorizontalScrollRowProps) {
  return (
    <div
      className={`flex gap-3 overflow-x-auto scroll-smooth pb-2 pl-0.5 pr-6 scrollbar-hide ${className}`}
    >
      {children}
      <div className="w-2 shrink-0" aria-hidden />
    </div>
  )
}

export const carouselItemClass = 'w-[140px] shrink-0 snap-start'
