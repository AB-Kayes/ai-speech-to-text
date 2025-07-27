"use client"
import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Zap, Check, CreditCard, ArrowRight, X, Star, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface CreditModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreditModal: React.FC<CreditModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState<"plans" | "payment">("plans")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token } = useAuth()

  const creditPlans = [
    {
      id: "basic",
      name: "Starter",
      credits: 1000,
      price: 100,
      description: "Perfect for beginners",
      popular: false,
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
      features: ["1K Credits", "Basic Support", "30 Days Validity", "Email Support"],
    },
    {
      id: "standard",
      name: "Professional",
      credits: 2500,
      price: 200,
      description: "Most popular choice",
      popular: true,
      color: "from-violet-500 to-purple-500",
      bgColor: "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
      features: ["2.5K Credits", "Priority Support", "60 Days Validity", "Phone Support", "API Access"],
    },
    {
      id: "premium",
      name: "Enterprise",
      credits: 5000,
      price: 350,
      description: "Maximum value pack",
      popular: false,
      color: "from-emerald-500 to-teal-500",
      bgColor: "from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
      features: [
        "5K Credits",
        "Premium Support",
        "90 Days Validity",
        "24/7 Support",
        "API Access",
        "Custom Integration",
      ],
    },
  ]

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleContinueToPayment = () => {
    if (!selectedPlan) {
      toast.error("Please select a plan first")
      return
    }
    setCurrentStep("payment")
  }

  const handleBackToPlans = () => {
    setCurrentStep("plans")
  }

  const handleSubmitPayment = async () => {
    if (!selectedPlan || !phoneNumber || !transactionId) {
      toast.error("Please fill in all fields")
      return
    }

    const plan = creditPlans.find((p) => p.id === selectedPlan)
    if (!plan) return

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber,
          transactionId,
          amount: plan.price,
          credits: plan.credits,
        }),
      })

      if (response.ok) {
        toast.success("Payment submitted successfully! Awaiting admin approval.")
        setPhoneNumber("")
        setTransactionId("")
        setSelectedPlan(null)
        setCurrentStep("plans")
        onClose()
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to submit payment")
      }
    } catch (error) {
      console.error("Payment submission error:", error)
      toast.error("Failed to submit payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setCurrentStep("plans")
    setSelectedPlan(null)
    setPhoneNumber("")
    setTransactionId("")
    onClose()
  }

  const selectedPlanData = creditPlans.find((p) => p.id === selectedPlan)

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
      <DialogContent className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-4xl h-[85vh] max-h-[700px] bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl overflow-auto p-0">
        {/* Modal Container */}
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
          {/* Fixed Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white relative border-b border-violet-500/20">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="px-6 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Purchase Credits</h1>
                  <p className="text-violet-100 text-sm">
                    {currentStep === "plans" ? "Choose your credit package" : "Complete your payment"}
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-semibold text-sm transition-all ${
                        currentStep === "plans"
                          ? "border-white bg-white text-violet-600 shadow-lg"
                          : "border-white/50 bg-white/20 text-white"
                      }`}
                    >
                      {currentStep === "payment" ? <Check className="h-4 w-4" /> : "1"}
                    </div>
                    <span className="font-medium text-sm text-white">Select Plan</span>
                  </div>

                  <div className="w-8 h-0.5 bg-white/30" />

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-semibold text-sm transition-all ${
                        currentStep === "payment"
                          ? "border-white bg-white text-violet-600 shadow-lg"
                          : "border-white/30 bg-white/10 text-white/50"
                      }`}
                    >
                      2
                    </div>
                    <span
                      className={`font-medium text-sm ${currentStep === "payment" ? "text-white" : "text-white/50"}`}
                    >
                      Payment
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-800 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {currentStep === "plans" ? (
              /* PLANS PAGE - Scrollable */
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Your Package</h2>
                  <p className="text-gray-600 dark:text-gray-400">Select the plan that fits your needs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {creditPlans.map((plan) => (
                    <Card
                      key={plan.id}
                      className={`relative cursor-pointer transition-all duration-300 bg-white dark:bg-gray-900 ${
                        selectedPlan === plan.id
                          ? "ring-2 ring-violet-500 shadow-xl transform scale-105"
                          : "hover:shadow-lg hover:transform hover:scale-102 border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                          <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            Most Popular
                          </div>
                        </div>
                      )}

                      <div className={`h-1 bg-gradient-to-r ${plan.color} rounded-t-lg`} />

                      <CardHeader className="text-center pb-4 pt-6">
                        <div className="mb-4 flex justify-center">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.bgColor}`}>
                            <Zap className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                          </div>
                        </div>
                        <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {plan.name}
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
                      </CardHeader>

                      <CardContent className="text-center space-y-4 pb-6">
                        <div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {plan.credits.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Credits</div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">৳{plan.price}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            ৳{((plan.price / plan.credits) * 1000).toFixed(2)} per 1K
                          </div>
                        </div>

                        <div className="space-y-2 pt-3">
                          {plan.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                            >
                              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>

                        {selectedPlan === plan.id && (
                          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-medium text-sm">
                              <Check className="h-4 w-4" />
                              Selected Plan
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Additional Information Section */}
                <div className="max-w-4xl mx-auto mt-8 space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Why Choose Our Credits?</h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• No expiration on unused credits</li>
                      <li>• 24/7 customer support</li>
                      <li>• Instant activation after payment verification</li>
                      <li>• Secure payment processing</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                    <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Payment Information</h3>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      All payments are processed securely through Bkash. Your credits will be activated within 24 hours
                      of payment verification by our admin team.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* PAYMENT PAGE - Scrollable */
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-3">
                    <CreditCard className="h-6 w-6 text-violet-500" />
                    Complete Your Payment
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">Enter your Bkash payment details below</p>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Form */}
                  <div className="space-y-6">
                    <Card className="border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900">
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-violet-700 dark:text-violet-300 text-lg">
                          <div className="p-2 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg">
                            <Smartphone className="h-5 w-5 text-white" />
                          </div>
                          Bkash Payment Details
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-6">
                        {/* Payment Instructions */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full flex-shrink-0">
                              <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-3">
                                Payment Instructions
                              </h4>
                              <div className="text-sm text-amber-700 dark:text-amber-300 space-y-2">
                                <p className="flex items-center gap-2">
                                  <span className="w-5 h-5 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center text-xs font-bold">
                                    1
                                  </span>
                                  Send <span className="font-bold">৳{selectedPlanData?.price}</span> to{" "}
                                  <span className="font-bold">01XXXXXXXXX</span> via Bkash
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="w-5 h-5 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center text-xs font-bold">
                                    2
                                  </span>
                                  Enter your phone number and transaction ID below
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="w-5 h-5 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center text-xs font-bold">
                                    3
                                  </span>
                                  Submit for admin verification (24 hours)
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="phoneNumber"
                              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                              Your Bkash Phone Number *
                            </Label>
                            <Input
                              id="phoneNumber"
                              type="tel"
                              placeholder="01XXXXXXXXX"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="h-12 text-lg border-2 border-gray-300 dark:border-gray-600 focus:border-violet-500 focus:ring-violet-500 rounded-lg"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="transactionId"
                              className="text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                              Transaction ID *
                            </Label>
                            <Input
                              id="transactionId"
                              placeholder="Enter Bkash transaction ID"
                              value={transactionId}
                              onChange={(e) => setTransactionId(e.target.value)}
                              className="h-12 text-lg border-2 border-gray-300 dark:border-gray-600 focus:border-violet-500 focus:ring-violet-500 rounded-lg"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Help Section */}
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Need Help?</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        If you're having trouble with the payment process:
                      </p>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Make sure you have sufficient balance in your Bkash account</li>
                        <li>• Double-check the transaction ID before submitting</li>
                        <li>• Contact support if payment is not processed within 24 hours</li>
                      </ul>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="space-y-6">
                    <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                          <Check className="h-5 w-5 text-green-500" />
                          Order Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Package:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {selectedPlanData?.name}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Credits:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {selectedPlanData?.credits.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Validity:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {selectedPlanData?.features[2]}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-lg px-4">
                            <span className="font-bold text-lg text-gray-900 dark:text-white">Total Amount:</span>
                            <span className="font-bold text-2xl text-violet-600 dark:text-violet-400">
                              ৳{selectedPlanData?.price}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Security Notice */}
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                          <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Secure Payment</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Your payment will be verified by our admin team within 24 hours. You'll receive a
                            confirmation email once approved and credits are added to your account.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Terms & Conditions</h4>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• Credits are non-refundable once activated</li>
                        <li>• Credits expire based on the validity period of your selected plan</li>
                        <li>• Fraudulent transactions will result in account suspension</li>
                        <li>• Contact support for any payment-related issues</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
            <div className="flex gap-4 max-w-lg mx-auto">
              <Button
                variant="outline"
                onClick={currentStep === "plans" ? handleClose : handleBackToPlans}
                className="flex-1 h-12 text-sm font-semibold bg-white dark:bg-gray-800 border-2"
                disabled={isSubmitting}
              >
                {currentStep === "plans" ? (
                  "Cancel"
                ) : (
                  <>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Plans
                  </>
                )}
              </Button>
              <Button
                onClick={currentStep === "plans" ? handleContinueToPayment : handleSubmitPayment}
                disabled={currentStep === "plans" ? !selectedPlan : isSubmitting || !phoneNumber || !transactionId}
                className="flex-1 h-12 text-sm font-bold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50"
              >
                {currentStep === "plans" ? (
                  <>
                    Continue to Payment
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Submit Payment
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreditModal
