import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CallbackPage from './pages/CallbackPage'
import GoogleCallbackPage from './pages/GoogleCallbackPage'
import EventDetailPage from './pages/EventDetailPage'
import MyPage from './pages/MyPage'
import SpotListPage from './pages/SpotListPage'
import NotFoundPage from './pages/NotFoundPage'
import ScrollToTop from './components/common/ScrollToTop'
import ToastContainer from './components/common/ToastContainer'
import ErrorBoundary from './components/common/ErrorBoundary'
import { useAuthStore } from './store/useAuthStore'
import { useFavoriteStore } from './store/useFavoriteStore'
import { useCourseStore } from './store/useCourseStore'

function AppInit() {
  useEffect(() => {
    useAuthStore.getState().initFromStorage()
    useFavoriteStore.getState().loadFromStorage()
    useCourseStore.getState().loadFromStorage()
  }, [])

  return null
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInit />
        <ScrollToTop />
        <ToastContainer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/callback" element={<CallbackPage />} />
          <Route path="/callback/google" element={<GoogleCallbackPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/spots" element={<SpotListPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
