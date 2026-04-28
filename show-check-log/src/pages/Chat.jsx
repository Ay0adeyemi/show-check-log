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
  arrayUnion,
  arrayRemove,
  deleteDoc
} from "firebase/firestore"
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
  AlertTriangle
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Chat({ user }) {
  const [channels, setChannels] = useState([])
  const [activeChannel, setActiveChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [usersList, setUsersList] = useState([])
  const [text, setText] = useState("")
  const [file, setFile] = useState(null)
  const [replyingTo, setReplyingTo] = useState(null)
  const [viewer, setViewer] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [showMembers, setShowMembers] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newChannelName, setNewChannelName] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { id, type: 'message' | 'channel' }

  const bottomRef = useRef()
  const fileRef = useRef()
  const navigate = useNavigate()

  // 1. CHANNELS LISTENER
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "channels"), (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setChannels(docs)
    })
    return () => unsub()
  }, [])

  // 2. MESSAGES LISTENER (FIXED FOR SWITCHING)
  useEffect(() => {
    if (!activeChannel?.id) return

    // 🔥 FIX 1: Clear messages immediately when switching
    setMessages([])
bottomRef.current?.scrollIntoView() 

    const q = query(
  collection(db, "teamMessages"),
  where("channelId", "==", activeChannel.id),
  limit(100)
)

    const unsub = onSnapshot(q, (snap) => {
      const newMsgs = snap.docs
  .map(d => ({ id: d.id, ...d.data() }))
  .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))

setMessages(newMsgs)
      // 🔥 FIX 2: Ensure scroll happens after data arrives
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100)
    })

    return () => unsub() // Cleanup listener on switch
  }, [activeChannel?.id])

  useEffect(() => {
  if (!activeChannel && channels.length > 0) {
    setActiveChannel(channels[0])
  }
}, [channels, activeChannel])

  // 3. SEND MESSAGE (FIXED FOR IMMEDIATE VISIBILITY)
  const sendMessage = async (e) => {
    e?.preventDefault()
    if (!text.trim() && !file) return
    if (!isMember) return

    setUploading(true)
    const currentChannelId = activeChannel.id // Lock the ID

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
        channelId: currentChannelId,
        userId: user.uid,
        userName: user.displayName || user.email.split('@')[0],
        userPhoto: user.photoURL || null,
        createdAt: Date.now(),
        replyTo: replyingTo ? { text: replyingTo.text, userName: replyingTo.userName } : null
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

  const executeDelete = async () => {
    if (!deleteConfirm) return
    try {
      if (deleteConfirm.type === 'message') {
        await deleteDoc(doc(db, "teamMessages", deleteConfirm.id))

// 🔥 FORCE UI UPDATE
setMessages(prev => prev.filter(m => m.id !== deleteConfirm.id))
      } else {
        const deletedId = deleteConfirm.id

await deleteDoc(doc(db, "channels", deletedId))

// remove it from UI immediately
setChannels(prev => prev.filter(c => c.id !== deletedId))

// pick another channel
const remaining = channels.filter(c => c.id !== deletedId)

if (remaining.length > 0) {
  setActiveChannel(remaining[0])
} else {
  setActiveChannel(null)
  setMessages([])
}
      }
    } catch (err) { console.error(err) }
    setDeleteConfirm(null)
  }

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return
    const id = newChannelName.toLowerCase().replace(/\s+/g, '-')
    await setDoc(doc(db, "channels", id), {
      name: id,
      members: [user.uid],
      createdBy: user.uid,
     createdAt: Date.now(),
    })
    setNewChannelName(""); setShowCreateModal(false)
  }

  const joinChannel = async () => {
    await updateDoc(doc(db, "channels", activeChannel.id), { members: arrayUnion(user.uid) })
  }

  const leaveChannel = async () => {
  if (!activeChannel) return

  try {
    await updateDoc(doc(db, "channels", activeChannel.id), {
      members: arrayRemove(user.uid)
    })

    // remove from UI immediately
    setActiveChannel(null)
    setMessages([])

  } catch (err) {
    console.error(err)
  }
}

  const isMember = activeChannel?.members?.includes(user.uid)
  const theme = isDarkMode ? "bg-[#020617] text-white" : "bg-slate-50 text-slate-900"
  const sideTheme = isDarkMode ? "bg-[#0f172a] border-white/5" : "bg-white border-slate-200"

  return (
    <div className={`h-screen flex overflow-hidden ${theme}`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed lg:relative z-[100] w-72 h-full border-r transition-transform ${mobileMenu ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${sideTheme}`}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-black text-xl tracking-tighter">PRO<span className="text-blue-500">CHAT</span></h1>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Channels</span>
            <button onClick={() => setShowCreateModal(true)} className="text-blue-500"><Plus size={18}/></button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {channels.map(ch => (
              <div key={ch.id} onClick={() => { setActiveChannel(ch); setMobileMenu(false); }} className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeChannel?.id === ch.id ? "bg-blue-600 text-white shadow-lg" : "hover:bg-blue-500/5 text-slate-500"}`}>
                <span className="flex items-center gap-2 font-bold text-sm"><Hash size={16} /> {ch.name}</span>
                {ch.createdBy === user.uid && <Trash2 onClick={(e) => { e.stopPropagation(); setDeleteConfirm({id: ch.id, type: 'channel'}); }} size={14} className="opacity-0 group-hover:opacity-100 hover:text-rose-500"/>}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CHAT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>

  <div className="flex items-center gap-3">
    <button 
      onClick={() => navigate("/")}
      className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500"
    >
      <ArrowLeft size={20}/>
    </button>

    <button onClick={() => setMobileMenu(true)} className="lg:hidden text-blue-500">
      <Menu/>
    </button>

    <h2 className="font-black text-lg tracking-tight uppercase">
      #{activeChannel?.name}
    </h2>
  </div>

  {/* ✅ ADD THIS */}
  {isMember && (
    <button
      onClick={leaveChannel}
      className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition"
    >
      Leave
    </button>
  )}

</header>

        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((m) => {
              const isMe = m.userId === user.uid
              return (
                <div key={m.id} className={`flex items-start gap-3 group ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar name={m.userName} src={m.userPhoto} />
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>
                    <div className="text-[10px] font-black uppercase opacity-40 mb-1">{m.userName} • {formatTime(m.createdAt)}</div>
                    <div className={`relative px-4 py-3 rounded-2xl text-sm shadow-sm ${isMe ? "bg-blue-600 text-white rounded-tr-none" : isDarkMode ? "bg-slate-800 text-white rounded-tl-none" : "bg-white text-slate-800 border rounded-tl-none"}`}>
                      {m.replyTo && <div className="mb-2 p-2 rounded-lg text-xs bg-black/10 border-l-4 border-blue-400"><b>@{m.replyTo.userName}</b>: {m.replyTo.text}</div>}
                      <p>{m.text}</p>
                      {m.image && <img src={m.image} onClick={() => setViewer(m.image)} className="mt-2 rounded-xl max-h-64 cursor-pointer" />}
                      <div className={`absolute -top-4 ${isMe ? "right-0" : "left-0"} flex bg-slate-900 border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl`}>
                        <button onClick={() => setReplyingTo(m)} className="p-2 hover:text-blue-400"><Reply size={14}/></button>
                        {isMe && <button onClick={() => setDeleteConfirm({id: m.id, type: 'message'})} className="p-2 hover:text-rose-500"><Trash2 size={14}/></button>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* INPUT */}
        <footer className={`p-6 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
          {!isMember ? (
            <div className="text-center p-6 bg-blue-500/5 rounded-3xl border-2 border-dashed border-blue-500/20">
              <p className="text-sm font-bold opacity-60 mb-4">Join this channel to contribute</p>
              <button onClick={joinChannel} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black">Join Channel</button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {replyingTo && (
                <div className="mb-2 flex items-center justify-between p-3 bg-blue-500/10 border-l-4 border-blue-500 rounded-xl">
                  <div className="text-xs"><b>Replying to {replyingTo.userName}</b><p className="opacity-60 truncate">{replyingTo.text}</p></div>
                  <button onClick={() => setReplyingTo(null)}><X size={14}/></button>
                </div>
              )}
              <form onSubmit={sendMessage} className={`flex items-center gap-3 p-2 rounded-2xl border ${isDarkMode ? "bg-slate-900 border-white/10" : "bg-slate-100 border-slate-300"}`}>
                <button type="button" onClick={() => fileRef.current.click()} className="p-2 text-slate-400"><ImageIcon size={20}/></button>
                <input ref={fileRef} type="file" hidden onChange={(e) => setFile(e.target.files[0])} />
                <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())} placeholder="Type a message..." className="flex-1 bg-transparent outline-none text-sm font-bold py-2 resize-none" rows="1" />
                <button className="p-3 bg-blue-600 text-white rounded-xl shadow-lg"><Send size={20}/></button>
              </form>
            </div>
          )}
        </footer>
      </div>

      {/* 🔥 PREMIUM DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'} shadow-2xl`}>
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mb-6"><AlertTriangle size={32}/></div>
            <h3 className="text-2xl font-black mb-2 tracking-tighter">Delete {deleteConfirm.type === 'message' ? 'Message' : 'Channel'}?</h3>
            <p className="text-sm opacity-50 mb-8 font-medium leading-relaxed text-left">This action is permanent and cannot be undone. All associated data will be removed from the server.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 font-black text-xs uppercase opacity-50">Cancel</button>
              <button onClick={executeDelete} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-600/30">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CHANNEL MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[500] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#0f172a] border-white/10' : 'bg-white border-slate-200'}`}>
            <h3 className="text-2xl font-black mb-6 tracking-tighter">New Channel</h3>
            <input autoFocus value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} placeholder="Channel name..." className={`w-full p-4 rounded-2xl border outline-none mb-6 font-bold ${isDarkMode ? 'bg-slate-950 border-white/10' : 'bg-slate-50'}`} />
            <div className="flex gap-3">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-black text-xs uppercase opacity-50">Cancel</button>
              <button onClick={handleCreateChannel} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-600/30">Create</button>
            </div>
          </div>
        </div>
      )}

      {viewer && <div className="fixed inset-0 z-[600] bg-black/95 flex items-center justify-center p-4" onClick={() => setViewer(null)}><img src={viewer} className="max-h-full max-w-full rounded-2xl shadow-2xl animate-in zoom-in-95" /></div>}
    </div>
  )
}

function Avatar({ name, src }) {
  if (src) return <img src={src} className="w-10 h-10 rounded-xl object-cover border border-black/10" alt="" />
  return <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-xs text-white uppercase shadow-md">{(name || "?").slice(0, 2)}</div>
}

function formatTime(ts) {
  if (!ts) return "Just now"
  const d = ts?.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true })
}