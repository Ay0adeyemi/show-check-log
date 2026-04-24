
import { useState } from "react"

export default function ShowForm({ onAdd, onClose }) {
  const [name, setName] = useState("")

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    onAdd(name)
    setName("")
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6 space-y-4
                   bg-white/10 border border-white/10 backdrop-blur-xl
                   shadow-2xl shadow-black/40"
      >
        <h2 className="font-bold text-xl text-white text-center">
          Add Show
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/80">
            Show Name
          </label>

          <input
            className="w-full rounded-xl px-4 py-3 outline-none
                       bg-white/10 border border-white/10 text-white
                       placeholder-white/40 focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Wicked"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl py-3 font-semibold text-white
                     bg-blue-600 hover:bg-blue-700
                     shadow-lg shadow-blue-600/20 transition active:scale-[0.99]"
        >
          Save Show
        </button>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl py-3 font-semibold
                     bg-white/10 hover:bg-white/15 border border-white/10
                     text-white/90 transition active:scale-[0.99]"
        >
          Cancel
        </button>
      </form>
    </div>
  )
}


