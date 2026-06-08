export type SpotCategory = '관광지' | '문화시설' | '레포츠' | '쇼핑'

export type SpotFilterCategory = '전체' | SpotCategory

export interface Spot {
  id: string
  title: string
  address: string
  description: string
  imageUrl: string
  category: SpotCategory
  lat?: number
  lng?: number
}
