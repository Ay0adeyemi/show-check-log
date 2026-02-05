import { useState } from "react"
import { User, LogOut, Menu, X } from "lucide-react"

export default function Navbar({ username, onLogout }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-white/10 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between relative">
          <h1 className="font-bold tracking-wide text-lg text-white">
            Show Check Log
          </h1>

          <div className="hidden lg:flex gap-8 absolute left-1/2 -translate-x-1/2 text-white/80">
            <a
              href="https://www.telecharge.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Telecharge
            </a>
            <a
              href="https://www.todaytix.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              TodayTix
            </a>
            <a
              href="https://broadwaydirect.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Broadwaydirect
            </a>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-white/90">
            <span className="text-sm">Welcome, {username}</span>
            <User className="w-5 h-5 text-white/80" />
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-700 text-white px-3 py-2 rounded-xl text-sm flex items-center gap-2 shadow-lg transition active:scale-[0.99]"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <button
            className="lg:hidden text-white"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-4 pt-2 bg-[#0b1220]/70 backdrop-blur-xl border-t border-white/10">
            <div className="flex items-center gap-2 text-white/90 font-medium mb-3">
              <User className="w-5 h-5 text-white/70" />
              <span className="text-sm">{username}</span>
            </div>

            <a
              href="https://www.telecharge.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 text-white/85 hover:text-white border-b border-white/10"
            >
              Telecharge
            </a>
            <a
              href="https://www.todaytix.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 text-white/85 hover:text-white border-b border-white/10"
            >
              TodayTix
            </a>
            <a
              href="https://broadwaydirect.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 text-white/85 hover:text-white border-b border-white/10"
            >
              Broadwaydirect
            </a>

            <button
              onClick={() => {
                onLogout()
                setOpen(false)
              }}
              className="w-full mt-4 bg-red-500 hover:bg-red-700 text-white py-3 rounded-xl font-semibold shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}



