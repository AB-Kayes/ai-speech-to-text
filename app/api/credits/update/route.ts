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

    // Update user credits
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(userPayload.userId) },
      { $inc: { credits: amount } },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

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
      credits: result.credits,
      message: "Credits updated successfully",
    })
  } catch (error) {
    console.error("Update credits error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
