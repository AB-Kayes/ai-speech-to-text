"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Check, X, User, Phone, CreditCard, Calendar, Search } from "lucide-react"
import type { Payment } from "@/lib/models";
type PaymentWithId = Payment & { id?: string };

const PaymentApproval: React.FC = () => {
  const [payments, setPayments] = useState<PaymentWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/payments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch payments")
      }

      const data = await response.json()
      setPayments(data.payments || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch payments")
      console.error("Error fetching payments:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleApproval = async (paymentId: string, action: "approve" | "reject") => {
    try {
      setProcessingId(paymentId)

      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentId,
          status: action === "approve" ? "approved" : "rejected",
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} payment`)
      }

      // Refresh the payments list
      await fetchPayments()
    } catch (err) {
      console.error(`Error ${action}ing payment:`, err)
      alert(`Failed to ${action} payment. Please try again.`)
    } finally {
      setProcessingId(null)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phoneNumber.includes(searchTerm)

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-500/30"
      case "approved":
        return "bg-green-600/20 text-green-400 border-green-500/30"
      case "rejected":
        return "bg-red-600/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-violet-500/30 rounded-xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
          <span className="ml-3 text-gray-300">Loading payments...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-violet-500/30 rounded-xl p-8">
        <div className="text-center py-12">
          <div className="text-red-400 mb-4">Error: {error}</div>
          <button
            onClick={fetchPayments}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-violet-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-purple-600 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Payment Approval</h2>
        </div>
        <button
          onClick={fetchPayments}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, transaction ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-violet-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "approved" | "rejected")}
          className="px-3 py-2 bg-gray-800/50 border border-violet-500/30 rounded-lg text-white focus:outline-none focus:border-violet-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No payments found</p>
          <p className="text-gray-500 text-sm">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filters"
              : "No payment requests to review"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment, idx) => {
            const paymentId = payment._id ? payment._id.toString() : payment.id;
            return (
              <div
                key={paymentId ? paymentId : `payment-${idx}`}
                className="bg-gray-800/30 border border-violet-500/20 rounded-lg p-6 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{payment.userName}</h3>
                        <p className="text-gray-400 text-sm">{payment.userEmail}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{payment.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{payment.transactionId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-violet-400 font-semibold">${payment.amount}</span>
                        <span className="text-gray-400 text-sm">({payment.credits} credits)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{formatDate(payment.createdAt)}</span>
                      </div>
                    </div>

                    {payment.status === "approved" && payment.approvedAt && payment.approvedBy && (
                      <div className="text-sm text-green-400 mb-2">
                        Approved by {payment.approvedBy} on {formatDate(payment.approvedAt)}
                      </div>
                    )}
                  </div>

                  {payment.status === "pending" && paymentId && (
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleApproval(paymentId, "approve")}
                        disabled={processingId === paymentId}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        {processingId === paymentId ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleApproval(paymentId, "reject")}
                        disabled={processingId === paymentId}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                        {processingId === paymentId ? "Processing..." : "Reject"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default PaymentApproval
