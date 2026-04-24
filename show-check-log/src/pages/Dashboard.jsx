import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ShowList from "../components/ShowList"
import ReminderModal from "../components/ReminderModal"
import ReminderList from "../components/ReminderList"
import TaskForm from "../components/TaskForm"
import PriorityLegend from "../components/PriorityLegend"
import PromoDrawer from "../components/PromoDrawer"
import Sidebar from "../components/Sidebar"
import toast from "react-hot-toast"
import { Toaster } from "react-hot-toast"
import { 
  Search, 
  X, 
  MessageCircle, 
  Plus, 
  ArrowLeft, 
  Filter, 
  LayoutDashboard 
} from "lucide-react"
import DashboardHero from "../components/DashboardHero"
import AnalyticsCanvas from "../components/AnalyticsCanvas"
import OnlineUsersPanel from "../components/OnlineUsersPanel"
import NotesBoard from "../components/NotesBoard"
import Faq from "../components/Faq"
import { db, auth } from "../firebase"
import { signOut } from "firebase/auth"
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "firebase/firestore"

export default function Dashboard({ user, theme, toggleTheme }) {
  const navigate = useNavigate()
  const dashboardRef = useRef(null)
  
  const [shows, setShows] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [reminders, setReminders] = useState([])
  const [reminderOpen, setReminderOpen] = useState(false)
  const [showReminderList, setShowReminderList] = useState(false)
  const [promoOpen, setPromoOpen] = useState(false)
  const [legendOpen, setLegendOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notesCount, setNotesCount] = useState(0)
  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [notesOpen, setNotesOpen] = useState(true)
  const [faqOpen, setFaqOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const playSound = () => {
    const audio = new Audio("/notification.mp3")
    audio.volume = 0.5
    audio.play().catch(() => {}) 
  }

  // --- FIREBASE EFFECTS ---
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "teamNotes"), (snap) => setNotesCount(snap.size))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user?.uid) return
    const unsub = onSnapshot(collection(db, "teamMessages"), (snap) => {
      const unread = snap.docs.filter(doc => !doc.data().seenBy?.includes(user.uid))
      setUnreadCount(unread.length)
    })
    return () => unsub()
  }, [user?.uid])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "shows"), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setShows(data)
    })
    return () => unsub()
  }, [])

  // --- CRUD FUNCTIONS (FIXED & RESTORED) ---
  
  const addShow = async(task)=>{
    const showRef = await addDoc(collection(db,"shows"),{
      name:task.name, link:task.link, note:task.note, priority:task.priority,
      checks:[], createdAt:Date.now()
    })
    await addDoc(collection(db,"teamNotes"),{
      text:`📺 New show added: ${task.name}`, priority:task.priority,
      author:user?.displayName || user?.email, createdAt:new Date().toISOString()
    })
    toast.success("Show added"); playSound(); setShowForm(false)
  }

  const deleteShows = async(showId)=>{ 
    await deleteDoc(doc(db,"shows",showId))
    toast.success("Show deleted")
    playSound() 
  }

 const addCheck = async (showId, check) => {
  const show = shows.find(s => s.id === showId)
  if (!show) return

  const newCheck = {
    id: Date.now(),


    startDate: check.startDate,
    endDate: check.endDate,

    checkedAt: Date.now(),

    userId: user.uid,
    userName: user.displayName || user.email,

    notes: check.notes || []
  }

  await updateDoc(doc(db, "shows", showId), {
    checks: [...(show.checks || []), newCheck]
  })
}

  // 🔥 RESTORED MISSING FUNCTIONS
  const deleteCheck = async(showId, checkId) => {
    const show = shows.find(s => s.id === showId)
    if(!show) return
    const filtered = (show.checks || []).filter(c => c.id !== checkId)
    await updateDoc(doc(db, "shows", showId), { checks: filtered })
  }

  const updateCheck = async(showId, updatedCheck) => {
    const show = shows.find(s => s.id === showId)
    if(!show) return
    const updated = (show.checks || []).map(c => c.id === updatedCheck.id ? updatedCheck : c)
    await updateDoc(doc(db, "shows", showId), { checks: updated })
  }

  const deleteNote = async (showId, checkId, noteId) => {
    const show = shows.find(s => s.id === showId)
    if (!show) return
    const updatedChecks = (show.checks || []).map(check => {
      if (check.id !== checkId) return check
      return { ...check, notes: (check.notes || []).filter(n => n.id !== noteId) }
    })
    await updateDoc(doc(db, "shows", showId), { checks: updatedChecks })
  }

  const saveReminder = async({daysFrom,daysTo})=>{
    await addDoc(collection(db,"users",user.uid,"reminders"),{ daysFrom, daysTo, createdAt:Date.now() })
    toast.success("Reminder added"); playSound(); setReminderOpen(false)
  }

  const deleteReminder = async(id)=>{ await deleteDoc(doc(db,"users",user.uid,"reminders",id)) }

  const runSearch = () => setSearchQuery(searchInput)

  const filteredShows = shows.filter(show => {
    if(searchQuery){
      const text = searchQuery.toLowerCase()
      if(!show.name?.toLowerCase().includes(text) && !show.note?.toLowerCase().includes(text)) return false
    }
    if(priorityFilter !== "All" && show.priority !== priorityFilter) return false
    if(statusFilter !== "All"){
      const checks = show.checks || []
      const latest = checks[checks.length - 1]
      if(statusFilter === "Checked Today"){
        if(!latest) return false
        const d = new Date(latest.checkedAt), today = new Date()
        if(!(d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate())) return false
      }
      if(statusFilter === "Overdue"){
        if(!latest) return true
        const d = new Date(latest.checkedAt), today = new Date()
        if(d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()) return false
      }
    }
    return true
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-200 dark:bg-[#020617] transition-colors duration-300">
      <Toaster position="top-right" />
      
      <Navbar username={user?.displayName || user?.email} onLogout={() => signOut(auth)} theme={theme} toggleTheme={toggleTheme} />
      <OnlineUsersPanel />
      <Sidebar 
        open={sidebarOpen} setOpen={setSidebarOpen} remindersCount={reminders.length} notesCount={notesCount}
        onOpenReminder={() => setReminderOpen(true)} onOpenReminderList={() => setShowReminderList(!showReminderList)}
        onOpenPromo={() => setPromoOpen(true)} onToggleLegend={() => setLegendOpen(!legendOpen)}
        onOpenAnalytics={() => setAnalyticsOpen(true)} onOpenNotes={() => setNotesOpen(true)}
        onOpenFaq={() => setFaqOpen(true)}
      />

      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"} p-4 lg:p-8`}>
        <div className="max-w-[1400px] mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/")} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 hover:scale-110 transition-all shadow-sm group">
                <ArrowLeft size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-blue-500" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <LayoutDashboard className="text-blue-500" size={24} />
                  Live Dashboard
                </h1>
                <p className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">Manage your shows and team checks in real-time</p>
              </div>
            </div>
            <button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5">
              <Plus size={18} /> Add New Show
            </button>
          </div>

          <DashboardHero user={user} shows={shows} />

          {/* SEARCH & FILTER SECTION */}
<section className="bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-white/5 p-4 md:p-6 rounded-3xl shadow-sm backdrop-blur-sm">
  <div className="flex flex-col xl:flex-row gap-4 items-center">
    
    {/* Search Input - Full width on mobile */}
    <div className="relative w-full xl:flex-1 group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
      <input
        type="text" 
        placeholder="Search by show name or notes..." 
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && runSearch()}
        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all dark:text-white text-sm sm:text-base"
      />
      {searchInput && (
        <button 
          onClick={() => {setSearchInput(""); setSearchQuery("")}} 
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
        >
          <X size={18} />
        </button>
      )}
    </div>

    {/* Dropdowns Container - Stacks on mobile, side-by-side on tablet/desktop */}
    <div className="flex flex-row items-center gap-3 w-full xl:w-auto">
      
      {/* Priority Filter */}
      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 px-3 rounded-2xl w-full sm:w-auto">
        <Filter size={16} className="text-slate-400" />
        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)} 
          className="flex-1 sm:flex-none bg-transparent py-3.5 pr-4 text-sm outline-none font-medium dark:text-slate-300 cursor-pointer"
        >
          <option value="All">All Priorities</option>
          <option value="High">🔴 High</option>
          <option value="Medium">🟠 Medium</option>
          <option value="Low">🟢 Low</option>
        </select>
      </div>

      {/* Status Filter */}
      <select 
  value={statusFilter} 
  onChange={(e) => setStatusFilter(e.target.value)} 
  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-white/10 px-4 py-3 rounded-xl text-sm outline-none font-medium dark:text-slate-300 cursor-pointer"
