"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Search, Download, Copy, Mic, Upload, Clock } from "lucide-react"
import { useHistory } from "@/contexts/HistoryContext"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<"all" | "live" | "file">("all")
  const { history, loading, error, fetchHistory } = useHistory()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchHistory()
    }
  }, [isOpen, isAuthenticated, fetchHistory])

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.fileName && item.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedType === "all" || item.type === selectedType
    return matchesSearch && matchesType
  })

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy")
    }
  }

  const handleDownload = (text: string, fileName?: string) => {
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName ? `${fileName}-transcript.txt` : "transcript.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Downloaded!")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Transcription History
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search transcriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
              >
                All
              </Button>
              <Button
                variant={selectedType === "live" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("live")}
                className="flex items-center gap-1"
              >
                <Mic className="w-3 h-3" />
                Live
              </Button>
              <Button
                variant={selectedType === "file" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("file")}
                className="flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                File
              </Button>
            </div>
          </div>

          {/* History List */}
          <ScrollArea className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading history...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-red-500">Error: {error}</div>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">
                  {searchTerm || selectedType !== "all" ? "No matching transcriptions found" : "No transcriptions yet"}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHistory.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={item.type === "live" ? "default" : "secondary"}>
                          {item.type === "live" ? (
                            <>
                              <Mic className="w-3 h-3 mr-1" />
                              Live Recording
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 mr-1" />
                              File Upload
                            </>
                          )}
                        </Badge>
                        {item.fileName && (
                          <Badge variant="outline" className="text-xs">
                            {item.fileName}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {item.language === "bn-BD" ? "🇧🇩 বাংলা" : "🇺🇸 English"}
                        </Badge>
                        {item.confidence && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round(item.confidence * 100)}% confidence
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(item.text)} className="h-8 w-8 p-0">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(item.text, item.fileName)}
                          className="h-8 w-8 p-0"
                        >
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.timestamp)}
                    </div>

                    <div className="text-sm leading-relaxed bg-muted/50 rounded p-3">{item.text}</div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default HistoryModal
