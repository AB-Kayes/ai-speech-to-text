// Simple punctuation processor for speech-to-text
export class PunctuationProcessor {
  private static readonly SENTENCE_ENDINGS = /[.!?]/
  private static readonly PAUSE_INDICATORS = /\b(um|uh|er|ah|hmm)\b/gi

  // Bengali pause indicators
  private static readonly BENGALI_PAUSE_INDICATORS = /\b(আহ|উহ|এহ|হুম|আচ্ছা)\b/gi

  // Common patterns that should end with periods
  private static readonly STATEMENT_PATTERNS = [
    /\b(i think|i believe|in my opinion|it seems|apparently)\b/i,
    /\b(however|therefore|furthermore|moreover|additionally)\b/i,
    /\b(first|second|third|finally|in conclusion)\b/i,
    // Bengali statement patterns
    /\b(আমি মনে করি|আমার মতে|মনে হচ্ছে|স্পষ্টতই|তবে|সুতরাং|প্রথমত|দ্বিতীয়ত|অবশেষে)\b/i,
  ]

  // Patterns that should end with question marks
  private static readonly QUESTION_PATTERNS = [
    /\b(what|when|where|who|why|how|which|whose)\b/i,
    /\b(is|are|was|were|will|would|could|should|can|do|does|did)\s/i,
    // Bengali question patterns
    /\b(কি|কী|কে|কোথায়|কখন|কেন|কিভাবে|কোন|কার)\b/i,
    /\b(আছে|আছেন|ছিল|ছিলেন|হবে|হবেন|পারেন|করেন|করবেন)\s/i,
  ]

  // Patterns that should end with exclamation marks
  private static readonly EXCLAMATION_PATTERNS = [
    /\b(wow|amazing|incredible|fantastic|terrible|awful|great|excellent)\b/i,
    /\b(oh no|oh my|oh wow|holy)\b/i,
    // Bengali exclamation patterns
    /\b(বাহ|অসাধারণ|দুর্দান্ত|চমৎকার|ভয়ানক|দারুণ|চমৎকার|অবিশ্বাস্য)\b/i,
    /\b(হায়|আরে|ওহ|আহা|বাপরে)\b/i,
  ]

  static addPunctuation(
    text: string,
    options: {
      addPeriods?: boolean
      addCommas?: boolean
      addQuestionMarks?: boolean
      addExclamations?: boolean
      removePauses?: boolean
      capitalizeFirst?: boolean
    } = {},
  ): string {
    const {
      addPeriods = true,
      addCommas = true,
      addQuestionMarks = true,
      addExclamations = true,
      removePauses = true,
      capitalizeFirst = true,
    } = options

    let processedText = text.trim()

    // Remove pause indicators if requested
    if (removePauses) {
      processedText = processedText.replace(this.PAUSE_INDICATORS, "")
      processedText = processedText.replace(this.BENGALI_PAUSE_INDICATORS, "")
    }

    // Clean up extra spaces
    processedText = processedText.replace(/\s+/g, " ").trim()

    if (!processedText) return ""

    // Split into sentences based on natural pauses and conjunctions
    const sentences = this.splitIntoSentences(processedText)

    const processedSentences = sentences.map((sentence, index) => {
      let processed = sentence.trim()

      if (!processed) return ""

      // Capitalize first letter if requested
      if (capitalizeFirst) {
        processed = processed.charAt(0).toUpperCase() + processed.slice(1)
      }

      // Skip if already has punctuation
      if (this.SENTENCE_ENDINGS.test(processed.slice(-1))) {
        return processed
      }

      // Add appropriate punctuation
      if (addQuestionMarks && this.isQuestion(processed)) {
        processed += "?"
      } else if (addExclamations && this.isExclamation(processed)) {
        processed += "!"
      } else if (addPeriods) {
        processed += "."
      }

      return processed
    })

    let result = processedSentences.filter((s) => s).join(" ")

    // Add commas for natural pauses
    if (addCommas) {
      result = this.addCommas(result)
    }

    return result
  }

  private static splitIntoSentences(text: string): string[] {
    // Split on natural sentence boundaries
    const sentences = text.split(
      /(?<=[.!?।])\s+|(?:\s+(?:and|but|so|because|however|therefore|meanwhile|furthermore|moreover|additionally|consequently|nevertheless|nonetheless|এবং|কিন্তু|তাই|কারণ|তবে|সুতরাং|এদিকে|উপরন্তু|অতিরিক্ত|ফলস্বরূপ|তবুও)\s+)/i,
    )

    // If no natural splits found, try to split on long pauses (multiple words)
    if (sentences.length === 1) {
      return text.split(
        /\s+(?=\b(?:i|we|you|they|he|she|it|this|that|there|here|now|then|today|yesterday|tomorrow|আমি|আমরা|তুমি|তারা|সে|এটি|এই|সেই|এখানে|সেখানে|এখন|তখন|আজ|গতকাল|আগামীকাল)\b)/i,
      )
    }

    return sentences
  }

  private static isQuestion(sentence: string): boolean {
    const trimmed = sentence.trim().toLowerCase()

    // Check for question patterns at the beginning
    for (const pattern of this.QUESTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return true
      }
    }

    // Check for inverted word order (auxiliary verb + subject)
    const questionStarters = /^(is|are|was|were|will|would|could|should|can|do|does|did|have|has|had)\s+/i
    const bengaliQuestionStarters = /^(কি|কী|আছে|আছেন|ছিল|ছিলেন|হবে|হবেন|পারেন|করেন|করবেন)\s+/i
    return questionStarters.test(trimmed) || bengaliQuestionStarters.test(trimmed)
  }

  private static isExclamation(sentence: string): boolean {
    const trimmed = sentence.trim().toLowerCase()

    for (const pattern of this.EXCLAMATION_PATTERNS) {
      if (pattern.test(trimmed)) {
        return true
      }
    }

    return false
  }

  private static addCommas(text: string): string {
    // Add commas before conjunctions in compound sentences
    text = text.replace(/\s+(and|but|or|so|yet|for|nor|এবং|কিন্তু|অথবা|তাই|তবুও|জন্য)\s+/gi, ", $1 ")

    // Add commas after introductory phrases
    text = text.replace(
      /^(however|therefore|furthermore|moreover|additionally|meanwhile|consequently|nevertheless|nonetheless|first|second|third|finally|in conclusion|for example|for instance|in fact|indeed|of course|তবে|সুতরাং|উপরন্তু|অতিরিক্ত|এদিকে|ফলস্বরূপ|তবুও|প্রথমত|দ্বিতীয়ত|তৃতীয়ত|অবশেষে|উপসংহারে|উদাহরণস্বরূপ|প্রকৃতপক্ষে|অবশ্যই)\s+/gi,
      "$1, ",
    )

    // Add commas around parenthetical expressions
    text = text.replace(
      /\s+(however|therefore|of course|in fact|indeed|for example|for instance|তবে|সুতরাং|অবশ্যই|প্রকৃতপক্ষে|উদাহরণস্বরূপ)\s+/gi,
      ", $1, ",
    )

    return text
  }

  // Real-time punctuation for live speech
  static addRealTimePunctuation(text: string, isInterim = false): string {
    if (isInterim) {
      // For interim results, only add basic capitalization
      return text.charAt(0).toUpperCase() + text.slice(1)
    }

    // For final results, add full punctuation
    return this.addPunctuation(text, {
      addPeriods: true,
      addCommas: true,
      addQuestionMarks: true,
      addExclamations: true,
      removePauses: true,
      capitalizeFirst: true,
    })
  }
}
