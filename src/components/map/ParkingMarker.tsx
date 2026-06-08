import type { ParkingLot } from '../../types/parking'
import { buildInfoWindowActions, getKakaoDirectionsUrl } from '../../lib/kakaoMapLinks'

function createParkingMarkerElement(): HTMLElement {
  const el = document.createElement('div')
  el.className =
    'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#F97316] text-xs font-bold text-white shadow-md transition-transform hover:scale-110'
  el.textContent = 'P'
  return el
}

export function createParkingMarkers(
  map: kakao.maps.Map,
  parkingLots: ParkingLot[],
): kakao.maps.CustomOverlay[] {
  const overlays: kakao.maps.CustomOverlay[] = []

  parkingLots.forEach((lot) => {
    const position = new kakao.maps.LatLng(lot.lat, lot.lng)
    const content = createParkingMarkerElement()

    const freeInfo =
      lot.freeSpots != null
        ? `<p style="margin:4px 0 0;font-size:11px;color:#378ADD;">잔여 ${lot.freeSpots}면</p>`
        : ''

    const actions = buildInfoWindowActions({
      directionsHref: getKakaoDirectionsUrl(lot.name, lot.lat, lot.lng),
    })

    const infoContent = `
      <div style="padding:10px 12px;min-width:180px;font-family:sans-serif;">
        <strong style="display:block;margin-bottom:4px;font-size:13px;color:#111;">${lot.name}</strong>
        <p style="margin:0;font-size:11px;color:#666;">${lot.address}</p>
        <p style="margin:4px 0 0;font-size:11px;color:#999;">총 ${lot.totalSpots}면</p>
        ${freeInfo}
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
      infowindow.close()
      const marker = new kakao.maps.Marker({ position })
      infowindow.open(map, marker)
      marker.setMap(null)
    })

    overlays.push(overlay)
  })

  return overlays
}
