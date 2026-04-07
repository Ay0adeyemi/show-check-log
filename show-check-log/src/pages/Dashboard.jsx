import { useState, useEffect, useRef } from "react"
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
import { Search, X } from "lucide-react"
import DashboardHero from "../components/DashboardHero"
import AnalyticsCanvas from "../components/AnalyticsCanvas"
import OnlineUsersPanel from "../components/OnlineUsersPanel"
import NotesBoard from "../components/NotesBoard"
import Faq from "../components/Faq"
import { db } from "../firebase"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"

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
    const playSound = () => {
  const audio = new Audio("/notification.mp3")
  audio.volume = 0.5
  audio.play()
}

const [shows,setShows] = useState([])
const [showForm,setShowForm] = useState(false)

const [reminders,setReminders] = useState([])
const [reminderOpen,setReminderOpen] = useState(false)
const [showReminderList,setShowReminderList] = useState(false)

const [promoOpen,setPromoOpen] = useState(false)
const [legendOpen,setLegendOpen] = useState(false)

const [sidebarOpen,setSidebarOpen] = useState(false)
const [notesCount,setNotesCount] = useState(0)
/* SEARCH + FILTER */

const [searchInput,setSearchInput] = useState("")
const [searchQuery,setSearchQuery] = useState("")
const [priorityFilter,setPriorityFilter] = useState("All")
const [statusFilter,setStatusFilter] = useState("All")

/* ref for outside click detection */
const dashboardRef = useRef(null)

const [analyticsOpen,setAnalyticsOpen] = useState(false)
const [notesOpen, setNotesOpen] = useState(true)
const [faqOpen,setFaqOpen] = useState(false)


useEffect(() => {

async function enableNotifications(){

const token = await requestNotificationPermission()

if(token && user){

await updateDoc(doc(db,"users",user.uid),{
fcmToken: token
})

}

}

enableNotifications()

},[user])

useEffect(()=>{

const unsub = onSnapshot(collection(db,"teamNotes"),(snap)=>{
setNotesCount(snap.size)
})

return ()=>unsub()

},[])
/* LOAD SHOWS */

useEffect(()=>{

const unsub = onSnapshot(collection(db,"shows"),(snapshot)=>{

const data = snapshot.docs.map(d=>({
id:d.id,
...d.data()
}))

setShows(data)

const overdue = getOverdueShows(data, user.email)

if (overdue.length > 0) {

  playSound()
  toast.error(
    `⚠️ ${overdue.length} show(s) overdue: ${overdue.join(", ")}`,
    { duration: 10000 }
  )

}

})

return ()=>unsub()

},[])

useEffect(() => {

  const interval = setInterval(() => {

    checkOverdueAlerts(shows)

  }, 300000) // 5 minutes

  return () => clearInterval(interval)

}, [shows])

/* LOAD REMINDERS */

useEffect(()=>{

if(!user?.uid) return

const q = query(
collection(db,"users",user.uid,"reminders"),
orderBy("createdAt","desc")
)

const unsub = onSnapshot(q,(snap)=>{

const data = snap.docs.map(d=>({
id:d.id,
...d.data()
}))

setReminders(data)

})

return ()=>unsub()

},[user?.uid])

/* CLOSE LEGEND & REMINDERS WHEN CLICKING OUTSIDE */

useEffect(()=>{

function handleOutsideClick(e){

if(!dashboardRef.current) return

if(!dashboardRef.current.contains(e.target)){
setLegendOpen(false)
setShowReminderList(false)
}

}

document.addEventListener("mousedown",handleOutsideClick)

return ()=>document.removeEventListener("mousedown",handleOutsideClick)

},[])

/* SHOW CRUD */

const addShow = async(task)=>{

const showRef = await addDoc(collection(db,"shows"),{
name:task.name,
link:task.link,
note:task.note,
priority:task.priority,
checks:[],
createdAt:Date.now()
})

/* AUTO POST TO MESSAGE BOARD */

await addDoc(collection(db,"teamNotes"),{
text:`📺 New show added: ${task.name}`,
priority:task.priority,
author:user?.displayName || user?.email,
createdAt:new Date().toISOString()
})

toast.success("Show added")
playSound()

setShowForm(false)

}

const deleteShows = async(showId)=>{

await deleteDoc(doc(db,"shows",showId))

toast.success("Show deleted")
playSound()

}

/* CHECK CRUD */

const addCheck = async(showId,check)=>{

const show = shows.find(s=>s.id===showId)
if(!show) return

await updateDoc(doc(db,"shows",showId),{
checks:[...(show.checks || []),check]
})

}

