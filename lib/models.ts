import type { ObjectId } from "mongodb"

export interface User {
  _id?: ObjectId
  email: string
  name: string
  password: string
  credits: number
  plan: "free" | "premium" | "enterprise"
  createdAt: Date
  lastLogin: Date
}

export interface TranscriptionHistory {
  _id?: ObjectId
  userId: ObjectId
  text: string
  type: "live" | "file"
  fileName?: string
  language: string
  timestamp: Date
  duration?: number
  confidence?: number
}

export interface Payment {
  _id?: ObjectId
  userId: ObjectId
  userName: string
  userEmail: string
  phoneNumber: string
  transactionId: string
  amount: number
  credits: number
  status: "pending" | "approved" | "rejected"
  createdAt: Date
  approvedAt?: Date
  approvedBy?: string
}

export interface CreditTransaction {
  _id?: ObjectId
  userId: ObjectId
  amount: number
  type: "purchase" | "usage" | "bonus"
  description: string
  paymentId?: ObjectId
  timestamp: Date
}
