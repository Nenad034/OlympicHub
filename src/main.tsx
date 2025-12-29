import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ConfigProvider } from './context/ConfigContext'
import ErrorBoundary from './components/ErrorBoundary'
import { ToastProvider } from './components/ui/Toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ConfigProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ConfigProvider>
    </ErrorBoundary>
  </StrictMode>,
)

