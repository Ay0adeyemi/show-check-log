import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from "react"
import Login from './pages/Login'
import Signup from './pages/Signups'
import Home from "./pages/Home"
import Guide from "./pages/Guide"
import Chat from "./pages/Chat"
import Dashboard from './pages/Dashboard'
import Tasks from "./pages/Tasks"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth, db } from "./firebase" // Added db
import { collection, onSnapshot } from "firebase/firestore" // Added for live stats
import ForgotPassword from "./pages/ForgotPassword"
import { Toaster } from "react-hot-toast"
import NotesBoard from "./components/NotesBoard"
import { doc, setDoc } from "firebase/firestore"

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notesOpen, setNotesOpen] = useState(false)
  const [shows, setShows] = useState([]) // 🔥 Added state to hold shows globally

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  )

  useEffect(() => {
  if (!user) return

  const userRef = doc(db, "onlineUsers", user.uid)

  // mark online immediately
  setDoc(userRef, {
    name: user.displayName || user.email,
    lastActive: Date.now()
  })

  // keep updating
  const interval = setInterval(() => {
    setDoc(userRef, {
      name: user.displayName || user.email,
      lastActive: Date.now()
    })
  }, 15000)

  // update on leave
  const handleLeave = () => {
    setDoc(userRef, {
      name: user.displayName || user.email,
      lastActive: Date.now()
    })
  }

  window.addEventListener("beforeunload", handleLeave)

  return () => {
    clearInterval(interval)
    window.removeEventListener("beforeunload", handleLeave)
  }
}, [user])

  // 🔥 THEME LOGIC
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"))
  }

  // 🔥 LIVE DATA FETCH (For Home Stats & Dashboard)
  useEffect(() => {
    // We listen to shows here so the Home page stats update in real-time
    const unsub = onSnapshot(collection(db, "shows"), (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      setShows(data)
    })
    return () => unsub()
  }, [])

  // 🔥 AUTH LOGIC
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  // 🔥 LOGOUT FUNCTION
  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0f172a] text-white font-bold">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="tracking-widest uppercase text-xs">Initializing System...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      
      {notesOpen && (
        <NotesBoard user={user} onClose={() => setNotesOpen(false)} />
      )}

      <Routes>
        {/* AUTH ROUTES */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* HOME ROUTE - Now receiving the 'shows' data */}
        <Route
          path="/"
          element={
            user ? (
              <Home 
                user={user} 
                theme={theme} 
                toggleTheme={toggleTheme} 
                onLogout={handleLogout}
                onOpenNotes={() => setNotesOpen(true)}
                shows={shows} 
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* FEATURES */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard 
                user={user} 
                theme={theme} 
                toggleTheme={toggleTheme}
                onOpenNotes={() => setNotesOpen(true)} 
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/tasks"
          element={
            user ? (
              <Tasks user={user} theme={theme} toggleTheme={toggleTheme} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route 
          path="/guide" 
          element={user ? <Guide user={user} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/chat" 
          element={user ? <Chat user={user} theme={theme} toggleTheme={toggleTheme} /> : <Navigate to="/login" />} 
        />

      </Routes>
    </BrowserRouter>
  )
}