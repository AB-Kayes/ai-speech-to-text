"use client"

import React from "react"
import { Settings, Check } from "lucide-react"

export interface PunctuationOptions {
  addPeriods: boolean
  addCommas: boolean
  addQuestionMarks: boolean
  addExclamations: boolean
  removePauses: boolean
  capitalizeFirst: boolean
}

interface PunctuationSettingsProps {
  options: PunctuationOptions
  onChange: (options: PunctuationOptions) => void
  disabled?: boolean
}

const PunctuationSettings: React.FC<PunctuationSettingsProps> = ({ options, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleToggle = (key: keyof PunctuationOptions) => {
    onChange({
      ...options,
      [key]: !options[key],
    })
  }

  const settingsItems = [
    { key: "addPeriods" as const, label: "Add Periods", description: "Automatically add periods at sentence ends" },
    { key: "addCommas" as const, label: "Add Commas", description: "Insert commas for natural pauses" },
    { key: "addQuestionMarks" as const, label: "Add Question Marks", description: "Detect and mark questions" },
    { key: "addExclamations" as const, label: "Add Exclamations", description: "Add exclamation marks for emphasis" },
    { key: "removePauses" as const, label: "Remove Filler Words", description: 'Remove "um", "uh", "er" etc.' },
    {
      key: "capitalizeFirst" as const,
      label: "Capitalize Sentences",
      description: "Capitalize first letter of sentences",
    },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-gray-900 
          border border-violet-500/30 rounded-lg transition-all duration-300
          hover:bg-gray-800 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
          w-full sm:w-auto justify-center sm:justify-start
          ${isOpen ? "bg-gray-800" : ""}
        `}
      >
        <Settings className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
        <span className="text-white font-semibold text-sm lg:text-base">Punctuation</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 lg:w-80 bg-gray-900 border border-violet-500/30 rounded-lg shadow-xl z-50">
          <div className="p-4">
            <h3 className="text-white font-bold mb-3 lg:mb-4 font-montserrat text-sm lg:text-base">
              Punctuation Settings
            </h3>
            <div className="space-y-3">
              {settingsItems.map((item) => (
                <div key={item.key} className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggle(item.key)}
                    className={`
                      flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                      ${
                        options[item.key]
                          ? "bg-violet-600 border-violet-600"
                          : "border-gray-400 hover:border-violet-400"
                      }
                    `}
                  >
                    {options[item.key] && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1">
                    <label className="text-white font-semibold text-xs lg:text-sm cursor-pointer">{item.label}</label>
                    <p className="text-gray-400 text-xs mt-1 font-light">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-violet-500/20">
              <button
                onClick={() => {
                  onChange({
                    addPeriods: true,
                    addCommas: true,
                    addQuestionMarks: true,
                    addExclamations: true,
                    removePauses: true,
                    capitalizeFirst: true,
                  })
                }}
                className="text-violet-400 hover:text-violet-300 text-xs lg:text-sm font-semibold"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PunctuationSettings
