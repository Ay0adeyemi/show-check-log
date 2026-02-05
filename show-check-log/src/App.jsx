import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from "react"
import Login from './pages/Login'
import Signup from './pages/Signups'
import Dashboard from './pages/Dashboard'
import Tasks from "./pages/Tasks"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import ForgotPassword from "./pages/ForgotPassword"
import { Toaster } from "react-hot-toast"






export default function App() {

  const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (u) => {
    setUser(u)
    setLoading(false)
  })

  return () => unsub()
}, [])

  return (
    <BrowserRouter>
  <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user}/> : <Navigate to="/" />} />
        <Route path="/tasks" element={user ? <Tasks user={user}/> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

      </Routes>
    </BrowserRouter>
  )
}

