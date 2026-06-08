import type { Event } from '../../types/event'
import { buildInfoWindowActions, getKakaoDirectionsUrl } from '../../lib/kakaoMapLinks'

function formatDateRange(start: string, end: string) {
  if (!start) return ''
  if (start === end || !end) return start
  return `${start} ~ ${end}`
}

interface EventMarkerOptions {
  selectedEventId?: string | null
  onEventSelect?: (eventId: string) => void
}

function createEventMarkerElement(selected: boolean): HTMLElement {
  const el = document.createElement('div')
  el.className = `flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 ${
    selected ? 'scale-125 bg-[#1a4d8f]' : 'bg-[#378ADD]'
  }`
  el.innerHTML =
    '<svg class="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>'
  return el
}

export function createEventMarkers(
  map: kakao.maps.Map,
  events: Event[],
  options: EventMarkerOptions = {},
): kakao.maps.CustomOverlay[] {
  const overlays: kakao.maps.CustomOverlay[] = []
  const { selectedEventId, onEventSelect } = options

  events.forEach((event) => {
    if (event.lat == null || event.lng == null) return

    const position = new kakao.maps.LatLng(event.lat, event.lng)
    const selected = selectedEventId === event.id
    const content = createEventMarkerElement(selected)

    const actions = buildInfoWindowActions({
      detailHref: `/events/${event.id}`,
      directionsHref: getKakaoDirectionsUrl(event.title, event.lat, event.lng),
    })

    const infoContent = `
      <div style="padding:10px 12px;min-width:180px;font-family:sans-serif;">
        <strong style="display:block;margin-bottom:4px;font-size:13px;color:#111;">${event.title}</strong>
        <p style="margin:0 0 2px;font-size:11px;color:#666;">${event.place}</p>
        <p style="margin:0;font-size:11px;color:#999;">${formatDateRange(event.startDate, event.endDate)}</p>
        ${actions}
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
      onEventSelect?.(event.id)
      infowindow.close()
      const marker = new kakao.maps.Marker({ position })
      infowindow.open(map, marker)
      marker.setMap(null)
    })

    overlays.push(overlay)
  })

  return overlays
}
