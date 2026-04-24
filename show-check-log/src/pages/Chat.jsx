import { useEffect, useRef, useState } from "react"
import {
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  doc,
  updateDoc,
  limit,
  where,
  setDoc,
  arrayUnion
} from "firebase/firestore"
import { arrayRemove } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "../firebase" 
import { 
  Send, 
  Image as ImageIcon, 
  Reply, 
  Trash2, 
  X,
  ArrowLeft,
  Sun,
  Moon,
  Hash,
  Users,
  Plus,
  Lock,
  Menu,
  ShieldCheck,
  Clock
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Chat({ user }) {
  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [usersList, setUsersList] = useState([]) // For right sidebar
  const [text, setText] = useState("")
  const [file, setFile] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [viewer, setViewer] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showMembers, setShowMembers] = useState(true)
  const [mobileMenu, setMobileMenu] = useState(false)
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")

  const bottomRef = useRef()
  const fileRef = useRef()
  const navigate = useNavigate()

  // 1. LISTEN FOR ALL CHANNELS
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "channels"), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setChannels(docs)
      if (!activeChannel && docs.length > 0) setActiveChannel(docs[0])
    })
    return () => unsub()
  }, [])

  // 2. LISTEN FOR ALL USERS (Presence)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "onlineUsers"), (snap) => {
      setUsersList(snap.docs.map(d => ({ uid: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  // 3. LISTEN FOR MESSAGES
  useEffect(() => {
    if (!activeChannel) return
    const q = query(
      collection(db, "teamMessages"), 
      where("channelId", "==", activeChannel.id),
      orderBy("createdAt", "asc"), 
      limit(100)
    )
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [activeChannel])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleCreateChannel = async () => {
  if (!newChannelName.trim()) return

  try {
    const id = newChannelName.toLowerCase().replace(/\s+/g, '-')

    const channelRef = doc(db, "channels", id)

    await setDoc(channelRef, {
      name: id,
      members: [user.uid],
      createdBy: user.uid,
      createdAt: serverTimestamp()
    })

    // 🔥 AUTO SWITCH TO NEW CHANNEL
    setActiveChannel({
      id,
      name: id,
      members: [user.uid]
    })

    setNewChannelName("")
    setShowCreateModal(false)

  } catch (err) {
    console.error("Create channel failed:", err)
  }
}

  const [joining, setJoining] = useState(false)

const joinChannel = async () => {
  if (!activeChannel) return

  setJoining(true)

  try {
    const channelRef = doc(db, "channels", activeChannel.id)

    await updateDoc(channelRef, {
      members: arrayUnion(user.uid)
    })

  } catch (err) {
    console.error("Join failed:", err)
  } finally {
    setJoining(false)
  }
}

const leaveChannel = async () => {
  if (!activeChannel) return

  try {
    const channelRef = doc(db, "channels", activeChannel.id)

    await updateDoc(channelRef, {
      members: arrayRemove(user.uid)
    })

  } catch (err) {
    console.error("Leave failed:", err)
  }
}

 const sendMessage = async (e) => {
  e?.preventDefault()

  // 🚨 BLOCK NON-MEMBERS
  if (!isMember) return

  if (!text.trim() && !file) return

  setUploading(true)

  try {
    let imageUrl = ""

    if (file) {
      const storageRef = ref(storage, `chats/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      imageUrl = await getDownloadURL(snapshot.ref)
    }

    await addDoc(collection(db, "teamMessages"), {
      text: text.trim(),
      image: imageUrl,
      channelId: activeChannel.id,
      userId: user.uid,
      userName: user.displayName || user.email.split('@')[0],
      userPhoto: user.photoURL || null,
      createdAt: serverTimestamp(),
      replyTo: replyingTo
        ? { text: replyingTo.text, userName: replyingTo.userName }
        : null,
      reactions: {},
      deleted: false
    })

    setText("")
    setFile(null)
    setReplyingTo(null)

  } catch (err) {
    console.error(err)
  } finally {
    setUploading(false)
  }
}

  const isMember = activeChannel?.members?.includes(user.uid)
  const channelMembers = usersList.filter(u => activeChannel?.members?.includes(u.uid))

  const bgMain = isDarkMode ? "bg-[#020617]" : "bg-[#f1f5f9]" 
  const bgSide = isDarkMode ? "bg-[#0f172a]" : "bg-white"
  const border = isDarkMode ? "border-white/5" : "border-slate-300"
  const textPrimary = isDarkMode ? "text-white" : "text-slate-900"

  return (
    <div className={`h-screen flex overflow-hidden transition-colors duration-500 ${bgMain} ${textPrimary}`}>
      
      {/* 🟢 CHANNELS SIDEBAR */}
      <aside className={`${mobileMenu ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-[150] flex flex-col w-72 h-full border-r transition-transform duration-300 ${bgSide} ${border}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-black text-xl tracking-tighter">PRO<span className="text-blue-500">CHAT</span></h1>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl hover:bg-blue-500/10 transition-all">
              {isDarkMode ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18} className="text-blue-600"/>}
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-4 px-2">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Channels</p>
            <button onClick={() => setShowCreateModal(true)} className="p-1 hover:bg-blue-500/20 rounded-md text-blue-500"><Plus size={16}/></button>
          </div>

          <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            {channels.map(ch => (
              <button 
                key={ch.id}
                onClick={() => { setActiveChannel(ch); setMobileMenu(false); }}
                className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all font-bold text-sm ${activeChannel?.id === ch.id ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-blue-500/10 hover:text-blue-500"}`}
              >
                <span className="flex items-center gap-2"><Hash size={16}/> {ch.name}</span>
                {!ch.members?.includes(user.uid) && <Lock size={12} className="opacity-40" />}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 🔵 CHAT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`px-6 py-4 border-b flex items-center justify-between backdrop-blur-md ${border} ${isDarkMode ? "bg-[#020617]/80" : "bg-white/80"}`}>
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenu(true)} className="lg:hidden p-2 bg-blue-500/10 rounded-lg text-blue-500"><Menu size={20}/></button>
            <button onClick={() => navigate("/")} className=" p-2 hover:bg-slate-500/10 rounded-full"><ArrowLeft size={20}/></button>
            <div>
              <h2 className="font-bold text-lg flex items-center gap-2 uppercase tracking-tight">
                <Hash className="text-blue-500" size={20}/> {activeChannel?.name}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">

  {/* 👇 LEAVE BUTTON */}
  {isMember && (
    <button
      onClick={leaveChannel}
      className="px-3 py-2 text-xs font-bold rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition"
    >
      Leave
    </button>
  )}

  {/* 👇 USERS BUTTON */}
  <button 
    onClick={() => setShowMembers(!showMembers)} 
    className={`p-2 rounded-lg border ${border} ${showMembers ? "text-blue-500 border-blue-500" : ""}`}
  >
    <Users size={18}/>
  </button>

</div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto space-y-6">
            {messages.map((m) => {
              const isMe = m.userId === user.uid
              return (
                <div key={m.id} className={`flex items-start gap-3 group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar name={m.userName} src={m.userPhoto} />
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[85%] sm:max-w-[70%]`}>
                    <span className="text-[10px] font-black uppercase opacity-40 mb-1 px-1">{m.userName} • {formatTime(m.createdAt)}</span>
                    <div className={`relative px-4 py-3 rounded-2xl text-sm font-semibold shadow-sm ${isMe ? "bg-blue-600 text-white rounded-tr-none" : isDarkMode ? "bg-slate-800 text-slate-100 border border-white/5 rounded-tl-none" : "bg-white text-slate-800 border border-slate-300 rounded-tl-none"}`}>
                      <p>{m.text}</p>
                      {m.image && <img src={m.image} onClick={() => setViewer(m.image)} className="mt-3 rounded-xl max-h-80 border border-black/10 cursor-pointer shadow-md" />}
                      {isMe && <button onClick={() => deleteMessage(m.id)} className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        <footer className={`p-6 border-t ${border} ${isDarkMode ? "bg-[#020617]" : "bg-white"}`}>
          <div className="max-w-4xl mx-auto">
            {!isMember ? (
              <div className="flex flex-col items-center gap-4 py-6 border-2 border-dashed border-blue-500/30 rounded-3xl bg-blue-500/5">
                <ShieldCheck size={40} className="text-blue-500 opacity-50" />
                <p className="text-sm font-bold opacity-60">Join this channel to start chatting</p>
                <button
  onClick={joinChannel}
  disabled={joining}
  className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
>
  {joining ? "Joining..." : `Join #${activeChannel?.name}`}
</button>
              </div>
            ) : (
              <form onSubmit={sendMessage} className={`flex items-center gap-3 p-2 rounded-2xl border ${isDarkMode ? "bg-slate-900 border-white/10" : "bg-slate-100 border-slate-300 shadow-inner"}`}>
                <button type="button" onClick={() => fileRef.current.click()} className="p-3 text-slate-400 hover:text-blue-500"><ImageIcon size={20}/></button>
                <input ref={fileRef} type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
                <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder={`Message #${activeChannel?.name}`} className="flex-1 bg-transparent outline-none text-sm font-bold py-2 resize-none" rows="1" />
                <button className="p-3 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><Send size={20} /></button>
              </form>
            )}
          </div>
        </footer>
      </div>

      {/* 🔴 MEMBERS SIDEBAR */}
      {showMembers && (
        <div className="fixed inset-0 z-[200] flex">
          <div 
  onClick={() => setShowMembers(false)}
  className="flex-1 bg-black/50 backdrop-blur-sm"
/>
        <aside className={`ml-auto w-[85%] sm:w-80 h-full flex flex-col border-l ${bgSide} ${border}`}>
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40">
    Channel Members ({channelMembers.length})
  </h3>

  <button 
    onClick={() => setShowMembers(false)}
    className="p-2 rounded-lg hover:bg-white/10"
  >
    <X size={16}/>
  </button>

</div>
            <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar">
              {channelMembers.map(u => {
                const isActive = u.lastActive && (Date.now() - u.lastActive < 120000)
                return (
                  <div key={u.uid} className={`flex items-center justify-between p-3 rounded-2xl border ${border} ${isDarkMode ? "bg-white/5" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white uppercase">{(u.name || u.email).slice(0, 2)}</div>
                        <div
  className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 
  ${isDarkMode ? "border-[#0f172a]" : "border-white"} 
  ${
    isActive
      ? "bg-emerald-500"     // 🟢 online
      : u.lastActive
        ? "bg-yellow-500"    // 🟡 last seen
        : "bg-slate-500"     // ⚪ offline
  }`}
/>
                      </div>
                      <div>
                        <p className="text-[11px] font-black truncate max-w-[100px]">{u.name || u.email?.split('@')[0]}</p>
                        <p className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                           <Clock size={10} className="opacity-60" />
                           {isActive ? "Online now" : u.lastActive ? `Last seen ${formatTime(u.lastActive)}` : "Offline"}
                         </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>
        </div>
      )}

      {/* 🔥 CREATE CHANNEL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] border shadow-2xl ${isDarkMode ? "bg-[#0f172a] border-white/10" : "bg-white border-slate-200"}`}>
            <h3 className="text-2xl font-black mb-2 tracking-tighter">Create Channel</h3>
            <p className="text-sm opacity-50 mb-6 font-medium">Add a new workspace for your team.</p>
            <input autoFocus type="text" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} placeholder="e.g. night-shift" className={`w-full p-4 rounded-2xl border outline-none mb-6 font-bold ${isDarkMode ? "bg-slate-950 border-white/10" : "bg-slate-50 border-slate-200"}`} />
            <div className="flex gap-3">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-bold opacity-50">Cancel</button>
              <button onClick={handleCreateChannel} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-all">Create</button>
            </div>
          </div>
        </div>
      )}

      {viewer && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4" onClick={() => setViewer(null)}>
          <img src={viewer} className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain animate-in zoom-in-95" />
        </div>
      )}
    </div>
  )
}

function Avatar({ name, src }) {
  if (src) return <img src={src} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-black/10" alt="" />
  return <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-xs text-white uppercase">{name?.slice(0, 2)}</div>
}

function formatTime(ts) {
  if (!ts) return ""
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDate(ts) {
  if (!ts) return ""
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return "Today"
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}