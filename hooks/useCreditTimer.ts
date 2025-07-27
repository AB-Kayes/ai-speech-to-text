"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"

interface UseCreditTimerProps {
  isActive: boolean
  onInsufficientCredits: () => void
}

export const useCreditTimer = ({ isActive, onInsufficientCredits }: UseCreditTimerProps) => {
  const { user, updateCredits } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout>()
  const lastDeductionRef = useRef<number>(0)

  useEffect(() => {
    if (!isActive || !user) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    // Start the timer - deduct 1 credit every 2 seconds
    intervalRef.current = setInterval(() => {
      const now = Date.now()

      // Ensure we don't deduct too frequently
      if (now - lastDeductionRef.current < 1900) {
        // 1.9 seconds buffer
        return
      }

      if (user.credits <= 0) {
        onInsufficientCredits()
        return
      }

      // Deduct 1 credit (represents 2 seconds of usage)
      updateCredits(-1)
      lastDeductionRef.current = now
    }, 2000) // Every 2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, user, updateCredits, onInsufficientCredits])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
}
