import { useState, useEffect } from "react"
import { db } from "../firebase"
import { collection, onSnapshot } from "firebase/firestore"

export default function OnlineUsersPanel() {

const [users,setUsers] = useState([])
const [open,setOpen] = useState(false)

/* FETCH USERS */

useEffect(()=>{

const unsub = onSnapshot(collection(db,"onlineUsers"),(snap)=>{

const data = snap.docs.map(d=>({
id:d.id,
...d.data()
}))

setUsers(data)

})

return ()=>unsub()

},[])

/* NORMALIZE TIMESTAMP */

function getTime(value){
if(!value) return 0
if(typeof value === "number") return value
if(value.seconds) return value.seconds * 1000
return new Date(value).getTime()
}

/* CHECK ONLINE STATUS */

function isOnline(lastActive){

const time = getTime(lastActive)
const diff = Date.now() - time

return diff < 60000  // 60 seconds considered online

}

/* LAST SEEN FORMAT */

function timeAgo(timestamp){

const time = getTime(timestamp)
const seconds = Math.floor((Date.now()-time)/1000)

const intervals=[
{label:"hour",seconds:3600},
{label:"minute",seconds:60}
]

for(const i of intervals){

const count=Math.floor(seconds/i.seconds)

if(count>=1){
return `${count} ${i.label}${count>1?"s":""} ago`
}

}

return "just now"

}

const onlineCount = users.filter(u=>isOnline(u.lastActive)).length

return(

<div className="fixed top-20 right-6 z-50">

{/* ONLINE INDICATOR */}

<button
onClick={()=>setOpen(!open)}
className="
flex items-center gap-2
px-3 py-1 
rounded-xl
bg-blue-700 dark:bg-white/10
border border-white/20
text-sm
hover:dark:bg-white/20
transition
text-white
dark:text-white
"
>

<span className="w-2 h-2 bg-green-400 rounded-full"></span>

{onlineCount} Online

</button>


{/* DROPDOWN PANEL */}

{open && (

<div className="
mt-2
w-64
bg-[#0f172a]
border border-white/10
rounded-xl
shadow-2xl
overflow-hidden
">

<div className="flex justify-between items-center px-4 py-3 border-b border-white/10">

<span className="text-xs font-semibold text-white/70 tracking-wide">
RECENTLY ACTIVE
</span>

<span className="text-xs bg-green-500/20 text-green-400 px-2 py-[2px] rounded-full">
{onlineCount} online
</span>

</div>


<div className="divide-y divide-white/5">

{users.map(u=>{

const online = isOnline(u.lastActive)

return(

<div
key={u.id}
className="flex items-center justify-between px-4 py-3 text-sm"
>

<div className="flex items-center gap-2">

<span
className={`w-2 h-2 rounded-full ${
online ? "bg-green-400" : "bg-gray-500"
}`}
></span>

<span className="text-white/90 whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">
{u.name}
</span>

</div>

<span className={`text-xs whitespace-nowrap ${online ? "text-green-400" : "text-white/50"}`}>

{online ? "Online" : timeAgo(u.lastActive)}

</span>

</div>

)

})}

</div>

</div>

)}

</div>

)

}