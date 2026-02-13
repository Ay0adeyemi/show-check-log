import { useState, useEffect } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ShowForm from "../components/ShowForm"
import ShowList from "../components/ShowList"
import ReminderModal from "../components/ReminderModal"
import ReminderList from "../components/ReminderList"

import { useNavigate } from "react-router-dom"
import { db } from "../firebase"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"
import toast from "react-hot-toast"
import { Bell } from "lucide-react"

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "firebase/firestore"

export default function Dashboard({ user }) {
  const navigate = useNavigate()

  const [tasksCount, setTasksCount] = useState(0)
  const [shows, setShows] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [reminders, setReminders] = useState([])
  const [reminderOpen, setReminderOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    setLoadError("")

    const unsub = onSnapshot(
      collection(db, "shows"),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
        setShows(data)
        setLoading(false)
      },
      (error) => {
        console.error(error)
        setLoading(false)

        if (error?.code === "permission-denied") {
          toast.error("Session expired. Please login again.")
          navigate("/")
          return
        }

        setLoadError("Failed to load shows.")
      }
    )

    return () => unsub()
  }, [navigate])


  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tasks"), (snapshot) => {
      setTasksCount(snapshot.size)
    })

    return () => unsub()
  }, [])


  useEffect(() => {
    if (!user?.uid) return

    const q = query(
      collection(db, "users", user.uid, "reminders"),
      orderBy("createdAt", "desc")
    )

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }))
      setReminders(data)
    })

    return () => unsub()
  }, [user?.uid])


  const logout = async () => {
    await signOut(auth)
    navigate("/")
  }


  const addShow = async (name) => {
    if (!name?.trim()) return

    try {
      await addDoc(collection(db, "shows"), {
        name: name.trim(),
        checks: [],
        createdAt: Date.now()
      })
      toast.success("Show added")
    } catch {
      toast.error("Failed to add show")
    }
  }

  const addCheck = async (showId, check) => {
    const show = shows.find((s) => s.id === showId)
    if (!show) return

    try {
      await updateDoc(doc(db, "shows", showId), {
        checks: [...show.checks, check]
      })
      toast.success("Check added")
    } catch {
      toast.error("Failed to add check")
    }
  }

  const deleteCheck = async (showId, checkId) => {
    const show = shows.find((s) => s.id === showId)
    if (!show) return

    try {
      await updateDoc(doc(db, "shows", showId), {
        checks: show.checks.filter((c) => c.id !== checkId)
      })
      toast.success("Check deleted")
    } catch {
      toast.error("Failed to delete check")
    }
  }

  const updateCheck = async (showId, updatedCheck) => {
    const show = shows.find((s) => s.id === showId)
    if (!show) return

    try {
      await updateDoc(doc(db, "shows", showId), {
        checks: show.checks.map((c) =>
          c.id === updatedCheck.id ? updatedCheck : c
        )
      })
      toast.success("Check updated")
    } catch {
      toast.error("Failed to update check")
    }
  }

  const deleteShows = async (showId) => {
    try {
      await deleteDoc(doc(db, "shows", showId))
      toast.success("Show deleted")
    } catch {
      toast.error("Failed to delete show")
    }
  }


  const saveReminder = async ({ daysFrom, daysTo }) => {
    if (!user?.uid) return

    try {
      await addDoc(collection(db, "users", user.uid, "reminders"), {
        daysFrom,
        daysTo,
        createdAt: Date.now()
      })

      toast.success("Reminder saved")
      setReminderOpen(false)
    } catch (e) {
      console.error(e)
      toast.error("Failed to save reminder")
    }
  }

  const deleteReminder = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "reminders", id))
      toast.success("Reminder deleted")
    } catch {
      toast.error("Failed to delete reminder")
    }
  }

  /* ------------------------------ UI ------------------------------ */

  return (
    <div className="min-h-screen flex flex-col bg-[#0b1220] text-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-blue-600/25 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 w-96 h-96 bg-cyan-400/15 blur-3xl rounded-full" />

      <Navbar
        username={user?.displayName || user?.email}
        onLogout={logout}
      />

      <div className="flex-grow p-4 max-w-5xl mx-auto w-full relative mt-16">

        {/* Reminder Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setReminderOpen(true)}
            className="p-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl hover:bg-white/15 transition"
          >
            <Bell className="w-5 h-5 text-white/90" />
          </button>
        </div>

        {/* Reminders */}
        <ReminderList
          username={user?.displayName || user?.email || "there"}
          reminders={reminders}
          onDelete={deleteReminder}
        />

        {/* Shows To Check Button */}
        <button
          onClick={() => navigate("/tasks")}
          className="relative w-full rounded-2xl px-6 py-5 font-semibold text-lg
                     bg-white/10 border border-white/10 backdrop-blur-xl
                     shadow-xl shadow-black/30 hover:bg-white/15 transition active:scale-[0.99]"
        >
          📋 Shows To Check

          {tasksCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
              {tasksCount}
            </span>
          )}
        </button>

        {/* Add Entry */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full mt-6 rounded-2xl px-6 py-5 font-semibold text-lg
                     bg-blue-600 hover:bg-blue-700
                     shadow-xl shadow-blue-600/20 transition active:scale-[0.99]"
        >
          + Add Entry
        </button>

        {showForm && (
          <ShowForm
            onAdd={addShow}
            onClose={() => setShowForm(false)}
          />
        )}

        {reminderOpen && (
          <ReminderModal
            onSave={saveReminder}
            onClose={() => setReminderOpen(false)}
          />
        )}

        {loadError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-2xl p-4 mt-6 backdrop-blur-xl">
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
            <ShowList
              user={user}   
              shows={shows}
              onAddCheck={addCheck}
              onDeleteCheck={deleteCheck}
              onUpdateCheck={updateCheck}
              onDeleteShows={deleteShows}
            />
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}



