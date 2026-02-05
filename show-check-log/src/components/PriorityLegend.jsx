export default function PriorityLegend() {
  return (
    <div className="bg-white/10 border border-white/10 backdrop-blur-xl rounded-2xl p-5 mb-5 shadow-xl shadow-black/30 mt-8">
      <h4 className="text-sm font-semibold text-white mb-3">
        Priority Legend
      </h4>

      <div className="flex flex-wrap gap-4 text-sm">
        <LegendItem dot="bg-red-500" label="High Priority" />
        <LegendItem dot="bg-orange-400" label="Medium Priority" />
        <LegendItem dot="bg-green-500" label="Low Priority" />
      </div>
    </div>
  )
}

function LegendItem({ dot, label }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-black/20 border border-white/10 px-3 py-2">
      <span className={`w-3 h-3 rounded-full ${dot}`} />
      <span className="text-white/80">{label}</span>
    </div>
  )
}
