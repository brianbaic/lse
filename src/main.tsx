import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

type ErrorBoundaryState = {
  hasError: boolean
  errorMessage: string
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    }
  }

  componentDidCatch(error: unknown): void {
    console.error('Visual Editor runtime error:', error)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#fff7ed', color: '#7c2d12', padding: '24px', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif' }}>
          <h1 style={{ margin: 0, fontSize: '22px' }}>Visual Editor failed to render</h1>
          <p style={{ marginTop: '12px', marginBottom: '8px' }}>A runtime error occurred. The app did not load completely.</p>
          <pre style={{ margin: 0, padding: '12px', background: '#ffedd5', border: '1px solid #fdba74', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
            {this.state.errorMessage || 'Unknown runtime error'}
          </pre>
          <p style={{ marginTop: '12px', fontSize: '12px' }}>Open browser console for full stack trace.</p>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
)
