import { useEffect, useState } from 'react'

const DISMISS_KEY = 'wir-zwei-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export default function InstallHint() {
  const [visible, setVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosHint, setIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === '1') return

    if (isIos()) {
      setIosHint(true)
      setVisible(true)
      return
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="install-hint animate-fade-in">
      <p className="install-hint-text">
        {iosHint
          ? 'Tippe auf Teilen → „Zum Home-Bildschirm“ — dann ist Wir Zwei wie eine App auf deinem Handy.'
          : 'Wir Zwei auf deinem Handy installieren — wie eine kleine App, nur für uns.'}
      </p>
      <div className="install-hint-actions">
        {!iosHint && (
          <button type="button" className="install-hint-btn tap-active" onClick={install}>
            Installieren
          </button>
        )}
        <button type="button" className="install-hint-dismiss tap-active" onClick={dismiss}>
          Später
        </button>
      </div>
    </div>
  )
}
