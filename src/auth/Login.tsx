import { useState } from 'react'
import { useAuth } from './AuthContext'
import InstallHint from '../components/InstallHint'

export default function Login() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!login(username, password)) {
      setError('Name oder Passwort stimmt nicht.')
    }
  }

  return (
    <div className="app-shell min-h-dvh flex flex-col items-center justify-center px-6 relative">
      <div className="app-sky" aria-hidden />
      <div className="app-horizon" aria-hidden />
      <div className="app-grain" aria-hidden />
      <div className="app-vignette" aria-hidden />

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-heading tracking-[0.15em]">WIR ZWEI</h1>
          <p className="text-subtitle mt-3">Nur für uns.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name (Marie oder Nico)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            required
          />
          <input
            type="password"
            placeholder="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />
          {error && <p className="text-red-400/50 text-sm text-center">{error}</p>}
          <button type="submit" className="btn-primary tap-active">
            Einloggen
          </button>
        </form>
      </div>

      <InstallHint />
    </div>
  )
}
