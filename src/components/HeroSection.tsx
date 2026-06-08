import { Link } from 'react-router-dom'

interface HeroSectionProps {
  onSearch?: (query: string) => void
}

export default function HeroSection(_props: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F7F8FC] via-[#F5F6FA] to-[#EEF1F8] py-8 md:py-12">
      <div className="gj-container">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-10">
          {/* 좌측 텍스트 */}
          <div className="relative z-10 w-full shrink-0 md:max-w-[480px] md:flex-1">
            <h1 className="mb-4 text-[clamp(28px,4vw,44px)] font-bold leading-[1.25] tracking-tight text-gj-dark">
              오늘, 광주는
              <br />
              어디가 좋을까?
            </h1>
            <p className="mb-8 text-[clamp(14px,1.8vw,17px)] leading-relaxed text-gj-sub">
              광주 AI가 지금 딱 맞는 곳을 추천해드려요.
            </p>
            <Link
              to="/#ai-chat"
              className="inline-flex items-center gap-2 rounded-full bg-gj-dark px-6 py-3.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              AI 코스 추천받기
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* 우측 NOW 플래너 */}
          <div className="flex w-full flex-1 justify-center md:justify-end">
            <div className="gj-grad-bg flex w-full max-w-[320px] flex-col justify-between rounded-2xl p-5 shadow-lg shadow-violet-300/30 md:max-w-[280px]">
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  NOW 플래너
                </p>
                <p className="mb-1 text-[17px] font-bold leading-snug text-white sm:text-[18px]">
                  나만의 광주 코스
                  <br />
                  AI가 30초에 완성
                </p>
                <p className="text-[12px] text-white/60">대화로 코스를 설계하세요</p>
              </div>
              <Link
                to="/#ai-chat"
                className="mt-4 rounded-xl bg-white py-2.5 text-center text-[13px] font-semibold text-gj-purple transition-colors hover:bg-white/90"
              >
                시작하기 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
