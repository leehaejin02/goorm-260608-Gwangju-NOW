import type { Restaurant } from '../../types/restaurant'
import { getKakaoDirectionsUrl } from '../../lib/kakaoMapLinks'

function createRestaurantMarkerElement(): HTMLElement {
  const el = document.createElement('div')
  el.className =
    'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-xs shadow-md transition-transform hover:scale-110'
  el.textContent = '🍽'
  return el
}

export function createRestaurantMarkers(
  map: kakao.maps.Map,
  restaurants: Restaurant[],
): kakao.maps.CustomOverlay[] {
  const overlays: kakao.maps.CustomOverlay[] = []

  restaurants.forEach((restaurant) => {
    if (restaurant.lat == null || restaurant.lng == null) return

    const position = new kakao.maps.LatLng(restaurant.lat, restaurant.lng)
    const content = createRestaurantMarkerElement()

    const kakaoLink = restaurant.placeUrl
      ? `<a href="${restaurant.placeUrl}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#378ADD;text-decoration:none;font-weight:600;">카카오맵</a>`
      : ''

    const directionsLink = getKakaoDirectionsUrl(restaurant.name, restaurant.lat, restaurant.lng)
    const directionsHtml = `<a href="${directionsLink}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#378ADD;text-decoration:none;font-weight:600;">길찾기</a>`

    const linksRow =
      kakaoLink || directionsHtml
        ? `<div style="margin-top:8px;display:flex;gap:10px;">${[kakaoLink, directionsHtml].filter(Boolean).join('')}</div>`
        : ''

    const infoContent = `
      <div style="padding:10px 12px;min-width:180px;font-family:sans-serif;">
        <strong style="display:block;margin-bottom:4px;font-size:13px;color:#111;">${restaurant.name}</strong>
        <p style="margin:0;font-size:11px;color:#666;">${restaurant.category}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#999;">${restaurant.address}</p>
        ${linksRow}
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

  return overlays
}
