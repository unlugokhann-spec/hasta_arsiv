import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'

export async function createUserProfile(
  uid,
  { name, email, role, clinicId, clinicName, clinicCode },
) {
  await setDoc(doc(db, 'users', uid), {
    name,
    email,
    role,
    clinicId,
    clinicName,
    clinicCode,
    createdAt: Date.now(),
  })
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
