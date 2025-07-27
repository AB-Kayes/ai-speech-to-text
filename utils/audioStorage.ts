/**
 * Audio storage utilities for history functionality
 */

/**
 * Convert a File to base64 string for storage
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to convert file to base64"))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/**
 * Convert base64 string back to audio blob for playback
 */
export const base64ToBlob = (base64: string): Blob | null => {
  try {
    const [header, data] = base64.split(",")
    const mimeMatch = header.match(/data:([^;]+)/)

    if (!mimeMatch) return null

    const mimeType = mimeMatch[1]
    const byteCharacters = atob(data)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  } catch (error) {
    console.error("Error converting base64 to blob:", error)
    return null
  }
}

/**
 * Create a blob URL for audio playback
 */
export const createAudioUrl = (audioData: string): string | null => {
  const blob = base64ToBlob(audioData)
  if (!blob) return null

  return URL.createObjectURL(blob)
}

/**
 * Clean up blob URLs to prevent memory leaks
 */
export const cleanupAudioUrl = (url: string | null | undefined) => {
  if (url && url.startsWith("blob:")) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Check if audio data is valid and not too large (limit to 5MB)
 */
export const isValidAudioData = (base64Data: string): boolean => {
  try {
    // Check if it's a valid base64 data URL
    if (!base64Data.startsWith("data:audio/")) {
      return false
    }

    // Check size (base64 is ~4/3 the size of original, so 5MB * 4/3 ≈ 6.7MB)
    const maxSize = 6700000 // ~5MB in base64
    if (base64Data.length > maxSize) {
      console.warn("Audio data too large for storage")
      return false
    }

    return true
  } catch (error) {
    console.error("Error validating audio data:", error)
    return false
  }
}

/**
 * Record audio from MediaStream and return as base64
 * This is for live recording capture
 */
export const recordAudioFromStream = (stream: MediaStream, duration = 30000): Promise<string | null> => {
  return new Promise((resolve) => {
    try {
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: "audio/webm" })
          const file = new File([blob], "recording.webm", { type: "audio/webm" })
          const base64 = await fileToBase64(file)

          if (isValidAudioData(base64)) {
            resolve(base64)
          } else {
            resolve(null)
          }
        } catch (error) {
          console.error("Error processing recorded audio:", error)
          resolve(null)
        }
      }

      mediaRecorder.onerror = () => {
        console.error("MediaRecorder error")
        resolve(null)
      }

      mediaRecorder.start()

      // Stop recording after duration or when stream ends
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop()
        }
      }, duration)
    } catch (error) {
      console.error("Error setting up audio recording:", error)
      resolve(null)
    }
  })
}
