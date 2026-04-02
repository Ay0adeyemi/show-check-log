
import { useState } from "react"

export default function ReminderModal({ onSave, onClose }) {
  const [daysFrom, setDaysFrom] = useState("")
  const [daysTo, setDaysTo] = useState("")
  const [error, setError] = useState("")

  const submit = (e) => {
    e.preventDefault()
    setError("")

    const from = Number(daysFrom)
    const to = Number(daysTo)

    if (!Number.isFinite(from) || !Number.isFinite(to)) {
      setError("Enter valid numbers")
      return
    }
    if (from < 0 || to < 0) {
      setError("Days cannot be negative")
      return
    }
    if (from > to) {
      setError("Start days must be less than End days")
      return
    }

    onSave({ daysFrom: from, daysTo: to })
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl"
      >
        <h2 className="text-xl font-bold text-white text-center">
          Add Reminder
        </h2>

        {error && (
          <p className="text-red-300 text-sm mt-3 text-center">{error}</p>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-white/80">
              Start in (days from today)
            </label>
            <input
              type="number"
              className="w-full rounded-xl border border-white/10 bg-white/10 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300/40"
              placeholder="e.g. 6"
              value={daysFrom}
              onChange={(e) => setDaysFrom(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-white/80">
              End in (days from today)
            </label>
            <input
              type="number"
              className="w-full rounded-xl border border-white/10 bg-white/10 text-white px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-300/40"
              placeholder="e.g. 21"
              value={daysTo}
              onChange={(e) => setDaysTo(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="w-1/2 py-2 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-semibold shadow-xl shadow-blue-600/20 transition active:scale-[0.99]"
          >
            Save Reminder
          </button>
        </div>
      </form>
    </div>
  )
}

