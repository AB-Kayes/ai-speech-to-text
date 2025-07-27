export interface User {
  id: string
  email: string
  name: string
  credits: number
  plan: "free" | "premium" | "enterprise"
  createdAt: string
  lastLogin: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: "purchase" | "usage" | "bonus"
  description: string
  timestamp: string
}

export interface PricingPlan {
  id: string
  name: string
  price: number
  credits: number
  features: string[]
  popular?: boolean
}
