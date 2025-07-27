"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface AudioWaveformProps {
  isRecording: boolean
  audioLevel: number
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording, audioLevel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const bars = 50
      const barWidth = canvas.width / bars
      const centerY = canvas.height / 2

      for (let i = 0; i < bars; i++) {
        const height = isRecording
          ? (Math.random() * audioLevel * 100 + 10) * (Math.sin(Date.now() * 0.01 + i * 0.5) * 0.5 + 1)
          : 5

        const x = i * barWidth
        const gradient = ctx.createLinearGradient(x, centerY - height / 2, x, centerY + height / 2)
        gradient.addColorStop(0, "#8B5CF6")
        gradient.addColorStop(0.5, "#A855F7")
        gradient.addColorStop(1, "#7C3AED")

        ctx.fillStyle = gradient
        ctx.fillRect(x, centerY - height / 2, barWidth - 2, height)
      }

      if (isRecording) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    if (isRecording) {
      draw()
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRecording, audioLevel])

  return <canvas ref={canvasRef} width={300} height={80} className="w-full h-16 lg:h-20 rounded-lg" />
}

export default AudioWaveform
