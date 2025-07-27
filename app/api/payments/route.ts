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

    // Validate phone number format (basic validation for Bangladeshi numbers)
    const phoneRegex = /^(\+88)?01[3-9]\d{8}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 })
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

    // Create payment record
    const payment: Omit<Payment, "_id"> = {
      userId: new ObjectId(userPayload.userId),
      userName: user.name,
      userEmail: user.email,
      phoneNumber,
      transactionId,
      amount,
      credits,
      status: "pending",
      createdAt: new Date(),
    }

    const result = await payments.insertOne(payment)

    return NextResponse.json({
      paymentId: result.insertedId.toString(),
      status: "pending",
      message: "Payment submitted for approval",
    })
  } catch (error) {
    console.error("Payment submission error:", error)
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
