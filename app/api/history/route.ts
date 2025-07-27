import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { TranscriptionHistory } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const history = db.collection<TranscriptionHistory>("transcription_history")

    const userHistory = await history
      .find({ userId: new ObjectId(userPayload.userId) })
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
      duration: item.duration,
      confidence: item.confidence,
    }))

    return NextResponse.json({ history: formattedHistory })
  } catch (error) {
    console.error("Get history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, type, fileName, language, duration, confidence } = await request.json()

    if (!text || !type || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const history = db.collection<TranscriptionHistory>("transcription_history")

    const newHistoryItem: Omit<TranscriptionHistory, "_id"> = {
      userId: new ObjectId(userPayload.userId),
      text,
      type,
      fileName,
      language,
      timestamp: new Date(),
      duration,
      confidence,
    }

    const result = await history.insertOne(newHistoryItem)

    return NextResponse.json({
      id: result.insertedId.toString(),
      message: "History item saved successfully",
    })
  } catch (error) {
    console.error("Save history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
