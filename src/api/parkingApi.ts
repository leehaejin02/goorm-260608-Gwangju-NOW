import axios from 'axios'
import type { ParkingLot } from '../types/parking'

const PARKING_API_BASE = import.meta.env.DEV
  ? '/tour-api/B553881/Parking'
  : 'https://apis.data.go.kr/B553881/Parking'

/** API 미승인 시 사용하는 광주 공영주차장 fallback (전국주차장 표준데이터 기반) */
const GWANGJU_PARKING_FALLBACK: ParkingLot[] = [
  {
    name: '삼각동 일곡엘리체공영주차장',
    address: '광주광역시 북구 삼각동 837',
    lat: 35.19665034,
    lng: 126.8981828,
    totalSpots: 44,
  },
  {
    name: '본촌동 공영주차장',
    address: '광주광역시 북구 용두택지로 66',
    lat: 35.21652283,
    lng: 126.8788846,
    totalSpots: 28,
  },
  {
    name: '유동 쌈지 공영주차장',
    address: '광주광역시 북구 유동 103-4',
    lat: 35.160841,
    lng: 126.905949,
    totalSpots: 8,
  },
  {
    name: '건국동 쌈지주차장',
    address: '광주광역시 북구 본촌동 3034',
    lat: 35.21412582,
    lng: 126.8788884,
    totalSpots: 7,
  },
  {
    name: '양동복개상가 앞 공영주차장',
    address: '광주광역시 서구 누문동 324',
    lat: 35.1542,
    lng: 126.8896,
    totalSpots: 85,
  },
  {
    name: '효덕주차장',
    address: '광주광역시 남구 서문대로',
    lat: 35.1335,
    lng: 126.9021,
    totalSpots: 120,
  },
  {
    name: '1913송정역시장 주차타워',
    address: '광주광역시 광산구 송정동 857-1',
    lat: 35.1398,
    lng: 126.7935,
    totalSpots: 107,
  },
  {
    name: '광산로 제1공영주차장',
    address: '광주광역시 광산구 송정동 818-15',
    lat: 35.1412,
    lng: 126.7918,
    totalSpots: 60,
  },
]

interface ParkingApiItem {
  prk_plce_nm?: string
  prk_plce_adres?: string
  prk_plce_la?: string | number
  prk_plce_lo?: string | number
  prk_cmprt_co?: string | number
  now_prk_vhcle_co?: string | number
  prk_plce_se?: string
}

interface ParkingApiResponse {
  response?: {
    header?: { resultCode?: string; resultMsg?: string }
    body?: {
      items?: { item?: ParkingApiItem | ParkingApiItem[] }
      totalCount?: number
    }
  }
}

function mapItemToParkingLot(item: ParkingApiItem): ParkingLot | null {
  const lat = Number(item.prk_plce_la)
  const lng = Number(item.prk_plce_lo)
  if (!item.prk_plce_nm || Number.isNaN(lat) || Number.isNaN(lng)) return null

  const totalSpots = Number(item.prk_cmprt_co) || 0
  const occupied = Number(item.now_prk_vhcle_co)
  const freeSpots = !Number.isNaN(occupied) && totalSpots > 0 ? totalSpots - occupied : undefined

  return {
    name: item.prk_plce_nm,
    address: item.prk_plce_adres ?? '광주광역시',
    lat,
    lng,
    totalSpots,
    freeSpots: freeSpots !== undefined && freeSpots >= 0 ? freeSpots : undefined,
  }
}

function filterGwangjuParking(lots: ParkingLot[]): ParkingLot[] {
  return lots.filter((lot) => lot.address.includes('광주') || lot.name.includes('광주'))
}

export async function fetchGwangjuParkingLots(): Promise<ParkingLot[]> {
  const apiKey = import.meta.env.VITE_PUBLIC_DATA_API_KEY?.trim()

  if (!apiKey || apiKey === '발급받은_키_입력') {
    return GWANGJU_PARKING_FALLBACK
  }

  try {
    const { data } = await axios.get<ParkingApiResponse>(`${PARKING_API_BASE}/PrkSttusInfo`, {
      params: {
        serviceKey: apiKey,
        pageNo: 1,
        numOfRows: 100,
        type: 'json',
      },
    })

    const resultCode = data.response?.header?.resultCode
    if (resultCode !== '00' && resultCode !== '0000') {
      return GWANGJU_PARKING_FALLBACK
    }

    const rawItems = data.response?.body?.items?.item
    const items: ParkingApiItem[] = rawItems
      ? Array.isArray(rawItems)
        ? rawItems
        : [rawItems]
      : []

    const mapped = items
      .map(mapItemToParkingLot)
      .filter((lot): lot is ParkingLot => lot !== null)

    const gwangjuLots = filterGwangjuParking(mapped)
    return gwangjuLots.length > 0 ? gwangjuLots : GWANGJU_PARKING_FALLBACK
  } catch {
    return GWANGJU_PARKING_FALLBACK
  }
}
