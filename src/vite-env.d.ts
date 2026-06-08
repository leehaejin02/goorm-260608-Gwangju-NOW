/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_DATA_API_KEY: string
  readonly VITE_KAKAO_MAP_KEY: string
  readonly VITE_YOUTUBE_API_KEY: string
  readonly VITE_KAKAO_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
