"use client"

import type React from "react"

const EnvDebug: React.FC = () => {
  const envKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY

  // Only show in development or if explicitly enabled
  const isDev = process.env.NODE_ENV === "development"
  const showDebug = isDev || process.env.NEXT_PUBLIC_SHOW_DEBUG === "true"

  if (!showDebug) return null

  return (
    <div className="fixed bottom-4 left-4 bg-gray-800 text-white p-3 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Environment Debug</h4>
      <div>
        <strong>Environment:</strong> {process.env.NODE_ENV}
      </div>
      <div>
        <strong>API Key Present:</strong> {envKey ? "Yes" : "No"}
      </div>
      <div>
        <strong>API Key Length:</strong> {envKey?.length || 0}
      </div>
      <div>
        <strong>API Key First 8:</strong> {envKey?.substring(0, 8) || "N/A"}
      </div>
    </div>
  )
}

export default EnvDebug
