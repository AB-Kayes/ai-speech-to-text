import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { verifyPassword, generateToken } from "@/lib/auth"
import type { User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 })
    }

    const db = await getDatabase()
    const users = db.collection<User>("users")

    // Find user by email
    const user = await users.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Update last login
    await users.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } })

    // Generate JWT token
    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
      name: user.name,
      status: user.status,
    })

    // Return user data without password
    const userData = {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      credits: user.credits,
      plan: user.plan,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
      lastLogin: new Date().toISOString(),
    }

    return NextResponse.json({
      user: userData,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
