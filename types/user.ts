export interface User {
  id: string
  email: string
  name: string
  credits: number
  plan: "free" | "premium"
  status: "user" | "admin"
  createdAt: string
  lastLogin: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
