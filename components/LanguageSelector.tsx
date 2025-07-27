"use client"

import React from "react"
import { Globe, ChevronDown } from "lucide-react"
import type { Language, LanguageOption } from "@/hooks/useSpeechRecognition"

interface LanguageSelectorProps {
  currentLanguage: Language
  onLanguageChange: (language: Language) => void
  disabled?: boolean
}

const languages: LanguageOption[] = [
  { code: "en-US", name: "English", flag: "🇺🇸" },
  { code: "bn-BD", name: "বাংলা", flag: "🇧🇩" },
]

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ currentLanguage, onLanguageChange, disabled = false }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const currentLang = languages.find((lang) => lang.code === currentLanguage)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 bg-gray-900 
          border border-violet-500/30 rounded-lg transition-all duration-300
          hover:bg-gray-800 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
          w-full sm:w-auto justify-center sm:justify-start
          ${isOpen ? "bg-gray-800" : ""}
        `}
      >
        <Globe className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
        <span className="text-white font-semibold text-sm lg:text-base">
          {currentLang?.flag} {currentLang?.name}
        </span>
        <ChevronDown
          className={`w-3 lg:w-4 h-3 lg:h-4 text-white transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-gray-900 border border-violet-500/30 rounded-lg shadow-xl z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code)
                setIsOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                hover:bg-gray-800 first:rounded-t-lg last:rounded-b-lg
                text-sm lg:text-base
                ${currentLanguage === lang.code ? "bg-gray-800" : ""}
              `}
            >
              <span className="text-lg lg:text-xl">{lang.flag}</span>
              <span className="text-white font-semibold">{lang.name}</span>
              {currentLanguage === lang.code && <div className="ml-auto w-2 h-2 bg-violet-500 rounded-full"></div>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
