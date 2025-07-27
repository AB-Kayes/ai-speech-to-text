"use client"

import type React from "react"

const FloatingShapes: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating geometric shapes */}
      <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-full animate-float blur-sm"></div>
      <div className="absolute top-3/4 right-1/4 w-16 h-16 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-lg rotate-45 animate-float-delayed blur-sm"></div>
      <div className="absolute top-1/2 left-3/4 w-12 h-12 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full animate-pulse blur-sm"></div>
      <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-gradient-to-r from-purple-300/20 to-violet-300/20 rounded-full animate-bounce blur-sm"></div>
      <div className="absolute bottom-1/4 left-1/2 w-14 h-14 bg-gradient-to-r from-violet-600/20 to-purple-600/20 rounded-lg rotate-12 animate-float-slow blur-sm"></div>
    </div>
  )
}

export default FloatingShapes
