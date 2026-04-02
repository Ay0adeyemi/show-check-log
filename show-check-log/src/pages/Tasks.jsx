import { useEffect, useState } from "react"
import { db } from "../firebase"
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDocs
} from "firebase/firestore"

import Navbar from "../components/Navbar"
import TaskForm from "../components/TaskForm"
import TaskList from "../components/TaskList"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"
import PriorityLegend from "../components/PriorityLegend"
import PromoDrawer from "../components/PromoDrawer"
import { Tag } from "lucide-react"


export default function Tasks({ user, theme, toggleTheme }) {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [promoOpen, setPromoOpen] = useState(false)


  const logout = async () => {
    await signOut(auth)
    navigate("/")
  }

  useEffect(() => {
    setLoading(true)
    setLoadError("")

    const unsub = onSnapshot(
      collection(db, "tasks"),
      (snapshot) => {
        const data = snapshot.docs.map(d => ({
          ...d.data(),
          id: d.id
        }))
        setTasks(data)
        setLoading(false)
      },
      (error) => {
        console.error(error)
        setLoading(false)

        if (error?.code === "permission-denied") {
          setLoadError("Session expired or not authorized. Please log in again.")
          toast.error("Please log in again")
          navigate("/")
          return
        }

        setLoadError("Something went wrong while loading tasks.")
        toast.error("Failed to load tasks")
      }
    )

    return () => unsub()
  }, [navigate])

  const addTask = async (task) => {
  try {

    // Save task
    await addDoc(collection(db, "tasks"), task)

    // Check if show already exists
    const snapshot = await getDocs(collection(db, "shows"))

    const exists = snapshot.docs.some(
      d => d.data().name.toLowerCase() === task.name.toLowerCase()
    )

    // If show doesn't exist, create it
    if (!exists) {
      await addDoc(collection(db, "shows"), {
        name: task.name,
        checks: [],
        createdAt: Date.now()
      })
    }

    toast.success("Show added")

  } catch (e) {
    toast.error("Failed to add task")
  }
}

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, "tasks", id))
      toast.success("Task deleted")
    } catch (e) {
      toast.error("Failed to delete task")
    }
  }

  const updateTask = async (id, updates) => {
    try {
      await updateDoc(doc(db, "tasks", id), updates)
      toast.success("Task updated")
    } catch (e) {
      toast.error("Failed to update task")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1220] text-white relative overflow-hidden">

      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-blue-600/25 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 w-96 h-96 bg-cyan-400/15 blur-3xl rounded-full" />

      <Navbar username={user?.displayName || user?.email} onLogout={logout} theme={theme} toggleTheme={toggleTheme}/>

     <div className="w-full max-w-5xl mx-auto px-4 mt-20">
  <div className="w-full flex items-center justify-between">

    <button
      onClick={() => navigate("/dashboard")}
      className="flex items-center gap-2 text-white/90 hover:text-white font-bold text-lg"
    >
      <ArrowLeft size={18} />
      Back to Dashboard
    </button>

    <button
      onClick={() => setPromoOpen(true)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl
                 bg-white/10 border border-white/10 backdrop-blur-xl
                 hover:bg-white/15 transition font-semibold"
    >
      <Tag size={18} />
      Promo Codes
    </button>
  </div>
</div>



      <div className="max-w-5xl mx-auto w-full p-4 relative">
        <PriorityLegend />

        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full mt-4 rounded-2xl px-6 py-5 font-semibold text-lg
                     bg-blue-600 hover:bg-blue-700 text-white
                     shadow-xl shadow-blue-600/20 transition active:scale-[0.99]"
        >
          + Add Show To Check
        </button>

        {showForm && (
          <TaskForm
            onAdd={addTask}
            onClose={() => setShowForm(false)}
          />
        )}

        {loadError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-2xl p-4 mt-5 backdrop-blur-xl">
            {loadError}
          </div>
        )}

        {loading ? (
          <div className="space-y-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-white/10 border border-white/10 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <TaskList tasks={tasks} onDelete={deleteTask} onUpdate={updateTask} />
          </div>
        )}
      </div>
      <PromoDrawer
  open={promoOpen}
  onClose={() => setPromoOpen(false)}
  user={user}
/>


    </div>
  )
}
