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

<div className="text-center space-y-2 sm:space-y-3">

  <h2 className="font-bold tracking-tight 
    text-xl sm:text-2xl md:text-3xl lg:text-4xl 
    text-gray-900 dark:text-white leading-snug">

    {getGreeting()}, 
    <br className="sm:hidden" />

    <span className="text-blue-600 dark:text-blue-400">
      {user?.displayName || user?.email}
    </span>

    <span className="ml-1">👋</span>
  </h2>

  <p className="text-md sm:text-sm md:text-base 
    text-gray-600 dark:text-gray-300 
    max-w-xl mx-auto leading-relaxed">

    Stay on top of your monitoring and keep everything running smoothly.

  </p>

</div>

)

}