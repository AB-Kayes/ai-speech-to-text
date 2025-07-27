"use client"

import React, { useState, useEffect } from "react"
import { X, Search, Download, Copy, Trash2, Clock, Mic, Upload } from "lucide-react"
import { useHistory } from "@/contexts/HistoryContext"
import type { TranscriptionHistory } from "@/types/history"
import { downloadTranscript, copyToClipboard } from "@/utils/fileProcessor"

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const HistoryModal: React.FC<HistoryModalProps> = React.memo(({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<"all" | "live" | "file">("all")
  const [notification, setNotification] = useState("")

  // Always call useHistory hook - React rules require this
  const historyContext = useHistory()
  const { history = [], clearHistory, deleteHistoryItem, searchHistory } = historyContext || {}

  // Handle keyboard events and clicking outside
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest(".history-modal")) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("mousedown", handleClickOutside)

    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  // Filter history safely with fallbacks
  let filteredHistory: TranscriptionHistory[] = []
  try {
    const searchResults = searchQuery.trim() && searchHistory ? searchHistory(searchQuery) : history
    filteredHistory = Array.isArray(searchResults)
      ? searchResults.filter((item) => item && (selectedType === "all" || item.type === selectedType))
      : []
  } catch (error) {
    console.error("Error filtering history:", error)
    filteredHistory = []
  }

  const handleCopy = async (text: string) => {
    try {
      const success = await copyToClipboard(text)
      if (success) {
        setNotification("Copied to clipboard!")
        setTimeout(() => setNotification(""), 2000)
      } else {
        setNotification("Failed to copy")
        setTimeout(() => setNotification(""), 2000)
      }
    } catch (error) {
      console.error("Error copying text:", error)
      setNotification("Failed to copy")
      setTimeout(() => setNotification(""), 2000)
    }
  }

  const handleDownload = (item: TranscriptionHistory) => {
    try {
      const filename = item.fileName
        ? `transcript-${item.fileName.replace(/\.[^/.]+$/, "")}.txt`
        : `transcript-${new Date(item.timestamp).toISOString().split("T")[0]}.txt`
      downloadTranscript(item.text, filename)
      setNotification("Download started!")
      setTimeout(() => setNotification(""), 2000)
    } catch (error) {
      console.error("Error downloading transcript:", error)
      setNotification("Failed to download")
      setTimeout(() => setNotification(""), 2000)
    }
  }

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        return "Invalid date"
      }
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      )
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Invalid date"
    }
  }

  const getLanguageFlag = (language: string) => {
    return language === "bn-BD" ? "🇧🇩" : "🇺🇸"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden history-modal">
        <div className="bg-gray-900/50 backdrop-blur-md border border-violet-500/20 rounded-2xl shadow-2xl h-full flex flex-col">
          {/* Notification */}
          {notification && (
            <div className="absolute top-4 right-4 z-10 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-lg">
              {notification}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Transcription History</h2>
              <p className="text-gray-300">View and manage your past transcriptions</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-white/20">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search transcriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="flex gap-2">
                {(["all", "live", "file"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      selectedType === type ? "bg-violet-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {type === "all" ? "All" : type === "live" ? "Live" : "Files"}
                  </button>
                ))}
              </div>

              {Array.isArray(history) && history.length > 0 && (
                <button
                  onClick={() => {
                    try {
                      if (window.confirm("Are you sure you want to clear all transcription history?")) {
                        if (clearHistory) {
                          clearHistory()
                          setNotification("History cleared!")
                          setTimeout(() => setNotification(""), 2000)
                        }
                      }
                    } catch (error) {
                      console.error("Error clearing history:", error)
                      setNotification("Failed to clear history")
                      setTimeout(() => setNotification(""), 2000)
                    }
                  }}
                  className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded-lg transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-6 min-h-0">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery ? "No matching transcriptions" : "No transcriptions yet"}
                </h3>
                <p className="text-gray-300">
                  {searchQuery
                    ? "Try adjusting your search terms or filters"
                    : "Start recording or upload files to see your history here"}
                </p>
              </div>
            ) : (
              <div className="space-y-4 pr-2">
                {Array.isArray(filteredHistory) &&
                  filteredHistory.map((item) => {
                    // Safety check for item
                    if (!item || !item.id) return null

                    return (
                      <div
                        key={item.id}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                item.type === "live"
                                  ? "bg-violet-500/20 text-violet-400"
                                  : "bg-purple-500/20 text-purple-400"
                              }`}
                            >
                              {item.type === "live" ? <Mic className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-white">
                                  {item.type === "live" ? "Live Recording" : item.fileName || "Audio File"}
                                </h4>
                                <span className="text-lg">{getLanguageFlag(item.language || "en-US")}</span>
                              </div>
                              <p className="text-sm text-gray-400 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {formatDate(item.timestamp || new Date().toISOString())}
                                {item.confidence && (
                                  <span className="ml-2">Confidence: {Math.round((item.confidence || 0) * 100)}%</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopy(item.text || "")}
                              className="p-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(item)}
                              className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                              title="Download transcript"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                try {
                                  if (window.confirm("Are you sure you want to delete this transcription?")) {
                                    if (deleteHistoryItem && item && item.id) {
                                      deleteHistoryItem(item.id)
                                      setNotification("Transcription deleted!")
                                      setTimeout(() => setNotification(""), 2000)
                                    }
                                  }
                                } catch (error) {
                                  console.error("Error deleting item:", error)
                                  setNotification("Failed to delete")
                                  setTimeout(() => setNotification(""), 2000)
                                }
                              }}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="bg-black/20 rounded-lg p-3">
                          <p
                            className="text-gray-200 text-sm overflow-hidden"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: "vertical" as const,
                            }}
                          >
                            {item.text || "No text available"}
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export default HistoryModal
