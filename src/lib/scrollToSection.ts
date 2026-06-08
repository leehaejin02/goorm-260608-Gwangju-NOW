import type { Location, NavigateFunction } from 'react-router-dom'

export function scrollToElement(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}

/** 홈이면 스크롤/hash만, 다른 페이지면 홈 코스 패널로 이동 */
export function goToCoursePanel(
  navigate: NavigateFunction,
  location: Pick<Location, 'pathname' | 'hash'>,
) {
  if (location.pathname === '/') {
    if (location.hash === '#my-course') {
      scrollToElement('my-course')
    } else {
      navigate({ pathname: '/', hash: 'my-course' }, { replace: true })
    }
    return
  }

  navigate({ pathname: '/', hash: 'my-course' })
}
