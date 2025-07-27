"use client"

import { useState, useEffect, useRef } from "react"

const useAudioLevel = (isRecording: boolean) => {
  const [audioLevel, setAudioLevel] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    let stream: MediaStream | null = null

    const setupAudio = async () => {
      if (!isRecording) {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop())
        }
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        setAudioLevel(0)
        return
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        audioContextRef.current = new AudioContext()
        analyserRef.current = audioContextRef.current.createAnalyser()

        const source = audioContextRef.current.createMediaStreamSource(stream)
        source.connect(analyserRef.current)

        analyserRef.current.fftSize = 256
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        const updateAudioLevel = () => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray)
            const average = dataArray.reduce((a, b) => a + b) / bufferLength
            setAudioLevel(average / 255)
          }
          animationRef.current = requestAnimationFrame(updateAudioLevel)
        }

        updateAudioLevel()
      } catch (error) {
        console.error("Error accessing microphone:", error)
      }
    }

    setupAudio()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRecording])

  return audioLevel
}

export default useAudioLevel
