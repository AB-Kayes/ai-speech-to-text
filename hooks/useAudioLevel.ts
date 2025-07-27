"use client"

import { useState, useEffect, useRef } from "react"

export const useAudioLevel = (isListening: boolean): number => {
  const [audioLevel, setAudioLevel] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!isListening) {
      setAudioLevel(0)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    const setupAudioAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()

        analyser.fftSize = 256
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        source.connect(analyser)
        analyserRef.current = analyser
        dataArrayRef.current = dataArray

        const updateAudioLevel = () => {
          if (!analyserRef.current || !dataArrayRef.current) return

          analyserRef.current.getByteFrequencyData(dataArrayRef.current)

          // Calculate average volume
          let sum = 0
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i]
          }
          const average = sum / dataArrayRef.current.length

          // Normalize to 0-1 range
          const normalizedLevel = Math.min(average / 128, 1)
          setAudioLevel(normalizedLevel)

          if (isListening) {
            animationRef.current = requestAnimationFrame(updateAudioLevel)
          }
        }

        updateAudioLevel()
      } catch (error) {
        console.error("Error setting up audio analysis:", error)
      }
    }

    setupAudioAnalysis()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isListening])

  return audioLevel
}

export default useAudioLevel
