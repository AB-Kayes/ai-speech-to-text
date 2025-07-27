import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { hashPassword, generateToken } from "@/lib/auth"
import type { User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const users = db.collection<User>("users")

    // Check if user already exists
    const existingUser = await users.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const newUser: Omit<User, "_id"> = {
      email,
      name,
      password: hashedPassword,
      credits: 999, // Start with 999 credits
      plan: "free",
      status: "user", // Default status is user
      createdAt: new Date(),
      lastLogin: new Date(),
    }

    const result = await users.insertOne(newUser)
    const userId = result.insertedId.toString()

    // Generate JWT token
    const token = generateToken({
      userId,
      email,
      name,
      status: "user",
    })

    // Return user data without password
    const userData = {
      id: userId,
      email,
      name,
      credits: 999,
      plan: "free",
      status: "user",
      createdAt: newUser.createdAt.toISOString(),
      lastLogin: newUser.lastLogin.toISOString(),
    }

    return NextResponse.json({
      user: userData,
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
