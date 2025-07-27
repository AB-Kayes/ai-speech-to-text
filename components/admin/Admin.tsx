"use client"

import type React from "react"
import { useState, useEffect } from "react"
import AdminLogin from "./AdminLogin"
import AdminDashboard from "./AdminDashboard"

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if admin is already logged in
    const adminAuth = localStorage.getItem("adminAuth")
    if (adminAuth === "true") {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return <>{isAuthenticated ? <AdminDashboard onLogout={handleLogout} /> : <AdminLogin onLogin={handleLogin} />}</>
}

export default Admin
