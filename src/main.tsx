import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return

    const checkForUpdate = () => {
      if (document.visibilityState === 'visible') {
        registration.update()
      }
    }

    document.addEventListener('visibilitychange', checkForUpdate)
    window.addEventListener('focus', checkForUpdate)
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
