"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Check, X, Clock, Phone, Hash } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface PaymentRequest {
  id: string
  userName: string
  userEmail: string
  phoneNumber: string
  transactionId: string
  amount: number
  credits: number
  status: "pending" | "approved" | "rejected"
  createdAt: string
  approvedAt?: string
  approvedBy?: string
}

const PaymentApproval: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { token } = useAuth()

  useEffect(() => {
    if (token) {
      loadPayments()
    }
  }, [token])

  const loadPayments = async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments || [])
      }
    } catch (error) {
      console.error("Error loading payments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePayment = async (paymentId: string, status: "approved" | "rejected") => {
    if (!token) return

    try {
      const response = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentId, status }),
      })

      if (response.ok) {
        // Reload payments to get updated data
        loadPayments()
        alert(`Payment ${status} successfully!`)
      } else {
        const error = await response.json()
        alert(error.error || `Failed to ${status} payment`)
      }
    } catch (error) {
      alert(`Failed to ${status} payment`)
    }
  }

  const getStatusBadge = (status: PaymentRequest["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-900/30 border border-yellow-500/50 rounded-full text-yellow-300 text-xs">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-900/30 border border-green-500/50 rounded-full text-green-300 text-xs">
            <Check className="w-3 h-3" />
            Approved
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-900/30 border border-red-500/50 rounded-full text-red-300 text-xs">
            <X className="w-3 h-3" />
            Rejected
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white">Loading payments...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Payment Approval</h1>
        <p className="text-gray-400">Review and approve pending Bkash payment requests</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-sm border border-violet-500/30 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Transaction</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Credits</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-800/30">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-white">{payment.userName}</div>
                      <div className="text-xs text-gray-400">{payment.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                      <Phone className="w-3 h-3" />
                      {payment.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-300">
                      <Hash className="w-3 h-3" />
                      {payment.transactionId}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-medium">৳{payment.amount}</td>
                  <td className="px-6 py-4 text-sm text-violet-300 font-medium">{payment.credits}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{new Date(payment.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                  <td className="px-6 py-4">
                    {payment.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdatePayment(payment.id, "approved")}
                          className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdatePayment(payment.id, "rejected")}
                          className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {payment.status === "approved" && payment.approvedAt && (
                          <div>
                            <div>Approved</div>
                            <div>{new Date(payment.approvedAt).toLocaleString()}</div>
                            {payment.approvedBy && <div>by {payment.approvedBy}</div>}
                          </div>
                        )}
                        {payment.status === "rejected" && <span>Rejected</span>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No payment requests found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentApproval
