import { useEffect } from 'react'

const SITE_NAME = 'Gwangju NOW'
const DEFAULT_DESCRIPTION = '광주의 행사, 맛집, 주차 정보를 AI로 탐색하세요.'

interface PageMetaOptions {
  title?: string
  description?: string
  image?: string
}

function setMetaTag(name: string, content: string, property = false): void {
  const attr = property ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta({ title, description, image }: PageMetaOptions = {}): void {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — 광주의 지금`
    const desc = description || DEFAULT_DESCRIPTION
    const img = image || `${window.location.origin}/favicon.svg`

    document.title = fullTitle
    setMetaTag('description', desc)
    setMetaTag('og:title', fullTitle, true)
    setMetaTag('og:description', desc, true)
    setMetaTag('og:image', img, true)
    setMetaTag('og:type', 'website', true)
    setMetaTag('twitter:card', 'summary_large_image')
    setMetaTag('twitter:title', fullTitle)
    setMetaTag('twitter:description', desc)

    return () => {
      document.title = `${SITE_NAME} — 광주의 지금`
      setMetaTag('description', DEFAULT_DESCRIPTION)
    }
  }, [title, description, image])
}
