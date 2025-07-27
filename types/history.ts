export interface TranscriptionHistory {
  id: string
  text: string
  type: "live" | "file"
  fileName?: string
  language: string
  timestamp: string
  duration?: number
  confidence?: number
}

export interface HistoryState {
  items: TranscriptionHistory[]
  isLoading: boolean
}
