import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const App = lazy(() => import('./App.jsx'))
const DevApp = lazy(() => import('./dev/App.jsx'))

const isDevRoute =
  window.location.pathname === '/dev' ||
  window.location.pathname.startsWith('/dev/')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={null}>
      {isDevRoute ? <DevApp /> : <App />}
    </Suspense>
  </StrictMode>,
)
