import { useState, useEffect } from "react"
import { db } from "../firebase"
import {
collection,
addDoc,
deleteDoc,
doc,
onSnapshot
} from "firebase/firestore"

export default function NotesBoard({ user, onClose }) {

const [notes,setNotes] = useState([])
const [text,setText] = useState("")
const [priority,setPriority] = useState("Low")

/* LOAD NOTES */

useEffect(()=>{

const unsub = onSnapshot(collection(db,"teamNotes"),(snap)=>{

const data = snap.docs.map(d=>({
id:d.id,
...d.data()
}))

setNotes(data)

})

return ()=>unsub()

},[])

/* PRIORITY ORDER */

const priorityOrder = {
High:1,
Medium:2,
Low:3
}

const sortedNotes = [...notes].sort(
(a,b)=>priorityOrder[a.priority] - priorityOrder[b.priority]
)

/* ADD NOTE */

const addNote = async()=>{

if(!text.trim()) return

await addDoc(collection(db,"teamNotes"),{
text:text.trim(),
priority,
author:user?.displayName || user?.email,
createdAt:new Date().toISOString()
})

setText("")

}

/* DELETE NOTE */

const deleteNote = async(id)=>{
await deleteDoc(doc(db,"teamNotes",id))
}

/* FORMAT TIME */

function formatTime(ts){
return new Date(ts).toLocaleString()
}

return(

<div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center px-4">

{/* BOARD */}

<div className="w-full max-w-6xl bg-blue-950 border-[10px] border-[#5b3a1e] rounded-2xl shadow-2xl p-6 relative">

{/* CLOSE */}

<button
onClick={onClose}
className="absolute right-4 top-4 text-white text-lg bg-black/40 px-3 py-1 rounded-lg"
>
✕
</button>

{/* HEADER */}

<div className="flex items-center gap-3 mb-6">

<h2 className="text-2xl font-bold text-purple-100">
📌 Team Message Board
</h2>

<span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">
Daily
</span>

</div>

{/* POST SECTION */}

<div className="flex flex-col md:flex-row gap-2 mb-6">

<textarea
value={text}
onChange={(e)=>setText(e.target.value)}
placeholder="Post an announcement, reminder, or note for the team..."
rows="1"
className="
flex-1
rounded-lg
py-1.5
px-3
text-[15px]
font-semibold
border border-black/20
resize-none
"
/>

<div className="flex gap-2 w-full md:w-auto">

<select
value={priority}
onChange={(e)=>setPriority(e.target.value)}
className="
flex-1
md:w-28
px-2
py-1.5
rounded-lg
text-[15px]
font-semibold
"
>
<option>Low</option>
<option>Medium</option>
<option>High</option>
</select>

<button
onClick={addNote}
className="
flex-1
md:flex-none
bg-teal-700
hover:bg-teal-800
text-white
px-4
py-1.5
rounded-lg
text-[15px]
font-bold
"
>
Post
</button>

</div>

</div>

{/* NOTES GRID */}

<div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3 md:gap-5 max-h-[60vh] overflow-y-auto items-start">

{sortedNotes.map(note=>{

const bg =
note.priority === "High"
? "bg-red-200"
: note.priority === "Medium"
? "bg-orange-200"
: "bg-yellow-200"

const ribbon =
note.priority === "High"
? "bg-red-500"
: note.priority === "Medium"
? "bg-orange-500"
: "bg-yellow-500"

return(

<div
key={note.id}
className={`${bg} relative rounded-lg p-4 shadow-xl`}
>

{/* PRIORITY RIBBON */}

<div className={`absolute top-0 left-0 text-xs font-bold text-white px-2 py-1 ${ribbon}`}>
{note.priority}
</div>

{/* DELETE */}

<button
onClick={()=>deleteNote(note.id)}
className="absolute right-2 top-2 text-sm font-bold"
>
✕
</button>

{/* NOTE TEXT */}

<p className="text-[15px] font-semibold mt-4 whitespace-pre-wrap">
{note.text}
</p>

{/* FOOTER */}

<div className="mt-4 text-[13px] font-semibold flex justify-between opacity-70">

<span>{note.author}</span>

<span>{formatTime(note.createdAt)}</span>

</div>

</div>

)

})}

</div>

</div>

</div>

)

}