export interface DummyEvent {
  title: string
  place: string
  startDate: string
  endDate: string
  imageUrl: string
  category: '축제' | '공연' | '전시'
}

export interface DummyYoutubeVideo {
  title: string
  channelName: string
  thumbnailUrl: string
  videoUrl: string
}

export const dummyEvents: DummyEvent[] = [
  {
    title: '2025 광주 빛고을 축제',
    place: '광주광역시 동구 광장',
    startDate: '2025-07-01',
    endDate: '2025-07-07',
    imageUrl: 'https://placehold.co/400x240/378ADD/ffffff?text=빛고을+축제',
    category: '축제',
  },
  {
    title: '광주 비엔날레',
    place: '광주광역시 북구 문화전당',
    startDate: '2025-09-05',
    endDate: '2025-12-07',
    imageUrl: 'https://placehold.co/400x240/1D9E75/ffffff?text=비엔날레',
    category: '전시',
  },
  {
    title: '국립아시아문화전당 클래식 콘서트',
    place: '광주광역시 동구 문화전당로',
    startDate: '2025-06-15',
    endDate: '2025-06-15',
    imageUrl: 'https://placehold.co/400x240/7F77DD/ffffff?text=클래식+콘서트',
    category: '공연',
  },
  {
    title: '무등산 별빛 야간 축제',
    place: '광주광역시 동구 무등산',
    startDate: '2025-08-10',
    endDate: '2025-08-12',
    imageUrl: 'https://placehold.co/400x240/D85A30/ffffff?text=별빛+축제',
    category: '축제',
  },
  {
    title: '광주 현대미술 특별전',
    place: '광주광역시 서구 치평동',
    startDate: '2025-05-20',
    endDate: '2025-08-31',
    imageUrl: 'https://placehold.co/400x240/BA7517/ffffff?text=현대미술전',
    category: '전시',
  },
  {
    title: '광주 재즈 페스티벌',
    place: '광주광역시 남구 봉선동',
    startDate: '2025-10-03',
    endDate: '2025-10-05',
    imageUrl: 'https://placehold.co/400x240/378ADD/ffffff?text=재즈+페스티벌',
    category: '공연',
  },
]

export const dummyYoutubeVideos: DummyYoutubeVideo[] = [
  {
    title: '2025 광주 빛고을 축제 하이라이트',
    channelName: '광주문화재단',
    thumbnailUrl: 'https://placehold.co/480x270/378ADD/ffffff?text=YouTube+1',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    title: '광주 비엔날레 작품 투어',
    channelName: '광주비엔날레',
    thumbnailUrl: 'https://placehold.co/480x270/1D9E75/ffffff?text=YouTube+2',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    title: '무등산 등산 & 광주 맛집 코스',
    channelName: '광주여행TV',
    thumbnailUrl: 'https://placehold.co/480x270/D85A30/ffffff?text=YouTube+3',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
]
