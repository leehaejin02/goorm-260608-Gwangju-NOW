export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#378ADD] via-[#2d6fc4] to-[#1a4d8f] pt-16">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            광주의 지금, 한눈에
          </h1>
          <p className="mt-4 text-base text-blue-100 sm:text-lg lg:text-xl">
            행사 · 주차 · 트렌드를 AI로 탐색하세요
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href="#events"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#378ADD] shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl active:scale-[0.97]"
            >
              행사 보기
            </a>
            <a
              href="#map"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/60 px-6 py-3 text-sm font-semibold text-white transition-all hover:border-white hover:bg-white/10 active:scale-[0.97]"
            >
              지도 열기
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
