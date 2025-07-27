export const processAudioFile = async (file: File, language = "en-US"): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Simulate processing with more realistic delay
    setTimeout(() => {
      const sampleTranscripts =
        language === "bn-BD"
          ? [
              "নমস্কার, এটি আপনার অডিও ফাইলের একটি নমুনা ট্রান্সক্রিপশন। বক্তৃতা স্বীকৃতি সিস্টেম সফলভাবে আপনার অডিও প্রক্রিয়া করেছে এবং এটি পাঠ্যে রূপান্তরিত করেছে।",
              "AI স্পিচ স্টুডিওতে স্বাগতম। আপনার অডিও ফাইল উন্নত বক্তৃতা স্বীকৃতি প্রযুক্তি ব্যবহার করে প্রক্রিয়াকৃত এবং ট্রান্সক্রাইব করা হয়েছে।",
              "এটি অডিও ফাইল ট্রান্সক্রিপশনের একটি প্রদর্শনী। সিস্টেম বিভিন্ন অডিও ফরম্যাট পরিচালনা করতে এবং নির্ভুল পাঠ্য রূপান্তর প্রদান করতে পারে।",
            ]
          : [
              "Hello, this is a sample transcription of your audio file. The speech recognition system has successfully processed your audio and converted it to text.",
              "Welcome to the AI Speech Studio. Your audio file has been processed and transcribed using advanced speech recognition technology.",
              "This is a demonstration of audio file transcription. The system can handle various audio formats and provide accurate text conversion.",
            ]
      const randomTranscript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)]
      resolve(`[${file.name}]\n\n${randomTranscript}`)
    }, 1500)
  })
}

export const downloadTranscript = (transcript: string, filename = "transcript.txt") => {
  const blob = new Blob([transcript], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error("Failed to copy to clipboard:", error)
    return false
  }
}
