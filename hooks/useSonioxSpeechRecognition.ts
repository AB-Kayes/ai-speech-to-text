"use client"

import { useState, useRef, useCallback } from "react"
import type { Language } from "./useSpeechRecognition"
import type { PunctuationOptions } from "@/components/PunctuationSettings"
import { PunctuationProcessor } from "@/utils/punctuationProcessor"

interface UseSonioxSpeechRecognitionResult {
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

export const useSonioxSpeechRecognition = (
  initialLanguage: Language = "bn-BD",
  initialPunctuationOptions: PunctuationOptions = {
    addPeriods: true,
    addCommas: true,
    addQuestionMarks: true,
    addExclamations: true,
    removePauses: true,
    capitalizeFirst: true,
  },
): UseSonioxSpeechRecognitionResult => {
  const [transcript, setTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [confidence, setConfidence] = useState(0)
  const [punctuationOptions, setPunctuationOptions] = useState<PunctuationOptions>(initialPunctuationOptions)

  const socketRef = useRef<WebSocket | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const currentTextRef = useRef("")

  const SONIOX_KEY = process.env.NEXT_PUBLIC_SONIOX_API_KEY || ""
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
    if (!SONIOX_KEY) {
      console.error("Soniox API key not found")
      return
    }
    if (!hasRecognitionSupport) {
      console.error("Media devices not supported")
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        console.error("Browser does not support audio/webm")
        return
      }
      const options = { mimeType: "audio/webm" }
      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder
      const socket = new WebSocket("wss://stt-rt.soniox.com/transcribe-websocket")
      socketRef.current = socket
      socket.onopen = () => {
        setIsListening(true)
        socket.send(
          JSON.stringify({
            api_key: SONIOX_KEY,
            audio_format: "auto",
            model: "stt-rt-preview",
            language_hints: ["bn"],
          })
        )
        mediaRecorder.addEventListener("dataavailable", async (event) => {
          if (event.data.size > 0 && socket.readyState === WebSocket.OPEN) {
            socket.send(event.data)
          }
        })
        mediaRecorder.start(1100)
      }
      socket.onmessage = async (event) => {
        try {
          const res = JSON.parse(event.data)
          if (res.error_code) {
            console.error(`Soniox error: ${res.error_code} ${res.error_message}`)
            stopListening()
            return
          }
          let nonFinalText = ""
          for (const token of res.tokens || []) {
            if (token.text) {
              if (token.is_final) {
                currentTextRef.current += token.text
              } else {
                nonFinalText += token.text
              }
            }
          }
          const processedText = PunctuationProcessor.addPunctuation(currentTextRef.current, punctuationOptions)
          setTranscript(processedText + nonFinalText)
          setConfidence(res.confidence || 0)
        } catch (error) {
          console.error("Error parsing Soniox response:", error)
        }
      }
      socket.onerror = (error) => {
        console.error("Soniox WebSocket error:", error)
        stopListening()
      }
      socket.onclose = () => {
        setIsListening(false)
      }
    } catch (error) {
      console.error("Error starting Soniox recording:", error)
      setIsListening(false)
    }
  }, [SONIOX_KEY, hasRecognitionSupport, punctuationOptions, stopListening])

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

export default useSonioxSpeechRecognition
