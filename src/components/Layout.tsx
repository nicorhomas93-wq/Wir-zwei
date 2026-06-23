import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { bothUsersActiveToday, hasRecentGlobalActivity } from '../storage/meta'
import { getStore } from '../storage/sync'
import { recordAppOpen } from '../storage/db'
import InAppReminders, { wasFirstOpenToday } from './InAppReminders'
import InstallHint from './InstallHint'
import ForegroundPushToast, { PushBootstrap } from './PushBootstrap'
const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/erinnerungen', label: 'Erinnerungen' },
  { to: '/gedanken', label: 'Gedanken' },
  { to: '/moodboards', label: 'Moodboards' },
  { to: '/planung', label: 'Planung' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isFirstOpenRef = useRef(wasFirstOpenToday(getStore().notifications.lastOpenedAt))

  useEffect(() => {
    recordAppOpen()
  }, [])
  const isHome = location.pathname === '/'
  const connected = bothUsersActiveToday()
  const calm = !hasRecentGlobalActivity(3)

  const shellClass = [
    'app-shell',
    connected ? 'app-shell--connected' : '',
    calm ? 'app-shell--calm' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass}>
      <div className="app-bg" aria-hidden />
      <div className="app-fog" aria-hidden />
      <div className="app-grain" aria-hidden />
      <div className="app-vignette" aria-hidden />

      <header className="app-header sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="max-w-lg mx-auto px-4 sm:px-5 py-4 sm:py-5 flex items-center justify-between gap-3">
          <div>
            <p className="brand-label">WIR ZWEI</p>
            {!isHome && (
              <NavLink to="/" className="text-sm nav-back tap-active">
                ← Zurück
              </NavLink>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="user-name">{user?.name}</span>
            <button onClick={logout} className="logout-link tap-active">
              Abmelden
            </button>
          </div>
        </div>
      </header>

      <main
        key={location.pathname}
        className="app-main relative z-10 flex-1 max-w-lg mx-auto w-full px-3 page-enter"
      >
        <PushBootstrap />
        <ForegroundPushToast />
        <InAppReminders isFirstOpenToday={isFirstOpenRef.current} />
        {children}
      </main>

      <nav className="app-nav app-nav--five fixed bottom-0 inset-x-0 z-20 pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-lg mx-auto flex">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link tap-active ${isActive ? 'nav-link--active' : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      <InstallHint />
    </div>
  )
}
