import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function Faq({ onClose }) {

const [open,setOpen] = useState(null)

const faqs = [

{
q: "What is this app used for?",
a: "This app helps teams track and log show checks. It allows users to monitor shows, record when they were checked, and see if any show is overdue."
},

{
q: "How do I add a show?",
a: "Click the '+ Add Show To Check' button and enter the show name, priority level, and any notes you want to attach."
},

{
q: "What do the priority colors mean?",
a: "Each show has a priority indicator: 🔴 High Priority – Must be checked frequently, 🟠 Medium Priority – Normal monitoring, 🟢 Low Priority – Occasional checks."
},

{
q: "What does 'Checked Today' mean?",
a: "When a show is checked on the current day, it will display a 'Checked Today' status."
},

{
q: "What does 'Overdue' mean?",
a: "A show becomes 'Overdue' if it has not been checked today. Overdue entries are highlighted so they can be addressed quickly."
},

{
q: "Who can edit or delete entries?",
a: "Only the person who created the entry can edit or delete that specific check."
},

{
q: "What is the Team Message Board?",
a: "The Team Message Board allows team members to post announcements, reminders, or updates for everyone to see."
},

{
q: "Why do I see glowing red highlights?",
a: "A glowing red border means the show currently has no recent checks or is overdue, helping you quickly identify issues."
},

{
q: "Can I check a show multiple times in a day?",
a: "Yes. Multiple checks can be recorded, but the system will still mark the show as 'Checked Today' once a check has been logged that day."
},

{
q: "What happens if I delete a show?",
a: "Deleting a show will remove the show and all its check entries permanently."
}

]

return(

<div className="fixed inset-0 z-[300] bg-black/60 flex items-start justify-center px-4 py-10 overflow-y-auto">

<div className="w-full max-w-3xl bg-white dark:bg-[#081225] rounded-2xl p-6 relative max-h-[85vh] overflow-y-auto">

<button
onClick={onClose}
className="sticky top-0 ml-auto block text-gray-500 dark:text-white text-lg"
>
✕
</button>

<h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
Help & FAQ
</h2>

<div className="space-y-3">

{faqs.map((item,i)=>{

const isOpen = open === i

return(

<div
key={i}
className="border border-gray-200 dark:border-white/10 rounded-lg"
>

<button
onClick={()=>setOpen(isOpen ? null : i)}
className= " flex items-start justify-between gap-3 px-4 py-3 text-left dark:text-white"
>
<span className="font-semibold text-sm leading-snug text-gray-800 dark:text-white">
{item.q}
</span>

<ChevronDown
className={`w-4 h-4 transition-transform ${
isOpen ? "rotate-180" : ""
}`}
 />

</button>

{isOpen && (

<div className="px-4 pb-4 text-sm text-gray-600 dark:text-white/70">
{item.a}
</div>

)}

</div>

)

})}

</div>

</div>

</div>

)

}