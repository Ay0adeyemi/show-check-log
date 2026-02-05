import { Github, Mail, FileText } from "lucide-react"

export default function Footer() {
  return (
    <footer className="mt-10 bg-white/10 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-5
        flex flex-row items-center justify-between gap-4 flex-wrap"
      >
        <div className="flex flex-col">
          <div className="font-bold text-white">
            Show Check Log
          </div>
          <div className="text-xs text-white/60">
            © {new Date().getFullYear()} • Ticket Producer
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl border border-white/10
              bg-black/20 hover:bg-black/30
              transition-transform duration-200 hover:scale-110"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5 text-white/80" />
          </a>

          <a
            href="mailto:support@ticketproducer.com"
            className="p-2 rounded-xl border border-white/10
              bg-black/20 hover:bg-black/30
              transition-transform duration-200 hover:scale-110"
            aria-label="Email"
          >
            <Mail className="w-5 h-5 text-white/80" />
          </a>

          <a
            href="#"
            className="p-2 rounded-xl border border-white/10
              bg-black/20 hover:bg-black/30
              transition-transform duration-200 hover:scale-110"
            aria-label="Docs"
          >
            <FileText className="w-5 h-5 text-white/80" />
          </a>
        </div>
      </div>
    </footer>
  )
}


