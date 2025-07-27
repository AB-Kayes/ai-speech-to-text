"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import type { Language } from "./useSpeechRecognition"
import type { PunctuationOptions } from "@/components/PunctuationSettings"
import { PunctuationProcessor } from "@/utils/punctuationProcessor"

interface UseDeepgramSpeechRecognitionResult {
  transcript: string
  isListening: boolean
  language: Language
  confidence: number
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  hasRecognitionSupport: boolean
  setPunctuationOptions: (options: PunctuationOptions) => void
  punctuationOptions: PunctuationOptions
  setLanguage: (language: Language) => void
}

export const useDeepgramSpeechRecognition = (
  initialLanguage: Language = "en-US",
  initialPunctuationOptions: PunctuationOptions = {
    addPeriods: true,
    addCommas: true,
    addQuestionMarks: true,
    addExclamations: true,
    removePauses: true,
    capitalizeFirst: true,
  },
): UseDeepgramSpeechRecognitionResult => {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [confidence, setConfidence] = useState(0)
  const [punctuationOptions, setPunctuationOptions] = useState<PunctuationOptions>(initialPunctuationOptions)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const socketRef = useRef<WebSocket | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const currentTextRef = useRef("")

  const DG_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
  const hasRecognitionSupport = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)


  const resetTranscript = useCallback(() => {
    setTranscript("")
    currentTextRef.current = ""
    setConfidence(0)
  }, [])

  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }

    if (socketRef.current) {
      socketRef.current.close()
    }

    setIsListening(false)
    mediaRecorderRef.current = null
    socketRef.current = null
    streamRef.current = null
  }, [])

  const startListening = useCallback(async () => {
    if (!DG_KEY) {
      console.error("Deepgram API key not found")
      return
    }

    if (!hasRecognitionSupport) {
      console.error("Media devices not supported")
      return
    }

    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Check if browser supports WebM
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        console.error("Browser does not support audio/webm")
        return
      }

      // Create MediaRecorder
      const options = { mimeType: "audio/webm" }
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      // Create WebSocket connection to Deepgram
      const deepgramLanguage = language === "bn-BD" ? "bn" : "en-US"
      const socket = new WebSocket(
        `wss://api.deepgram.com/v1/listen?language=${deepgramLanguage}&model=nova-2&smart_format=true&interim_results=false`,
        ["token", DG_KEY],
      )
      socketRef.current = socket

      socket.onopen = () => {
        console.log("Deepgram WebSocket connected")
        setIsListening(true)

        mediaRecorder.addEventListener("dataavailable", async (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data)
          }
        })

        // Start recording with chunks every 1100ms
        mediaRecorder.start(1100)
      }

      socket.onmessage = async (message) => {
        try {
          const received = JSON.parse(message.data)

          if (received.channel && received.channel.alternatives && received.channel.alternatives[0]) {
            const transcriptText = received.channel.alternatives[0].transcript
            const confidenceScore = received.channel.alternatives[0].confidence || 0

            if (transcriptText && received.is_final) {
              // Append new transcript to existing text
              currentTextRef.current = currentTextRef.current.concat(" " + transcriptText)

              // Apply punctuation processing
              const processedText = PunctuationProcessor.addPunctuation(currentTextRef.current, punctuationOptions)

              setTranscript(processedText)
              setConfidence(confidenceScore)
              console.log("Deepgram transcript:", processedText)
            }
          }
        } catch (error) {
          console.error("Error parsing Deepgram response:", error)
        }
      }

      socket.onerror = (error) => {
        console.error("Deepgram WebSocket error:", error)
        stopListening()
      }

      socket.onclose = (event) => {
        console.log("Deepgram WebSocket closed:", event.code, event.reason)
        if (isListening) {
          stopListening()
        }
      }
    } catch (error) {
      console.error("Error starting Deepgram recording:", error)
      setIsListening(false)
    }
  }, [DG_KEY, hasRecognitionSupport, language, punctuationOptions, isListening, stopListening])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  // Update transcript when punctuation options change
  useEffect(() => {
    if (currentTextRef.current) {
      const processedText = PunctuationProcessor.addPunctuation(currentTextRef.current, punctuationOptions)
      setTranscript(processedText)
    }
  }, [punctuationOptions])

  return {
    transcript,
    isListening,
    language,
    confidence,
    startListening,
    stopListening,
    resetTranscript,
    hasRecognitionSupport,
    setPunctuationOptions,
    punctuationOptions,
    setLanguage,
  }
}

export default useDeepgramSpeechRecognition
