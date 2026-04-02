import { useState } from "react"
import { User, LogOut, Menu, X, Moon, Sun } from "lucide-react"

export default function Navbar({ username, onLogout, theme, toggleTheme }) {

const [open,setOpen] = useState(false)

/* CREATE USER INITIALS */

const initials = username
? username
.split(" ")
.map(n => n[0])
.join("")
.substring(0,2)
.toUpperCase()
: "U"

return (

<header className="fixed top-0 left-0 right-0 z-50">

<nav className="
bg-white border-b border-slate-200
dark:bg-[#0b1220]/90 dark:border-white/10
backdrop-blur-xl
shadow-sm
">

<div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between relative">

{/* LEFT SECTION */}

<div className="flex items-center gap-3">

<div className="
w-9 h-9
rounded-lg
bg-blue-700
flex items-center justify-center
text-white
font-bold
text-sm
shadow
">
SC
</div>

<h1 className="font-semibold tracking-wide text-slate-800 dark:text-white text-lg whitespace-nowrap">
Show Check Log
</h1>

</div>



{/* CENTER LINKS */}

<div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 gap-10 text-md font-medium">

<a
href="https://www.telecharge.com/"
target="_blank"
rel="noopener noreferrer"
className="text-slate-600 hover:text-blue-700 dark:text-white/80 dark:hover:text-white transition"
>
Telecharge
</a>

<a
href="https://www.todaytix.com/"
target="_blank"
rel="noopener noreferrer"
className="text-slate-600 hover:text-blue-700 dark:text-white/80 dark:hover:text-white transition"
>
TodayTix
</a>

<a
href="https://broadwaydirect.com/"
target="_blank"
rel="noopener noreferrer"
className="text-slate-600 hover:text-blue-700 dark:text-white/80 dark:hover:text-white transition"
>
Broadwaydirect
</a>

</div>



{/* RIGHT CONTROLS */}

<div className="flex items-center gap-3">

{/* DESKTOP USER */}

<div className="hidden lg:flex items-center gap-3">

<div className="
w-9 h-9
rounded-full
bg-blue-600
text-white
flex items-center justify-center
font-semibold
text-sm
shadow
">
{initials}
</div>

<span className="text-sm text-slate-700 dark:text-white/90">
{username}
</span>

<button
onClick={onLogout}
className="
bg-red-500
hover:bg-red-600
text-white
px-3
py-2
rounded-lg
text-sm
flex
items-center
gap-2
shadow
transition
active:scale-[0.98]
"
>

<LogOut className="w-4 h-4"/>

Logout

</button>

</div>



{/* THEME TOGGLE */}

<button
onClick={toggleTheme}
className="
p-2
rounded-lg
border border-gray-800
bg-white
hover:bg-slate-100
dark:bg-white/10 dark:border-white/10 dark:hover:bg-white/20 
transition
flex items-center justify-center
text-gray-800 dark:text-white
"
>

{theme === "dark"
? <Sun size={18}/>
: <Moon size={18}/>
}

</button>



{/* MOBILE MENU BUTTON */}

<button
className="lg:hidden text-slate-700 dark:text-white"
onClick={()=>setOpen(!open)}
aria-label="Toggle menu"
>

{open ? <X size={26}/> : <Menu size={26}/>}

</button>

</div>

</div>



{/* MOBILE MENU */}

<div
className={`lg:hidden overflow-hidden transition-all duration-300 ${
open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
}`}
>

<div className="
px-6 pb-5 pt-3
bg-white border-t border-slate-200
dark:bg-[#0b1220]/95 dark:border-white/10
backdrop-blur-xl
">

<div className="flex items-center gap-3 mb-4">

<div className="
w-9 h-9
rounded-full
bg-blue-600
text-white
flex items-center justify-center
font-semibold
text-sm
">
{initials}
</div>

<span className="text-sm font-medium text-slate-700 dark:text-white">
{username}
</span>

</div>



<a
href="https://www.telecharge.com/"
target="_blank"
rel="noopener noreferrer"
className="block py-3 text-slate-700 hover:text-blue-700 dark:text-white/85 dark:hover:text-white border-b border-slate-200 dark:border-white/10"
>
Telecharge
</a>

<a
href="https://www.todaytix.com/"
target="_blank"
rel="noopener noreferrer"
className="block py-3 text-slate-700 hover:text-blue-700 dark:text-white/85 dark:hover:text-white border-b border-slate-200 dark:border-white/10"
>
TodayTix
</a>

<a
href="https://broadwaydirect.com/"
target="_blank"
rel="noopener noreferrer"
className="block py-3 text-slate-700 hover:text-blue-700 dark:text-white/85 dark:hover:text-white border-b border-slate-200 dark:border-white/10"
>
Broadwaydirect
</a>



<button
onClick={()=>{
onLogout()
setOpen(false)
}}
className="
w-full
mt-4
bg-red-500
hover:bg-red-600
text-white
py-3
rounded-lg
font-semibold
shadow
transition
active:scale-[0.98]
flex
items-center
justify-center
gap-2
"
>

<LogOut className="w-4 h-4"/>

Logout

</button>

</div>

</div>

</nav>

</header>

)

}