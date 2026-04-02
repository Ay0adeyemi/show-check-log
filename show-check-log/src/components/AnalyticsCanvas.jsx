import { useMemo } from "react"
import { X } from "lucide-react"

export default function AnalyticsCanvas({ open, onClose, shows }) {

if(!open) return null

/* TOTAL SHOWS */

const totalShows = shows.length

/* CHECKED TODAY */

const checkedToday = useMemo(()=>{

let count = 0

shows.forEach(show=>{
(show.checks || []).forEach(check=>{

const d = new Date(check.checkedAt)
const today = new Date()

const sameDay =
d.getFullYear() === today.getFullYear() &&
d.getMonth() === today.getMonth() &&
d.getDate() === today.getDate()

if(sameDay) count++

})
})

return count

},[shows])

/* OVERDUE */

const overdueEntries = useMemo(()=>{

let count = 0

shows.forEach(show=>{

(show.checks || []).forEach(check=>{

if(!check.checkedAt) return

const d = new Date(check.checkedAt)
const today = new Date()

const sameDay =
d.getFullYear() === today.getFullYear() &&
d.getMonth() === today.getMonth() &&
d.getDate() === today.getDate()

if(!sameDay) count++

})

})

return count

},[shows])

return(

<div className="fixed inset-0 z-50 flex">

{/* OVERLAY */}

<div
className="flex-1 bg-black/40 backdrop-blur-sm"
onClick={onClose}
/>

{/* CANVAS */}

<div
className="
w-[380px]
bg-[#0b1220]
border-l border-white/10
h-full
p-6
space-y-6
overflow-y-auto
"
>

{/* HEADER */}

<div className="flex items-center justify-between">

<h2 className="text-lg font-semibold text-white">
Analytics
</h2>

<button
onClick={onClose}
className="p-1 rounded-lg hover:bg-white/10 text-white"
>
<X className="w-5 h-5"/>
</button>

</div>

{/* STATS */}

<div className="space-y-4">

<StatCard
title="Total Shows"
value={totalShows}
/>

<StatCard
title="Checked Today"
value={checkedToday}
/>

<StatCard
title="Overdue Entries"
value={overdueEntries}
/>

</div>

</div>

</div>

)

}

function StatCard({ title, value }){

return(

<div
className="
bg-white/10
border border-white/10
rounded-xl
p-4
backdrop-blur
hover:bg-white/15
transition
"
>

<div className="text-white/60 text-xs uppercase tracking-wide">
{title}
</div>

<div className="text-2xl font-bold mt-1 text-white">
{value}
</div>

</div>

)

}