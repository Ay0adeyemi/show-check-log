import { useState } from "react"
import CheckForm from "./CheckForm"
import { Pencil, Trash2, ChevronDown, NotebookPen } from "lucide-react"
import ConfirmModal from "./ConfirmModal"
import toast from "react-hot-toast"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "../firebase"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"

export default function ShowList({
  shows,
  user,
  onAddCheck,
  onDeleteCheck,
  onUpdateCheck,
  onDeleteShows,
   onDeleteNote
}) {

const playSound = () => {
  const audio = new Audio("/notification.mp3")
  audio.volume = 0.5
  audio.play()
}
const [openShowId,setOpenShowId] = useState(null)
const [showToDelete,setShowToDelete] = useState(null)
const [checkModal,setCheckModal] = useState(null)
const [editModal,setEditModal] = useState(null)
const [activeTooltip,setActiveTooltip] = useState(null)
const [entryToDelete,setEntryToDelete] = useState(null)
const [notesModal,setNotesModal] = useState(null)
const [newNote,setNewNote] = useState("")
const [newImage,setNewImage] = useState(null)

const toggleShow = (id)=>{
setOpenShowId(prev => prev === id ? null : id)
}

const priorityOrder = {
High:1,
Medium:2,
Low:3
}

const sortedShows = [...shows].sort(
(a,b)=>priorityOrder[a.priority] - priorityOrder[b.priority]
)

const addNote = async () => {

if(!newNote && !newImage) return

let imageUrl = null

if(newImage){
const storageRef = ref(storage, `checkNotes/${Date.now()}-${newImage.name}`)
await uploadBytes(storageRef,newImage)
imageUrl = await getDownloadURL(storageRef)
}

const newNoteObj = {
id: Date.now(),
text: newNote,
image: imageUrl,
createdAt: Date.now(),
author: user?.displayName || user?.email
}

const show = shows.find(s => s.id === notesModal.showId)

const updatedChecks = show.checks.map(c => {

if(c.id !== notesModal.check.id) return c

return {
...c,
notes:[...(c.notes || []), newNoteObj]
}

})

await updateDoc(doc(db,"shows",notesModal.showId),{
checks:updatedChecks
})

setNewNote("")
setNewImage(null)

}

return(

<div className="space-y-6">


{/* HEADER ROW */}

<div className="hidden lg:block">

<div
className="
grid
grid-cols-[40px_110px_1.6fr_1fr_80px]
items-center

px-4
py-3

rounded-sm
bg-[#3B5BDB]
border border-white/10
backdrop-blur

text-sm
font-semibold
uppercase
tracking-wide
text-white
"
>

<div></div>
<div>Priority</div>
<div className="pl-2">Show Name</div>
<div>Notes</div>
<div className="text-right">Actions</div>

</div>

</div>

{sortedShows.map(show=>{

const hasNoEntries = !show.checks || show.checks.length === 0

return(

<div
key={show.id}
className={`
rounded-xl
bg-white/70 dark:bg-white/10
backdrop-blur-xl
border border-white/20 dark:border-white/10
shadow-lg
transition-all duration-200
hover:-translate-y-[2px]
hover:shadow-xl
p-4

${hasNoEntries
? "border-red-500 shadow-[0_0_14px_rgba(239,68,68,0.45)]"
: ""}
`}
>

{/* HEADER */}

<div
className="
grid
grid-cols-[28px_40px_1fr_auto]
lg:grid-cols-[40px_110px_1.6fr_1fr_80px]
items-center
gap-4
cursor-pointer
text-sm
"
>

  {/* TOGGLE BUTTON */}

<div className="flex justify-center">

<button
onClick={()=>toggleShow(show.id)}
className="text-blue-800 dark:text-white/70 dark:hover:text-white transition "
>
<ChevronDown
className={`w-4 h-4 transition-transform ${
openShowId === show.id ? "rotate-180" : ""
}`}
/>
</button>

</div>

{/* PRIORITY */}

<div className="flex items-center gap-2">

<span
className={`
w-3 h-3 rounded-full shrink-0
${show.priority === "High" && "bg-red-500"}
${show.priority === "Medium" && "bg-orange-400"}
${show.priority === "Low" && "bg-green-500"}
`}
/>



</div>


{/* SHOW NAME */}

<div className="flex items-center gap-2 min-w-0 group">

<h3 className="text-lg sm:text-base font-bold text-gray-700 dark:text-white truncate">

{show.link ? (

<a
href={show.link}
target="_blank"
rel="noopener noreferrer"
className="flex items-center gap-2 hover:text-blue-300 transition"
onClick={(e)=>e.stopPropagation()}
>

{show.name?.toUpperCase()}

<span className="opacity-0 group-hover:opacity-100 transition text-blue-300 text-xs">
🔗
</span>

</a>

) : show.name}

</h3>

</div>


{/* NOTES */}

<div className="hidden lg:block text-md font-semibold text-gray-700 dark:text-white/60 truncate">

{show.note || "—"}

</div>


{/* ACTION */}

<div className="flex justify-end">

<button
onClick={(e)=>{
e.stopPropagation()
setShowToDelete(show)
}}
className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
>
<Trash2 className="w-4 h-4 text-red-500 dark:text-red-300"/>
</button>

</div>

</div>

{/* EXPANDED */}

{openShowId === show.id && (

<div className="mt-3 space-y-3">




<div className="w-full px-2">

{/* NO ENTRIES MESSAGE */}

{(show.checks || []).length === 0 && (

<div className="text-center text-gray-800 dark:text-white/60 text-md py-6">
No entries yet.
</div>

)}

{/* HEADER ONLY IF ENTRIES EXIST */}

{(show.checks || []).length > 0 && (

<div className="
hidden md:grid
grid-cols-[60px_1.5fr_1.6fr_1fr_1fr_80px_100px]
text-sm
font-bold
uppercase
tracking-wide
text-gray-400 dark:text-white/60
border-b
border-white dark:border-white/10
px-4
py-6
pb-2
mb-3
">

<div>Name</div>
<div>Date Range Checked</div>
<div>Date/Time of Check</div>
<div>Last Checked</div>
<div>Status</div>
<div>Notes</div>
<div className="text-right">Actions</div>

</div>

)}

<div className="space-y-5">

{(show.checks || []).map(check=>{

const checkedToday = isCheckedToday(check.checkedAt)
const displayName =
  check.userName ||
  check.checkedBy ||
  "Unknown"
const overdue = isOverdue(check.checkedAt)

return(

<div
key={check.id}
className={`
rounded-xl
border 
bg-white/10 dark:bg-black/20
transition
p-4

md:grid
md:grid-cols-[60px_1.5fr_1.6fr_1fr_1fr_80px_100px]
md:items-center

flex
flex-col
gap-3

${overdue
? " border-red-800 shadow-[0_0_22px_rgba(239,68,68,0.45)] dark:border-red-500 dark:shadow-[0_0_16px_rgba(239,68,68,0.35)]"
: "dark:border-white/10"}
`}
>

{/* NAME */}
{/* MOBILE LAYOUT */}

<div className="md:hidden space-y-3">

{/* ROW 1 */}

<div className="flex items-center gap-3">

<div className="relative">

<div
onClick={() =>
setActiveTooltip(activeTooltip === check.id ? null : check.id)
}
className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-md font-semibold text-white cursor-pointer"
>
{getInitials(displayName)}
</div>

{activeTooltip === check.id && (

<div
className="
absolute
bottom-full
mb-2
left-1/2
-translate-x-1/2
px-2 py-1
text-xs
rounded-md
bg-black
text-white
whitespace-nowrap
z-50
"
>
{displayName}
</div>

)}

</div>

<div className="font-semibold text-sm text-gray-800 dark:text-white">
{check.startDate && check.endDate
  ? `${formatLongDate(check.startDate)} → ${formatLongDate(check.endDate)}`
  : "No date range"}
</div>

</div>

{/* ROW 2 */}

<div className="flex justify-between text-sm text-gray-700 dark:text-white">

<span>{formatDateTime(check.checkedAt)}</span>

<span>{timeAgo(check.checkedAt)}</span>

</div>

{/* ROW 3 */}

<div className="flex justify-between items-center">

<div>

{checkedToday && (
<span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-green-800 dark:bg-green-500/20 dark:text-green-500">
Checked Today
</span>
)}

{overdue && (
<span className="text-xs px-2 py-0.5 rounded-full bg-red-600 text-white dark:bg-red-500/20 dark:text-red-300">
Overdue
</span>
)}

</div>

<div className="flex items-center gap-2">

{/* NOTES BUTTON */}

<button
  onClick={() => setNotesModal({ showId: show.id, check })}
  className="relative p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
>

<NotebookPen
  className={`w-4 h-4 ${
    check.notes?.length ? "text-yellow-600" : "text-gray-400"
  }`}
/>

{check.notes?.length > 0 && (
  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] px-1 py-[1px] rounded-full leading-none">
    {check.notes.length}
  </span>
)}

</button>

{check.userId === user.uid  && (

<div className="flex gap-2">

<button
onClick={()=>setEditModal({
id:check.id,
showId:show.id,
startDate:check.startDate,
endDate:check.endDate,
checkedAt:check.checkedAt,
checkedBy:check.checkedBy
})}
className="p-1.5 rounded-lg dark:bg-white/5 border dark:border-white/10"
>
<Pencil className="h-4 w-4 text-blue-900 dark:text-blue-300"/>
</button>

<button
onClick={()=>{
setEntryToDelete({
showId:show.id,
checkId:check.id
})
}}
className="p-1.5 rounded-lg bg-white/5 border border-white/10"
>
<Trash2 className="h-4 w-4 text-red-500 dark:text-red-300"/>
</button>

</div>

)}

</div>

</div>

</div>


{/* DESKTOP LAYOUT */}

<div className="hidden md:contents">

{/* NAME */}

<div className="relative group">

<div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-md font-semibold text-white cursor-pointer">
{getInitials(displayName)}
</div>

<div
className="
absolute
bottom-full
mb-2
left-1/2
-translate-x-1/2
px-2 py-1
text-xs
rounded-md
bg-black
text-white
opacity-0
group-hover:opacity-100
transition
pointer-events-none
whitespace-nowrap
z-50
"
>
{displayName}
</div>

</div>


{/* DATE RANGE */}

<div className="text-gray-800 dark:text-white font-semibold text-sm">

{check.startDate && check.endDate
  ? `${formatLongDate(check.startDate)} → ${formatLongDate(check.endDate)}`
  : "No date range"}

</div>


{/* DATE TIME */}

<div className="text-gray-800 dark:text-white text-sm">

{formatDateTime(check.checkedAt)}

</div>


{/* LAST CHECKED */}

<div className="text-gray-800 dark:text-white text-sm">

{timeAgo(check.checkedAt)}

</div>


{/* STATUS */}

<div>

{checkedToday && (
<span className="text-xs px-2 py-0.5 rounded-full bg-green-500 text-green-800 dark:bg-green-500/20 dark:text-green-500">
Checked Today
</span>
)}

{overdue && (
<span className="text-xs px-2 py-0.5 rounded-full text-red-200 bg-red-600 dark:bg-red-500/20 dark:text-red-300">
Overdue
</span>
)}

</div>

{/* NOTES */}

<div className="flex justify-center">

<button
  onClick={() => setNotesModal({ showId: show.id, check })}
  className="relative p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10"
>

<NotebookPen
  className={`w-4 h-4 ${
    check.notes?.length ? "text-yellow-600" : "text-gray-400"
  }`}
/>

{check.notes?.length > 0 && (
  <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[9px] px-1 py-[1px] rounded-full leading-none">
    {check.notes.length}
  </span>
)}

</button>

</div>


{/* ACTIONS */}

{check.userId === user.uid  && (

<div className="flex md:justify-end gap-2">

<button
onClick={()=>setEditModal({
id:check.id,
showId:show.id,
startDate:check.startDate,
endDate:check.endDate,
checkedAt:check.checkedAt,
checkedBy:check.checkedBy,
userName: check.userName || check.checkedBy,
  userId: check.userId
})}
className="p-1.5 rounded-lg dark:bg-white/5 border dark:border-white/10"
>
<Pencil className="h-4 w-4 text-blue-900 dark:text-blue-300"/>
</button>

<button
onClick={()=>{
setEntryToDelete({
showId:show.id,
checkId:check.id
})
}}
className="p-1.5 rounded-lg bg-white/5 border border-white/10"
>
<Trash2 className="h-4 w-4 text-red-500 dark:text-red-300"/>
</button>

</div>

)}

</div>

</div>

)

})}

</div>

{/* CENTERED ADD CHECK BUTTON */}

<div className="flex justify-center pt-4">

<button
onClick={()=>setCheckModal(show.id)}
className="
inline-flex
items-center
justify-center

px-5
py-2.5

rounded-full
text-sm
font-semibold
text-white

bg-blue-600
hover:bg-blue-700

shadow-lg shadow-blue-600/30

transition
duration-200

hover:scale-105
active:scale-95
"
>
+ Add Check
</button>

</div>

</div>

</div>

)}

</div>

)

})}

{/* ADD CHECK MODAL */}

{checkModal && (

<div
className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
onClick={()=>setCheckModal(null)}
>

<div
onClick={(e)=>e.stopPropagation()}
className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl p-6"
>

<h2 className="text-lg font-semibold mb-4 text-white">
Add Check
</h2>

<CheckForm
user={user}
onAdd={(check)=>{
onAddCheck(checkModal,check)

toast.success("Entry added")
playSound()

setCheckModal(null)
}}
/>

</div>

</div>

)}

{/* ADD NOTES MODAL */}
{notesModal && (

<div
className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
onClick={()=>setNotesModal(null)}
>

<div
onClick={(e)=>e.stopPropagation()}
className="w-full max-w-md max-h-[80vh] overflow-y-auto bg-[#0f172a] border border-white/10 rounded-2xl p-6 space-y-4"
>

<h2 className="text-lg font-semibold text-white">
Entry Notes
</h2>

{/* ADD NOTE FORM */}

<div className="space-y-2 border border-white/10 rounded-lg p-3">

<textarea
placeholder="Add a note..."
value={newNote}
onChange={(e)=>setNewNote(e.target.value)}
className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/10 text-white text-sm"
/>

<input
type="file"
accept="image/*"
onChange={(e)=>setNewImage(e.target.files[0])}
className="text-white text-xs"
/>

<button
onClick={addNote}
className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
>
Add Note
</button>

</div>

{(
shows
.find(s => s.id === notesModal.showId)
?.checks
.find(c => c.id === notesModal.check.id)
?.notes || []
).length === 0 && (
<div className="text-white/60">No notes</div>
)}

{(
shows
.find(s => s.id === notesModal.showId)
?.checks
.find(c => c.id === notesModal.check.id)
?.notes || []
).map(n => {

const initials = getInitials(n.author)

return (

<div
key={n.id}
className="border border-white/10 rounded-lg p-3 flex items-start gap-3"
>

{/* Avatar */}
<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
{initials}
</div>

{/* Note content */}
<div className="flex-1 space-y-2">

<div className="space-y-1">

<div className="text-white text-sm">
{n.text}
</div>

<div className="text-xs text-white/50">
{formatNoteTime(n.createdAt)}
</div>

</div>

{n.image && (
<a
href={n.image}
download
target="_blank"
rel="noopener noreferrer"
className="text-blue-400 hover:text-blue-300 text-sm underline"
>
📎 screenshot.png
</a>
)}

</div>

{/* Delete button */}
<button
onClick={() =>
onDeleteNote(
notesModal.showId,
notesModal.check.id,
n.id
)
}
className="text-red-400 hover:text-red-300"
>
<Trash2 className="w-4 h-4"/>
</button>

</div>

)

})}

<button
onClick={()=>setNotesModal(null)}
className="w-full rounded-lg py-2 bg-blue-600 hover:bg-blue-700 text-white"
>
Close
</button>

</div>

</div>

)}

{/* EDIT MODAL */}

{editModal && (

<div
className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
onClick={()=>setEditModal(null)}
>

<div
onClick={(e)=>e.stopPropagation()}
className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl p-6 space-y-4"
>

<h2 className="text-lg font-semibold text-white">
Edit Check
</h2>

<input
type="date"
value={editModal.startDate}
onChange={(e)=>setEditModal({
...editModal,
startDate:e.target.value
})}
className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/10 text-white"
/>

<input
type="date"
value={editModal.endDate}
onChange={(e)=>setEditModal({
...editModal,
endDate:e.target.value
})}
className="w-full rounded-lg px-3 py-2 bg-white/10 border border-white/10 text-white"
/>

<div className="flex justify-end gap-3">

<button
onClick={()=>setEditModal(null)}
className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
>
Cancel
</button>

<button
onClick={()=>{

const updated = {
id:editModal.id,
startDate:editModal.startDate,
endDate:editModal.endDate,

/* update timestamp */
checkedAt: Date.now(),

userName: user?.displayName || user?.email,
userId: user.uid
}

onUpdateCheck(editModal.showId,updated)

toast.success("Entry updated")
playSound()

setEditModal(null)

}}
className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
>
Save
</button>

</div>

</div>

</div>

)}

{/* DELETE MODAL */}

{showToDelete && (

<ConfirmModal
title="Delete Show"
message={`Delete "${showToDelete.name}" and all entries?`}
confirmText="Delete"
onCancel={()=>setShowToDelete(null)}
onConfirm={()=>{
onDeleteShows(showToDelete.id)
setShowToDelete(null)
}}
/>

)}

{/* DELETE ENTRY MODAL */}

{entryToDelete && (

<ConfirmModal
title="Delete Entry"
message="Are you sure you want to delete this entry?"
confirmText="Delete"
onCancel={()=>setEntryToDelete(null)}
onConfirm={()=>{

onDeleteCheck(entryToDelete.showId, entryToDelete.checkId)

/* keep your toast + sound */

toast.success("Entry deleted")
playSound()

setEntryToDelete(null)

}}
/>

)}

</div>


)

}

