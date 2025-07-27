import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { Payment, User } from "@/lib/models"

export async function POST(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { phoneNumber, transactionId, amount, credits } = await request.json()

    if (!phoneNumber || !transactionId || !amount || !credits) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const payments = db.collection<Payment>("payments")
    const users = db.collection<User>("users")

    // Get user details
    const user = await users.findOne({ _id: new ObjectId(userPayload.userId) })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if transaction ID already exists
    const existingPayment = await payments.findOne({ transactionId })
    if (existingPayment) {
      return NextResponse.json({ error: "Transaction ID already exists" }, { status: 400 })
    }

    const newPayment: Omit<Payment, "_id"> = {
      userId: new ObjectId(userPayload.userId),
      userName: user.name,
      userEmail: user.email,
      phoneNumber,
      transactionId,
      amount: Number(amount),
      credits: Number(credits),
      status: "pending",
      createdAt: new Date(),
    }

    const result = await payments.insertOne(newPayment)

    return NextResponse.json({
      id: result.insertedId.toString(),
      message: "Payment submitted successfully. Awaiting admin approval.",
    })
  } catch (error) {
    console.error("Submit payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const payments = db.collection<Payment>("payments")

    const userPayments = await payments
      .find({ userId: new ObjectId(userPayload.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    const formattedPayments = userPayments.map((payment) => ({
      id: payment._id!.toString(),
      phoneNumber: payment.phoneNumber,
      transactionId: payment.transactionId,
      amount: payment.amount,
      credits: payment.credits,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
      approvedAt: payment.approvedAt?.toISOString(),
    }))

    return NextResponse.json({ payments: formattedPayments })
  } catch (error) {
    console.error("Get payments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
