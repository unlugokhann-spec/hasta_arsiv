import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

function generateClinicCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function findClinicByCode(code) {
  const normalized = code.trim().toUpperCase()
  const q = query(
    collection(db, 'clinics'),
    where('code', '==', normalized),
    limit(1),
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const docSnap = snap.docs[0]
  return { id: docSnap.id, ...docSnap.data() }
}

export async function createClinic(name) {
  let code = generateClinicCode()
  // eşsizliği garanti altına al (çok düşük olasılıkla çakışabilir)
  while (await findClinicByCode(code)) {
    code = generateClinicCode()
  }
  const ref = await addDoc(collection(db, 'clinics'), {
    name: name.trim(),
    code,
    createdAt: Date.now(),
  })
  return { id: ref.id, name: name.trim(), code }
}
