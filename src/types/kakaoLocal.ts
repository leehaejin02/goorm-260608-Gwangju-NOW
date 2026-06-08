/** 광주광역시 중심 좌표 (Kakao: x=lng, y=lat) */
export const GWANGJU_CENTER = { lat: 35.1595, lng: 126.8526 }

export interface KakaoLocalDocument {
  id: string
  place_name: string
  category_name: string
  category_group_code: string
  phone: string
  address_name: string
  road_address_name: string
  x: string
  y: string
  place_url: string
  distance?: string
}
