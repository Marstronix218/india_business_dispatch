import type {
  IndiaRelevance,
  JapaneseBusinessRelevance,
  ReferenceUrl,
  SynthesisOutput,
} from "./types"
import { LLMError } from "./types"
import type { SynthesisInput } from "./types"

export function extractJsonObject(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  if (fenceMatch) {
    const inner = fenceMatch[1].trim()
    if (inner.startsWith("{") && inner.endsWith("}")) return inner
  }

  const start = trimmed.indexOf("{")
  const end = trimmed.lastIndexOf("}")
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1)

  throw new LLMError("LLM応答にJSONオブジェクトが見つかりません")
}

export function parseSynthesisOutput(raw: string, input?: SynthesisInput): SynthesisOutput {
  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonObject(raw))
  } catch (error) {
    throw new LLMError("LLM応答のJSONパースに失敗", error)
  }

  if (!parsed || typeof parsed !== "object") {
    throw new LLMError("LLM応答がオブジェクトではありません")
  }

  const obj = parsed as Record<string, unknown>
  const title = asString(obj.title)
  const summary = asString(obj.summary)
  const implications = asStringArray(obj.implications)
  const industryTags = asStringArray(obj.industryTags ?? [])
  const category = asString(obj.category)
  const referenceUrls = asReferenceUrls(obj.referenceUrls, input)
  const indiaRelevance = asIndiaRelevance(obj.indiaRelevance)
  const japaneseBusinessRelevance = asJapaneseBusinessRelevance(
    obj.japaneseBusinessRelevance,
  )
  const imagePrompt = asString(obj.imagePrompt) || title

  if (!title || !summary || implications.length === 0 || !category) {
    throw new LLMError("LLM応答に必須フィールドが欠落しています")
  }

  return {
    title,
    summary,
    implications,
    industryTags,
    category,
    referenceUrls,
    indiaRelevance,
    japaneseBusinessRelevance,
    imagePrompt,
  }
}

function asReferenceUrls(value: unknown, input?: SynthesisInput): ReferenceUrl[] {
  const fromLLM: ReferenceUrl[] = []
  if (Array.isArray(value)) {
    for (const item of value) {
      if (!item || typeof item !== "object") continue
      const obj = item as Record<string, unknown>
      const title = asString(obj.title)
      const url = asString(obj.url)
      if (title && url) fromLLM.push({ title, url })
    }
  }
  if (fromLLM.length > 0) return fromLLM
  if (input) {
    return input.cluster
      .filter((s) => s.title && s.sourceUrl)
      .map((s) => ({ title: s.title, url: s.sourceUrl }))
  }
  return []
}

function asIndiaRelevance(value: unknown): IndiaRelevance {
  if (!value || typeof value !== "object") {
    return { score: 2, reason: "indiaRelevance未指定のため既定値で扱う" }
  }
  const obj = value as Record<string, unknown>
  const rawScore = typeof obj.score === "number" ? obj.score : Number(obj.score)
  const score = Number.isFinite(rawScore) ? Math.max(0, Math.min(3, Math.round(rawScore))) : 2
  const reason = asString(obj.reason) || "判定理由なし"
  return { score: score as IndiaRelevance["score"], reason }
}

function asJapaneseBusinessRelevance(
  value: unknown,
): JapaneseBusinessRelevance {
  if (!value || typeof value !== "object") {
    return {
      score: 2,
      reason: "japaneseBusinessRelevance未指定のため既定値で扱う",
    }
  }
  const obj = value as Record<string, unknown>
  const rawScore = typeof obj.score === "number" ? obj.score : Number(obj.score)
  const score = Number.isFinite(rawScore)
    ? Math.max(0, Math.min(3, Math.round(rawScore)))
    : 2
  const reason = asString(obj.reason) || "判定理由なし"
  return {
    score: score as JapaneseBusinessRelevance["score"],
    reason,
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string").map((s) => s.trim()).filter(Boolean)
}
