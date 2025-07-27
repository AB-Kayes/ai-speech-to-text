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
      <DialogContent className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-[98vw] max-w-6xl h-[95vh] max-h-[900px] bg-white dark:bg-gray-900 border-0 shadow-2xl rounded-2xl overflow-auto p-0 [&_button[data-radix-dialog-close]]:hidden">
        {/* Custom close button for all screen sizes */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-white dark:text-gray-200" />
        </button>
        <div className="h-full flex flex-col bg-white dark:bg-gray-900">
          {/* Main Content (full width) */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Header for mobile */}
            <div className="md:hidden flex-shrink-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white relative border-b border-violet-500/20 rounded-t-2xl">
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
              </div>
            </div>
            {/* Progress Steps */}
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-semibold text-sm transition-all ${
                      currentStep === "plans"
                        ? "border-violet-600 bg-violet-600 text-white shadow-lg"
                        : "border-violet-300 bg-white/20 text-violet-600"
                    }`}
                  >
                    {currentStep === "payment" ? <Check className="h-4 w-4" /> : "1"}
                  </div>
                  <span className="font-medium text-sm text-violet-700 dark:text-violet-200">Select Plan</span>
                </div>
                <div className="w-8 h-0.5 bg-violet-300" />
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 font-semibold text-sm transition-all ${
                      currentStep === "payment"
                        ? "border-violet-600 bg-violet-600 text-white shadow-lg"
                        : "border-violet-300 bg-white/20 text-violet-400"
                    }`}
                  >
                    2
                  </div>
                  <span className={`font-medium text-sm ${currentStep === "payment" ? "text-violet-700 dark:text-violet-200" : "text-violet-400"}`}>Payment</span>
                </div>
              </div>
            </div>
            {/* Main Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col justify-center">
              {currentStep === "plans" ? (
                <div className="space-y-6 max-w-3xl mx-auto w-full">
                  <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">Choose Your Package</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {creditPlans.map((plan, idx) => (
                      <Card
                        key={plan.id || idx}
                        className={`relative cursor-pointer transition-all duration-200 bg-white dark:bg-gray-900 ring-2 ring-transparent hover:ring-violet-300 hover:shadow-md border-gray-200 dark:border-gray-700 min-h-[320px] flex flex-col justify-between px-6 py-6 ${selectedPlan === plan.id ? "ring-violet-500 shadow-lg" : ""}`}
                        onClick={() => handlePlanSelect(plan.id)}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
                            <div className="bg-gradient-to-r from-orange-400 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" /> Most Popular
                            </div>
                          </div>
                        )}
                        <div className={`h-1 bg-gradient-to-r ${plan.color} rounded-t-lg`} />
                        <CardHeader className="text-center pb-3 pt-4">
                          <div className="mb-2 flex justify-center">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${plan.bgColor}`}>
                              <Zap className="h-7 w-7 text-violet-600 dark:text-violet-400" />
                            </div>
                          </div>
                          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{plan.name}</CardTitle>
                          <p className="text-gray-600 dark:text-gray-400 text-base">{plan.description}</p>
                        </CardHeader>
                        <CardContent className="text-center space-y-2 pb-4">
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">{plan.credits.toLocaleString()} <span className="text-lg font-normal">credits</span></div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">৳{plan.price}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">৳{((plan.price / plan.credits) * 1000).toFixed(2)} per 1K</div>
                          <div className={`mt-2 p-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800 transition-opacity duration-200 ${selectedPlan === plan.id ? '' : 'opacity-0 pointer-events-none'}`}>
                            <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400 font-medium text-base">
                              <Check className="h-5 w-5" /> Selected
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6 max-w-5xl mx-auto w-full h-full flex flex-col">
                  <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2 flex items-center justify-center gap-2">
                    <CreditCard className="h-6 w-6 text-violet-500" /> Complete Your Payment
                  </h2>
                  <div className="flex-1 flex flex-col md:flex-row gap-6 w-full md:justify-center overflow-hidden">
                    {/* Payment Form */}
                    <div className="space-y-6 flex flex-col justify-center h-full w-full md:w-[480px] md:max-w-[520px] mx-auto overflow-auto" style={{maxHeight: '480px'}}>
                      <Card className="border-2 border-violet-200 dark:border-violet-800 bg-white dark:bg-gray-900 h-full min-h-[280px] flex flex-col justify-center px-4 py-4 md:px-8 md:py-6">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-violet-700 dark:text-violet-300 text-lg">
                            <Smartphone className="h-5 w-5 text-white bg-gradient-to-br from-pink-500 to-red-500 rounded-lg p-0.5" />
                            Bkash Payment
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="text-sm text-amber-700 dark:text-amber-300 mb-1">
                            Send <span className="font-bold">৳{selectedPlanData?.price}</span> to <span className="font-bold">01XXXXXXXXX</span> via Bkash. Enter your phone number and transaction ID below. Submit for admin verification (24h).
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bkash Phone Number *</Label>
                            <Input id="phoneNumber" type="tel" placeholder="01XXXXXXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="h-9 text-base border-2 border-gray-300 dark:border-gray-600 focus:border-violet-500 focus:ring-violet-500 rounded-lg" />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="transactionId" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction ID *</Label>
                            <Input id="transactionId" placeholder="Enter Bkash transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="h-9 text-base border-2 border-gray-300 dark:border-gray-600 focus:border-violet-500 focus:ring-violet-500 rounded-lg" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    {/* Order Summary */}
                    <div className="space-y-6 flex flex-col justify-center h-full w-full md:w-[480px] md:max-w-[520px] mx-auto overflow-auto" style={{maxHeight: '480px'}}>
                      <Card className="border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 h-full min-h-[280px] flex flex-col justify-center px-4 py-4 md:px-8 md:py-6">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white text-lg">
                            <Check className="h-5 w-5 text-green-500" /> Order Summary
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700 text-base">
                            <span className="text-gray-600 dark:text-gray-400">Package:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{selectedPlanData?.name}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700 text-base">
                            <span className="text-gray-600 dark:text-gray-400">Credits:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{selectedPlanData?.credits.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-700 text-base">
                            <span className="text-gray-600 dark:text-gray-400">Validity:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{selectedPlanData?.features[2]}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 rounded-lg px-3 mt-2 text-lg">
                            <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                            <span className="font-bold text-xl text-violet-600 dark:text-violet-400">৳{selectedPlanData?.price}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Payment form and order summary are now correctly rendered above. */}
            {/* Fixed Footer */}
            <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4">
              <div className="flex gap-4 max-w-lg mx-auto">
                <Button
                  variant="outline"
                  onClick={currentStep === "plans" ? handleClose : handleBackToPlans}
                  className="flex-1 h-12 text-base font-semibold bg-white dark:bg-gray-800 border-2 text-gray-700 dark:text-gray-200"
                  disabled={isSubmitting}
                >
                  {currentStep === "plans" ? (
                    <span className="text-gray-700 dark:text-gray-200">Cancel</span>
                  ) : (
                    <>
                      <ArrowLeft className="h-4 w-4 mr-2 text-gray-700 dark:text-gray-200" />
                      <span className="text-gray-700 dark:text-gray-200">Back to Plans</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={currentStep === "plans" ? handleContinueToPayment : handleSubmitPayment}
                  disabled={currentStep === "plans" ? !selectedPlan : isSubmitting || !phoneNumber || !transactionId}
                  className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg disabled:opacity-50"
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreditModal
