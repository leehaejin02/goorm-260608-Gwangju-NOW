# Gwangju NOW

광주광역시의 **행사 · 명소 · 맛집 · 주차** 정보를 탐색하고, **AI 에이전트**와 함께 **나만의 코스**를 짜는 웹 서비스입니다.

> goorm 팀 프로젝트 · [GitHub Repository](https://github.com/leehaejin02/goorm-260608-Gwangju-NOW)

## 주요 기능

### 탐색
- **광주 행사** — TourAPI 실시간 축제·공연·전시 (키워드·날짜·카테고리 필터)
- **가볼만한 곳** — TourAPI 관광지 목록 (`/spots`)
- **광주 맛집** — 카카오 로컬 API 키워드 검색 + 직접 검색
- **행사 지도** — 카카오맵 행사·주차·맛집 레이어, 길찾기
- **YouTube** — 광주 관련 영상 검색
- **AI 추천 코스** — 데이트·가족·야간 테마별 OpenAI 추천

### NOW 플래너 (AI 에이전트)
- **대화형 코스 설계** — OpenAI tool calling으로 맛집 검색·코스 추가·시간 설정·삭제
- **실시간 코스 패널** — 에이전트가 수정하면 `나만의 코스`에 즉시 반영
- **동선 지도** — 순서대로 마커·경로 표시 (카카오맵)
- **프로액티브 배너** — 점심·명소·시간 배치 등 상황별 제안

### 나만의 코스
- 행사·명소·맛집·주차 **코스에 담기** (드래그 정렬, 시간대 설정)
- **저장 / 편집 / 복제** — localStorage 기반 (마이페이지)
- **저장 코스 선택 담기** — 카드에서 `선택 ▾`로 기존 코스 또는 새 코스에 추가
- **FloatingCourseBar** — 작업 중 코스 바로가기

### 마이페이지
- 카카오 / Google OAuth 로그인
- 행사·맛집 **찜** 목록
- **저장 코스** — 미니 지도, 타입별 칩, 편집·공유·복제·삭제
- 「이 코스로 출발」→ 홈 NOW 플래너 편집 모드

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS v4 |
| 상태 | Zustand (코스·찜·인증·AI 채팅) |
| 라우팅 | React Router v7 |
| 지도 | Kakao Maps SDK |
| AI | OpenAI GPT-4o-mini (에이전트·요약·추천) |
| API | TourAPI, Kakao Local/Login, YouTube Data API |
| 배포 | Vercel Serverless Functions (`/api/*`) |

## 프로젝트 구조 (요약)

```
src/
  components/   # UI (행사·맛집·명소·코스·AI·지도)
  pages/        # Home, EventDetail, Spots, MyPage
  store/        # Zustand stores
  api/          # 클라이언트 API
  lib/          # courseUtils, agentPoiCatalog, geoUtils 등
api/            # Vercel/ Vite dev 서버 핸들러 (agent, ai-chat, kakao-local …)
```

## 로컬 실행

```bash
npm install
cp .env.example .env
# .env에 API 키 입력
npm run dev
```

브라우저: http://localhost:5173/

```bash
npm run build    # 프로덕션 빌드
npm run preview  # 빌드 미리보기
npm run lint     # ESLint
```

## 환경 변수

| 변수 | 용도 |
|------|------|
| `VITE_PUBLIC_DATA_API_KEY` | TourAPI (행사·명소·주차) |
| `VITE_KAKAO_MAP_KEY` | 카카오맵 JS SDK |
| `KAKAO_REST_API_KEY` | 카카오 로컬·맛집 검색 (서버) |
| `KAKAO_CLIENT_SECRET` | 카카오 로그인 (서버) |
| `VITE_KAKAO_CLIENT_ID` | 카카오 로그인 (클라이언트) |
| `VITE_GOOGLE_CLIENT_ID` | Google 로그인 |
| `GOOGLE_CLIENT_SECRET` | Google 로그인 (서버) |
| `OPENAI_API_KEY` | AI 요약·에이전트 (서버) |
| `VITE_YOUTUBE_API_KEY` | YouTube Data API |

발급 방법은 [`.env.example`](.env.example) 참고.

## API 엔드포인트 (서버)

| 경로 | 설명 |
|------|------|
| `/api/agent` | AI 에이전트 (tool calling, 코스 조작) |
| `/api/ai-chat` | AI 대화형 탐색 |
| `/api/ai-summary` | 행사 AI 요약 |
| `/api/kakao-local` | 카카오 로컬 검색 프록시 |
| `/api/kakao-place-image` | 카카오맵 장소 대표 사진 |
| `/api/kakao-token` | 카카오 OAuth |
| `/api/google-token` | Google OAuth |

로컬 개발 시 `vite.config.ts`의 dev middleware가 동일 API를 제공합니다.

## 주요 수정·개선 이력

### AI 에이전트 & 코스 지도
- **빈 코스에서 에이전트 추가 시 지도 미표시** — `poiCatalog` + `enrichCourseItem()`으로 좌표·링크 보강
- **에이전트 코스 지도 빈 화면 / 128km 줌아웃** — `normalizeCourseLatLng()` (위·경도 뒤바뀜·스케일 보정), 카카오맵 `relayout()`, 과도한 줌아웃 제한

### 코스 저장·편집 UX
- **마이페이지 「편집하기」 무반응** — `startEditingCourse()` + 홈 `#my-course` 이동
- **저장 시 항상 업데이트만 되던 문제** — `editingCourseId` 추적, **변경사항 저장** / **새 코스로 저장** / **+ 새 코스 시작** 분리
- **새 코스 저장 후 작업판 비우기**, 저장 완료 **토스트** (마이페이지 링크)
- 홈 코스 패널 **공유 버튼 제거** (공유는 마이페이지 저장 코스에서)

### 코스에 담기 UI
- **저장 ▾ 드롭다운 가림** — Portal + 카드 `overflow-hidden` 제거
- **저장 코스 담기 시 불필요한 페이지 이동** — 홈에서는 스크롤만, 타 페이지에서만 navigate
- **+ 새 코스에 담기** 메뉴 추가

### 기타 UI
- 네비·QuickMenu **NOW 플래너 ↔ 맛집** 순서를 화면과 일치
- **내 주변 행사** 섹션 제거
- 마이페이지 저장 코스 **미니 지도·타입 칩·복제** UI 개선

## Vercel 배포

1. [GitHub 저장소](https://github.com/leehaejin02/goorm-260608-Gwangju-NOW) 연결
2. Environment Variables에 `.env.example` 키 등록 (`VITE_` 접두사 포함)
3. 카카오/Google Redirect URI에 배포 URL 등록

## 라이선스

MIT
