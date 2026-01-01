"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function submit(e: any) {
    e.preventDefault()

    const res = await fetch("/api/chat/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })

    if (res.ok) router.push("/dashboard")
    else setError("Wrong login details")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-green-50">
      <form onSubmit={submit} className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md space-y-6 border border-green-300">
        <h1 className="text-3xl font-bold text-center text-green-700">
          Admin Login
        </h1>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <input className="w-full border rounded-xl p-3" placeholder="Email"
          onChange={e=>setEmail(e.target.value)} />

        <input className="w-full border rounded-xl p-3" type="password" placeholder="Password"
          onChange={e=>setPassword(e.target.value)} />

        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold">
          Login
        </button>
      </form>
    </main>
  )
}
