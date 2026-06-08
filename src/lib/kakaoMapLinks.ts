export function getKakaoDirectionsUrl(name: string, lat: number, lng: number): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`
}

export function getKakaoMapUrl(lat: number, lng: number): string {
  return `https://map.kakao.com/link/map/${lat},${lng}`
}

export function buildInfoWindowActions(options: {
  detailHref?: string
  directionsHref?: string
}): string {
  const links: string[] = []
  if (options.detailHref) {
    links.push(
      `<a href="${options.detailHref}" style="font-size:11px;color:#378ADD;text-decoration:none;font-weight:600;">상세보기</a>`,
    )
  }
  if (options.directionsHref) {
    links.push(
      `<a href="${options.directionsHref}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#378ADD;text-decoration:none;font-weight:600;">길찾기</a>`,
    )
  }
  if (links.length === 0) return ''
  return `<div style="margin-top:8px;display:flex;gap:10px;">${links.join('')}</div>`
}
