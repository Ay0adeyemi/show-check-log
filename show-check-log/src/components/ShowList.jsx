import { useState } from "react"
import CheckForm from "./CheckForm"
import { Pencil, Trash2, ChevronDown } from "lucide-react"
import ConfirmModal from "./ConfirmModal"

export default function ShowList({
  shows,
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
    setOpenShowId(prev => (prev === id ? null : id))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    })
  }

  const sortedShows = [...shows].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  )

  return (
    <div className="space-y-5 py-3">
      {sortedShows.map(show => (
        <div
          key={show.id}
          className="bg-white/10 border border-white/10 backdrop-blur-xl p-5 rounded-2xl shadow-xl shadow-black/30"
        >
          <div
            className="flex justify-between items-center mb-3 cursor-pointer select-none"
            onClick={() => toggleShow(show.id)}
          >
            <div className="flex items-center gap-2">
              <ChevronDown
                className={`w-5 h-5 text-white/80 transition-transform ${
                  openShowId === show.id ? "rotate-180" : ""
                }`}
              />
              <h3 className="text-xl font-bold text-white">
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

          {openShowId === show.id && (
            <div
              className="mt-4 space-y-4"
              style={{ animation: "fadeSlideIn 400ms ease-out" }}
            >
              <div className="bg-black/20 border border-white/10 rounded-2xl p-4">
                <CheckForm onAdd={(check) => onAddCheck(show.id, check)} />
              </div>

              {show.checks.length === 0 && (
                <p className="text-white/60 text-sm">
                  No checks yet. Add one above.
                </p>
              )}

              <div className="space-y-3">
                {show.checks.map(check => (
                  <div
                    key={check.id}
                    className="border border-white/10 rounded-2xl p-4 bg-black/20 shadow-sm"
                  >
                    {editingId === check.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <input
                          type="date"
                          className="input bg-white/10 border-white/10 text-white placeholder-white/40"
                          value={editForm.startDate || ""}
                          onChange={e =>
                            seeEdit(setEditForm, editForm, "startDate", e.target.value)
                          }
                        />

                        <input
                          type="date"
                          className="input bg-white/10 border-white/10 text-white placeholder-white/40"
                          value={editForm.endDate || ""}
                          onChange={e =>
                            seeEdit(setEditForm, editForm, "endDate", e.target.value)
                          }
                        />

                        <input
                          type="date"
                          className="input bg-white/10 border-white/10 text-white placeholder-white/40"
                          value={editForm.checkDate || ""}
                          onChange={e =>
                            seeEdit(setEditForm, editForm, "checkDate", e.target.value)
                          }
                        />

                        <input
                          type="time"
                          className="input bg-white/10 border-white/10 text-white placeholder-white/40"
                          value={editForm.time || ""}
                          onChange={e =>
                            seeEdit(setEditForm, editForm, "time", e.target.value)
                          }
                        />

                        <input
                          className="input bg-white/10 border-white/10 text-white placeholder-white/40"
                          value={editForm.checker || ""}
                          onChange={e =>
                            seeEdit(setEditForm, editForm, "checker", e.target.value)
                          }
                        />

                        <button
                          onClick={() => {
                            onUpdateCheck(show.id, editForm)
                            setEditingId(null)
                          }}
                          className="md:col-span-5 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition active:scale-[0.99]"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="font-semibold text-lg mb-1 text-white">
                          {formatDate(check.startDate)} to {formatDate(check.endDate)}
                        </div>

                        <div className="text-white/80 mb-2 text-sm">
                          {formatDate(check.checkDate)} • {check.time}
                        </div>

                        <div className="text-sm font-medium mb-3 text-white/90">
                          Checked by: <span className="text-white">{check.checker}</span>
                        </div>

                        <div className="flex gap-4 text-sm">
                          <button
                            onClick={() => {
                              setEditingId(check.id)
                              setEditForm(check)
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
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

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

function seeEdit(setter, obj, key, value) {
  setter({ ...obj, [key]: value })
}
