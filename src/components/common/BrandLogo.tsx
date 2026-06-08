interface BrandLogoProps {
  className?: string
  heightClass?: string
}

export default function BrandLogo({ className = '', heightClass = 'h-10 sm:h-11' }: BrandLogoProps) {
  return (
    <img
      src="/images/logo.png"
      alt="Gwangju NOW — 광주의 지금을 발견하다"
      className={`w-auto object-contain ${heightClass} ${className}`}
    />
  )
}
