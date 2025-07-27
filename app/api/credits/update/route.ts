import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { User, CreditTransaction } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, type = "usage", description = "Credit usage" } = await request.json()

    if (typeof amount !== "number") {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    const db = await getDatabase()
    const users = db.collection<User>("users")
    const transactions = db.collection<CreditTransaction>("credit_transactions")

    // Get current user
    const user = await users.findOne({ _id: new ObjectId(userPayload.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has enough credits for negative amounts
    const newCredits = Math.max(0, user.credits + amount)

    if (amount < 0 && user.credits + amount < 0) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 })
    }

    // Update user credits
    await users.updateOne({ _id: new ObjectId(userPayload.userId) }, { $set: { credits: newCredits } })

    // Record transaction
    const transaction: Omit<CreditTransaction, "_id"> = {
      userId: new ObjectId(userPayload.userId),
      amount,
      type,
      description,
      timestamp: new Date(),
    }

    await transactions.insertOne(transaction)

    return NextResponse.json({
      credits: newCredits,
      success: true,
    })
  } catch (error) {
    console.error("Update credits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
