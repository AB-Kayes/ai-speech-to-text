"use client"


import { useAuth } from "@/contexts/AuthContext"
import AdminDashboard from "./admin-dashboard"


const Admin: React.FC = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Only allow access if authenticated and admin
  if (!isAuthenticated || !user || user.status !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-300">You must be logged in as an admin to view this page.</p>
        </div>
      </div>
    )
  }

  return <AdminDashboard />
}

export default Admin
