"use client"

import type React from "react"
import { useState } from "react"
import { User, LogOut, CreditCard, Settings, ChevronDown } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface UserMenuProps {
  onOpenCredits: () => void
}

const UserMenu: React.FC<UserMenuProps> = ({ onOpenCredits }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 bg-gray-900/50 border border-violet-500/30 rounded-lg hover:bg-gray-800 transition-all duration-300 backdrop-blur-sm"
      >
        <div className="w-6 lg:w-8 h-6 lg:h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-3 lg:w-4 h-3 lg:h-4 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-white font-medium text-xs lg:text-sm">{user.name}</p>
          <p className="text-violet-300 text-xs">{user.credits} credits</p>
        </div>
        <ChevronDown
          className={`w-3 lg:w-4 h-3 lg:h-4 text-white transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 lg:w-64 bg-gray-900/90 backdrop-blur-md border border-violet-500/30 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-violet-500/20">
            <p className="text-white font-medium text-sm lg:text-base">{user.name}</p>
            <p className="text-gray-300 text-xs lg:text-sm">{user.email}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs lg:text-sm text-gray-300">Credits:</span>
              <span className="text-violet-300 font-semibold text-xs lg:text-sm">{user.credits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs lg:text-sm text-gray-300">Plan:</span>
              <span className="text-violet-300 font-semibold capitalize text-xs lg:text-sm">{user.plan}</span>
            </div>
          </div>

          <div className="p-2">
            <button
              onClick={() => {
                onOpenCredits()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-800 rounded-lg transition-colors"
            >
              <CreditCard className="w-4 h-4 text-violet-400" />
              <span className="text-white text-sm lg:text-base">Buy Credits</span>
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm lg:text-base">Settings</span>
            </button>

            <button
              onClick={() => {
                logout()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-800 rounded-lg transition-colors text-violet-300"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm lg:text-base">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
