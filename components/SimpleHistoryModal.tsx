"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Search, Download, Copy, Calendar, Clock, FileText, Mic } from "lucide-react"
import { useHistory } from "@/contexts/HistoryContext"

interface SimpleHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const SimpleHistoryModal: React.FC<SimpleHistoryModalProps> = ({ isOpen, onClose }) => {
  const { history, loading, error, fetchHistory } = useHistory()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "live" | "file">("all")
  const [sortBy, setSortBy] = useState<"date" | "type" | "duration">("date")

  useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen, fetchHistory])

  if (!isOpen) return null

  const filteredHistory = history
    .filter((item) => {
      const matchesSearch =
        item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.fileName && item.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesType = filterType === "all" || item.type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case "type":
          return a.type.localeCompare(b.type)
        case "duration":
          return (b.duration || 0) - (a.duration || 0)
        default:
          return 0
      }
    })

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (err) {
      console.error("Failed to copy text:", err)
    }
  }

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-md border border-violet-500/30 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-violet-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Transcription History</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-violet-500/10">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transcriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-violet-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as "all" | "live" | "file")}
                className="px-3 py-2 bg-gray-800/50 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500"
              >
                <option value="all">All Types</option>
                <option value="live">Live Recording</option>
                <option value="file">File Upload</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "type" | "duration")}
                className="px-3 py-2 bg-gray-800/50 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500"
              >
                <option value="date">Sort by Date</option>
                <option value="type">Sort by Type</option>
                <option value="duration">Sort by Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
              <span className="ml-3 text-gray-300">Loading history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 mb-2">Failed to load history</div>
              <button
                onClick={fetchHistory}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg mb-2">No transcriptions found</p>
              <p className="text-gray-500 text-sm">
                {searchTerm || filterType !== "all"
                  ? "Try adjusting your search or filters"
                  : "Start recording or upload an audio file to see your history"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-800/30 border border-violet-500/20 rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          item.type === "live" ? "bg-green-600/20 text-green-400" : "bg-blue-600/20 text-blue-400"
                        }`}
                      >
                        {item.type === "live" ? <Mic className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium">
                            {item.type === "live" ? "Live Recording" : item.fileName || "File Upload"}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              item.type === "live" ? "bg-green-600/20 text-green-400" : "bg-blue-600/20 text-blue-400"
                            }`}
                          >
                            {item.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.timestamp)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(item.duration)}
                          </div>
                          <span>Language: {item.language === "en-US" ? "English" : "বাংলা"}</span>
                          {item.confidence && <span>Confidence: {Math.round(item.confidence * 100)}%</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(item.text)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() =>
                          handleDownload(
                            item.text,
                            item.fileName
                              ? `${item.fileName}_transcript.txt`
                              : `${item.type}_transcript_${Date.now()}.txt`,
                          )
                        }
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Download transcript"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {item.text.length > 200 ? `${item.text.substring(0, 200)}...` : item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-violet-500/10 bg-gray-900/50">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>
              Total: {filteredHistory.length} transcription{filteredHistory.length !== 1 ? "s" : ""}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleHistoryModal
