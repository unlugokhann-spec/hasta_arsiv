import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">Med Clinic</div>
        <nav>
          <NavLink to="/" end>
            Panel
          </NavLink>
          <NavLink to="/appointments">Randevular</NavLink>
          <NavLink to="/messages">Mesajlar</NavLink>
        </nav>
        <div className="user-box">
          <span>
            {profile?.name} <em>({profile?.role === 'staff' ? 'Çalışan' : 'Hasta'})</em>
          </span>
          <button type="button" onClick={handleLogout}>
            Çıkış
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
