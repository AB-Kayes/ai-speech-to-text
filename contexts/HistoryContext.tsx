"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import type { TranscriptionHistory } from "@/lib/models"

interface HistoryItem {
  text: string
  type: "live" | "file"
  fileName?: string
  language: string
  timestamp: string
  duration?: number
  confidence?: number
}

interface HistoryContextType {
  history: HistoryItem[]
  loading: boolean
  error: string | null
  addToHistory: (item: Omit<HistoryItem, "timestamp">) => void
  fetchHistory: () => Promise<void>
  clearHistory: () => void
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export const useHistory = () => {
  const context = useContext(HistoryContext)
  if (!context) {
    throw new Error("useHistory must be used within a HistoryProvider")
  }
  return context
}

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addToHistory = useCallback((item: Omit<HistoryItem, "timestamp">) => {
    const historyItem: HistoryItem = {
      ...item,
      timestamp: new Date().toISOString(),
    }
    setHistory((prev) => [historyItem, ...prev])
  }, [])

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Authentication required")
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

      // Transform the database response to match our HistoryItem interface
      const transformedHistory: HistoryItem[] = data.history.map((item: TranscriptionHistory) => ({
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
      setLoading(false)
    }
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const value: HistoryContextType = {
    history,
    loading,
    error,
    addToHistory,
    fetchHistory,
    clearHistory,
  }

  return <HistoryContext.Provider value={value}>{children}</HistoryContext.Provider>
}
