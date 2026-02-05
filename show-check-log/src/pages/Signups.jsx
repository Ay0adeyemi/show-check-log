import { useState } from "react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../firebase"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import AuthLayout from "../components/AuthLayout"

export default function Signups() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()

    if (!name || !email || !password || !confirm) {
      toast.error("Fill in all fields")
      return
    }

    if (password.length < 6) {
      toast.error("Password must be 6+ characters")
      return
    }

    if (password !== confirm) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setLoading(true)
      const cred = await createUserWithEmailAndPassword(auth, email, password)

      await updateProfile(cred.user, { displayName: name })

      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        createdAt: Date.now()
      })

      toast.success("Account created")
      navigate("/dashboard")
    } catch (err) {
      toast.error("Could not create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout heading="Show Check Log">
      <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
        Create your account
      </h2>
      <p className="text-white/60 text-center mt-1 mb-6 text-sm">
        Fill in your details to get started
      </p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white/80">Name</label>
          <input
            type="text"
            className="mt-1 w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/80">Email</label>
          <input
            type="email"
            className="mt-1 w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/80">Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-white/80">Confirm Password</label>
          <input
            type="password"
            className="mt-1 w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••••"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
          />
        </div>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 shadow-lg shadow-blue-600/20 transition active:scale-[0.99]"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-white/70 mt-2">
          Already have an account?{" "}
          <Link to="/" className="text-blue-300 hover:text-blue-200 underline underline-offset-4">
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

