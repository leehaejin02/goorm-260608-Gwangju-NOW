import { Link } from 'react-router-dom'

const SERVICE_LINKS = [
  { label: '행사/축제', to: '/#events' },
  { label: '명소', to: '/#spots' },
  { label: '맛집/카페', to: '/#restaurants' },
  { label: '지도', to: '/#map' },
  { label: 'AI 플래너', to: '/#ai-chat' },
]

const INFO_LINKS = ['서비스 소개', '개인정보처리방침', '이용약관']

export default function Footer() {
  return (
    <footer className="mt-0 bg-gj-dark py-10 text-white">
      <div className="gj-container">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div>
            <div className="mb-3 flex flex-col leading-none">
              <span className="text-[9px] tracking-[0.14em] text-white/40">GWANGJU</span>
              <span className="gj-grad-text text-[22px] font-bold">NOW</span>
            </div>
            <p className="text-[12px] leading-relaxed text-white/40">
              광주의 지금을 발견하다
              <br />
              행사 · 명소 · 맛집 · AI 코스 추천
            </p>
          </div>
          <div className="flex gap-12">
            <div>
              <p className="mb-3 text-[12px] font-semibold text-white/70">서비스</p>
              {SERVICE_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="mb-2 block text-[12px] text-white/40 hover:text-white/70"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div>
              <p className="mb-3 text-[12px] font-semibold text-white/70">정보</p>
              {INFO_LINKS.map((item) => (
                <p
                  key={item}
                  className="mb-2 cursor-pointer text-[12px] text-white/40 hover:text-white/70"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-[11px] text-white/30">
          © 2025 Gwangju NOW. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
