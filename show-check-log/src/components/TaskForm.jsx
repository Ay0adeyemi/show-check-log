
import { useEffect, useState } from "react"

export default function TaskForm({
  onAdd,
  onClose,
  initialValues,
  submitText
}) {
  const [name, setName] = useState("")
  const [link, setLink] = useState("")
  const [note, setNote] = useState("")
  const [priority, setPriority] = useState("")

  useEffect(() => {
    if (!initialValues) return

    setName(initialValues.name || "")
    setLink(initialValues.link || "")
    setNote(initialValues.note || "")
    setPriority(initialValues.priority || "")
  }, [initialValues])

  const submit = (e) => {
    e.preventDefault()

    if (!name || !link || !priority) return

    const payload = initialValues?.createdAt
      ? { name, link, note, priority }
      : { name, link, note, priority, createdAt: Date.now() }

    onAdd(payload)

    if (!initialValues) {
      setName("")
      setLink("")
      setNote("")
      setPriority("Medium")
    }

    onClose?.()
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
          {initialValues ? "Edit Show To Check" : "Add Show To Check"}
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/80">
            Show Name
          </label>
          <input
            className="w-full rounded-xl px-4 py-3 outline-none
                       bg-white/10 border border-white/10 text-white
                       placeholder-white/40 focus:ring-2 focus:ring-blue-500"
            placeholder="Show Name"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/80">
            Website Link
          </label>
          <input
            className="w-full rounded-xl px-4 py-3 outline-none
                       bg-white/10 border border-white/10 text-white
                       placeholder-white/40 focus:ring-2 focus:ring-blue-500"
            placeholder="https://..."
            value={link}
            onChange={e => setLink(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/80">
            Brief Note (optional)
          </label>
          <textarea
            className="w-full rounded-xl px-4 py-3 outline-none resize-none
                       bg-white/10 border border-white/10 text-white
                       placeholder-white/40 focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Brief Note"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/80">
            Priority
          </label>
          <select
            className="w-full rounded-xl px-4 py-3 outline-none
                       bg-white/10 border border-white/10 text-white
                       focus:ring-2 focus:ring-blue-500"
            value={priority}
            onChange={e => setPriority(e.target.value)}
          >
            <option value="" disabled className="text-black">
              Select Priority
            </option>
            <option value="Low" className="text-black">Low</option>
            <option value="Medium" className="text-black">Medium</option>
            <option value="High" className="text-black">High</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl py-3 font-semibold text-white
                     bg-blue-600 hover:bg-blue-700
                     shadow-lg shadow-blue-600/20 transition active:scale-[0.99]"
        >
          {submitText || (initialValues ? "Save Changes" : "Save Task")}
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