/* HELPERS */
function getInitials(name){
if(!name) return "?"

const parts = name.trim().split(" ")

if(parts.length === 1){
return parts[0][0].toUpperCase()
}

return (parts[0][0] + parts[1][0]).toUpperCase()
}

/* FIXED DATE PARSER (prevents timezone shift) */

function parseLocalDate(dateString){

if(!dateString) return null

const [year,month,day] = dateString.split("-")

return new Date(year, month - 1, day)

}

function formatLongDate(dateString){

const date = parseLocalDate(dateString)

if(!date) return "—"

return date.toLocaleDateString("en-US",{
month:"short",
day:"numeric",
year:"numeric"
})

}

function formatDateTime(ms){

if(!ms) return "—"

const d = new Date(ms)

return d.toLocaleString("en-US",{
month:"short",
day:"numeric",
year:"numeric",
hour:"numeric",
minute:"2-digit"
})

}

function timeAgo(timestamp){

if(!timestamp) return "—"

const seconds = Math.floor((Date.now() - timestamp) / 1000)

const intervals = [
{label:"year",seconds:31536000},
{label:"month",seconds:2592000},
{label:"day",seconds:86400},
{label:"hour",seconds:3600},
{label:"minute",seconds:60}
]

for(const i of intervals){

const count = Math.floor(seconds / i.seconds)

if(count >= 1){
return `${count} ${i.label}${count > 1 ? "s" : ""} ago`
}

}

return "just now"

}

function isSameDay(a,b){

return (
a.getFullYear() === b.getFullYear() &&
a.getMonth() === b.getMonth() &&
a.getDate() === b.getDate()
)

}

function isCheckedToday(checkedAt){

if(!checkedAt) return false

return isSameDay(new Date(checkedAt), new Date())

}

function isOverdue(checkedAt){

if(!checkedAt) return true

return !isCheckedToday(checkedAt)

}

function formatNoteTime(timestamp){

if(!timestamp) return ""

const d = new Date(timestamp)

return d.toLocaleString("en-US",{
month:"short",
day:"numeric",
hour:"numeric",
minute:"2-digit"
})

}