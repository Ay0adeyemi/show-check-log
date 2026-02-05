import { useState } from "react"
import { Trash2, ChevronDown } from "lucide-react"

function addDays(base, days) {
  const d = new Date(base)
  d.setDate(d.getDate() + Number(days || 0))
  return d
}

function formatNice(date) {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  })
}

export default function ReminderList({ username, reminders, onDelete }) {
  const [open, setOpen] = useState(true)

  if (!reminders || reminders.length === 0) return null

  const today = new Date()

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl px-4 py-3
                   flex items-center justify-between gap-3 hover:bg-white/15 transition"
      >
        <div className="flex items-center gap-3">
          <div className="text-white/90 font-semibold">
            Reminders
          </div>

          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-white/10 border border-white/10 text-white/80">
            {reminders.length}
          </span>
        </div>

        <ChevronDown
          className={`w-5 h-5 text-white/70 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Collapsible body */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[900px] opacity-100 mt-3" : "max-h-0 opacity-0 mt-0"
        }`}
      >
        <div className="space-y-3">
          {reminders.map((r) => {
            const start = addDays(today, r.daysFrom)
            const end = addDays(today, r.daysTo)

            return (
              <div
                key={r.id}
                className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl p-4
                           flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-white/90 font-semibold">
                    Hi {username},
                  </p>

                  <p className="text-white/70 text-sm leading-relaxed">
                    You are to check all shows from{" "}
                    <span className="text-white">{formatNice(start)}</span>{" "}
                    to{" "}
                    <span className="text-white">{formatNice(end)}</span>.
                  </p>

                  <p className="text-white/50 text-xs mt-1">
                    ({r.daysFrom} → {r.daysTo} days from today)
                  </p>
                </div>

                <button
                  onClick={() => onDelete(r.id)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                  title="Delete reminder"
                >
                  <Trash2 className="w-5 h-5 text-red-300" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
