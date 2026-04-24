import { useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Bell, 
  BellPlus, 
  Ticket, 
  ChevronRight, 
  BarChart3, 
  Megaphone, 
  BookOpen
} from "lucide-react"

export default function Sidebar({
  open,
  setOpen,
  notesCount,
  remindersCount,
  onOpenReminder,
  onOpenReminderList,
  onOpenPromo,
  onToggleLegend,
  onOpenAnalytics,
  onOpenNotes,
  onOpenFaq
}) {
  const sidebarRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e) {
      if (e.target.closest("[data-sidebar-toggle]")) return
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setOpen])

  const SidebarItem = ({ icon: Icon, label, count, onClick, color = "dark:text-white text-slate-600" }) => (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center w-full transition-all duration-200
        ${open ? "px-4 py-3 gap-4" : "justify-center py-4"}
        hover:bg-blue-600/10 hover:text-blue-500 rounded-xl
      `}
    >
      <div className={`relative ${!open && "hover:scale-110 transition-transform"}`}>
        <Icon size={22} className={`${color} group-hover:text-blue-500 transition-colors`} />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-[#E9EEF7] dark:ring-[#081225]">
            {count}
          </span>
        )}
      </div>
      
      {open && (
        <span className="text-sm font-semibold whitespace-nowrap overflow-hidden dark:text-white transition-colors group-hover:text-blue-500">
          {label}
        </span>
      )}

      {/* TOOLTIP FIX: Using a massive z-index and clearing all overflow barriers */}
      {!open && (
        <div className="fixed left-20 scale-0 group-hover:scale-100 transition-all duration-150 origin-left bg-slate-900 text-white text-[11px] font-bold px-3 py-2 rounded-lg shadow-2xl pointer-events-none z-[9999] whitespace-nowrap border border-white/10 flex items-center gap-2">
          {label}
          <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45 border-l border-b border-white/10"></div>
        </div>
      )}
    </button>
  )

  return (
    <>
      <button
        data-sidebar-toggle
        onClick={() => setOpen(prev => !prev)}
        className="fixed top-1/2 left-0 z-[60] -translate-y-1/2 bg-blue-600 p-2 rounded-r-xl shadow-lg lg:hidden"
      >
        <ChevronRight size={20} className={`text-white transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <div
        ref={sidebarRef}
        className={`
          fixed left-0 top-16 h-[calc(100vh-64px)] z-50
          flex flex-col bg-[#E9EEF7] dark:bg-[#081225]
          border-r border-slate-200 dark:border-white/5
          transition-all duration-300 ease-in-out
          ${open ? "translate-x-0 w-64" : "-translate-x-full w-20 lg:translate-x-0"}
          lg:translate-x-0 lg:${open ? "w-64" : "w-20"}
          /* IMPORTANT: sidebar must not clip children for tooltips to show */
          overflow-visible
        `}
      >
        <button
          data-sidebar-toggle
          onClick={() => setOpen(prev => !prev)}
          className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-7 w-7 items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-full shadow-md z-[70]"
        >
          <ChevronRight size={14} className={`dark:text-white transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {/* This inner container needs to allow overflow for the tooltips to pop out */}
        <div className="flex-1 flex flex-col gap-1.5 p-3 mt-4 overflow-x-visible">
          
          <button
            onClick={onToggleLegend}
            className={`group flex items-center w-full transition-all mb-4 ${open ? "px-4 py-3 gap-4" : "justify-center py-4"} bg-blue-600/5 dark:bg-white/5 rounded-xl border border-blue-500/10`}
          >
            <div className="flex gap-0.5">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
              <span className="w-2 h-2 rounded-full bg-orange-400"></span>
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            </div>
            {open && <span className="text-[10px] font-bold uppercase tracking-widest dark:text-white opacity-80">Priority Legend</span>}
          </button>

          <SidebarItem icon={BellPlus} label="Add Reminder" onClick={onOpenReminder} />
          <SidebarItem icon={Bell} label="View Reminders" count={remindersCount} onClick={onOpenReminderList} />
          <SidebarItem icon={Ticket} label="Promo Codes" onClick={onOpenPromo} />
          <SidebarItem icon={BarChart3} label="Analytics" onClick={onOpenAnalytics} />
          <SidebarItem icon={Megaphone} label="Announcements" count={notesCount} onClick={onOpenNotes} />
          
          <div className="my-2 h-px bg-slate-200 dark:bg-white/5 mx-2" />
          
          <SidebarItem 
            icon={BookOpen} 
            label="Help & Guide" 
            color="text-blue-500 dark:text-blue-400" 
            onClick={() => navigate("/guide")} 
          />
        </div>

        {open && (
          <div className="p-4 mt-auto border-t border-slate-200 dark:border-white/5">
            <div className="bg-blue-600/10 rounded-lg p-2 text-center">
              <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Premium v2.4.0</p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}