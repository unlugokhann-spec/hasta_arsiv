import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { createClinic, findClinicByCode } from '../lib/clinics'
import { createUserProfile } from '../lib/users'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const navigate = useNavigate()
  const { setProfile } = useAuth()

  const [role, setRole] = useState('patient')
  const [clinicMode, setClinicMode] = useState('join') // staff için: 'create' | 'join'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [clinicCode, setClinicCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (role === 'staff' && clinicMode === 'create' && !clinicName.trim()) {
      setError('Lütfen klinik adını girin.')
      return
    }
    if ((role === 'patient' || (role === 'staff' && clinicMode === 'join')) && !clinicCode.trim()) {
      setError('Lütfen klinik davet kodunu girin.')
      return
    }

    setSubmitting(true)
    try {
      let clinic
      if (role === 'staff' && clinicMode === 'create') {
        clinic = await createClinic(clinicName)
      } else {
        clinic = await findClinicByCode(clinicCode)
        if (!clinic) {
          setError('Bu kodla eşleşen bir klinik bulunamadı.')
          setSubmitting(false)
          return
        }
      }

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      const profile = {
        name: name.trim(),
        email: email.trim(),
        role,
        clinicId: clinic.id,
        clinicName: clinic.name,
        clinicCode: clinic.code,
      }
      await createUserProfile(cred.user.uid, profile)
      setProfile({ id: cred.user.uid, ...profile })
      navigate('/', { replace: true })
    } catch (err) {
      setError(mapAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Med Klinik</h1>
        <p className="subtitle">Yeni hesap oluştur</p>

        <div className="role-toggle">
          <button
            type="button"
            className={role === 'patient' ? 'active' : ''}
            onClick={() => setRole('patient')}
          >
            Hastayım
          </button>
          <button
            type="button"
            className={role === 'staff' ? 'active' : ''}
            onClick={() => setRole('staff')}
          >
            Klinik Çalışanıyım
          </button>
        </div>

        <label>
          Ad Soyad
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          E-posta
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Şifre
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>

        {role === 'staff' && (
          <div className="role-toggle secondary">
            <button
              type="button"
              className={clinicMode === 'join' ? 'active' : ''}
              onClick={() => setClinicMode('join')}
            >
              Mevcut kliniğe katıl
            </button>
            <button
              type="button"
              className={clinicMode === 'create' ? 'active' : ''}
              onClick={() => setClinicMode('create')}
            >
              Yeni klinik oluştur
            </button>
          </div>
        )}

        {role === 'staff' && clinicMode === 'create' ? (
          <label>
            Klinik Adı
            <input value={clinicName} onChange={(e) => setClinicName(e.target.value)} required />
          </label>
        ) : (
          <label>
            Klinik Davet Kodu
            <input
              value={clinicCode}
              onChange={(e) => setClinicCode(e.target.value.toUpperCase())}
              placeholder="Örn. AB12CD"
              required
            />
          </label>
        )}

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'Oluşturuluyor…' : 'Hesap Oluştur'}
        </button>

        <p className="switch-link">
          Zaten hesabın var mı? <Link to="/login">Giriş yap</Link>
        </p>
      </form>
    </div>
  )
}

function mapAuthError(err) {
  if (err.code === 'auth/email-already-in-use') return 'Bu e-posta zaten kayıtlı.'
  if (err.code === 'auth/weak-password') return 'Şifre en az 6 karakter olmalı.'
  if (err.code === 'auth/invalid-email') return 'Geçersiz e-posta adresi.'
  return 'Bir hata oluştu, lütfen tekrar deneyin.'
}
