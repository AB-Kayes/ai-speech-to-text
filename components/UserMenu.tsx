"use client"

import type React from "react"
import { useState } from "react"
import { User, LogOut, CreditCard } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface UserMenuProps {
  onBuyCredits?: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onBuyCredits }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  if (!user) return null

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const formatTime = (credits: number) => {
    const totalSeconds = credits * 2 // 1 credit = 2 seconds
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-900/50 border border-violet-500/50 rounded-lg hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 transition-all duration-300 backdrop-blur-sm"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-semibold text-white">{user.name}</div>
          <div className="text-xs text-violet-300">
            {user.credits} credits ({formatTime(user.credits)})
          </div>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-sm border border-violet-500/30 rounded-lg shadow-xl z-50">
            <div className="p-4 border-b border-violet-500/20">
              <div className="text-sm font-semibold text-white">{user.name}</div>
              <div className="text-xs text-gray-400">{user.email}</div>
              <div className="text-xs text-violet-300 mt-1">
                {user.credits} credits remaining ({formatTime(user.credits)})
              </div>
            </div>

            <div className="p-2">

              <button
                onClick={() => {
                  if (onBuyCredits) onBuyCredits();
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors text-left"
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Buy Credits</span>
              </button>

                <button
                onClick={() => {
                  window.location.href = "/admin";
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors text-left"
                >
                <User className="w-4 h-4" />
                <span className="text-sm">Admin Page</span>
                </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-red-400 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default UserMenu
