import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <span className="text-5xl" aria-hidden>
            ⚠️
          </span>
          <h1 className="mt-4 text-xl font-bold text-gray-900">문제가 발생했습니다</h1>
          <p className="mt-2 text-sm text-gray-500">페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.</p>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="mt-6 rounded-lg bg-[#378ADD] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#2d6fc4]"
          >
            홈으로 돌아가기
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
