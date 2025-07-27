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
      .limit(100)
      .toArray()

    // Convert to frontend format
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

    const { text, type, fileName, language, confidence } = await request.json()

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
      confidence,
    }

    const result = await history.insertOne(newHistoryItem)

    const responseItem = {
      id: result.insertedId.toString(),
      text,
      type,
      fileName,
      language,
      timestamp: newHistoryItem.timestamp.toISOString(),
      confidence,
    }

    return NextResponse.json({ item: responseItem })
  } catch (error) {
    console.error("Add history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(request.url)
    const itemId = url.searchParams.get("id")

    if (itemId) {
      // Delete specific item
      const db = await getDatabase()
      const history = db.collection<TranscriptionHistory>("transcription_history")

      const result = await history.deleteOne({
        _id: new ObjectId(itemId),
        userId: new ObjectId(userPayload.userId),
      })

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: "Item not found" }, { status: 404 })
      }
    } else {
      // Clear all history for user
      const db = await getDatabase()
      const history = db.collection<TranscriptionHistory>("transcription_history")

      await history.deleteMany({
        userId: new ObjectId(userPayload.userId),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
