export default function EntryForm() {
  return (
    <div className="bg-white p-5 rounded-2xl shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">New Show Check</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="input" placeholder="Show Name" />
        <input className="input" type="date" />
        <input className="input" type="date" />
        <input className="input" type="time" />
        <input className="input" type="date" />
        <input className="input" placeholder="Checker Name" />
      </div>

      <button className="mt-4 bg-accent text-white px-6 py-2 rounded-xl">
        Save Entry
      </button>
    </div>
  )
}
