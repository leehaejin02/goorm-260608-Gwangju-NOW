/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace kakao {
  namespace maps {
    class LatLng {
      constructor(lat: number, lng: number)
    }

    class Map {
      constructor(container: HTMLElement, options: MapOptions)
      setCenter(latlng: LatLng): void
      setLevel(level: number): void
      getLevel(): number
      setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void
      relayout(): void
    }

    interface MapOptions {
      center: LatLng
      level: number
    }

    class Marker {
      constructor(options: MarkerOptions)
      setMap(map: Map | null): void
      getPosition(): LatLng
    }

    interface MarkerOptions {
      map?: Map
      position: LatLng
      image?: MarkerImage
      title?: string
    }

    class MarkerImage {
      constructor(src: string, size: Size, options?: { offset?: Point })
    }

    class Size {
      constructor(width: number, height: number)
    }

    class Point {
      constructor(x: number, y: number)
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng)
      extend(latlng: LatLng): void
    }

    class Polyline {
      constructor(options: PolylineOptions)
      setMap(map: Map | null): void
    }

    interface PolylineOptions {
      map?: Map
      path: LatLng[]
      strokeWeight?: number
      strokeColor?: string
      strokeOpacity?: number
      strokeStyle?: string
    }

    class InfoWindow {
      constructor(options: { content: string; removable?: boolean })
      open(map: Map, marker: Marker): void
      close(): void
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions)
      setMap(map: Map | null): void
    }

    interface CustomOverlayOptions {
      map?: Map
      position: LatLng
      content: string | HTMLElement
      yAnchor?: number
    }

    namespace event {
      function addListener(
        target: Marker | Map,
        type: string,
        callback: () => void,
      ): void
    }

    function load(callback: () => void): void
  }
}

interface Window {
  kakao: typeof kakao
}
