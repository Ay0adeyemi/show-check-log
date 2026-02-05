import { useState } from "react"
import ConfirmModal from "./ConfirmModal"
import TaskForm from "./TaskForm"
import { Pencil, Trash2 } from "lucide-react"

export default function TaskList({ tasks, onDelete, onUpdate }) {
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [taskToEdit, setTaskToEdit] = useState(null)

  if (tasks.length === 0) {
    return (
      <p className="text-center text-white/60 mt-6">
        No shows assigned yet
      </p>
    )
  }

  const priorityOrder = {
    High: 1,
    Medium: 2,
    Low: 3
  }

  const sortedTasks = [...tasks].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  )

  const borderColor = (p) =>
    p === "High"
      ? "rgba(239,68,68,0.9)"
      : p === "Medium"
      ? "rgba(249,115,22,0.9)"
      : "rgba(34,197,94,0.9)"

  return (
    <div className="space-y-4">
      {sortedTasks.map(task => (
        <div
          key={task.id}
          className="
            bg-white/10 border border-white/10 backdrop-blur-xl p-5 rounded-2xl
            shadow-xl shadow-black/30
            transition-all duration-300
            hover:-translate-y-1
            hover:shadow-2xl hover:shadow-blue-500/20
          "
          style={{
            borderLeft: "4px solid",
            borderLeftColor: borderColor(task.priority)
          }}
        >
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-white truncate">
                {task.name}
              </h3>

              <a
                href={task.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-300 hover:text-blue-200 underline underline-offset-4 text-sm transition"
              >
                Visit Website
              </a>

              <p className="mt-2 text-white/70 text-sm leading-relaxed">
                {task.note}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTaskToEdit(task)}
                className="
                  p-2 rounded-xl bg-white/5 border border-white/10
                  transition-transform duration-200
                  hover:bg-white/10 hover:scale-110
                "
                title="Edit"
              >
                <Pencil className="h-5 w-5 text-blue-300" />
              </button>

              <button
                onClick={() => setTaskToDelete(task)}
                className="
                  p-2 rounded-xl bg-white/5 border border-white/10
                  transition-transform duration-200
                  hover:bg-white/10 hover:scale-110
                "
                title="Delete"
              >
                <Trash2 className="h-5 w-5 text-red-300" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {taskToEdit && (
        <TaskForm
          initialValues={taskToEdit}
          submitText="Save Changes"
          onAdd={(updated) => {
            onUpdate(taskToEdit.id, updated)
            setTaskToEdit(null)
          }}
          onClose={() => setTaskToEdit(null)}
        />
      )}

      {taskToDelete && (
        <ConfirmModal
          title="Delete Show To Check"
          message={`Are you sure you want to delete "${taskToDelete.name}"? This cannot be undone.`}
          confirmText="Delete"
          onCancel={() => setTaskToDelete(null)}
          onConfirm={() => {
            onDelete(taskToDelete.id)
            setTaskToDelete(null)
          }}
        />
      )}
    </div>
  )
}




