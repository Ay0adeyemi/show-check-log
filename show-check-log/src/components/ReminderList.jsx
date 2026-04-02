import { useEffect, useRef } from "react"
import { Bell, Trash2 } from "lucide-react"

function addDays(base, days) {
  const d = new Date(base)
  d.setDate(d.getDate() + Number(days || 0))
  return d
}

function formatNice(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })
}

export default function ReminderList({ reminders, onDelete, onClose }) {

  const ref = useRef(null)

  useEffect(()=>{

    function handleClick(e){
      if(ref.current && !ref.current.contains(e.target)){
        onClose?.()
      }
    }

    document.addEventListener("mousedown",handleClick)

    return ()=>document.removeEventListener("mousedown",handleClick)

  },[])

  if(!reminders || reminders.length === 0) return null

  const today = new Date()

  return(

  <div
  ref={ref}
  className="
  bg-gray-800
  dark:bg-blue-500/10
  border border-blue-400/30
  rounded-xl
  p-4
  mb-6
  "
  >

  {reminders.map(r=>{

  const start = addDays(today,r.daysFrom)
  const end = addDays(today,r.daysTo)

  return(

  <div
  key={r.id}
  className="
  flex items-center justify-between
  "
  >

  <div className="flex items-center gap-3">

  <Bell className="w-5 h-5 text-blue-300"/>

  <div>

  <p className="text-white font-semibold text-sm">
  Reminder Active
  </p>

  <p className="text-white/70 text-sm">
  Check shows from {formatNice(start)} → {formatNice(end)}
  </p>

  </div>

  </div>

  <button
  onClick={()=>onDelete(r.id)}
  className="
  p-2
  rounded-lg
  bg-white/5
  border border-white/10
  hover:bg-white/10
  "
  >

  <Trash2 className="w-4 h-4 text-red-300"/>

  </button>

  </div>

  )

  })}

  </div>

  )

}