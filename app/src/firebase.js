import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
// Kısıtlayıcı proxy/güvenlik duvarı arkasındaki ağlarla uyumluluk için
// Firestore'un kalıcı akış kanalı yerine long-polling'e otomatik geçmesi sağlanıyor.
// VITE_FIRESTORE_DATABASE_ID: Firebase konsolunda veritabanı özel "(default)"
// kimliği yerine başka bir adla (örn. "default") oluşturulduysa burada belirtilir.
export const db = initializeFirestore(
  app,
  {
    experimentalAutoDetectLongPolling: true,
    useFetchStreams: false,
  },
  import.meta.env.VITE_FIRESTORE_DATABASE_ID || undefined,
)
