import { Github, Mail, FileText } from "lucide-react"

export default function Footer({onOpenFaq}) {
  return (

<footer className="mt-10 bg-blue-900 dark:bg-white/10 backdrop-blur-xl border-t border-white/10 w-full">

{/* MOBILE FULL WIDTH / DESKTOP CENTERED */}

<div className="w-full md:max-w-6xl md:mx-auto px-4 py-4 flex items-center justify-between">

{/* LEFT */}

<div className="flex flex-col leading-tight">

<div className="font-bold text-white">
Show Check Log
</div>

<div className="text-xs text-white/60">
© {new Date().getFullYear()} • Ticket Producer
</div>

</div>


{/* RIGHT ICONS */}

<div className="flex items-center gap-3">

<a
href="https://github.com/"
target="_blank"
rel="noopener noreferrer"
className="
p-2
rounded-xl
border border-white/10
bg-black/20
hover:bg-black/30
transition
hover:scale-110
"
>

<Github className="w-4 h-4 text-white/80"/>

</a>



<a
href="mailto:support@ticketproducer.com"
className="
p-2
rounded-xl
border border-white/10
bg-black/20
hover:bg-black/30
transition
hover:scale-110
"
>

<Mail className="w-4 h-4 text-white/80"/>

</a>



<button
onClick={onOpenFaq}
className="
p-2
rounded-xl
border border-white/10
bg-black/20
hover:bg-black/30
transition
hover:scale-110
text-white
"
>

<h2>Need Help?</h2>

</button>

</div>

</div>

</footer>

  )
}

