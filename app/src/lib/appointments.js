import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

export function subscribeAppointments({ clinicId, patientId, role }, callback) {
  const base = collection(db, 'appointments')
  const q =
    role === 'staff'
      ? query(base, where('clinicId', '==', clinicId), orderBy('date', 'asc'))
      : query(
          base,
          where('clinicId', '==', clinicId),
          where('patientId', '==', patientId),
          orderBy('date', 'asc'),
        )

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function createAppointment({
  clinicId,
  patientId,
  patientName,
  date,
  time,
  reason,
}) {
  await addDoc(collection(db, 'appointments'), {
    clinicId,
    patientId,
    patientName,
    date,
    time,
    reason: reason.trim(),
    status: 'pending',
    staffNote: '',
    createdAt: Date.now(),
  })
}

export async function updateAppointmentStatus(id, status, staffNote = '') {
  await updateDoc(doc(db, 'appointments', id), {
    status,
    ...(staffNote ? { staffNote } : {}),
  })
}
