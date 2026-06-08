import type { CourseItem } from '../../types/course'
import { COURSE_TYPE_LABELS } from '../../types/course'
import { getKakaoDirectionsUrl } from '../../lib/kakaoMapLinks'
import { normalizeCourseLatLng } from '../../lib/geoUtils'

function getItemPosition(item: CourseItem): { lat: number; lng: number } | null {
  return normalizeCourseLatLng(item.lat, item.lng)
}

const TYPE_MARKER_COLORS: Record<CourseItem['type'], string> = {
  event: '#378ADD',
  restaurant: '#F97316',
  parking: '#6366f1',
  spot: '#10b981',
}

function createCourseMarkerElement(order: number, color: string): HTMLElement {
  const el = document.createElement('div')
  el.className =
    'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow-md'
  el.style.backgroundColor = color
  el.textContent = String(order)
  return el
}

export function createCourseMarkers(
  map: kakao.maps.Map,
  items: CourseItem[],
): { overlays: kakao.maps.CustomOverlay[]; polyline: kakao.maps.Polyline | null } {
  const overlays: kakao.maps.CustomOverlay[] = []
  const path: kakao.maps.LatLng[] = []
  let order = 0

  items.forEach((item) => {
    const pos = getItemPosition(item)
    if (!pos) return

    order += 1
    const position = new kakao.maps.LatLng(pos.lat, pos.lng)
    path.push(position)

    const content = createCourseMarkerElement(order, TYPE_MARKER_COLORS[item.type])
    const timeLabel = item.timeSlot ? `<p style="margin:0 0 2px;font-size:11px;color:#378ADD;font-weight:600;">⏰ ${item.timeSlot}</p>` : ''
    const directions =
      pos != null
        ? `<a href="${getKakaoDirectionsUrl(item.title, pos.lat, pos.lng)}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#378ADD;text-decoration:none;font-weight:600;">길찾기</a>`
        : ''

    const infoContent = `
      <div style="padding:10px 12px;min-width:160px;font-family:sans-serif;">
        <span style="font-size:10px;color:#999;">${order}번 · ${COURSE_TYPE_LABELS[item.type]}</span>
        ${timeLabel}
        <strong style="display:block;margin:4px 0;font-size:13px;color:#111;">${item.title}</strong>
        <p style="margin:0;font-size:11px;color:#666;">${item.subtitle}</p>
        ${directions ? `<div style="margin-top:8px;">${directions}</div>` : ''}
      </div>
    `

    const infowindow = new kakao.maps.InfoWindow({ content: infoContent, removable: true })

    const overlay = new kakao.maps.CustomOverlay({
      map,
      position,
      content,
      yAnchor: 1,
    })

    content.addEventListener('click', () => {
      infowindow.close()
      const marker = new kakao.maps.Marker({ position })
      infowindow.open(map, marker)
      marker.setMap(null)
    })

    overlays.push(overlay)
  })

  const polyline =
    path.length >= 2
      ? new kakao.maps.Polyline({
          map,
          path,
          strokeWeight: 4,
          strokeColor: '#378ADD',
          strokeOpacity: 0.65,
          strokeStyle: 'solid',
        })
      : null

  return { overlays, polyline }
}

export function fitMapToCourseItems(map: kakao.maps.Map, items: CourseItem[]) {
  const coords = items
    .map((item) => getItemPosition(item))
    .filter((pos): pos is { lat: number; lng: number } => pos != null)

  if (coords.length === 0) return

  if (coords.length === 1) {
    map.setCenter(new kakao.maps.LatLng(coords[0].lat, coords[0].lng))
    map.setLevel(5)
    return
  }

  const bounds = new kakao.maps.LatLngBounds()
  coords.forEach((pos) => {
    bounds.extend(new kakao.maps.LatLng(pos.lat, pos.lng))
  })
  map.setBounds(bounds, 48, 48, 48, 48)

  // 과도한 줌아웃 방지 (잘못된 좌표 혼입 시)
  window.setTimeout(() => {
    if (map.getLevel() > 10) {
      map.setLevel(10)
    }
  }, 0)
}