const deleteCheck = async(showId,checkId)=>{

const show = shows.find(s=>s.id===showId)
if(!show) return

await updateDoc(doc(db,"shows",showId),{
checks:(show.checks || []).filter(c=>c.id!==checkId)
})

}

const updateCheck = async(showId,updatedCheck)=>{

const show = shows.find(s=>s.id===showId)
if(!show) return

const updatedChecks = (show.checks || []).map(c=>
c.id === updatedCheck.id ? updatedCheck : c
)

await updateDoc(doc(db,"shows",showId),{
checks:updatedChecks
})

}

/* REMINDER CRUD */

const saveReminder = async({daysFrom,daysTo})=>{

await addDoc(collection(db,"users",user.uid,"reminders"),{
daysFrom,
daysTo,
createdAt:Date.now()
})

toast.success("Reminder added")
playSound()

setReminderOpen(false)

}

const deleteReminder = async(id)=>{
await deleteDoc(doc(db,"users",user.uid,"reminders",id))
}

const runSearch = () => {
setSearchQuery(searchInput)
}
/* FILTERED SHOWS */

const filteredShows = shows.filter(show=>{


/* SEARCH */

if(searchQuery){
const text = searchQuery.toLowerCase()
if(
!show.name?.toLowerCase().includes(text) &&
!show.note?.toLowerCase().includes(text)
){
return false
}
}

/* PRIORITY FILTER */

if(priorityFilter !== "All" && show.priority !== priorityFilter){
return false
}

/* STATUS FILTER */

if(statusFilter !== "All"){

const checks = show.checks || []

const latest = checks[checks.length - 1]

if(statusFilter === "Checked Today"){

if(!latest) return false

const d = new Date(latest.checkedAt)
const today = new Date()

const sameDay =
d.getFullYear() === today.getFullYear() &&
d.getMonth() === today.getMonth() &&
d.getDate() === today.getDate()

if(!sameDay) return false

}

if(statusFilter === "Overdue"){

if(!latest) return true

const d = new Date(latest.checkedAt)
const today = new Date()

const sameDay =
d.getFullYear() === today.getFullYear() &&
d.getMonth() === today.getMonth() &&
d.getDate() === today.getDate()

if(sameDay) return false

}

}

return true


})

function getOverdueShows(shows, userEmail){

  const now = Date.now()

  const overdue = []

  shows.forEach(show => {

    const checks = show.checks || []

    checks.forEach(check => {

      /* ONLY CHECK ENTRIES CREATED BY CURRENT USER */

      if(check.checkedBy !== userEmail) return

      if(!check.checkedAt) return

      const hours = (now - check.checkedAt) / (1000 * 60 * 60)

      if(hours > 24){
        overdue.push(show.name)
      }

    })

  })

  return overdue

}

function checkOverdueAlerts(shows){

  const overdue = getOverdueShows(shows, user?.email)

  if(overdue.length > 0){

    playSound()

    toast.error(
      `⚠️ ${overdue.length} show(s) overdue: ${overdue.join(", ")}`,
      { duration: 10000 }
    )

  }

}

/* UI */

