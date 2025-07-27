"use client"

import type React from "react"
import { useState } from "react"
import { Home, Users, CreditCard, BarChart3, Shield } from "lucide-react"
import UserList from "./user-list"
import PaymentApproval from "./payment-approval"

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"users" | "payments" | "analytics">("users")

  const sidebarItems = [
    { id: "users" as const, label: "User Management", icon: Users },
    { id: "payments" as const, label: "Payment Approval", icon: CreditCard },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-violet-500/30 min-h-screen">
          <div className="p-6">
            {/* Return to Home Button */}
            <a
              href="/"
              className="flex items-center gap-3 w-full px-4 py-3 mb-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-colors font-medium"
            >
              <Home className="w-5 h-5" />
              <span>Return to Home</span>
            </a>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-gray-400 text-sm">Management Dashboard</p>
              </div>
            </div>

            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === item.id
                      ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "users" && <UserList />}
            {activeTab === "payments" && <PaymentApproval />}
            {activeTab === "analytics" && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-violet-500/30 rounded-xl p-8 text-center">
                <BarChart3 className="w-16 h-16 text-violet-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
                <p className="text-gray-400">Coming soon - detailed usage analytics and reporting</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
