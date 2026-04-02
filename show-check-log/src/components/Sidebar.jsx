import { useRef, useEffect } from "react"
import { Bell, BellPlus, Ticket, ChevronRight, BarChart3, NotebookPen, BookOpen } from "lucide-react"

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

useEffect(() => {

function handleClickOutside(e){

if(e.target.closest("[data-sidebar-toggle]")) return

if(sidebarRef.current && !sidebarRef.current.contains(e.target)){
setOpen(false)
}

}

document.addEventListener("mousedown", handleClickOutside)

return () => document.removeEventListener("mousedown", handleClickOutside)

}, [setOpen])

return (
<>

<button
data-sidebar-toggle
onClick={()=>setOpen(prev => !prev)}
className="
fixed
top-1/2
left-0
z-50
-translate-y-1/2
bg-[#081225]
border border-white/10
rounded-r-xl
p-2
lg:hidden
"
>
<ChevronRight
className={`w-4 h-4 text-white transition-transform ${
open ? "rotate-180" : ""
}`}
/>
</button>

<div
ref={sidebarRef}
className={`
fixed
left-0
top-16
h-[calc(100vh-64px)]
z-40
flex
flex-col
items-center
bg-[#E9EEF7] dark:bg-[#081225]
border-r
border-white/10
transition-all
duration-300
${open ? "translate-x-0 w-52" : "-translate-x-full w-22"}
lg:translate-x-0
lg:${open ? "lg:w-52" : "lg:w-12"}
`}
>

<button
data-sidebar-toggle
onClick={()=>setOpen(prev => !prev)}
className="
hidden lg:flex
absolute
top-1/2
right-[-12px]
-translate-y-1/2
bg-blue-900 dark:bg-white/10
border border-white/10
rounded-xl
p-1.5
hover:dark:bg-white/20 hover:bg-blue-950
transition
"
>
<ChevronRight
className={`w-5 h-5 text-white transition-transform ${
open ? "rotate-180" : ""
}`}
/>
</button>

<div className="flex flex-col items-center gap-6 mt-6 w-full">

<button
title="Priority Legend"
onClick={onToggleLegend}
className="flex items-center gap-3 w-full px-1 text-blue-700 dark:text-white hover:text-blue-800 font-bold"
>

<div className="flex gap-1">
<span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
<span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
<span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
</div>

{open && <span className="text-sm">Priority Legend</span>}

</button>

<button
title="Add Reminder"
onClick={onOpenReminder}
className="flex items-center gap-3 w-full px-4 text-blue-700 dark:text-white hover:text-blue-800 font-bold"
>

<BellPlus className="w-5 h-5"/>

{open && <span className="text-sm">Add Reminder</span>}

</button>

<button
title="Reminders"
onClick={onOpenReminderList}
className="relative flex items-center gap-3 w-full px-4 text-blue-700 dark:text-white hover:text-blue-800 font-bold"
>

<Bell className="w-5 h-5"/>

{remindersCount > 0 && (
<span className="absolute left-7 top-[-4px] text-[10px] px-1 rounded-full bg-red-500 text-white">
{remindersCount}
</span>
)}

{open && <span className="text-sm">Reminders</span>}

</button>

<button
title="Promo Codes"
onClick={onOpenPromo}
className="flex items-center gap-3 w-full px-4 text-blue-700 dark:text-white hover:text-blue-800 font-bold"
>

<Ticket className="w-5 h-5"/>

{open && <span className="text-sm">Promo Codes</span>}

</button>

<button
title="Analytics"
onClick={onOpenAnalytics}
className="flex items-center gap-3 w-full px-4 text-blue-700 dark:text-white hover:text-blue-800 font-bold"
>

<BarChart3 className="w-5 h-5"/>

{open && <span className="text-sm">Analytics</span>}

</button>

<button
title="Team Notes"
onClick={onOpenNotes}
className="relative flex items-center gap-3 w-full px-4 text-blue-700 dark:text-white hover:text-blue-800 font-bold transition"
>

<NotebookPen className="w-5 h-5"/>

{notesCount > 0 && (
<span
className="
absolute
left-7
top-[-4px]
text-[10px]
px-1
rounded-full
bg-red-500
text-white
"
>
{notesCount}
</span>
)}

{open && <span className="text-sm">Team Notes</span>}

</button>

<button
title="Help / FAQ"
onClick={onOpenFaq}
className="flex items-center gap-3 w-full px-4 text-blue-700 dark:text-white hover:text-blue-800 font-bold"
>

<BookOpen className="w-5 h-5"/>

{open && <span className="text-sm">Help / FAQ</span>}

</button>

</div>

</div>

</>
)
}