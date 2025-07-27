import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface UserPayload {
  userId: string
  email: string
  name: string
  status: "user" | "admin"
}

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export const verifyToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload
  } catch (error) {
    return null
  }
}

export const getUserFromRequest = (request: NextRequest): UserPayload | null => {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}
