export interface ParkingLot {
  name: string
  address: string
  lat: number
  lng: number
  totalSpots: number
  freeSpots?: number
}

export interface ParkingLotWithDistance extends ParkingLot {
  distanceKm: number
}
