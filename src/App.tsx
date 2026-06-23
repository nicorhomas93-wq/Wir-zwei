import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Login from './auth/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { DataProvider } from './storage/DataContext'
import Anker from './pages/Anker'
import Beziehungsgesetzbuch from './pages/Beziehungsgesetzbuch'
import Home from './pages/Home'
import Memories from './pages/Memories'
import MoodboardDetail from './pages/MoodboardDetail'
import Moodboards from './pages/Moodboards'
import Planning from './pages/Planning'
import Strafkatalog from './pages/Strafkatalog'
import Thoughts from './pages/Thoughts'
import Zufallsdate from './pages/Zufallsdate'

function LoginRoute() {
  const { user } = useAuth()
  if (user) return <Navigate to="/" replace />
  return <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/anker" element={<Anker />} />
            <Route path="/beziehungsgesetzbuch" element={<Beziehungsgesetzbuch />} />
            <Route path="/strafkatalog" element={<Strafkatalog />} />
            <Route path="/zufallsdate" element={<Zufallsdate />} />
            <Route path="/erinnerungen" element={<Memories />} />
            <Route path="/gedanken" element={<Thoughts />} />
            <Route path="/moodboards" element={<Moodboards />} />
            <Route path="/moodboards/:id" element={<MoodboardDetail />} />
            <Route path="/planung" element={<Planning />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
