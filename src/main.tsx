import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initMonitoring, ErrorBoundary, LogLevel } from './monitoring'

initMonitoring({
  enabled: true,
  logLevel: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  enableStateLogging: true,
  enablePerformanceMonitoring: true,
  enableErrorBoundary: true,
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
