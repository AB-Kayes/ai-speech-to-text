/**
 * Format seconds into a readable time format
 * @param seconds - Number of seconds
 * @returns Formatted string like "15m 30s" or "2h 15m" or "45s"
 */
export const formatTimeFromSeconds = (seconds: number): string => {
  if (seconds < 0) return "0s"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${hours}h`
  }

  if (minutes > 0) {
    if (remainingSeconds > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${minutes}m`
  }

  return `${remainingSeconds}s`
}

/**
 * Format seconds for credit display (show seconds for under 2 minutes, otherwise show minutes)
 * @param seconds - Number of seconds
 * @returns Formatted string optimized for credit display
 */
export const formatCreditsTime = (seconds: number): string => {
  if (seconds < 0) return "0s"

  if (seconds < 120) {
    // Show seconds for under 2 minutes
    return `${seconds}s`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (remainingSeconds === 0) {
    return `${minutes}m`
  }

  return `${minutes}m ${remainingSeconds}s`
}
