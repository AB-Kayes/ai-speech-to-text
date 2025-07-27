"use client"

import type React from "react"
import { useState } from "react"
import { CreditCard, Users, LogOut } from "lucide-react"
import PaymentApproval from "./PaymentApproval"
import UserList from "./UserList"

interface AdminDashboardProps {
  onLogout: () => void
}

type TabType = "payments" | "users"

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>("payments")

  const handleLogout = () => {
    localStorage.removeItem("adminAuth")
    onLogout()
  }

  const sidebarItems = [
    { id: "payments" as TabType, label: "Payment Approval", icon: CreditCard },
    { id: "users" as TabType, label: "User List", icon: Users },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "payments":
        return <PaymentApproval />
      case "users":
        return <UserList />
      default:
        return <PaymentApproval />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-violet-500/30 min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-white mb-8">Admin Panel</h1>

            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                      activeTab === item.id
                        ? "bg-violet-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Logout button at bottom */}
          <div className="absolute bottom-0 left-0 w-64 p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">{renderContent()}</div>
      </div>
    </div>
  )
}

export default AdminDashboard