return(

<div className="min-h-screen flex flex-col bg-slate-200 dark:bg-[#0b1220]">

<Navbar
username={user?.displayName || user?.email}
onLogout={()=>signOut(auth)}
theme={theme}
toggleTheme={toggleTheme}
/>
<OnlineUsersPanel />

<div className="pt-20">
<DashboardHero
user={user}
/>
</div>

<Sidebar
open={sidebarOpen}
setOpen={setSidebarOpen}
remindersCount={reminders.length}
notesCount={notesCount}
onOpenReminder={()=>{setReminderOpen(true);setSidebarOpen(false)}}
onOpenReminderList={()=>{setShowReminderList(prev=>!prev);setSidebarOpen(false)}}
onOpenPromo={()=>{setPromoOpen(true);setSidebarOpen(false)}}
onToggleLegend={()=>{setLegendOpen(prev=>!prev);setSidebarOpen(false)}}
onOpenAnalytics={()=>{setAnalyticsOpen(true);setSidebarOpen(false)}}
onOpenNotes={()=>{setNotesOpen(true);setSidebarOpen(false)}}
onOpenFaq={()=>{setFaqOpen(true);setSidebarOpen(false)}}
/>
<Toaster position="top-right" />
{/* MAIN */}

<main
className={`
flex-1
pt-19
px-4
sm:px-6
lg:px-20
transition-all
duration-300

ml-0 lg:ml-10
lg:${sidebarOpen ? "ml-52" : "ml-12"}
`}
>

<div ref={dashboardRef} className="w-full space-y-4">


{legendOpen && (
<div className="mb-4">
<PriorityLegend/>
</div>
)}

{/* SEARCH + FILTERS */}

<div className="w-full flex justify-center">

<div className="w-full max-w-4xl flex flex-col lg:flex-row gap-3 lg:items-center justify-center pt-6">

{/* SEARCH */}

<div className="flex gap-2 w-full lg:flex-1">

<input
type="text"
placeholder="Search shows..."
value={searchInput}
onChange={(e)=>setSearchInput(e.target.value)}
onKeyDown={(e)=>{
if(e.key === "Enter"){
runSearch()
}
}}
className="
flex-1
bg-white dark:bg-white/10
border border-slate-300 dark:border-white/10
rounded-xl
px-4 py-3
text-black dark:text-white
 placeholder-slate-400 dark:placeholder-white/50
outline-none
focus:ring-2 focus:ring-blue-500/40
"
/>

<button
onClick={runSearch}
className="
p-3
rounded-xl
bg-blue-700 hover:bg-blue-950
text-white
transition
flex items-center justify-center
"
>
<Search size={18}/>
</button>

<button
onClick={()=>{
setSearchInput("")
setSearchQuery("")
}}
className="
p-3
rounded-xl
bg-blue-700 dark:bg-white/10 hover:bg-blue-950 dark:hover:bg-white/20
text-white
transition
flex items-center justify-center
"
>
<X size={18}/>
</button>

</div>

{/* FILTERS */}

<div className="grid grid-cols-2 lg:flex gap-3">

<select
value={priorityFilter}
onChange={(e)=>setPriorityFilter(e.target.value)}
className="
px-4 py-2.5
rounded-lg
bg-white dark:bg-white/10
border border-slate-300 dark:border-white/10
text-sm
text-black dark:text-white
"
>
<option className="bg-white dark:bg-slate-600" value="All">All Priorities</option>
<option className="bg-white dark:bg-slate-600" value="High">High</option>
<option className="bg-white dark:bg-slate-600" value="Medium">Medium</option>
<option className="bg-white dark:bg-slate-600" value="Low">Low</option>
</select>

<select
value={statusFilter}
onChange={(e)=>setStatusFilter(e.target.value)}
className="
px-4 py-2.5
rounded-lg
bg-white dark:bg-white/10
border border-slate-300 dark:border-white/10
text-sm
text-black dark:text-white
"
>
<option className="bg-white dark:bg-slate-600" value="All">All Status</option>
<option className="bg-white dark:bg-slate-600" value="Checked Today">Checked Today</option>
<option className="bg-white dark:bg-slate-600" value="Overdue">Overdue</option>
</select>

</div>

{/* ADD SHOW BUTTON */}

<button
onClick={()=>setShowForm(true)}
className="
inline-flex
items-center
justify-center
gap-4

px-6
py-3

rounded-lg
font-semibold
text-sm

bg-blue-700
hover:bg-blue-950

shadow-lg dark:shadow-blue-600/30 text-white

transition
duration-200

hover:scale-105
active:scale-95
"
>
+ Add Show To Check
</button>

</div>

</div>
{showForm && (
<TaskForm
onAdd={addShow}
onClose={()=>setShowForm(false)}
/>
)}

{showReminderList && (
<ReminderList
reminders={reminders}
onDelete={deleteReminder}
/>
)}

<ShowList
user={user}
shows={filteredShows}
onAddCheck={addCheck}
onDeleteCheck={deleteCheck}
onUpdateCheck={updateCheck}
onDeleteShows={deleteShows}
/>

</div>

</main>

{reminderOpen && (
<ReminderModal
onSave={saveReminder}
onClose={()=>setReminderOpen(false)}
/>
)}

<PromoDrawer
open={promoOpen}
onClose={()=>setPromoOpen(false)}
user={user}
/>

<AnalyticsCanvas
open={analyticsOpen}
onClose={()=>setAnalyticsOpen(false)}
shows={shows}
/>

{notesOpen && (
<NotesBoard
user={user}
onClose={()=>setNotesOpen(false)}
/>
)}

{faqOpen && (
<Faq onClose={()=>setFaqOpen(false)} />
)}
<Footer onOpenFaq={()=>setFaqOpen(true)} />

</div>

)

}
