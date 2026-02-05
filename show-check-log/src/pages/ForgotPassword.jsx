import { useState } from "react"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../firebase"
import { Link } from "react-router-dom"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const submit = async (e) => {
    e.preventDefault()
    setMsg("")
    setError("")

    if (!email) {
      setError("Enter your email")
      return
    }

    try {
      await sendPasswordResetEmail(auth, email)
      setMsg("Password reset link sent. Check your email.")
    } catch (err) {
      setError("Could not send reset email. Check the email address.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <form
        onSubmit={submit}
        className="bg-white p-6 rounded-xl shadow w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-950">
          Reset Password
        </h2>

        {msg && <p className="text-green-600 mb-3">{msg}</p>}
        {error && <p className="text-red-500 mb-3">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="text-white w-full mt-4 bg-blue-950 py-2 rounded-lg shadow-lg hover:bg-blue-700">
          Send reset link
        </button>

        <p className="mt-3 text-sm text-center">
          <Link to="/" className="text-blue-600 underline">
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  )
}
