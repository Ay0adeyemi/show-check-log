import { useEffect, useRef, useState } from "react"
import { db, storage } from "../firebase"
import {
  collection, addDoc, onSnapshot, orderBy, query,
  serverTimestamp, doc, updateDoc, deleteDoc, setDoc
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export default function TeamChat({ user, open, onClose }) {

  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [file, setFile] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [editing, setEditing] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  const bottomRef = useRef()
  const fileRef = useRef()

  // 🔹 FETCH
  useEffect(() => {
    const q = query(collection(db, "teamMessages"), orderBy("createdAt", "asc"))

    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })

    return () => unsub()
  }, [])

  // 🔹 SEEN
  useEffect(() => {
    messages.forEach(async (m) => {
      if (!m.seenBy?.includes(user.uid)) {
        await updateDoc(doc(db, "teamMessages", m.id), {
          seenBy: [...(m.seenBy || []), user.uid]
        })
      }
    })
  }, [messages])

  // 🔹 ONLINE FIX
  useEffect(() => {
  if (!user) return

  const userRef = doc(db, "chatOnlineUsers", user.uid)

  const updatePresence = () => {
    setDoc(userRef, {
      name: user.displayName,
      last: Date.now()
    }, { merge: true })
  }

  updatePresence()

  const interval = setInterval(updatePresence, 8000)

  const unsub = onSnapshot(collection(db, "chatOnlineUsers"), snap => {
    const now = Date.now()

    const active = snap.docs
      .map(d => d.data())
      .filter(u => now - u.last < 30000)

    setOnlineUsers(active)
  })

  return () => {
    clearInterval(interval)
    unsub()
  }
}, [user])

  // 🔹 SEND
  const sendMessage = async () => {
    if (!text.trim() && !file) return

    let fileUrl = null
    let type = "text"

    if (file) {
      const storageRef = ref(storage, `chat/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      fileUrl = await getDownloadURL(storageRef)
      if (file.type.startsWith("image")) type = "image"
    }

    if (editing) {
      await updateDoc(doc(db, "teamMessages", editing.id), { text })
      setEditing(null)
    } else {
      await addDoc(collection(db, "teamMessages"), {
        text,
        file: fileUrl,
        type,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName,
        seenBy: [user.uid],
        reactions: {},
        replyTo: replyingTo
  ? {
      text: replyingTo.text,
      userName: replyingTo.userName
    }
  : null
      })
    }

    setText("")
    setFile(null)
    setReplyingTo(null)
  }

 const react = async (id, emoji) => {
  const msg = messages.find(m => m.id === id)

  if (!msg) return

  const currentReactions = msg.reactions || {}
  const users = currentReactions[emoji] || []

  let updatedUsers

  if (users.includes(user.uid)) {
    // remove reaction
    updatedUsers = users.filter(u => u !== user.uid)
  } else {
    // add reaction
    updatedUsers = [...users, user.uid]
  }

  await updateDoc(doc(db, "teamMessages", id), {
    reactions: {
      ...currentReactions,
      [emoji]: updatedUsers
    }
  })
}

  const formatTime = (t) => {
    if (!t) return ""
    const d = t.toDate ? t.toDate() : new Date(t)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const initials = (n) =>
    n?.split(" ").map(x => x[0]).join("").slice(0,2).toUpperCase()

  useEffect(() => {
  const el = bottomRef.current
  if (!el) return

  const container = el.parentElement
  if (!container) return

  const distanceFromBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight

  // only scroll if user is near bottom
  if (distanceFromBottom < 80) {
    el.scrollIntoView({ behavior: "smooth" })
  }
}, [messages])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">

      <div className="w-full max-w-md h-[80vh] mx-4 bg-[#0f172a] text-white flex flex-col rounded-xl overflow-hidden">

        {/* HEADER */}
        <div className="p-3 border-b border-white/10 flex justify-between">
          <div>
            <div className="font-semibold">Team Chat</div>
            <div className="text-xs opacity-60">
              {onlineUsers.length} online
            </div>
          </div>
          <button onClick={onClose}>✕</button>
        </div>

        {/* MESSAGES (SCROLL FIXED) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">

          {messages.map(m => {
            const isMe = m.userId === user.uid

            return (
              <div key={m.id} className="flex gap-2">

                {!isMe && (
                  <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center text-xs">
                    {initials(m.userName)}
                  </div>
                )}

                <div className={`max-w-[75%] ${isMe ? "ml-auto" : ""}`}>

                  <div className={`p-2 rounded-lg ${
                    isMe ? "bg-blue-600" : "bg-[#1e293b]"
                  }`}>

                    {!isMe && (
                      <div className="text-xs font-semibold mb-1">
                        {m.userName}
                      </div>
                    )}

                  {m.replyTo && (
  <div className="mb-2 p-2 rounded-md bg-white/10 border-l-4 border-green-400">
    <div className="text-xs font-semibold text-green-300">
      {m.replyTo.userName}
    </div>
    <div className="text-xs text-white/70">
      {m.replyTo.text?.slice(0, 40)}
    </div>
  </div>
)}

                    {m.type === "image" && (
                      <img src={m.file} className="rounded mb-1" />
                    )}

                    {m.text}

                    <div className="text-[10px] text-right opacity-60 mt-1">
                      {formatTime(m.createdAt)} {isMe && (m.seenBy?.length > 1 ? "✓✓" : "✓")}
                    </div>

                    {m.reactions && Object.keys(m.reactions).length > 0 && (
  <div className="flex gap-1 mt-1 text-xs">
    {Object.entries(m.reactions).map(([emoji, users]) => (
      users.length > 0 && (
        <span
          key={emoji}
          className="bg-black/20 px-2 py-[2px] rounded-full"
        >
          {emoji} {users.length}
        </span>
      )
    ))}
  </div>
)}

                  </div>

                  <div className="flex gap-2 text-xs mt-1 opacity-70">
                    <button onClick={() => react(m.id, "👍")}>👍</button>
                    <button onClick={() => react(m.id, "❤️")}>❤️</button>
                    <button onClick={() => setReplyingTo(m)}>Reply</button>

                    {isMe && (
                      <>
                        <button onClick={() => {
                          setEditing(m)
                          setText(m.text)
                        }}>Edit</button>
                        <button onClick={() => deleteDoc(doc(db,"teamMessages",m.id))}>
                          Delete
                        </button>
                      </>
                    )}
                  </div>

                </div>
              </div>
            )
          })}

          <div ref={bottomRef} />
        </div>

        {replyingTo && (
 <div className="px-3 py-2 border-t border-white/10 bg-blue-500/10 flex justify-between items-center text-xs">
  <div className="border-l-2 border-blue-400 pl-2">
    <span className="font-semibold text-blue-300">
      {replyingTo.userName}
    </span>
    <div className="text-white/70">
      {replyingTo.text?.slice(0, 40)}
    </div>
  </div>

  <button
    onClick={() => setReplyingTo(null)}
    className="text-white/60 hover:text-white"
  >
    ✕
  </button>
</div>
)}

        {/* INPUT */}
        <div className="p-2 border-t border-white/10 flex items-center gap-2">

          <button
            onClick={() => fileRef.current.click()}
            className="text-xl"
          >
            📎
          </button>

          <input
            ref={fileRef}
            type="file"
            onChange={(e)=>setFile(e.target.files[0])}
            className="hidden"
          />

          <input
            value={text}
            onChange={(e)=>setText(e.target.value)}
            placeholder="Message"
            className="flex-1 bg-[#1e293b] px-3 py-2 rounded-full outline-none"
          />

          <button
            onClick={sendMessage}
            className="text-xl"
          >
            ➤
          </button>

        </div>

      </div>
    </div>
  )
}