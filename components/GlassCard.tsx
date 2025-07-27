"use client"

import type React from "react"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "" }) => {
  return (
    <div
      className={`
      bg-gray-900/50 backdrop-blur-md border border-violet-500/20 
      rounded-2xl shadow-2xl transform transition-all duration-300
      hover:shadow-3xl hover:border-violet-500/40
      ${className}
    `}
    >
      {children}
    </div>
  )
}

export default GlassCard
