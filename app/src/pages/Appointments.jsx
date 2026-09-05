import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  createAppointment,
  subscribeAppointments,
  updateAppointmentStatus,
} from '../lib/appointments'

const STATUS_LABELS = {
  pending: 'Beklemede',
  confirmed: 'Onaylandı',
  cancelled: 'İptal Edildi',
}

export default function Appointments() {
  const { profile } = useAuth()
  const isStaff = profile?.role === 'staff'

  const [appointments, setAppointments] = useState([])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!profile) return undefined
    const unsubscribe = subscribeAppointments(
      { clinicId: profile.clinicId, patientId: profile.id, role: profile.role },
      setAppointments,
    )
    return unsubscribe
  }, [profile])

  async function handleCreate(e) {
    e.preventDefault()
    setError('')
    if (!date || !time) {
      setError('Lütfen tarih ve saat seçin.')
      return
    }
    setSubmitting(true)
    try {
      await createAppointment({
        clinicId: profile.clinicId,
        patientId: profile.id,
        patientName: profile.name,
        date,
        time,
        reason,
      })
      setDate('')
      setTime('')
      setReason('')
    } catch {
      setError('Randevu oluşturulamadı, tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleStatusChange(id, status) {
    await updateAppointmentStatus(id, status)
  }

  return (
    <div className="appointments-page">
      <h1>Randevular</h1>

      {!isStaff && (
        <form className="appointment-form" onSubmit={handleCreate}>
          <h2>Yeni Randevu Talebi</h2>
          <div className="form-row">
            <label>
              Tarih
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label>
              Saat
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </label>
          </div>
          <label>
            Not (opsiyonel)
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Şikayetinizi kısaca yazabilirsiniz"
              rows={2}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="primary" disabled={submitting}>
            {submitting ? 'Gönderiliyor…' : 'Randevu Talep Et'}
          </button>
        </form>
      )}

      <div className="appointment-list">
        {appointments.length === 0 && <p className="empty">Henüz randevu yok.</p>}
        {appointments.map((appt) => (
          <div key={appt.id} className={`appointment-item status-${appt.status}`}>
            <div className="appointment-main">
              <strong>
                {appt.date} · {appt.time}
              </strong>
              {isStaff && <span className="patient-name">{appt.patientName}</span>}
              {appt.reason && <p className="reason">{appt.reason}</p>}
            </div>
            <div className="appointment-side">
              <span className={`status-badge status-${appt.status}`}>
                {STATUS_LABELS[appt.status] ?? appt.status}
              </span>
              {isStaff && appt.status === 'pending' && (
                <div className="appointment-actions">
                  <button type="button" onClick={() => handleStatusChange(appt.id, 'confirmed')}>
                    Onayla
                  </button>
                  <button type="button" onClick={() => handleStatusChange(appt.id, 'cancelled')}>
                    Reddet
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
