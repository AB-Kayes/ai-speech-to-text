"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { PunctuationProcessor } from "@/utils/punctuationProcessor"
import type { PunctuationOptions } from "@/components/PunctuationSettings"

export type Language = "en-US" | "bn-BD"

export interface LanguageOption {
  code: Language
  name: string
  flag: string
}

interface SpeechRecognitionHook {
  transcript: string
  isListening: boolean
  language: Language
  startListening: () => void
  stopListening: () => void
  setLanguage: (language: Language) => void
  hasRecognitionSupport: boolean
  confidence: number
  resetTranscript: () => void
  setPunctuationOptions: (options: PunctuationOptions) => void
  punctuationOptions: PunctuationOptions
}

const useSpeechRecognition = (
  initialLanguage: Language = "en-US",
  initialPunctuationOptions?: PunctuationOptions,
): SpeechRecognitionHook => {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [confidence, setConfidence] = useState(0)
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [punctuationOptions, setPunctuationOptions] = useState<PunctuationOptions>(
    initialPunctuationOptions || {
      addPeriods: true,
      addCommas: true,
      addQuestionMarks: true,
      addExclamations: true,
      removePauses: true,
      capitalizeFirst: true,
    },
  )
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef("")
  const restartPendingRef = useRef(false)
  const isStoppingIntentionally = useRef(false)

  const hasRecognitionSupport = Boolean(
    typeof window !== "undefined" && (window.SpeechRecognition || (window as any).webkitSpeechRecognition),
  )

  useEffect(() => {
    if (!hasRecognitionSupport) return

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()

    const recognition = recognitionRef.current
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log("Speech recognition started")
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = finalTranscriptRef.current

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcriptPart = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcriptPart + " "
          // Apply punctuation to final results
          finalTranscript = PunctuationProcessor.addPunctuation(finalTranscript, punctuationOptions)
          setConfidence(result[0].confidence || 0.8)
        } else {
          // Apply basic punctuation to interim results
          interimTranscript += PunctuationProcessor.addRealTimePunctuation(transcriptPart, true)
        }
      }

      finalTranscriptRef.current = finalTranscript
      setTranscript(finalTranscript + interimTranscript)
    }

    recognition.onerror = (event: any) => {
      // Don't log error if we're stopping intentionally
      if (event.error === "aborted" && isStoppingIntentionally.current) {
        isStoppingIntentionally.current = false
        return
      }

      console.error("Speech recognition error:", event.error)
      if (event.error === "not-allowed") {
        alert("Microphone access denied. Please allow microphone access and try again.")
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      console.log("Speech recognition ended")
      setIsListening(false)
      isStoppingIntentionally.current = false

      // Check if we need to restart with new language
      if (restartPendingRef.current) {
        restartPendingRef.current = false
        setTimeout(() => {
          startListening()
        }, 100)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [hasRecognitionSupport, language])

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error("Error starting recognition:", error)
      }
    }
  }, [isListening])

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      isStoppingIntentionally.current = true
      recognitionRef.current.stop()
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    finalTranscriptRef.current = ""
    setConfidence(0)
  }, [])

  const changeLanguage = useCallback(
    (newLanguage: Language) => {
      const wasListening = isListening
      if (wasListening) {
        isStoppingIntentionally.current = true
        restartPendingRef.current = true
        stopListening()
      }
      setLanguage(newLanguage)
      resetTranscript()

      // If not listening, no need to restart
      if (!wasListening) {
        restartPendingRef.current = false
      }
    },
    [isListening, stopListening, startListening, resetTranscript],
  )

  return {
    transcript,
    isListening,
    language,
    startListening,
    stopListening,
    setLanguage: changeLanguage,
    hasRecognitionSupport,
    confidence,
    resetTranscript,
    setPunctuationOptions,
    punctuationOptions,
  }
}

export default useSpeechRecognition
