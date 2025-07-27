import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { User, TranscriptionHistory } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload || userPayload.status !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

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
        .toArray()

      const formattedHistory = userHistory.map((item) => ({
        id: item._id!.toString(),
        text: item.text,
        type: item.type,
        fileName: item.fileName,
        language: item.language,
        timestamp: item.timestamp.toISOString(),
        duration: item.duration,
        confidence: item.confidence,
      }))

      const userData = {
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        credits: user.credits,
        plan: user.plan,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.lastLogin.toISOString(),
        history: formattedHistory,
      }

      return NextResponse.json({ user: userData })
    } else {
      // Get all users
      const allUsers = await users.find({}).sort({ createdAt: -1 }).toArray()

      const formattedUsers = allUsers.map((user) => ({
        id: user._id!.toString(),
        email: user.email,
        name: user.name,
        credits: user.credits,
        plan: user.plan,
        status: user.status,
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

export async function PATCH(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload || userPayload.status !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId, status } = await request.json()

    if (!userId || !status || !["user", "admin"].includes(status)) {
      return NextResponse.json({ error: "Invalid user ID or status" }, { status: 400 })
    }

    const db = await getDatabase()
    const users = db.collection<User>("users")

    const result = await users.updateOne({ _id: new ObjectId(userId) }, { $set: { status } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: `User status updated to ${status} successfully`,
    })
  } catch (error) {
    console.error("Update user status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
