const CACHE_PREFIX = 'ai-summary:'

interface AISummaryRequest {
  eventTitle: string
  eventDescription: string
}

interface AISummaryResponse {
  summary?: string
  error?: string
}

function getCachedSummary(eventId: string): string | null {
  try {
    return sessionStorage.getItem(`${CACHE_PREFIX}${eventId}`)
  } catch {
    return null
  }
}

function setCachedSummary(eventId: string, summary: string): void {
  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${eventId}`, summary)
  } catch {
    // sessionStorage unavailable
  }
}

export async function fetchAISummary(
  eventId: string,
  eventTitle: string,
  eventDescription: string,
): Promise<string | null> {
  const cached = getCachedSummary(eventId)
  if (cached) return cached

  try {
    const body: AISummaryRequest = {
      eventTitle,
      eventDescription: eventDescription || eventTitle,
    }

    const response = await fetch('/api/ai-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) return null

    const data = (await response.json()) as AISummaryResponse
    if (!data.summary) return null

    setCachedSummary(eventId, data.summary)
    return data.summary
  } catch {
    return null
  }
}
