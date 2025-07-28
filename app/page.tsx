"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Upload, Download, Copy, Volume2, RotateCcw, AlertCircle, LogIn, History } from "lucide-react"
import GlassCard from "@/components/GlassCard"
import AudioWaveform from "@/components/AudioWaveform"
import FloatingShapes from "@/components/FloatingShapes"
import LanguageSelector from "@/components/LanguageSelector"
import PunctuationSettings, { type PunctuationOptions } from "@/components/PunctuationSettings"
import AuthModal from "@/components/AuthModal"
import UserMenu from "@/components/UserMenu"
import CreditModal from "@/components/CreditModal"
import SimpleHistoryModal from "@/components/SimpleHistoryModal"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { HistoryProvider, useHistory } from "@/contexts/HistoryContext"
import type { Language } from "@/hooks/useSpeechRecognition"
import useDeepgramSpeechRecognition from "@/hooks/useDeepgramSpeechRecognition"
import useAudioLevel from "@/hooks/useAudioLevel"
import { processAudioFile, downloadTranscript, copyToClipboard } from "@/utils/fileProcessor"
import { PunctuationProcessor } from "@/utils/punctuationProcessor"
import { useCreditTimer } from "@/hooks/useCreditTimer"

function AppContent() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState("")
  const [fileTranscript, setFileTranscript] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("en-US")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [punctuationOptions, setPunctuationOptions] = useState<PunctuationOptions>({
    addPeriods: true,
    addCommas: true,
    addQuestionMarks: true,
    addExclamations: true,
    removePauses: true,
    capitalizeFirst: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user, isAuthenticated, updateCredits } = useAuth()
  const { addToHistory } = useHistory()

  // Always call both hooks, select result based on language
  const recognitionBangla = require("@/hooks/useSonioxSpeechRecognition").default(selectedLanguage, punctuationOptions)
  const recognitionOther = require("@/hooks/useDeepgramSpeechRecognition").default(selectedLanguage, punctuationOptions)
  const currentRecognition = selectedLanguage === "bn-BD" ? recognitionBangla : recognitionOther

  const {
    transcript,
    isListening,
    language,
    startListening,
    stopListening,
    setLanguage,
    hasRecognitionSupport,
    confidence,
    resetTranscript,
    setPunctuationOptions: setSpeechPunctuationOptions,
    punctuationOptions: speechPunctuationOptions,
  } = currentRecognition

  const audioLevel = useAudioLevel(isListening)

  // Per-second credit billing for live transcription
  useCreditTimer({
    isActive: isListening,
    onInsufficientCredits: () => {
      stopListening()
      showNotification("Recording stopped - insufficient credits. Please purchase more credits.")
      setShowCreditModal(true)
    },
  })

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(""), 3000)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if user is authenticated
    if (!isAuthenticated) {
      showNotification("Please sign in to upload files")
      setShowAuthModal(true)
      return
    }

    // Check if user has enough credits for file processing
    if (user && user.credits < 10) {
      showNotification("Insufficient credits. File processing requires 10 credits.")
      setShowCreditModal(true)
      return
    }

    if (!file.type.startsWith("audio/")) {
      showNotification("Please upload an audio file")
      return
    }

    setUploadedFile(file)
    setIsProcessing(true)

    try {
      const result = await processAudioFile(file, language)
      // Apply punctuation to file transcript
      const processedResult = PunctuationProcessor.addPunctuation(result, punctuationOptions)
      setFileTranscript(processedResult)

      // Add to history
      addToHistory({
        text: processedResult,
        type: "file",
        fileName: file.name,
        language,
        confidence: 0.9, // Assume high confidence for file processing
      })

      // Deduct credits for file processing (10 credits per file)
      updateCredits(-10)
      showNotification("Audio file processed successfully!")
    } catch (error) {
      showNotification("Error processing audio file")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text)
    showNotification(success ? "Copied to clipboard!" : "Failed to copy")
  }

  const handleDownload = (text: string, filename: string) => {
    downloadTranscript(text, filename)
    showNotification("Transcript downloaded!")
  }

  const toggleRecording = () => {
    if (isListening) {
      stopListening()
    } else {
      // Check if user is authenticated for live recording
      if (!isAuthenticated) {
        showNotification("Please sign in to use live recording")
        setShowAuthModal(true)
        return
      }

      // Check if user has enough credits for at least 2 seconds (1 credit)
      if (user && user.credits < 1) {
        showNotification("Insufficient credits. Please purchase more credits.")
        setShowCreditModal(true)
        return
      }

      startListening()
      // Credits will now be deducted every 2 seconds by useCreditTimer hook
    }
  }

  // Add to history when transcript changes and recording stops
  useEffect(() => {
    if (!isListening && transcript.trim()) {
      const timeoutId = setTimeout(() => {
        addToHistory({
          text: transcript,
          type: "live",
          language,
          confidence,
        })
        // Save to database via API
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        fetch("/api/history", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            text: transcript,
            type: "live",
            language,
            confidence,
            timestamp: new Date().toISOString(),
          }),
        }).catch((err) => {
          console.error("Failed to save transcript to DB", err)
        })
      }, 1000) // Wait 1 second after stopping to avoid duplicate entries

      return () => clearTimeout(timeoutId)
    }
  }, [isListening, transcript, language, confidence, addToHistory])

  const handleResetTranscript = () => {
    resetTranscript()
    showNotification("Transcript cleared")
  }

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage)
    // Reset transcripts when changing language
    resetTranscript()
    setFileTranscript("")
    if (newLanguage === "bn-BD") {
      showNotification("Language changed to Bangla")
    } else if (newLanguage === "en-US") {
      showNotification("Language changed to English")
    } else {
      showNotification(`Language changed to ${newLanguage}`)
    }
  }

  const handlePunctuationChange = (options: PunctuationOptions) => {
    setPunctuationOptions(options)
    setSpeechPunctuationOptions(options)

    // Reprocess existing transcripts with new punctuation settings
    if (transcript) {
      const reprocessed = PunctuationProcessor.addPunctuation(transcript, options)
      // Note: This would require updating the speech recognition hook to handle reprocessing
    }

    if (fileTranscript) {
      const reprocessed = PunctuationProcessor.addPunctuation(fileTranscript, options)
      setFileTranscript(reprocessed)
    }
  }

  const getPlaceholderText = () => {
    return isListening ? "Listening... Start speaking!" : "Click the microphone to start recording"
  }

  const getReadyText = () => {
    return "Ready to capture your voice..."
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      {/* Subtle tech pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-purple-600/10"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #8B5CF6 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #A855F7 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <FloatingShapes />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start mb-8 lg:mb-12 gap-6 lg:gap-0">
          {/* Logo Section */}
          <div className="flex items-center order-1 lg:order-none">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-400/20 to-purple-400/20 rounded-xl blur-md"></div>
              <img
                src="/Aaladin-Logo.png"
                alt="Aaladin Logo"
                className="relative h-12 lg:h-16 w-auto mr-2 lg:mr-4 p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-violet-500/20 shadow-lg"
              />
            </div>
          </div>

          <div className="text-center flex-1 order-2 lg:order-none">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-2 lg:mb-4 font-montserrat tracking-tight">
              AI Speech Studio
            </h1>
            <div className="w-16 lg:w-24 h-0.5 lg:h-1 bg-gradient-to-r from-violet-500 to-purple-500 mx-auto mb-2 lg:mb-4"></div>
            <p className="text-sm sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto font-light px-4">
              Transform your voice into text with{" "}
              <span className="text-violet-400 font-semibold">cutting-edge AI technology</span>
            </p>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-2 lg:gap-4 order-3 lg:order-none">
            {isAuthenticated && (
              <button
                onClick={() => setShowHistoryModal(true)}
                className="flex items-center gap-1 lg:gap-2 px-3 lg:px-6 py-2 lg:py-3 bg-gray-900/50 border border-violet-500/50 rounded-lg hover:bg-gradient-to-r hover:from-violet-600 hover:to-purple-600 hover:text-white transition-all duration-300 backdrop-blur-sm"
              >
                <History className="w-4 lg:w-5 h-4 lg:h-5 text-white" />
                <span className="text-white font-semibold text-sm lg:text-base hidden sm:inline">History</span>
              </button>
            )}

            {isAuthenticated ? (
              <UserMenu onBuyCredits={() => setShowCreditModal(true)} />
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1 lg:gap-2 px-3 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 shadow-lg text-sm lg:text-base"
              >
                <LogIn className="w-4 lg:w-5 h-4 lg:h-5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Credit Warning */}
        {isAuthenticated && user && user.credits < 30 && (
          <div className="max-w-4xl mx-auto mb-6 lg:mb-8 px-4">
            <div className="bg-violet-900/30 border border-violet-500/50 rounded-lg p-3 lg:p-4 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 lg:w-5 h-4 lg:h-5 text-violet-400 flex-shrink-0" />
                  <p className="text-violet-200 font-medium text-sm lg:text-base">
                    Low credits: {Math.floor((user.credits * 2) / 60)}m {(user.credits * 2) % 60}s remaining (1 credit =
                    2 seconds)
                  </p>
                </div>
                <button
                  onClick={() => setShowCreditModal(true)}
                  className="px-3 lg:px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold rounded-lg transition-colors text-sm lg:text-base w-full sm:w-auto"
                >
                  Buy Credits
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Guest Mode Notice */}
        {!isAuthenticated && (
          <div className="max-w-4xl mx-auto mb-6 lg:mb-8 px-4">
            <div className="bg-gray-900/50 border border-violet-500/30 rounded-lg p-4 lg:p-6 text-center backdrop-blur-sm">
              <p className="text-gray-300 mb-2 font-medium text-sm lg:text-base">
                You're in <span className="text-violet-400 font-semibold">guest mode</span> with limited features
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-violet-400 hover:text-violet-300 font-bold underline transition-colors text-sm lg:text-base"
              >
                Sign in to unlock full access and get 999 credits (33+ minutes of transcription)
              </button>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 bg-gradient-to-r from-violet-600 to-purple-600 border border-violet-500 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-lg shadow-xl animate-slide-in-right backdrop-blur-sm text-sm lg:text-base">
            {notification}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
          {/* Live Speech Recognition */}
          <GlassCard className="p-4 lg:p-8">
            <div className="text-center mb-6 lg:mb-8">
              <div className="w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Volume2 className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
              </div>
              <h2 className="text-xl lg:text-3xl font-bold text-white mb-2 font-montserrat">Live Speech Recognition</h2>
              <div className="w-12 lg:w-16 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 mx-auto mb-3 lg:mb-4"></div>
              <p className="text-gray-400 font-light text-sm lg:text-base">
                {"Click the microphone to start recording"}
              </p>
            </div>

            {/* Language Selector */}
            <div className="flex justify-center mb-4 lg:mb-6">
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-4 w-full sm:w-auto">
                <LanguageSelector
                  currentLanguage={language}
                  onLanguageChange={handleLanguageChange}
                  disabled={isListening}
                />
                <div style={{ display: "none" }}>
                  <PunctuationSettings
                    options={punctuationOptions}
                    onChange={handlePunctuationChange}
                    disabled={isListening}
                  />
                </div>
              </div>
            </div>

            {!process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY && (
              <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 lg:w-5 h-4 lg:h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-200 font-medium text-sm lg:text-base">Deepgram API key not found</p>
                </div>
                <p className="text-red-300 text-xs lg:text-sm mt-2 font-light">
                  Please add your Deepgram API key to the .env file as NEXT_PUBLIC_DEEPGRAM_API_KEY
                </p>
              </div>
            )}

            {!hasRecognitionSupport && (
              <div className="bg-violet-900/30 border border-violet-500 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 lg:w-5 h-4 lg:h-5 text-violet-400 flex-shrink-0" />
                  <p className="text-violet-200 font-medium text-sm lg:text-base">
                    Microphone access is required for speech recognition
                  </p>
                </div>
                <p className="text-violet-300 text-xs lg:text-sm mt-2 font-light">
                  Please allow microphone access when prompted
                </p>
              </div>
            )}

            <div className="space-y-4 lg:space-y-6">
              {/* Recording Button */}
              <div className="flex justify-center">
                <button
                  onClick={toggleRecording}
                  disabled={
                    !hasRecognitionSupport ||
                    (!isAuthenticated && isListening) ||
                    !process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
                  }
                  className={`
                    relative p-6 rounded-full transition-all duration-300 transform
                    ${
                      isListening
                        ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 scale-105 lg:scale-110 animate-pulse shadow-lg shadow-violet-600/50"
                        : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                    border-2 border-violet-500
                  `}
                >
                  {isListening ? (
                    <MicOff className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
                  ) : (
                    <Mic className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
                  )}
                  <div
                    className={`absolute inset-0 rounded-full ${isListening ? "animate-ping bg-violet-400/75" : ""}`}
                  ></div>
                </button>
              </div>

              {/* Audio Waveform */}
              <div className="bg-black/50 border border-violet-500/20 rounded-lg p-2 lg:p-4">
                <AudioWaveform isRecording={isListening} audioLevel={audioLevel} />
              </div>

              {/* Confidence Indicator */}
              {confidence > 0 && (
                <div className="text-center">
                  <p className="text-xs lg:text-sm text-gray-400 mb-2 font-medium">
                    Confidence: {Math.round(confidence * 100)}%
                  </p>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-violet-600 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Live Transcript */}
              <div className="space-y-3 lg:space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg lg:text-xl font-bold text-white font-montserrat">
                  {"Live Transcript"}
                  </h3>
                  {transcript && (
                    <button
                      onClick={handleResetTranscript}
                      className="flex items-center gap-1 lg:gap-2 px-2 lg:px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-violet-500/30 rounded-lg transition-colors text-xs lg:text-sm"
                    >
                      <RotateCcw className="w-3 lg:w-4 h-3 lg:h-4" />
                      <span className="text-white font-medium hidden sm:inline">
                        {"Clear"}
                      </span>
                    </button>
                  )}
                </div>
                <div className="bg-black/70 border border-violet-500/10 rounded-lg p-3 lg:p-4 min-h-24 lg:min-h-32 max-h-48 lg:max-h-64 overflow-y-auto">
                  <p className="text-gray-100 whitespace-pre-wrap font-light leading-relaxed text-sm lg:text-base">
                    {transcript || getPlaceholderText()}
                  </p>
                  {isListening && !transcript && (
                    <div className="flex items-center gap-2 mt-2 text-violet-400">
                      <div className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></div>
                      <span className="text-xs lg:text-sm">{getReadyText()}</span>
                    </div>
                  )}
                </div>

                {transcript && (
                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      onClick={() => handleCopy(transcript)}
                      className="flex items-center justify-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-violet-500/30 rounded-lg transition-colors"
                    >
                      <Copy className="w-3 lg:w-4 h-3 lg:h-4" />
                      <span className="text-xs lg:text-sm text-white font-medium">
                    {"Copy"}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDownload(transcript, "live-transcript.txt")}
                      className="flex items-center justify-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg transition-colors"
                    >
                      <Download className="w-3 lg:w-4 h-3 lg:h-4" />
                      <span className="text-xs lg:text-sm text-white font-medium">
                    {"Download"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* File Upload */}
          <GlassCard className="p-4 lg:p-8">
            <div className="text-center mb-6 lg:mb-8">
              <div className="w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <Upload className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
              </div>
              <h2 className="text-xl lg:text-3xl font-bold text-white mb-2 font-montserrat">Audio File Processing</h2>
              <div className="w-12 lg:w-16 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 mx-auto mb-3 lg:mb-4"></div>
              <p className="text-gray-400 font-light text-sm lg:text-base">
                {"Upload an audio file for transcription"}
              </p>
            </div>

            <div className="space-y-4 lg:space-y-6">
              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-violet-500/40 rounded-lg p-6 lg:p-8 text-center cursor-pointer hover:border-violet-500 hover:bg-violet-600/5 transition-all duration-300"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 lg:w-12 h-8 lg:h-12 mx-auto mb-3 lg:mb-4 text-violet-400" />
                <p className="text-gray-200 mb-2 font-medium text-sm lg:text-base">
                  {uploadedFile
                    ? uploadedFile.name
                    : "Click to upload audio file"}
                </p>
                <p className="text-xs lg:text-sm text-gray-400 font-light">
                  {"Supports MP3, WAV, M4A, and other audio formats"}
                </p>
                <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              </div>

              {/* Processing Indicator */}
              {isProcessing && (
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 lg:h-8 w-6 lg:w-8 border-b-2 border-violet-500 mx-auto mb-3 lg:mb-4"></div>
                  <p className="text-gray-300 font-medium text-sm lg:text-base">
                    {"Processing audio file..."}
                  </p>
                </div>
              )}

              {/* File Transcript */}
              {fileTranscript && (
                <div className="space-y-3 lg:space-y-4">
                  <h3 className="text-lg lg:text-xl font-bold text-white font-montserrat">
                    {"File Transcript"}
                  </h3>
                  <div className="bg-black/70 border border-violet-500/10 rounded-lg p-3 lg:p-4 min-h-24 lg:min-h-32 max-h-48 lg:max-h-64 overflow-y-auto">
                    <p className="text-gray-100 whitespace-pre-wrap font-light leading-relaxed text-sm lg:text-base">
                      {fileTranscript}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      onClick={() => handleCopy(fileTranscript)}
                      className="flex items-center justify-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-violet-500/30 rounded-lg transition-colors"
                    >
                      <Copy className="w-3 lg:w-4 h-3 lg:h-4" />
                      <span className="text-xs lg:text-sm text-white font-medium">
                    {"Copy"}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDownload(fileTranscript, "file-transcript.txt")}
                      className="flex items-center justify-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 rounded-lg transition-colors"
                    >
                      <Download className="w-3 lg:w-4 h-3 lg:h-4" />
                      <span className="text-xs lg:text-sm text-white font-medium">
                    {"Download"}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Modals */}
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        <CreditModal isOpen={showCreditModal} onClose={() => setShowCreditModal(false)} />
        <SimpleHistoryModal isOpen={showHistoryModal} onClose={() => setShowHistoryModal(false)} />

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 max-w-4xl mx-auto mt-12 lg:mt-16 px-4">
          <GlassCard className="p-4 lg:p-6 text-center">
            <div className="w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
              <Mic className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-white mb-2 font-montserrat">Real-time Recognition</h3>
            <div className="w-8 lg:w-12 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 mx-auto mb-2 lg:mb-3"></div>
            <p className="text-gray-400 text-xs lg:text-sm font-light leading-relaxed">
              {"Instant speech-to-text conversion with high accuracy and low latency"}
            </p>
          </GlassCard>

          <GlassCard className="p-4 lg:p-6 text-center">
            <div className="w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
              <Upload className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-white mb-2 font-montserrat">File Processing</h3>
            <div className="w-8 lg:w-12 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 mx-auto mb-2 lg:mb-3"></div>
            <p className="text-gray-400 text-xs lg:text-sm font-light leading-relaxed">
              {"Upload and transcribe audio files of various formats with ease"}
            </p>
          </GlassCard>

          <GlassCard className="p-4 lg:p-6 text-center sm:col-span-2 lg:col-span-1">
            <div className="w-12 lg:w-16 h-12 lg:h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
              <Download className="w-6 lg:w-8 h-6 lg:h-8 text-white" />
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-white mb-2 font-montserrat">Export Options</h3>
            <div className="w-8 lg:w-12 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 mx-auto mb-2 lg:mb-3"></div>
            <p className="text-gray-400 text-xs lg:text-sm font-light leading-relaxed">
              {"Copy to clipboard or download transcripts in multiple formats"}
            </p>
          </GlassCard>
        </div>
      </div>

    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <HistoryProvider>
        <AppContent />
      </HistoryProvider>
    </AuthProvider>
  )
}
