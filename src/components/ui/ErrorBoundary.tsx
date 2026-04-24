import { Component, type ErrorInfo, type ReactNode } from 'react'
import AppLogo from './AppLogo'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.page}>
          <div className={styles.card}>
            <AppLogo />
            <div className={styles.icon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" strokeWidth="1.75">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.subtitle}>
              An unexpected error occurred. Try refreshing the page.
            </p>
            <button className={styles.btn} onClick={() => window.location.reload()}>
              Refresh page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
