import { useState, useEffect } from "react"
import { db } from "../firebase"
import { doc, setDoc, onSnapshot, collection } from "firebase/firestore"

export default function DashboardHero({ user }) {


/* GREETING */

function getGreeting(){
const hour = new Date().getHours()

if(hour >= 0 && hour < 12) return "Good Morning"
if(hour >= 12 && hour < 17) return "Good Afternoon"
return "Good Evening"

}

/* ONLINE USERS */

useEffect(()=>{

if(!user) return

const userRef = doc(db,"onlineUsers",user.uid)

/* mark user online immediately */

setDoc(userRef,{
name:user.displayName || user.email,
lastActive:Date.now()
})

/* keep user active while tab is open */

const interval = setInterval(()=>{

setDoc(userRef,{
name:user.displayName || user.email,
lastActive:Date.now()
})

},15000)

/* update when leaving page */

const handleLeave = () => {
setDoc(userRef,{
name:user.displayName || user.email,
lastActive:Date.now()
})
}

window.addEventListener("beforeunload",handleLeave)

return ()=>{
clearInterval(interval)
window.removeEventListener("beforeunload",handleLeave)
}

},[user])

return(

<div className="w-full flex justify-center px-2 pt-5">

<div className="w-full max-w-4xl text-center space-y-4">

{/* GREETING */}

<div className="text-center space-y-1">

<h2 className="text-lg sm:text-md md:text-3xl font-extrabold flex items-center justify-center gap-2 text-gray-800 dark:text-white">

{getGreeting()}, {user?.displayName || user?.email}

<span className="wave text-lg md:text-xl">👋</span>

</h2>

<p className="text-gray-800 dark:text-white text-[18px] sm:text-md">
Stay on top of your monitoring and keep everything running smoothly.
</p>

</div>

</div>

</div>

)

}