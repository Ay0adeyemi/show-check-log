import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { 
  ChevronDown, 
  HelpCircle, 
  ArrowLeft, 
  Sun, 
  Moon, 
  Search,
  BookOpen
} from "lucide-react"

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

export default function Guide() {
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFaqs = faqs.filter(
    (faq) => 
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? "bg-[#020617] text-slate-200" : "bg-gray-50 text-slate-900"}`}>
      
      {/* HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-lg border-b px-6 py-4 flex items-center justify-between ${isDarkMode ? "bg-[#020617]/80 border-white/5" : "bg-white/80 border-gray-200"}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")} 
            className={`p-2 rounded-full transition-all ${isDarkMode ? "hover:bg-white/10 text-slate-400" : "hover:bg-gray-200 text-gray-600"}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg flex items-center gap-2">
              <HelpCircle size={20} className="text-blue-500" />
              Help Center
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-all ${isDarkMode ? "bg-slate-800 border-white/10 text-yellow-400" : "bg-white border-gray-200 text-indigo-600 shadow-sm"}`}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        
        {/* HERO SECTION */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-widest mb-4">
            <BookOpen size={14} /> Documentation
          </div>
          <h2 className="text-4xl font-extrabold mb-4 tracking-tight">How can we help?</h2>
          <p className={`text-lg ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            Search our knowledge base or browse the most common questions below.
          </p>

          {/* SEARCH BAR */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search for questions, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-4 pl-12 pr-4 rounded-2xl border outline-none transition-all ${
                isDarkMode 
                ? "bg-slate-900 border-white/10 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" 
                : "bg-white border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 shadow-sm"
              }`}
            />
          </div>
        </div>

        {/* FAQ ACCORDION */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div 
                  key={index}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen 
                    ? (isDarkMode ? "bg-slate-900 border-blue-500/50" : "bg-white border-indigo-500 shadow-md") 
                    : (isDarkMode ? "bg-slate-900/50 border-white/5 hover:border-white/20" : "bg-white border-gray-100 hover:border-gray-300 shadow-sm")
                  }`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className={`font-semibold text-lg ${isOpen ? (isDarkMode ? "text-white" : "text-indigo-600") : ""}`}>
                      {faq.q}
                    </span>
                    <ChevronDown 
                      size={20} 
                      className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : "text-slate-500"}`} 
                    />
                  </button>

                  <div 
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className={`p-5 pt-0 text-base leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                      <div className={`h-px w-full mb-4 ${isDarkMode ? "bg-white/5" : "bg-gray-100"}`} />
                      {faq.a}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-500">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* FOOTER CALL TO ACTION */}
        <div className={`mt-16 p-8 rounded-3xl text-center border ${isDarkMode ? "bg-gradient-to-b from-blue-500/10 to-transparent border-blue-500/20" : "bg-indigo-50 border-indigo-100"}`}>
          <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
          <p className={`mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
            If you couldn't find what you were looking for, reach out to the team via the message board.
          </p>
          <button 
            onClick={() => navigate("/chat")}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/20"
          >
            Open Team Chat
          </button>
        </div>
      </main>
    </div>
  )
}