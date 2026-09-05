import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  ensureConversation,
  sendMessage,
  subscribeConversations,
  subscribeMessages,
} from '../lib/messages'

export default function Messages() {
  const { profile } = useAuth()
  const isStaff = profile?.role === 'staff'

  const [conversations, setConversations] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const bottomRef = useRef(null)

  // Hasta için: konuşma otomatik oluşturulur ve doğrudan açılır.
  useEffect(() => {
    if (!profile || isStaff) return
    ensureConversation({
      clinicId: profile.clinicId,
      patientId: profile.id,
      patientName: profile.name,
    }).then(setActiveId)
  }, [profile, isStaff])

  // Çalışan için: klinikteki tüm konuşmaların listesi.
  useEffect(() => {
    if (!profile || !isStaff) return undefined
    const unsubscribe = subscribeConversations(
      { clinicId: profile.clinicId, role: profile.role },
      setConversations,
    )
    return unsubscribe
  }, [profile, isStaff])

  useEffect(() => {
    if (!activeId) return undefined
    const unsubscribe = subscribeMessages(activeId, setMessages)
    return unsubscribe
  }, [activeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!text.trim() || !activeId) return
    await sendMessage(activeId, {
      senderId: profile.id,
      senderName: profile.name,
      senderRole: profile.role,
      text,
    })
    setText('')
  }

  return (
    <div className="messages-page">
      {isStaff && (
        <aside className="conversation-list">
          <h2>Hastalar</h2>
          {conversations.length === 0 && <p className="empty">Henüz mesaj yok.</p>}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              className={conv.id === activeId ? 'conversation-item active' : 'conversation-item'}
              onClick={() => setActiveId(conv.id)}
            >
              <strong>{conv.patientName}</strong>
              <span>{conv.lastMessage ?? 'Yeni konuşma'}</span>
            </button>
          ))}
        </aside>
      )}

      <section className="chat-panel">
        {!activeId ? (
          <p className="empty">Sohbet başlatmak için soldan bir hasta seçin.</p>
        ) : (
          <>
            <div className="chat-messages">
              {messages.length === 0 && (
                <p className="empty">Henüz mesaj yok, ilk mesajı gönderin.</p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    msg.senderId === profile.id ? 'chat-bubble mine' : 'chat-bubble theirs'
                  }
                >
                  <span className="sender">{msg.senderName}</span>
                  <p>{msg.text}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form className="chat-input" onSubmit={handleSend}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Mesajınızı yazın…"
              />
              <button type="submit" className="primary">
                Gönder
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
