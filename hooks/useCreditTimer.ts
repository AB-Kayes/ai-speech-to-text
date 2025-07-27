"use client"

import { useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface UseCreditTimerProps {
  isActive: boolean // Whether transcription is active
  onInsufficientCredits?: () => void // Callback when credits run out
}

export const useCreditTimer = ({ isActive, onInsufficientCredits }: UseCreditTimerProps) => {
  const { user, updateCredits } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = useRef(isActive)
  const onInsufficientCreditsRef = useRef(onInsufficientCredits)

  // Keep refs updated
  useEffect(() => {
    isActiveRef.current = isActive
    onInsufficientCreditsRef.current = onInsufficientCredits
  }, [isActive, onInsufficientCredits])

  // Memoized deduction function
  const deductCredit = useCallback(() => {
    console.log("Attempting to deduct credit...", { user: user?.credits, isActive: isActiveRef.current })

    if (!isActiveRef.current) {
      console.log("Not active, stopping timer")
      return false
    }

    if (!user || user.credits <= 0) {
      console.log("No credits remaining, stopping")
      if (onInsufficientCreditsRef.current) {
        onInsufficientCreditsRef.current()
      }
      return false
    }

    console.log("Deducting 1 credit. Current credits:", user.credits)
    updateCredits(-1)
    return true
  }, [user, updateCredits])

  useEffect(() => {
    console.log("Credit timer effect triggered:", { isActive, userCredits: user?.credits })

    if (isActive && user && user.credits > 0) {
      console.log("Starting credit timer")

      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Start new interval - deduct 1 credit every 2 seconds
      intervalRef.current = setInterval(() => {
        if (!deductCredit()) {
          // Stop the timer if deduction failed
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      }, 2000)
    } else {
      console.log("Stopping credit timer")
      // Stop the timer when not active or no credits
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        console.log("Cleaning up credit timer")
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, user, deductCredit])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        console.log("Cleaning up credit timer")
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [])
}
