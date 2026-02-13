import { useState } from "react"
import CheckForm from "./CheckForm"
import { Pencil, Trash2, ChevronDown } from "lucide-react"
import ConfirmModal from "./ConfirmModal"

export default function ShowList({
  shows,
  user,
  onAddCheck,
  onDeleteCheck,
  onUpdateCheck,
  onDeleteShows
}) {
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [openShowId, setOpenShowId] = useState(null)
  const [showToDelete, setShowToDelete] = useState(null)

  const toggleShow = (id) => {
    setOpenShowId((prev) => (prev === id ? null : id))
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    })
  }

  const formatDateTime = (ms) => {
    if (!ms) return "—"
    const d = new Date(ms)
    return d.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  }

  const sortedShows = [...shows].sort((a, b) =>
    (a?.name || "").toLowerCase().localeCompare((b?.name || "").toLowerCase())
  )

  return (
    <div className="space-y-5 py-3">
      {sortedShows.map((show) => {
        const latestCheckedAt = getLatestCheckedAt(show)
        const showOverdue = isOverdue(latestCheckedAt)

        return (
          <div
            key={show.id}
            className={[
              "backdrop-blur-xl p-5 rounded-2xl shadow-xl shadow-black/30",
              showOverdue
                ? "bg-red-500/10 border border-red-500/40"
                : "bg-white/10 border border-white/10"
            ].join(" ")}
            style={showOverdue ? { animation: "overdueGlow 1.6s ease-in-out infinite" } : undefined}
          >
            {/* Header */}
            <div
              className="flex justify-between items-center mb-3 cursor-pointer select-none"
              onClick={() => toggleShow(show.id)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <ChevronDown
                  className={`w-5 h-5 text-white/80 transition-transform ${
                    openShowId === show.id ? "rotate-180" : ""
                  }`}
                />
                <h3 className="text-xl font-bold text-white truncate">
                  {show.name}
                </h3>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowToDelete(show)
                }}
                className="text-red-300 text-sm hover:text-red-200 hover:underline"
              >
                Delete Show
              </button>
            </div>

            {/* Expanded */}
            {openShowId === show.id && (
              <div
                className="mt-4 space-y-4"
                style={{ animation: "fadeSlideIn 400ms ease-out" }}
              >
                {/* Add Check */}
                <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                  <CheckForm
                    user={user}
                    onAdd={(check) => onAddCheck(show.id, check)}
                  />
                </div>

                {(!show.checks || show.checks.length === 0) && (
                  <p className="text-white/60 text-sm">
                    No checks yet. Add one above.
                  </p>
                )}

                {/* Checks */}
                <div className="space-y-3">
                  {(show.checks || []).map((check) => {
                    const checkedToday = isCheckedToday(check.checkedAt)
                    const overdue = isOverdue(check.checkedAt)

                    return (
                      <div
                          key={check.id}
                          className={[ "rounded-2xl p-4 bg-black/20 shadow-sm border",
                                      overdue ? "border-red-500/40" : "border-white/10"].join(" ")}
                          style={overdue ? { animation: "entryOverdueGlow 1.6s ease-in-out infinite" } : undefined}
                      >

                        {editingId === check.id ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-sm text-white/80 font-medium">
                                Check Started
                              </label>
                              <input
                                type="date"
                                className="input bg-white/10 border-white/10 text-white"
                                value={editForm.startDate || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    startDate: e.target.value
                                  })
                                }
                              />
                            </div>

                            <div className="flex flex-col gap-1">
                              <label className="text-sm text-white/80 font-medium">
                                Check Through
                              </label>
                              <input
                                type="date"
                                className="input bg-white/10 border-white/10 text-white"
                                value={editForm.endDate || ""}
                                onChange={(e) =>
                                  setEditForm({
                                    ...editForm,
                                    endDate: e.target.value
                                  })
                                }
                              />
                            </div>

                            <button
                              onClick={() => {
                                onUpdateCheck(show.id, {
                                  ...check,
                                  startDate: editForm.startDate,
                                  endDate: editForm.endDate,
                                  checkedAt: Date.now(),
                                  checkedBy: user?.displayName || user?.email
                                })
                                setEditingId(null)
                              }}
                              className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition active:scale-[0.99]"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-semibold text-lg text-white">
                                  {formatDate(check.startDate)} to {formatDate(check.endDate)}
                                </div>

                                <div className="text-white/80 mt-1 text-sm">
                                  Checked on:{" "}
                                  <span className="text-white">
                                    {formatDateTime(check.checkedAt)}
                                  </span>
                                </div>

                                <div className="text-white/70 mt-1 text-sm">
                                  Last checked:{" "}
                                  <span className="text-white/90 font-semibold">
                                    {formatRelative(check.checkedAt)}
                                  </span>
                                </div>

                                <div className="text-sm font-medium mt-2 text-white/90">
                                  Checked by:{" "}
                                  <span className="text-white">
                                    {check.checkedBy || "Unknown"}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-2 shrink-0">
                                {checkedToday && (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold
                                                   bg-emerald-500/15 text-emerald-200 border border-emerald-500/30">
                                    Checked Today
                                  </span>
                                )}

                                {overdue && (
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold
                                                   bg-red-500/15 text-red-200 border border-red-500/30">
                                    Overdue
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-4 text-sm mt-4">
                              <button
                                onClick={() => {
                                  setEditingId(check.id)
                                  setEditForm({
                                    startDate: check.startDate,
                                    endDate: check.endDate
                                  })
                                }}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                                title="Edit"
                              >
                                <Pencil className="h-5 w-5 text-blue-300" />
                              </button>

                              <button
                                onClick={() => onDeleteCheck(show.id, check.id)}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition"
                                title="Delete"
                              >
                                <Trash2 className="h-5 w-5 text-red-300" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {showToDelete && (
        <ConfirmModal
          title="Delete Show"
          message={`Delete "${showToDelete.name}" and all its checks? This cannot be undone.`}
          confirmText="Delete Show"
          onCancel={() => setShowToDelete(null)}
          onConfirm={() => {
            onDeleteShows(showToDelete.id)
            setShowToDelete(null)
          }}
        />
      )}
    </div>
  )
}

function getLatestCheckedAt(show) {
  const times = (show.checks || [])
    .map((c) => c.checkedAt)
    .filter(Boolean)

  if (times.length === 0) return null

  return Math.max(...times)
}

function toUtcDayKey(ms) {
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
}

function isCheckedToday(checkedAt) {
  if (!checkedAt) return false
  return toUtcDayKey(checkedAt) === toUtcDayKey(Date.now())
}
function isOverdue(checkedAt) {
  if (!checkedAt) return true
  return !isCheckedToday(checkedAt)
}

function formatRelative(ms) {
  if (!ms) return "—"

  const diff = Date.now() - ms

  if (diff < 60_000) return "just now"

  const mins = Math.floor(diff / 60_000)
  if (mins < 60)
    return `${mins} minute${mins === 1 ? "" : "s"} ago`

  const hours = Math.floor(mins / 60)
  if (hours < 24)
    return `${hours} hour${hours === 1 ? "" : "s"} ago`

  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

