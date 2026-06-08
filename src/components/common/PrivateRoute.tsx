import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

interface PrivateRouteProps {
  children: ReactNode
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { isLoggedIn, openLoginModal } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal()
      navigate('/')
    }
  }, [isLoggedIn, openLoginModal, navigate])

  if (!isLoggedIn) return null

  return <>{children}</>
}
