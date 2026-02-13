import { useState } from "react"

export default function CheckForm({ onAdd, user }) {
  const [form, setForm] = useState({
    startDate: "",
    endDate: ""
  })

  const submit = () => {
    if (!form.startDate || !form.endDate) return

    onAdd({
      id: Date.now(),
      startDate: form.startDate,
      endDate: form.endDate,
      checkedAt: Date.now(),
      checkedBy: user?.displayName || user?.email
    })

    setForm({
      startDate: "",
      endDate: ""
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80">
          Check Started
        </label>
        <input
          type="date"
          className="input bg-white/10 border-white/10 text-white focus:ring-blue-500"
          value={form.startDate}
          onChange={(e) =>
            setForm({ ...form, startDate: e.target.value })
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80">
          Check Through
        </label>
        <input
          type="date"
          className="input bg-white/10 border-white/10 text-white focus:ring-blue-500"
          value={form.endDate}
          onChange={(e) =>
            setForm({ ...form, endDate: e.target.value })
          }
        />
      </div>

      <button
        onClick={submit}
        className="md:col-span-2 mt-4 rounded-xl py-3 font-semibold text-white
                   bg-blue-600 hover:bg-blue-700
                   shadow-lg shadow-blue-600/20 transition active:scale-[0.99]"
      >
        Add Check
      </button>
    </div>
  )
}
