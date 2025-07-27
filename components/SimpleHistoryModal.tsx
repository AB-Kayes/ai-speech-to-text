"use client"

import type React from "react"
import { useState } from "react"
import { X, Clock, Mic, Upload, Copy, Download, Trash2 } from "lucide-react"
import { useHistory } from "@/contexts/HistoryContext"
import { copyToClipboard, downloadTranscript } from "@/utils/fileProcessor"

interface SimpleHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const SimpleHistoryModal: React.FC<SimpleHistoryModalProps> = ({ isOpen, onClose }) => {
  const historyContext = useHistory()
  const [notification, setNotification] = useState("")

  const history = historyContext?.history || []
  const clearHistory = historyContext?.clearHistory || (() => {})
  const deleteHistoryItem = historyContext?.deleteHistoryItem || (() => {})

  if (!isOpen) return null

  const handleCopy = async (text: string) => {
    try {
      const success = await copyToClipboard(text || "")
      setNotification(success ? "Copied!" : "Copy failed")
      setTimeout(() => setNotification(""), 2000)
    } catch (error) {
      setNotification("Copy failed")
      setTimeout(() => setNotification(""), 2000)
    }
  }

  const handleDownload = (item: any) => {
    try {
      const filename = `transcript-${new Date().getTime()}.txt`
      downloadTranscript(item.text || "", filename)
      setNotification("Downloaded!")
      setTimeout(() => setNotification(""), 2000)
    } catch (error) {
      setNotification("Download failed")
      setTimeout(() => setNotification(""), 2000)
    }
  }

  const handleDelete = (id: string) => {
    try {
      if (window.confirm("Delete this transcription?")) {
        deleteHistoryItem(id)
        setNotification("Deleted!")
        setTimeout(() => setNotification(""), 2000)
      }
    } catch (error) {
      setNotification("Delete failed")
      setTimeout(() => setNotification(""), 2000)
    }
  }

  const formatDate = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString()
    } catch {
      return "Unknown date"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[80vh] bg-gray-900 border border-violet-500/20 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h2 className="text-2xl font-bold text-white">Transcription History</h2>
            <p className="text-gray-300">View your past transcriptions</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className="absolute top-4 right-4 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-lg z-10">
            {notification}
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {!Array.isArray(history) || history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">No History Yet</h3>
              <p className="text-gray-300 mb-4">
                Your transcription history will appear here once you start using the app.
              </p>
              <p className="text-sm text-gray-400">Try recording some audio or uploading a file!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => {
                if (!item) return null

                return (
                  <div key={item.id || index} className="bg-white/5 border border-white/10 rounded-lg p-4">
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
                          <h4 className="font-semibold text-white">
                            {item.type === "live" ? "Live Recording" : item.fileName || "Audio File"}
                          </h4>
                          <p className="text-sm text-gray-400 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.timestamp || "")}
                            {item.language && <span>• {item.language === "bn-BD" ? "🇧🇩 বাংলা" : "🇺🇸 English"}</span>}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(item.text || "")}
                          className="p-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg transition-colors"
                          title="Copy"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id || "")}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-200 text-sm">
                        {(item.text || "No text available").substring(0, 200)}
                        {(item.text || "").length > 200 ? "..." : ""}
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
  )
}

export default SimpleHistoryModal
