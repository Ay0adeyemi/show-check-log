import { useState, useEffect } from "react"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../firebase"
import { useNavigate } from "react-router-dom"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { updateProfile } from "firebase/auth"
import { storage, auth } from "../firebase"
import { 
  MessageCircle, 
  BookOpen, 
  Megaphone, 
  ClipboardList, 
  Sun, 
  Moon, 
  ChevronRight,
  LogOut,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Plus,
  LayoutDashboard
} from "lucide-react"
import stubhubLogo from "../assets/stubhub.png"

export default function Home({ user, theme, toggleTheme, onLogout, onOpenNotes, shows = [] }) {
  const navigate = useNavigate()
  const [usersList, setUsersList] = useState([])
  const [showOnlineModal, setShowOnlineModal] = useState(false)

  // 🔥 1. LIVE USERS LISTENER
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "onlineUsers"), (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setUsersList(data)
    })
    return () => unsub()
  }, [])

  function getTimeAgo(timestamp) {
    if (!timestamp) return "Never"
    const now = Date.now()
    const diffInSeconds = Math.floor((now - timestamp) / 1000)
    if (diffInSeconds < 60) return "Just now"
    const minutes = Math.floor(diffInSeconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const now = Date.now()
  const ONLINE_THRESHOLD = 2 * 60 * 1000
  const onlineCount = usersList.filter(u => u.lastActive && (now - u.lastActive < ONLINE_THRESHOLD)).length
  
  const userShows = shows
  const totalShows = userShows.length
  
  const checkedToday = userShows.reduce((count, show) => {
    const today = new Date()
    const hasCheckedToday = show.checks?.some(check => {
      if (!check.userId || check.userId !== user.uid) return false
      const d = new Date(check.checkedAt)
      return d.toDateString() === today.toDateString()
    })
    return count + (hasCheckedToday ? 1 : 0)
  }, 0)

  const overdueCount = userShows.reduce((count, show) => {
    const latestUserCheck = show.checks?.filter(c => c.userId === user.uid).sort((a, b) => b.checkedAt - a.checkedAt)[0]
    if (!latestUserCheck) return count + 1 
    const lastCheck = new Date(latestUserCheck.checkedAt)
    const isToday = lastCheck.toDateString() === new Date().toDateString()
    return count + (isToday ? 0 : 1)
  }, 0)

  const completionRate = totalShows > 0 ? Math.round((checkedToday / totalShows) * 100) : 0
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening"
  const dateStr = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const userImage = user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`

  const bgColor = theme === "dark" ? "bg-[#020617]" : "bg-gray-50"
  const isDark = theme === "dark"
  const textColor = theme === "dark" ? "text-white" : "text-slate-900"
  const navBg = theme === "dark" ? "bg-[#020617]/70 border-white/5" : "bg-white/70 border-gray-200"
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const storageRef = ref(storage, `avatars/${auth.currentUser.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      await updateProfile(auth.currentUser, { photoURL: url })
      window.location.reload()
    } catch (err) {
      console.error("Upload failed:", err)
    }
  }

  const getInitials = (name, email) => {
    const str = name || email || "User";
    return str.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const [clockInTime, setClockInTime] = useState(null);
const [sessionDuration, setSessionDuration] = useState("00:00:00");
const [shiftStats, setShiftStats] = useState({ checks: 0, notes: 0 });

useEffect(() => {
  const saved = localStorage.getItem("clockInTime")
  if (saved) {
    setClockInTime(Number(saved))
  }
}, [])
// 🕒 Timer Logic
useEffect(() => {
  let interval;
  if (clockInTime) {
    interval = setInterval(() => {
      const diff = Date.now() - clockInTime;
      const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setSessionDuration(`${hours}:${mins}:${secs}`);
    }, 1000);
  }
  return () => clearInterval(interval);
}, [clockInTime]);

  return (
    <div className={`min-h-screen transition-colors duration-500 ${bgColor} ${textColor}`}>
      <nav className={`sticky top-0 z-50 backdrop-blur-xl border-b px-4 md:px-8 py-3 transition-all ${navBg}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-11 md:h-11 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <ClipboardList className="text-white" size={22} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg md:text-xl uppercase tracking-tighter">Pro<span className="text-indigo-500">Check</span></span>
              <span className="text-[9px] uppercase tracking-[0.2em] opacity-50 font-bold hidden md:block">Operations Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={toggleTheme} className={`p-2.5 rounded-xl border transition-all ${theme === "dark" ? "bg-slate-800/50 border-white/10 text-yellow-400" : "bg-white border-gray-200 text-indigo-600 shadow-sm"}`}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="h-8 w-[1px] mx-1 md:mx-2 bg-slate-200 dark:bg-white/10" />
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-black uppercase tracking-wide leading-none">{user?.displayName || user?.email?.split('@')[0]}</span>
                <button onClick={onLogout} className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1 group">
                  <div className="bg-rose-500/10 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white transition-all">
                    <LogOut size={10} /> <span className="uppercase">Sign Out</span>
                  </div>
                </button>
              </div>
              <div className="relative group">
                <label className="cursor-pointer block relative">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 border-indigo-500 object-cover shadow-md" alt="Avatar" />
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 border-indigo-500 bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm">{getInitials(user?.displayName, user?.email)}</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Plus size={16} className="text-white" /></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <header className="relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 bg-[#1e1b4b] text-white shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
               <img src={userImage} className="hidden sm:block w-24 h-24 rounded-3xl border-4 border-white/10 shadow-2xl object-cover" />
               <div className="space-y-2">
                 <span className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-[0.2em]">Operational Hub</span>
                 <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-2">{greeting}, {user?.displayName || user?.email?.split('@')[0]}</h1>
                 <p className="text-indigo-200/70 font-medium text-lg italic">{dateStr}</p>
               </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] flex items-center gap-6">
              <div className="relative flex items-center justify-center">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-white/10" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * completionRate) / 100} className="text-indigo-400 transition-all duration-1000 ease-out" />
                </svg>
                <span className="absolute text-sm font-black">{completionRate}%</span>
              </div>
              <div className="block text-center sm:text-left">
                <p className="text-[10px] font-black uppercase tracking-tighter text-indigo-300">My Productivity</p>
                <p className="text-sm font-bold">Daily Goal</p>
                <p className="text-xs opacity-60">{checkedToday} of {totalShows} personal logs</p>
              </div>
            </div>
          </div>
        </header>
        
        <div className={`p-6 rounded-[2rem] border transition-all duration-500 flex items-center justify-between ${
  clockInTime 
    ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
    : isDark ? "bg-slate-900/50 border-white/5" : "bg-white border-slate-200"
}`}>
  <div className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
      clockInTime ? "bg-emerald-500 text-white animate-pulse" : "bg-slate-500/10 text-slate-500"
    }`}>
      <Clock size={24} />
    </div>
    <div>
      <p className="text-[10px] uppercase font-black tracking-widest opacity-50">Active Session</p>
      <h3 className="text-2xl font-black font-mono tracking-tight">{sessionDuration}</h3>
    </div>
  </div>

  <button 
    onClick={() => {
  if (clockInTime) {
    localStorage.removeItem("clockInTime")
    setClockInTime(null)
    setSessionDuration("00:00:00")
  } else {
    const now = Date.now()
    localStorage.setItem("clockInTime", now)
    setClockInTime(now)
  }
}}
    className={`px-8 py-3 rounded-xl font-bold transition-all active:scale-95 ${
      clockInTime 
        ? "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white" 
        : "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
    }`}
  >
    {clockInTime ? "Clock Out" : "Clock In"}
  </button>
</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatItem icon={<ClipboardList size={20}/>} label="Total Shows" value={totalShows} color="blue" theme={theme} />
          <StatItem icon={<CheckCircle2 size={20}/>} label="My Checked Shows" value={checkedToday} color="emerald" theme={theme} />
          <StatItem icon={<AlertCircle size={20}/>} label="My Overdue Checks" value={overdueCount} color="rose" theme={theme} />
          <div onClick={() => setShowOnlineModal(true)} className="cursor-pointer group">
            <StatItem icon={<Users size={20}/>} label="Teammates Online" value={onlineCount} color="indigo" theme={theme} />
          </div>
        </div>

        {/* 🔥 NAVIGATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Internal Tools */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <PremiumCard 
              icon={<ClipboardList />} 
              title="Check Log" 
              desc="Track assigned shows and execute real-time operational logs." 
              color="blue" 
              theme={theme} 
              onClick={() => navigate("/dashboard")} 
            />
            <PremiumCard 
              icon={<BookOpen />} 
              title="User Guide" 
              desc="Master the system workflow with comprehensive protocols." 
              color="emerald" 
              theme={theme} 
              onClick={() => navigate("/guide")} 
            />
            
            {/* STUBHUB PRO EXTERNAL CARD */}
            <PremiumCard 
              icon={<img src={stubhubLogo} className="w-10 h-auto grayscale group-hover:grayscale-0 transition-all" alt="StubHub" />} 
              title="StubHub Pro" 
              desc="Execute advanced seat mapping and inventory pricing." 
              color="indigo" 
              theme={theme} 
              onClick={() => window.open("https://pro.stubhub.com/inventory", "_blank")} 
            />

            {/* SEATPOINTER EXTERNAL CARD */}
            <PremiumCard 
              icon={<LayoutDashboard />} 
              title="SeatPointer" 
              desc="Execute customer ticket fulfillment and manage ticket distribution." 
              color="blue" 
              theme={theme} 
              onClick={() => window.open("https://seatpointer.com/myhub", "_blank")} 
            />

            <div className="md:col-span-2">
              <PremiumCard 
                icon={<MessageCircle />} 
                title="Team Chat" 
                desc="Instant communication for seamless team synchronization." 
                color="indigo" 
                fullWidth 
                theme={theme} 
                onClick={() => navigate("/chat")} 
              />
            </div>
          </div>

          {/* ANNOUNCEMENTS */}
          <div onClick={onOpenNotes} className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl hover:-translate-y-2 transition-all duration-300">
            <div className="relative z-10 flex flex-col h-full">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Megaphone size={28} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Announcements</h2>
              <p className="text-indigo-100/70 text-sm mb-8 leading-relaxed">View critical team updates and broadcasted reminders.</p>
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest bg-black/20 px-4 py-2 rounded-lg">Open Board</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Online Modal */}
      {showOnlineModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowOnlineModal(false)} />
          <div className={`relative w-full max-w-xs rounded-2xl border shadow-2xl overflow-hidden ${theme === "dark" ? "bg-[#0f172a] border-white/10" : "bg-white border-gray-200"}`}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50 text-white">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Recently Active</span>
              <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">{onlineCount} online</div>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {usersList.length > 0 ? (
                usersList.sort((a,b) => (b.lastActive || 0) - (a.lastActive || 0)).map((u) => {
                  const isActive = u.lastActive && (Date.now() - u.lastActive < 120000)
                  return (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">{(u.name || u.email || "?").slice(0, 1)}</div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${theme === 'dark' ? 'border-[#0f172a]' : 'border-white'} ${isActive ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                        </div>
                        <p className="text-sm font-bold truncate max-w-[120px] dark:text-white">{u.name || u.email?.split('@')[0]}</p>
                      </div>
                      <span className={`text-[10px] font-medium ${isActive ? 'text-emerald-500' : 'opacity-40 dark:text-slate-400'}`}>{isActive ? "Online now" : u.lastActive ? getTimeAgo(u.lastActive) : "Offline"}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-6 text-[10px] opacity-40 uppercase font-bold tracking-widest">No users detected</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatItem({ icon, label, value, color, theme }) {
  const isDark = theme === "dark";
  const colors = {
    blue: isDark ? "text-blue-500 bg-blue-500/10" : "text-blue-700 bg-blue-100",
    emerald: isDark ? "text-emerald-500 bg-emerald-500/10" : "text-emerald-700 bg-emerald-100",
    rose: isDark ? "text-rose-500 bg-rose-500/10" : "text-rose-700 bg-rose-100",
    indigo: isDark ? "text-indigo-500 bg-indigo-500/10" : "text-indigo-700 bg-indigo-100",
  };

  const itemBg = isDark ? "bg-slate-900/40 border-white/5" : "bg-white border-gray-200 shadow-sm";
  
  return (
    <div className={`p-5 rounded-3xl border flex items-center gap-4 transition-all ${itemBg}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-black tracking-widest opacity-50">{label}</p>
        <p className="text-2xl font-black leading-none mt-1">{value}</p>
      </div>
    </div>
  );
}

function PremiumCard({ icon, title, desc, color, onClick, fullWidth, theme }) {
  const isDark = theme === "dark";
  const colors = {
    blue: isDark ? "text-blue-500 bg-blue-500/10" : "text-blue-700 bg-blue-100",
    emerald: isDark ? "text-emerald-500 bg-emerald-500/10" : "text-emerald-700 bg-emerald-100",
    rose: isDark ? "text-rose-500 bg-rose-500/10" : "text-rose-700 bg-rose-100",
    indigo: isDark ? "text-indigo-500 bg-indigo-500/10" : "text-indigo-700 bg-indigo-100",
  };

  const cardStyle = isDark ? "bg-slate-900/50 border-white/5" : "bg-white border-gray-200 shadow-sm";
  
  return (
    <div onClick={onClick} className={`group cursor-pointer p-8 rounded-[2rem] border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${cardStyle} ${fullWidth ? 'flex flex-col md:flex-row md:items-center gap-6' : ''}`}>
      <div className={`w-16 h-16 flex-shrink-0 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <h2 className="mt-4 text-xl font-bold tracking-tight">{title}</h2>
        <p className={`text-sm mt-2 leading-relaxed ${isDark ? 'opacity-60' : 'text-slate-500'}`}>{desc}</p>
      </div>
    </div>
  );
}