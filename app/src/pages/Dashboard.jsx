import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { profile } = useAuth()

  return (
    <div className="dashboard">
      <h1>Merhaba, {profile?.name} 👋</h1>
      <p className="clinic-line">{profile?.clinicName}</p>

      <div className="card-grid">
        <Link to="/appointments" className="dash-card">
          <h2>Randevular</h2>
          <p>
            {profile?.role === 'staff'
              ? 'Kliniğinize gelen randevu taleplerini görüntüleyin ve yönetin.'
              : 'Yeni randevu talebi oluşturun ve randevularınızı takip edin.'}
          </p>
        </Link>
        <Link to="/messages" className="dash-card">
          <h2>Mesajlar</h2>
          <p>
            {profile?.role === 'staff'
              ? 'Hastalarınızla yazışın, sorularını yanıtlayın.'
              : 'Kliniğinize mesaj gönderin, sorularınızı sorun.'}
          </p>
        </Link>
      </div>

      {profile?.role === 'staff' && (
        <div className="invite-box">
          <p>Klinik davet kodu, hastaların ve diğer çalışanların kaydolması için:</p>
          <code>{profile?.clinicCode}</code>
        </div>
      )}
    </div>
  )
}
