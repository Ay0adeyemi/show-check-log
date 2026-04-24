import { useState, useEffect } from "react"
import { db } from "../firebase"
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query
} from "firebase/firestore"
import { 
  X, 
  Plus, 
  Trash2, 
  User, 
  Clock, 
  AlertCircle, 
  Megaphone,
  Pin
} from "lucide-react"

export default function NotesBoard({ user, onClose }) {
  const [notes, setNotes] = useState([])
  const [text, setText] = useState("")
  const [priority, setPriority] = useState("Low")
  const [noteToDelete, setNoteToDelete] = useState(null) // 🔥 State for custom modal

  // 🔥 LOAD NOTES WITH FIRESTORE QUERY
  useEffect(() => {
    const q = query(collection(db, "teamNotes"))
    const unsub = onSnapshot(q, (snap) => {
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => unsub()
  }, [])

  // Priority mapping for backend sorting
  const priorityMap = { High: 1, Medium: 2, Low: 3 }

  const addNote = async () => {
    if (!text.trim()) return
    await addDoc(collection(db, "teamNotes"), {
      text: text.trim(),
      priority,
      priorityLevel: priorityMap[priority],
      author: user?.displayName || user?.email.split('@')[0],
      authorId: user?.uid,
      createdAt: new Date().toISOString()
    })
    setText("")
  }

  // 🔥 CUSTOM DELETE LOGIC
  const confirmDelete = async () => {
    if (noteToDelete) {
      await deleteDoc(doc(db, "teamNotes", noteToDelete))
      setNoteToDelete(null)
    }
  }

  function formatTime(ts) {
    const date = new Date(ts)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-5xl sm:max-w-3xl md:max-w-4xl 
bg-[#0f172a] border border-white/10 
rounded-2xl sm:rounded-3xl 
shadow-2xl overflow-hidden flex flex-col 
max-h-[95vh] sm:max-h-[90vh]">
        
        {/* HEADER */}
        <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
              <Megaphone className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Team Announcements</h2>
              <p className="text-slate-400 text-sm">Internal updates and important reminders</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* INPUT SECTION */}
        <div className="p-4 sm:p-8 bg-slate-900/50">
          <div className="flex flex-col gap-4">
            <div className="relative group">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share something with the team..."
                rows="2"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none font-medium"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-white/5">
                {['Low', 'Medium', 'High'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      priority === p 
                      ? (p === 'High' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 
                         p === 'Medium' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 
                         'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20')
                      : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                onClick={addNote}
                disabled={!text.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 
                         bg-blue-600 hover:bg-blue-500 
                         disabled:bg-slate-800 text-white 
                           px-6 py-3 rounded-xl font-bold 
                           transition-all active:scale-95 shadow-lg shadow-blue-600/20"
              >
                <Plus size={20} />
                Post Note
              </button>
            </div>
          </div>
        </div>

        {/* NOTES LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {notes.map((note) => {
              const styles = {
                High: "border-t-rose-500 bg-rose-500/5",
                Medium: "border-t-amber-500 bg-amber-500/5",
                Low: "border-t-emerald-500 bg-emerald-500/5"
              }
              const accent = {
                High: "text-rose-500",
                Medium: "text-amber-500",
                Low: "text-emerald-500"
              }

              return (
                <div
                  key={note.id}
                  className={`relative group flex flex-col justify-between border border-white/5 border-t-4 rounded-2xl p-4 sm:p-6 shadow-xl transition-all hover:-translate-y-1 hover:bg-slate-800/40 ${styles[note.priority]}`}
                >
                  <div className="absolute -top-3 -left-2 bg-slate-900 border border-white/10 p-1.5 rounded-lg shadow-xl">
                    <Pin size={14} className={accent[note.priority]} />
                  </div>

                  {/* 🔥 UPDATED DELETE TRIGGER */}
                  <button
                    onClick={() => setNoteToDelete(note.id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-rose-500/20 text-rose-500 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="mt-2">
                    <div className={`text-[10px] uppercase font-black tracking-widest mb-3 ${accent[note.priority]}`}>
                      {note.priority} Priority
                    </div>
                    <p className="text-slate-200 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                      {note.text}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <User size={12} className="text-blue-400" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 truncate max-w-[120px] sm:max-w-[80px]">
                        {note.author}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock size={12} />
                      <span className="text-[10px] font-medium">{formatTime(note.createdAt)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {notes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <AlertCircle size={48} className="mb-4 opacity-20" />
              <p className="font-medium">No announcements posted yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* 🔥 CUSTOM DELETE CONFIRMATION MODAL */}
      {noteToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-2">Remove Note?</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              This will permanently delete this announcement for the entire team.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setNoteToDelete(null)}
                className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl font-bold transition-all border border-white/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-rose-600/20 transition-all active:scale-95"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}