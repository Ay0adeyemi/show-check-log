import { useState } from "react"

export default function CheckForm({ onAdd }) {
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    checkDate: "",
    time: "",
    checker: ""
  })

  const submit = () => {
    if (!form.startDate || !form.endDate || !form.checkDate || !form.time || !form.checker) {
      return
    }

    onAdd({ ...form, id: Date.now() })

    setForm({
      startDate: "",
      endDate: "",
      checkDate: "",
      time: "",
      checker: ""
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 py-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80">
          Check Started
        </label>
        <input
          type="date"
          className="input bg-white/10 border-white/10 text-white placeholder-white/40 focus:ring-blue-500"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80">
          Check Through
        </label>
        <input
          type="date"
          className="input bg-white/10 border-white/10 text-white placeholder-white/40 focus:ring-blue-500"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80">
          Date Checked
        </label>
        <input
          type="date"
          className="input bg-white/10 border-white/10 text-white placeholder-white/40 focus:ring-blue-500"
          value={form.checkDate}
          onChange={(e) => setForm({ ...form, checkDate: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80">
          Time Checked
        </label>
        <input
          type="time"
          className="input bg-white/10 border-white/10 text-white placeholder-white/40 focus:ring-blue-500"
          value={form.time}
          onChange={(e) => setForm({ ...form, time: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-white/80">
          Checked By
        </label>
        <input
          type="text"
          className="input bg-white/10 border-white/10 text-white placeholder-white/40 focus:ring-blue-500"
          placeholder="Name"
          value={form.checker}
          onChange={(e) => setForm({ ...form, checker: e.target.value })}
        />
      </div>

      <button
        onClick={submit}
        className="md:col-span-5 mt-4 rounded-xl py-3 font-semibold text-white
                   bg-blue-600 hover:bg-blue-700
                   shadow-lg shadow-blue-600/20 transition active:scale-[0.99]"
      >
        Add Check
      </button>
    </div>
  )
}
