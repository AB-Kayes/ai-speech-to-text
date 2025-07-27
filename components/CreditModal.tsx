"use client"

import type React from "react"
import { useState } from "react"
import { X, CreditCard, Check, Zap, Star, Crown, Phone, Hash } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { PricingPlan } from "@/types/user"
import GlassCard from "./GlassCard"

interface CreditModalProps {
  isOpen: boolean
  onClose: () => void
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 500,
    credits: 500,
    features: [
      "500 transcription credits",
      "Real-time speech recognition",
      "Audio file processing",
      "Basic export options",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: 1200,
    credits: 1500,
    features: [
      "1,500 transcription credits",
      "Priority processing",
      "Advanced export formats",
      "Multi-language support",
      "Email support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 2500,
    credits: 3500,
    features: [
      "3,500 transcription credits",
      "Fastest processing",
      "Custom integrations",
      "Dedicated support",
      "Advanced analytics",
      "Team collaboration",
    ],
  },
]

const CreditModal: React.FC<CreditModalProps> = ({ isOpen, onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState({
    phoneNumber: "",
    transactionId: "",
  })
  const { token } = useAuth()

  if (!isOpen) return null

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan)
    setShowPaymentForm(true)
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlan || !token) return

    setIsProcessing(true)

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber: paymentData.phoneNumber,
          transactionId: paymentData.transactionId,
          amount: selectedPlan.price,
          credits: selectedPlan.credits,
        }),
      })

      if (response.ok) {
        alert("Payment submitted successfully! Please wait for admin approval.")
        onClose()
        setShowPaymentForm(false)
        setSelectedPlan(null)
        setPaymentData({ phoneNumber: "", transactionId: "" })
      } else {
        const error = await response.json()
        alert(error.error || "Payment submission failed")
      }
    } catch (error) {
      alert("Payment submission failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleBack = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
    setPaymentData({ phoneNumber: "", transactionId: "" })
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "starter":
        return <Zap className="w-6 h-6" />
      case "professional":
        return <Star className="w-6 h-6" />
      case "enterprise":
        return <Crown className="w-6 h-6" />
      default:
        return <CreditCard className="w-6 h-6" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <GlassCard className="p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {!showPaymentForm ? (
            <>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Get more credits to unlock unlimited transcription power
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {pricingPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`
                      relative bg-white/5 backdrop-blur-md border rounded-2xl p-8 transition-all duration-300
                      ${
                        plan.popular
                          ? "border-violet-400 scale-105 shadow-2xl shadow-violet-500/20"
                          : "border-white/20 hover:border-white/40"
                      }
                    `}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <div
                        className={`
                        w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center
                        ${
                          plan.popular
                            ? "bg-gradient-to-r from-violet-500 to-purple-500"
                            : "bg-gradient-to-r from-violet-600 to-purple-600"
                        }
                      `}
                      >
                        {getPlanIcon(plan.id)}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-white">৳{plan.price}</span>
                        <span className="text-gray-300 ml-2">one-time</span>
                      </div>
                      <div className="text-center">
                        <span className="text-2xl font-semibold text-violet-300">{plan.credits.toLocaleString()}</span>
                        <span className="text-gray-300 ml-2">credits</span>
                      </div>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePlanSelect(plan)}
                      className={`
                        w-full py-4 rounded-lg font-semibold transition-all duration-300
                        ${
                          plan.popular
                            ? "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                            : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                        }
                        text-white
                      `}
                    >
                      Select Plan
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-4">Bkash Payment</h2>
                <div className="bg-violet-900/30 border border-violet-500/50 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{selectedPlan?.name}</h3>
                  <p className="text-violet-300">
                    ৳{selectedPlan?.price} - {selectedPlan?.credits} credits
                  </p>
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-white mb-2">Payment Instructions:</h4>
                <ol className="text-sm text-gray-300 space-y-1">
                  <li>
                    1. Send money to: <strong className="text-white">01XXXXXXXXX</strong>
                  </li>
                  <li>
                    2. Amount: <strong className="text-white">৳{selectedPlan?.price}</strong>
                  </li>
                  <li>3. Enter your phone number and transaction ID below</li>
                  <li>4. Wait for admin approval</li>
                </ol>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Your Bkash Number
                  </label>
                  <input
                    type="tel"
                    value={paymentData.phoneNumber}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Hash className="w-4 h-4 inline mr-2" />
                    Transaction ID
                  </label>
                  <input
                    type="text"
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData((prev) => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="Enter transaction ID"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors"
                  >
                    {isProcessing ? "Submitting..." : "Submit Payment"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-gray-300 mb-4">Secure payment processing with manual verification</p>
            <div className="flex justify-center items-center gap-6 text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-pink-600 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">bK</span>
                </div>
                <span className="text-sm">Bkash</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

export default CreditModal
