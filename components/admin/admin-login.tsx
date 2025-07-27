"use client"

import type React from "react"
import { useState } from "react"
import { LogIn, AlertCircle } from "lucide-react"

interface AdminLoginProps {
  onLogin: () => void
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Hardcoded admin credentials
    if (email === "admin@aaladin.com" && password === "admin123") {
      localStorage.setItem("adminAuth", "true")
      onLogin()
    } else {
      setError("Invalid credentials")
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="bg-gray-900/50 backdrop-blur-sm border border-violet-500/30 rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">Sign in to access the dashboard</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-violet-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
              placeholder="admin@aaladin.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-violet-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Demo credentials: admin@aaladin.com / admin123</p>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
