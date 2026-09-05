import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'

// Bir hasta ve kliniği arasında tek bir konuşma yürütülür; klinikteki tüm
// çalışanlar aynı konuşmayı görüp yanıtlayabilir.
export function conversationId(clinicId, patientId) {
  return `${clinicId}_${patientId}`
}

export async function ensureConversation({ clinicId, patientId, patientName }) {
  const id = conversationId(clinicId, patientId)
  await setDoc(
    doc(db, 'conversations', id),
    {
      clinicId,
      patientId,
      patientName,
      updatedAt: Date.now(),
    },
    { merge: true },
  )
  return id
}

export function subscribeConversations({ clinicId, role, patientId }, callback) {
  const base = collection(db, 'conversations')
  const q =
    role === 'staff'
      ? query(base, where('clinicId', '==', clinicId), orderBy('updatedAt', 'desc'))
      : query(base, where('clinicId', '==', clinicId), where('patientId', '==', patientId))

  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function subscribeMessages(convId, callback) {
  const q = query(
    collection(db, 'conversations', convId, 'messages'),
    orderBy('createdAt', 'asc'),
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function sendMessage(convId, { senderId, senderName, senderRole, text }) {
  const trimmed = text.trim()
  if (!trimmed) return
  await addDoc(collection(db, 'conversations', convId, 'messages'), {
    senderId,
    senderName,
    senderRole,
    text: trimmed,
    createdAt: Date.now(),
  })
  await setDoc(
    doc(db, 'conversations', convId),
    { lastMessage: trimmed, updatedAt: Date.now() },
    { merge: true },
  )
}
