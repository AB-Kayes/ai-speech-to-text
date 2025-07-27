"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./AuthContext"
import type { TranscriptionHistory } from "@/types/history"

interface HistoryContextType {
  history: TranscriptionHistory[]
  addToHistory: (item: Omit<TranscriptionHistory, "id" | "timestamp">) => void
  clearHistory: () => void
  deleteHistoryItem: (id: string) => void
  searchHistory: (query: string) => TranscriptionHistory[]
  isLoading: boolean
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined)

export const useHistory = () => {
  const context = useContext(HistoryContext)
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider")
  }
  return context
}

export const HistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<TranscriptionHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { token, isAuthenticated } = useAuth()

  // Load history when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      loadHistory()
    } else {
      setHistory([])
    }
  }, [isAuthenticated, token])

  const loadHistory = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error("Error loading history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToHistory = async (item: Omit<TranscriptionHistory, "id" | "timestamp">) => {
    if (!token) return

    // Avoid duplicate entries by checking if the same text was added recently
    const recentItem = history[0]
    if (
      recentItem &&
      recentItem.text === item.text &&
      recentItem.type === item.type &&
      Date.now() - new Date(recentItem.timestamp).getTime() < 5000
    ) {
      return // Skip if same text was added within last 5 seconds
    }

    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(item),
      })

      if (response.ok) {
        const data = await response.json()
        setHistory((prev) => [data.item, ...prev].slice(0, 100))
      }
    } catch (error) {
      console.error("Error adding to history:", error)
    }
  }

  const clearHistory = async () => {
    if (!token) return

    try {
      const response = await fetch("/api/history", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setHistory([])
      }
    } catch (error) {
      console.error("Error clearing history:", error)
    }
  }

  const deleteHistoryItem = async (id: string) => {
    if (!token) return

    try {
      const response = await fetch(`/api/history?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id))
      }
    } catch (error) {
      console.error("Error deleting history item:", error)
    }
  }

  const searchHistory = (query: string): TranscriptionHistory[] => {
    try {
      if (!query.trim()) return history

      const lowercaseQuery = query.toLowerCase()
      return history.filter((item) => {
        if (!item || typeof item.text !== "string") return false
        return (
          item.text.toLowerCase().includes(lowercaseQuery) ||
          (item.fileName && item.fileName.toLowerCase().includes(lowercaseQuery))
        )
      })
    } catch (error) {
      console.error("Error searching history:", error)
      return []
    }
  }

  return (
    <HistoryContext.Provider
      value={{
        history,
        addToHistory,
        clearHistory,
        deleteHistoryItem,
        searchHistory,
        isLoading,
      }}
    >
      {children}
    </HistoryContext.Provider>
  )
}
