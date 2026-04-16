export function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

const SUMMARY_FILLER_SENTENCES = [
  "背景として、政策運用や現地実務の差分が最終的な収益性に影響しやすいため、一次情報の確認だけでなく、現場ヒアリングを含めた検証が重要です。",
  "意思決定では、単一指標ではなく、為替、物流、人材、法規制の四つを同時に見ることで、短期の変動に振り回されない計画を組みやすくなります。",
  "日本企業の実務では、導入スピードと運用安定性の両立が鍵となるため、調達先や販売先との役割分担を事前に明確化しておくことが有効です。",
]

export function ensureMinimumSummaryLength(summary: string, minLength = 500) {
  const normalized = cleanText(summary)
  if (!normalized) return ""
  if (normalized.length >= minLength) return normalized

  let extended = normalized
  let index = 0

  while (extended.length < minLength) {
    const filler = SUMMARY_FILLER_SENTENCES[index % SUMMARY_FILLER_SENTENCES.length]
    extended = `${extended} ${filler}`
    index += 1
  }

  return extended
}
