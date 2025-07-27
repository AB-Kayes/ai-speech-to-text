import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { User } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const users = db.collection<User>("users")

    const user = await users.findOne({ _id: new ObjectId(userPayload.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Return user data without password
    const userData = {
      id: user._id!.toString(),
      email: user.email,
      name: user.name,
      credits: user.credits,
      plan: user.plan,
      createdAt: user.createdAt.toISOString(),
      lastLogin: user.lastLogin.toISOString(),
    }

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
