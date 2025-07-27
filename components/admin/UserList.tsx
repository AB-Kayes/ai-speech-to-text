"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Eye, X, Clock, Mic, Upload } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface User {
  id: string
  name: string
  email: string
  createdAt: string
  credits: number
}

interface TranscriptionHistory {
  id: string
  text: string
  type: "live" | "file"
  fileName?: string
  timestamp: string
  language: string
  confidence?: number
}

interface UserWithHistory extends User {
  history: TranscriptionHistory[]
}

interface UserHistoryModalProps {
  user: UserWithHistory | null
  isOpen: boolean
  onClose: () => void
}

const UserHistoryModal: React.FC<UserHistoryModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/90 backdrop-blur-sm border border-violet-500/30 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-violet-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">{user.name} - Transcription History</h2>
              <p className="text-gray-400 text-sm">{user.email}</p>
              <p className="text-violet-300 text-sm">Credits: {user.credits}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {user.history.length > 0 ? (
            <div className="space-y-4">
              {user.history.map((item) => (
                <div key={item.id} className="bg-gray-800/50 border border-violet-500/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.type === "live"
                            ? "bg-green-900/30 border border-green-500/50 text-green-300"
                            : "bg-blue-900/30 border border-blue-500/50 text-blue-300"
                        }`}
                      >
                        {item.type === "live" ? (
                          <>
                            <Mic className="w-3 h-3 inline mr-1" />
                            Live Recording
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 inline mr-1" />
                            File Upload
                          </>
                        )}
                      </span>
                      {item.fileName && <span className="text-gray-400 text-xs">({item.fileName})</span>}
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                      {item.confidence && <div>Confidence: {Math.round(item.confidence * 100)}%</div>}
                    </div>
                  </div>
                  <p className="text-gray-200 text-sm leading-relaxed">{item.text}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    Language: {item.language === "bn-BD" ? "🇧🇩 বাংলা" : "🇺🇸 English"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No transcription history found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<UserWithHistory | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      loadUsers()
    }
  }, [token])

  const loadUsers = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewHistory = async (user: User) => {
    if (!token) return

    try {
      const response = await fetch(`/api/admin/users?userId=${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data.user)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error("Error loading user history:", error)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading users...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">User Management</h1>
        <p className="text-gray-400">Manage users and view their transcription activity</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-violet-500/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Name</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Signup Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Credits</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4 text-sm text-white font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{new Date(user.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`font-medium ${
                        user.credits > 500 ? "text-green-400" : user.credits > 100 ? "text-yellow-400" : "text-red-400"
                      }`}
                    >
                      {user.credits}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleViewHistory(user)}
                      className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs rounded-lg transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No users found</p>
          </div>
        )}
      </div>

      <UserHistoryModal user={selectedUser} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  )
}

export default UserList
