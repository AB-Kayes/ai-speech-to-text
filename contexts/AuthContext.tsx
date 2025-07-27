"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { AuthState } from "@/types/user"

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  updateCredits: (amount: number) => void
  token: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for stored token on app load
    const storedToken = localStorage.getItem("token")
    if (storedToken) {
      setToken(storedToken)
      // Verify token with server
      fetchUser(storedToken)
    } else {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const fetchUser = async (authToken: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        })
      } else {
        // Token is invalid
        localStorage.removeItem("token")
        setToken(null)
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      localStorage.removeItem("token")
      setToken(null)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("token", data.token)
        setToken(data.token)
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, name }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("token", data.token)
        setToken(data.token)
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        })
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error("Register error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const updateCredits = async (amount: number) => {
    if (!token || !authState.user) return

    try {
      const response = await fetch("/api/credits/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        const data = await response.json()
        setAuthState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, credits: data.credits } : null,
        }))
      }
    } catch (error) {
      console.error("Update credits error:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateCredits,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
