export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isRetryableLLMError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false
  const e = error as { status?: number; code?: string; name?: string; message?: string }

  if (typeof e.status === "number") {
    if (e.status === 408 || e.status === 429) return true
    if (e.status >= 500 && e.status < 600) return true
  }

  if (e.code === "ETIMEDOUT" || e.code === "ECONNRESET" || e.code === "ECONNREFUSED" || e.code === "EAI_AGAIN") {
    return true
  }

  if (e.name === "APIConnectionTimeoutError" || e.name === "APIConnectionError") return true

  const msg = (e.message ?? "").toLowerCase()
  if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("overloaded") || msg.includes("rate limit")) {
    return true
  }

  return false
}
