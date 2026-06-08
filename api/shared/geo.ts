/** 에이전트·TourAPI 등에서 들어온 좌표 보정 (스케일·위경도 뒤바뀜) */
export function normalizeCourseLatLng(
  lat?: number,
  lng?: number,
): { lat: number; lng: number } | null {
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng)) return null

  let la = lat
  let ln = lng

  if (Math.abs(la) > 1000) la = la / 10_000_000
  if (Math.abs(ln) > 1000) ln = ln / 10_000_000

  if (la >= 124 && la <= 132 && ln >= 33 && ln <= 39) {
    ;[la, ln] = [ln, la]
  }

  if (la < -90 || la > 90 || ln < -180 || ln > 180) return null

  return { lat: la, lng: ln }
}
