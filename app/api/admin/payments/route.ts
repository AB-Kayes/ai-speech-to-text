import { type NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDatabase } from "@/lib/mongodb"
import { getUserFromRequest } from "@/lib/auth"
import type { Payment, User, CreditTransaction } from "@/lib/models"

export async function GET(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload || userPayload.status !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const payments = db.collection<Payment>("payments")

    const allPayments = await payments.find({}).sort({ createdAt: -1 }).toArray()

    const formattedPayments = allPayments.map((payment) => ({
      id: payment._id!.toString(),
      userId: payment.userId.toString(),
      userName: payment.userName,
      userEmail: payment.userEmail,
      phoneNumber: payment.phoneNumber,
      transactionId: payment.transactionId,
      amount: payment.amount,
      credits: payment.credits,
      status: payment.status,
      createdAt: payment.createdAt.toISOString(),
      approvedAt: payment.approvedAt?.toISOString(),
      approvedBy: payment.approvedBy,
    }))

    return NextResponse.json({ payments: formattedPayments })
  } catch (error) {
    console.error("Get admin payments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const userPayload = getUserFromRequest(request)
    if (!userPayload || userPayload.status !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { paymentId, status } = await request.json()

    if (!paymentId || !status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid payment ID or status" }, { status: 400 })
    }

    const db = await getDatabase()
    const payments = db.collection<Payment>("payments")
    const users = db.collection<User>("users")
    const transactions = db.collection<CreditTransaction>("credit_transactions")

    // Get the payment
    const payment = await payments.findOne({ _id: new ObjectId(paymentId) })
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status !== "pending") {
      return NextResponse.json({ error: "Payment already processed" }, { status: 400 })
    }

    // Update payment status
    await payments.updateOne(
      { _id: new ObjectId(paymentId) },
      {
        $set: {
          status,
          approvedAt: new Date(),
          approvedBy: userPayload.name,
        },
      },
    )

    // If approved, add credits to user
    if (status === "approved") {
      await users.updateOne({ _id: payment.userId }, { $inc: { credits: payment.credits } })

      // Record credit transaction
      const transaction: Omit<CreditTransaction, "_id"> = {
        userId: payment.userId,
        amount: payment.credits,
        type: "purchase",
        description: `Payment approved - Transaction ID: ${payment.transactionId}`,
        paymentId: new ObjectId(paymentId),
        timestamp: new Date(),
      }

      await transactions.insertOne(transaction)
    }

    return NextResponse.json({
      message: `Payment ${status} successfully`,
    })
  } catch (error) {
    console.error("Update payment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
