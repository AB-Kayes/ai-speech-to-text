import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { User, TranscriptionHistory } from "@/lib/models"

// Admin credentials check
function isAdmin(email: string): boolean {
  return email === "admin@aaladin.com"
}

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload || !isAdmin(userPayload.email)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    const db = await getDatabase()
    const users = db.collection<User>("users")

    if (userId) {
      // Get specific user with their history
      const user = await users.findOne({ _id: new ObjectId(userId) })
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const history = db.collection<TranscriptionHistory>("transcription_history")
      const userHistory = await history
        .find({ userId: new ObjectId(userId) })
        .sort({ timestamp: -1 })
        .limit(50)
        .toArray()

      const formattedHistory = userHistory.map((item) => ({
        id: item._id!.toString(),
        text: item.text,
        type: item.type,
        fileName: item.fileName,
        language: item.language,
        timestamp: item.timestamp.toISOString(),
        confidence: item.confidence,
      }))

      const userData = {
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin.toISOString(),
        history: formattedHistory,
      }

      return NextResponse.json({ user: userData })
    } else {
      // Get all users
      const allUsers = await users
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .toArray()

      const formattedUsers = allUsers.map((user) => ({
        id: user._id!.toString(),
        name: user.name,
        email: user.email,
        credits: user.credits,
        plan: user.plan,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin.toISOString(),
      }))

      return NextResponse.json({ users: formattedUsers })
    }
  } catch (error) {
    console.error("Get admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