>
        <option value="All">All Status</option>
        <option value="Checked Today">✅ Checked Today</option>
        <option value="Overdue">⚠️ Overdue</option>
      </select>
    </div>

  </div>
</section>

          {legendOpen && <PriorityLegend />}
          {showReminderList && <ReminderList reminders={reminders} onDelete={deleteReminder} />}

          <div className="pb-24">
            <ShowList
              user={user}
              shows={filteredShows}
              onAddCheck={addCheck}
              onDeleteCheck={deleteCheck}
              onUpdateCheck={updateCheck}
              onDeleteShows={deleteShows}
              onDeleteNote={deleteNote}
            />
          </div>
        </div>
      </main>

      {showForm && <TaskForm onAdd={addShow} onClose={() => setShowForm(false)} />}
      {reminderOpen && <ReminderModal onSave={saveReminder} onClose={() => setReminderOpen(false)} />}
      <PromoDrawer open={promoOpen} onClose={() => setPromoOpen(false)} user={user} />
      <AnalyticsCanvas open={analyticsOpen} onClose={() => setAnalyticsOpen(false)} shows={shows} />
      {notesOpen && <NotesBoard user={user} onClose={() => setNotesOpen(false)} />}
      {faqOpen && <Faq onClose={() => setFaqOpen(false)} />}

      <button
        onClick={() => navigate("/chat")}
        className="fixed bottom-8 right-8 z-50 group flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-4 py-4 rounded-full shadow-2xl shadow-blue-600/40 transition-all hover:scale-105"
      >
        <div className="relative">
          <MessageCircle size={22} />
          
        </div>
        
      </button>

      <Footer onOpenFaq={() => setFaqOpen(true)} />
    </div>
  )
}