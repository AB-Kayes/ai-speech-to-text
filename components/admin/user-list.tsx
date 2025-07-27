"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { Search, Eye, Calendar, FileText, Mic, Clock, User, Mail, CreditCard, Shield } from "lucide-react"

interface UserData {
  _id: string
  name: string
  email: string
  credits: number
  plan: string
  isAdmin: boolean
  createdAt: string
}

interface HistoryItem {
  _id: string
  text: string
  type: "live" | "file"
  fileName?: string
  language: string
  timestamp: string
  duration?: number
  confidence?: number
}

interface UserHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserData | null
}

const UserHistoryModal: React.FC<UserHistoryModalProps> = ({ isOpen, onClose, user }) => {

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUserHistory = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required")
        setIsLoading(false)
        return
      }
      const response = await fetch("/api/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch history")
      }
      const data = await response.json()
      const transformedHistory: HistoryItem[] = data.history.map((item: any) => ({
        _id: item._id || item.timestamp,
        text: item.text,
        type: item.type,
        fileName: item.fileName,
        language: item.language,
        timestamp: item.timestamp.toString(),
        duration: item.duration,
        confidence: item.confidence,
      }))
      setHistory(transformedHistory)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch history")
      console.error("Error fetching history:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && user) {
      fetchUserHistory()
    }
  }, [isOpen, user])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString()
    } catch (error) {
      return "Invalid date"
    }
  }

  const formatDuration = (duration?: number) => {
    if (!duration) return "N/A"
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }


  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md border border-violet-500/30 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
          <h2 className="text-2xl font-bold text-white">{user.name}'s Transcription History</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUserHistory}
              disabled={isLoading}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white border border-violet-500/30 disabled:opacity-50"
              title="Refresh History"
            >
              &#x21bb;
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
              <span className="ml-3 text-gray-300">Loading history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-400 text-lg">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No transcription history found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item._id} className="bg-gray-800/50 border border-violet-500/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          item.type === "live" ? "bg-violet-600/20 text-violet-400" : "bg-purple-600/20 text-purple-400"
                        }`}
                      >
                        {item.type === "live" ? <Mic className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {item.type === "live" ? "Live Recording" : item.fileName || "File Upload"}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                          <span>{formatDate(item.timestamp)}</span>
                          <span>Language: {item.language}</span>
                          {item.duration && <span>Duration: {formatDuration(item.duration)}</span>}
                          {item.confidence && <span>Confidence: {Math.round(item.confidence * 100)}%</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleViewHistory = (user: UserData) => {
    setSelectedUser(user)
    setShowHistoryModal(true)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <div className="text-sm text-gray-400">Total Users: {users.length}</div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-violet-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
        />
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/30 border border-violet-500/20 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
            <span className="ml-3 text-gray-300">Loading users...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      User
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Credits
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Joined
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredUsers.map((user, key) => (
                  <tr key={key} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{user.name}</span>
                            {user.isAdmin && (
                              <span title="Admin">
                                <Shield className="w-4 h-4 text-orange-400" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-violet-400 font-semibold">{user.credits}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-violet-600/20 text-violet-300 rounded-full capitalize">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleViewHistory(user)}
                        className="flex items-center gap-2 px-3 py-1 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 rounded-lg transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {searchTerm ? "No users found matching your search" : "No users found"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User History Modal */}
      <UserHistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} user={selectedUser} />
    </div>
  )
}

export default UserList
