import { useState } from "react"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase"
import { useNavigate, Link } from "react-router-dom"
import toast from "react-hot-toast"
import AuthLayout from "../components/AuthLayout"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  

  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Fill in all fields")
      return
    }

    try {
      setLoading(true)
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/")
    } catch (err) {
        toast.error("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async () => {
    if (!email) {
      toast.error("Enter your email first")
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      toast.success("Password reset email sent")
    } catch (err) {
      toast.error("Could not send reset email")
    }
  }

  return (
    <AuthLayout heading="Show Check Log">
      <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
        Welcome back
      </h2>
      <p className="text-white/60 text-center mt-1 mb-6 text-sm">
        Login to continue
      </p>

      <form onSubmit={submit} className="space-y-4">
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

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={forgotPassword}
            className="text-white/70 hover:text-white underline underline-offset-4"
          >
            Forgot password?
          </button>

          <Link
            to="/signup"
            className="text-blue-300 hover:text-blue-200 underline underline-offset-4"
          >
            Create Account
          </Link>
        </div>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 shadow-lg shadow-blue-600/20 transition active:scale-[0.99]"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-center text-xs text-white/50 mt-4">
          Ticket Producer • Language: English
        </p>
      </form>
    </AuthLayout>
  )
}

